<?php

namespace App\Support\Api;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Symfony\Component\HttpFoundation\Response;

final class ApiResponse
{
    /**
     * @param  array<string, mixed>|JsonResource|null  $data
     */
    public static function success(mixed $data = null, ?string $message = null, int $status = Response::HTTP_OK): JsonResponse
    {
        if ($data instanceof JsonResource) {
            $data = $data->resolve(request());
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    /**
     * Standard paginated list: resolves a JsonResource collection and wraps {@see PaginatedResult}.
     *
     * @param  class-string<JsonResource>  $resourceClass
     */
    public static function paginated(
        LengthAwarePaginator $paginator,
        string $resourceClass,
        ListQueryState|array $filters,
        ?Request $request = null,
        ?string $message = null,
    ): JsonResponse {
        $request ??= request();

        $items = $resourceClass::collection($paginator->getCollection())->resolve($request);

        $filterPayload = $filters instanceof ListQueryState
            ? $filters->toFilterPayload()
            : $filters;

        return self::success(
            PaginatedResult::build($items, $paginator, $filterPayload),
            $message,
        );
    }

    /**
     * @param  array<string, array<int, string>|string>  $errors
     */
    public static function error(
        string $message,
        array $errors = [],
        int $status = Response::HTTP_BAD_REQUEST
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors === [] ? new \stdClass : $errors,
        ], $status);
    }

    /**
     * @param  array<string, array<int, string>>  $errors
     */
    public static function validation(string $message, array $errors, int $status = Response::HTTP_UNPROCESSABLE_ENTITY): JsonResponse
    {
        return self::error($message, $errors, $status);
    }

    public static function wantsApiEnvelope(Request $request): bool
    {
        if (! $request->is('api/*')) {
            return false;
        }

        if ($request->is('api/documentation', 'api/documentation/*', 'docs', 'docs/*', 'api/oauth2-callback')) {
            return false;
        }

        return true;
    }
}
