<?php

namespace App\Http\Middleware;

use App\Support\Api\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class WrapApiJsonResponse
{
    /**
     * Normalize successful JSON responses under /api/* to { success, message, data }.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! ApiResponse::wantsApiEnvelope($request)) {
            return $next($request);
        }

        $response = $next($request);

        if ($response->isEmpty() && $response->getStatusCode() === Response::HTTP_NO_CONTENT) {
            return ApiResponse::success(null, null, Response::HTTP_OK);
        }

        $contentType = (string) $response->headers->get('Content-Type', '');

        if (! str_contains($contentType, 'application/json')) {
            return $response;
        }

        if ($response->getStatusCode() >= 400) {
            return $response;
        }

        $payload = json_decode($response->getContent(), true);

        if (! is_array($payload)) {
            return $response;
        }

        if (array_key_exists('success', $payload) && is_bool($payload['success'])) {
            return $response;
        }

        return ApiResponse::success($payload, null, $response->getStatusCode());
    }
}
