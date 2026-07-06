<?php

$fromEnv = env('CORS_ALLOWED_ORIGINS');
$origins = [];
if (is_string($fromEnv) && trim($fromEnv) !== '') {
    foreach (explode(',', $fromEnv) as $piece) {
        $o = rtrim(trim($piece), '/');
        if ($o !== '') {
            $origins[] = $o;
        }
    }
}

$frontend = rtrim((string) env('FRONTEND_URL', ''), '/');
if ($frontend !== '' && ! in_array($frontend, $origins, true)) {
    $origins[] = $frontend;
}

$origins = array_values(array_unique($origins));

if ($origins === []) {
    $origins = ['*'];
}

$supportsCredentials = filter_var(env('CORS_SUPPORTS_CREDENTIALS', false), FILTER_VALIDATE_BOOLEAN);

if ($supportsCredentials && in_array('*', $origins, true)) {
    $origins = $frontend !== ''
        ? [$frontend]
        : ['http://localhost:5173', 'http://127.0.0.1:5173'];
}

$allowPrivatePatterns = filter_var(
    env('CORS_ALLOW_PRIVATE_NETWORK_ORIGINS', env('APP_ENV') === 'local' ? '1' : '0'),
    FILTER_VALIDATE_BOOLEAN
);

$originPatterns = [];
if ($allowPrivatePatterns) {
    $originPatterns = [
        '#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#',
        '#^https?://192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$#',
        '#^https?://10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$#',
        '#^https?://172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}(:\d+)?$#',
    ];
}

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'docs', 'docs/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $origins,

    'allowed_origins_patterns' => $originPatterns,

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => (int) env('CORS_MAX_AGE', 0),

    'supports_credentials' => $supportsCredentials,

];
