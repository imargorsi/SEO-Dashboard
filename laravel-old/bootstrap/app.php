<?php

use App\Http\Middleware\EnsureApiEmailVerified;
use App\Http\Middleware\EnsureCompanyAccount;
use App\Http\Middleware\WrapApiJsonResponse;
use App\Support\Api\ApiResponse;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $trusted = env('TRUSTED_PROXIES');
        if ($trusted === '*') {
            $middleware->trustProxies(at: '*');
        } elseif (is_string($trusted) && $trusted !== '') {
            $middleware->trustProxies(at: array_map('trim', explode(',', $trusted)));
        }

        $middleware->appendToGroup('api', WrapApiJsonResponse::class);

        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return null;
            }

            return '/';
        });

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
            'company.account' => EnsureCompanyAccount::class,
            'verified' => EnsureApiEmailVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e): bool {
            return $request->is('api/*') || $request->expectsJson();
        });

        $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
            if (! ApiResponse::wantsApiEnvelope($request)) {
                return $response;
            }

            if ($response->getStatusCode() < 400) {
                return $response;
            }

            if ($response instanceof JsonResponse) {
                $payload = json_decode($response->getContent(), true);
                if (is_array($payload) && array_key_exists('success', $payload) && $payload['success'] === false) {
                    return $response;
                }

                if (is_array($payload)) {
                    $message = (string) ($payload['message'] ?? Response::$statusTexts[$response->getStatusCode()] ?? __('Request failed.'));
                    $errors = $payload['errors'] ?? [];
                    if (! is_array($errors)) {
                        $errors = [];
                    }

                    return ApiResponse::error($message, $errors, $response->getStatusCode());
                }
            }

            return ApiResponse::error(
                Response::$statusTexts[$response->getStatusCode()] ?? __('An error occurred.'),
                [],
                $response->getStatusCode()
            );
        });
    })->create();
