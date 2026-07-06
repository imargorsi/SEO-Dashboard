<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// One-time deploy scripts must not go through the web stack (session DB runs before migrations exist).
$requestUri = (string) ($_SERVER['REQUEST_URI'] ?? '');
if (! str_contains($requestUri, '..')) {
    if (str_contains($requestUri, 'web-once-setup.php')) {
        require __DIR__.'/web-once-setup.php';
        exit;
    }
    if (str_contains($requestUri, 'server-setup.php')) {
        require __DIR__.'/server-setup.php';
        exit;
    }
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
