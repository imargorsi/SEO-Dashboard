<?php

/**
 * Fix super_admin permissions via browser (no SSH / terminal).
 *
 * 1. Deploy this file with your code.
 * 2. Open: https://your-domain/sync-super-admin-permissions.php
 *    Local: http://127.0.0.1:8004/sync-super-admin-permissions.php
 * 3. Confirm permissions_count matches total permissions, then log out and log in.
 *
 * Creates any missing permissions from PermissionSeeder and gives super_admin every permission in the DB.
 */

declare(strict_types=1);

putenv('SESSION_DRIVER=file');
$_ENV['SESSION_DRIVER'] = 'file';
$_SERVER['SESSION_DRIVER'] = 'file';

define('LARAVEL_START', microtime(true));

header('Content-Type: text/plain; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

if (! file_exists(__DIR__.'/../vendor/autoload.php')) {
    http_response_code(500);
    exit("Missing vendor/autoload.php.\n");
}

require __DIR__.'/../vendor/autoload.php';

/** @var \Illuminate\Foundation\Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$app->make('config')->set('session.driver', 'file');

use App\Models\Permission;
use App\Models\Role;
use App\Support\Permission\PermissionGuard;
use App\Support\Permission\PermissionRoleAssigner;
use Database\Seeders\PermissionSeeder;

$log = static function (string $line): void {
    echo $line."\n";
    if (function_exists('ob_flush')) {
        @ob_flush();
    }
    @flush();
};

$superAdmin = static function (): Role {
    return Role::findByName('super_admin', PermissionGuard::WEB);
};

$log('');
$log('--- super_admin permission sync ---');

try {
    $before = $superAdmin()->permissions()->count();
    $totalBefore = Permission::query()->where('guard_name', PermissionGuard::WEB)->count();
    $log("Before: {$before} on super_admin, {$totalBefore} permissions in database");

    $log('');
    $log('==> PermissionSeeder (create missing + sync roles)');
    (new PermissionSeeder)->run();
    $log('    OK');

    $log('');
    $log('==> syncSuperAdminWithAllPermissions (ensure all DB permissions)');
    PermissionRoleAssigner::syncSuperAdminWithAllPermissions();
    $log('    OK');

    try {
        \Illuminate\Support\Facades\Artisan::call('optimize:clear');
        $log('');
        $log('==> optimize:clear');
        $log('    OK');
    } catch (Throwable) {
        $log('    skipped (non-fatal)');
    }

    $super = $superAdmin()->load('permissions');
    $after = $super->permissions->count();
    $total = Permission::query()->where('guard_name', PermissionGuard::WEB)->count();

    $log('');
    $log("After: {$after} on super_admin, {$total} permissions in database");

    if ($after < $total) {
        $missing = Permission::query()
            ->where('guard_name', PermissionGuard::WEB)
            ->whereNotIn('id', $super->permissions->pluck('id'))
            ->pluck('name');
        $log('');
        $log('WARNING: super_admin is still missing: '.$missing->implode(', '));
        exit(1);
    }

    $log('');
    $log('super_admin permissions:');
    foreach ($super->permissions->pluck('name')->sort()->values() as $name) {
        $log('  - '.$name);
    }

    $log('');
    $log('Done. Log out and log in again, then check GET /api/v1/admin/roles/super_admin');
} catch (Throwable $e) {
    $log('');
    $log('ERROR: '.$e->getMessage());
    exit(1);
}
