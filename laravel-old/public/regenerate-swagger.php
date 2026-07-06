<?php

/**
 * Regenerate OpenAPI / Swagger docs via browser (no SSH, no terminal).
 *
 * 1. Open this file in the browser (same host as the app):
 *    https://your-domain/regenerate-swagger.php
 *    Local example: http://127.0.0.1:8004/regenerate-swagger.php
 * 2. Wait for "Done" and check Roles / Permissions / forgot-password = yes
 * 3. Hard-refresh Swagger UI: /api/documentation (Ctrl+F5)
 *
 * Requires: vendor/ on server, storage/api-docs writable (755/775).
 * Run after each API deploy. Remove from production when you no longer need it.
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
    exit("Missing vendor/autoload.php. Upload the vendor directory or run composer install.\n");
}

require __DIR__.'/../vendor/autoload.php';

/** @var \Illuminate\Foundation\Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$app->make('config')->set('session.driver', 'file');

$log = static function (string $line): void {
    echo $line."\n";
    if (function_exists('ob_flush')) {
        @ob_flush();
    }
    @flush();
};

$run = static function (string $label, callable $fn) use ($log): void {
    $log('==> '.$label);
    try {
        $fn();
        $log('    OK');
    } catch (Throwable $e) {
        $log('    ERROR: '.$e->getMessage());
        throw $e;
    }
};

$docsDir = storage_path('api-docs');
$docsFile = $docsDir.DIRECTORY_SEPARATOR.'api-docs.json';

$log('');
$log('--- Swagger / OpenAPI ---');
$log('Docs directory: '.$docsDir);

if (! is_dir($docsDir) && ! mkdir($docsDir, 0755, true) && ! is_dir($docsDir)) {
    http_response_code(500);
    exit("Could not create directory: {$docsDir}\n");
}

if (! is_writable($docsDir)) {
    http_response_code(500);
    exit("Directory is not writable: {$docsDir}\nFix permissions in cPanel File Manager (e.g. 755 or 775).\n");
}

try {
    $run('l5-swagger:generate', static function (): void {
        \Illuminate\Support\Facades\Artisan::call('l5-swagger:generate');
        $out = trim(\Illuminate\Support\Facades\Artisan::output());
        if ($out !== '') {
            echo '    '.$out."\n";
        }
    });
} catch (Throwable $e) {
    $log('');
    $log('Generation failed. Check storage/logs/laravel.log on the server.');
    exit(1);
}

try {
    $run('optimize:clear', static function (): void {
        \Illuminate\Support\Facades\Artisan::call('optimize:clear');
        $out = trim(\Illuminate\Support\Facades\Artisan::output());
        if ($out !== '') {
            echo '    '.$out."\n";
        }
    });
} catch (Throwable) {
    $log('    optimize:clear skipped (non-fatal)');
}

$log('');
if (is_file($docsFile)) {
    $log('Written: '.$docsFile);
    $log('Size: '.number_format(filesize($docsFile)).' bytes');
    $log('Modified: '.date('Y-m-d H:i:s', filemtime($docsFile)));

    $json = file_get_contents($docsFile);
    if (is_string($json)) {
        $hasRoles = str_contains($json, '"Roles"');
        $hasPermissions = str_contains($json, '"Permissions"');
        $hasForgot = str_contains($json, 'forgot-password');
        $log('');
        $log('Quick check:');
        $log('  Roles tag: '.($hasRoles ? 'yes' : 'no'));
        $log('  Permissions tag: '.($hasPermissions ? 'yes' : 'no'));
        $log('  forgot-password route: '.($hasForgot ? 'yes' : 'no'));
    }
} else {
    $log('WARNING: '.$docsFile.' was not created.');
    exit(1);
}

$appUrl = rtrim((string) config('app.url'), '/');
$log('');
$log('Done. Open Swagger UI (hard refresh Ctrl+F5):');
$log('  '.$appUrl.'/api/documentation');
