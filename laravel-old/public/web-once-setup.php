<?php

/**
 * UPLOAD TO: same folder as Laravel’s `index.php` (usually `public/` on disk, or your host’s `public_html/` if that is the app’s web root).
 * OPEN: https://yoursite.com/web-once-setup.php  (no query string)
 *
 * WARNING: No secret — anyone who can request this URL can run migrations/seeders. DELETE this file immediately after a successful run.
 *
 * If this file is NOT inside Laravel’s `public/` directory, edit `$laravelBase` below so it points at the folder that contains `artisan`, `.env`, and `vendor/`.
 */

declare(strict_types=1);

// Before Laravel reads .env (so this process never uses DB for sessions during setup).
putenv('SESSION_DRIVER=file');
$_ENV['SESSION_DRIVER'] = 'file';
$_SERVER['SESSION_DRIVER'] = 'file';

// Laravel root (folder that contains `artisan`, `.env`, `vendor/`).
// Default: this file lives in `public/`, so the project root is one level up.
$laravelBase = dirname(__DIR__);

// Example if you upload this to `public_html` and the app lives in a subfolder:
// $laravelBase = __DIR__ . '/SeoDashboard';

header('Content-Type: text/plain; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

$out = static function (string $line): void {
    echo $line."\n";
};

if (! is_dir($laravelBase)) {
    $out('FAIL: Laravel folder not found at:');
    $out($laravelBase);
    $out('Edit $laravelBase in this PHP file.');
    exit(1);
}

$resolved = realpath($laravelBase);
$base = $resolved !== false ? $resolved : $laravelBase;
chdir($base);

$out('=== SeoDashboard one-time setup (from browser) ===');
$out('Time: '.date('c'));
$out('PHP: '.PHP_VERSION);
$out('Laravel base: '.$base);

if (! is_file($base.'/vendor/autoload.php')) {
    $out('FAIL: vendor/autoload.php missing under Laravel base.');
    exit(1);
}

if (! is_file($base.'/bootstrap/app.php')) {
    $out('FAIL: bootstrap/app.php missing.');
    exit(1);
}

require $base.'/vendor/autoload.php';

/** @var \Illuminate\Foundation\Application $app */
$app = require_once $base.'/bootstrap/app.php';
/** @var \Illuminate\Contracts\Console\Kernel $kernel */
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Do not touch the `sessions` table until migrations have run (covers odd hosts / double boots).
$app->make('config')->set('session.driver', 'file');

$out('');
$out('--- .env / config (no passwords) ---');
$out('APP_ENV: '.(string) config('app.env'));
$out('APP_DEBUG: '.(config('app.debug') ? 'true' : 'false'));
$out('APP_URL: '.(string) config('app.url'));

$defaultConn = (string) config('database.default');
$out('DB_CONNECTION: '.$defaultConn);
$dbCfg = config('database.connections.'.$defaultConn);
if (is_array($dbCfg)) {
    $driver = (string) ($dbCfg['driver'] ?? '');
    if ($driver === 'sqlite') {
        $out('DB_DATABASE (path): '.(string) ($dbCfg['database'] ?? ''));
    } else {
        $out('DB_HOST: '.(string) ($dbCfg['host'] ?? ''));
        $out('DB_DATABASE: '.(string) ($dbCfg['database'] ?? ''));
        $out('DB_USERNAME: '.(string) ($dbCfg['username'] ?? ''));
    }
}

$out('');
$out('--- Writable paths ---');
$storage = $base.'/storage';
$bootstrapCache = $base.'/bootstrap/cache';
$out('storage writable: '.(is_writable($storage) ? 'yes' : 'NO'));
$out('bootstrap/cache writable: '.(is_writable($bootstrapCache) ? 'yes' : 'NO'));

$out('');
$out('--- Database ---');
try {
    \Illuminate\Support\Facades\DB::connection()->getPdo();
    $out('DB connection: OK');
} catch (\Throwable $e) {
    $out('DB connection: FAIL — '.$e->getMessage());
    if (str_contains($e->getMessage(), '1045') || str_contains($e->getMessage(), 'Access denied')) {
        $out('');
        $out('MySQL rejected the login (this is NOT a migration issue). Fix .env on the server:');
        $out('  - In cPanel: MySQL Databases — create user, create DB, "Add User To Database" with ALL PRIVILEGES.');
        $out('  - Copy the exact password into DB_PASSWORD. Special characters: avoid wrapping in double quotes if they break parsing; use single quotes or no quotes per Laravel .env rules.');
        $out('  - DB_HOST is often localhost or 127.0.0.1 on shared hosting (try the other if one fails).');
        $out('  - Until DB works, SESSION_DRIVER=file avoids session queries (temporary only).');
    }
    exit(1);
}

$out('');
$out('--- Artisan (same as terminal) ---');

$artisanOut = static function (): void {
    $t = trim(\Illuminate\Support\Facades\Artisan::output());
    if ($t !== '') {
        echo $t."\n";
    }
};

try {
    $out('> php artisan migrate --force');
    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
    $artisanOut();
    $out('OK');
} catch (\Throwable $e) {
    $out('FAIL migrate: '.$e->getMessage());
    exit(1);
}

try {
    $out('> php artisan db:seed --force');
    \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
    $artisanOut();
    $out('OK');
} catch (\Throwable $e) {
    $out('FAIL db:seed: '.$e->getMessage());
    exit(1);
}

try {
    $out('> php artisan storage:link --force');
    \Illuminate\Support\Facades\Artisan::call('storage:link', ['--force' => true]);
    $artisanOut();
    $out('OK');
} catch (\Throwable $e) {
    $out('storage:link: '.$e->getMessage());
}

try {
    $out('> php artisan optimize:clear');
    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
    $artisanOut();
    $out('OK');
} catch (\Throwable $e) {
    $out('optimize:clear skipped: '.$e->getMessage());
}

try {
    $out('> php artisan migrate:status');
    \Illuminate\Support\Facades\Artisan::call('migrate:status');
    $artisanOut();
} catch (\Throwable $e) {
    $out('migrate:status: '.$e->getMessage());
}

$out('');
try {
    $userCount = (int) \App\Models\User::query()->count();
    $out('users rows: '.$userCount);
} catch (\Throwable $e) {
    $out('users table check: '.$e->getMessage());
}

$out('');
$out('Done. DELETE this file from the server now (public/web-once-setup.php or your public_html copy).');
