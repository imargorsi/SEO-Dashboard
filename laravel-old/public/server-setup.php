<?php

/**
 * Server setup via browser (no SSH).
 *
 * Open: https://your-domain/server-setup.php
 * Local: http://127.0.0.1:8004/server-setup.php
 *
 * Runs migrate, seed, permission sync, storage:link, swagger generate.
 * Delete this file from production when you no longer need it.
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
    exit("Missing vendor/autoload.php. Upload the vendor directory or run composer install where you can.\n");
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

$log('');
$log('--- Database ---');
try {
    \Illuminate\Support\Facades\DB::connection()->getPdo();
    $log('DB connection: OK');
} catch (Throwable $e) {
    $log('DB connection: FAIL — '.$e->getMessage());
    if (str_contains($e->getMessage(), '1045') || str_contains($e->getMessage(), 'Access denied')) {
        $log('');
        $log('MySQL 1045 = wrong credentials or user not added to database in cPanel. Fix DB_* in .env before migrations.');
    }
    exit(1);
}

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

$run('migrate --force', static function (): void {
    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
    $out = trim(\Illuminate\Support\Facades\Artisan::output());
    if ($out !== '') {
        echo '    '.$out."\n";
    }
});

$run('db:seed --force', static function (): void {
    \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
    $out = trim(\Illuminate\Support\Facades\Artisan::output());
    if ($out !== '') {
        echo '    '.$out."\n";
    }
});

$run('permission:sync-super-admin', static function (): void {
    \Illuminate\Support\Facades\Artisan::call('permission:sync-super-admin');
    $out = trim(\Illuminate\Support\Facades\Artisan::output());
    if ($out !== '') {
        echo '    '.$out."\n";
    }
});

$run('storage:link', static function (): void {
    \Illuminate\Support\Facades\Artisan::call('storage:link', ['--force' => true]);
    $out = trim(\Illuminate\Support\Facades\Artisan::output());
    if ($out !== '') {
        echo '    '.$out."\n";
    }
});

$run('l5-swagger:generate', static function (): void {
    \Illuminate\Support\Facades\Artisan::call('l5-swagger:generate');
    $out = trim(\Illuminate\Support\Facades\Artisan::output());
    if ($out !== '') {
        echo '    '.$out."\n";
    }
});

try {
    $run('optimize:clear', static function (): void {
        \Illuminate\Support\Facades\Artisan::call('optimize:clear');
        echo '    '.trim(\Illuminate\Support\Facades\Artisan::output())."\n";
    });
} catch (Throwable) {
    $log('    (ignored)');
}

$log('');
$log('Done. Remove public/server-setup.php from the server now.');
