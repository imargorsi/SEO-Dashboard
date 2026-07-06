<?php

namespace App\Http\Controllers\Api\V1\Lookup;

use App\Http\Controllers\Controller;
use App\Http\Resources\SeoGoalResource;
use App\Models\SeoGoal;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Lookups', description: 'Reference data for forms')]
class SeoGoalListController extends Controller
{
    #[OA\Get(
        path: '/api/v1/lookups/seo-goals',
        operationId: 'lookupsSeoGoals',
        summary: 'List primary SEO goal options (onboarding & project forms)',
        security: [['sanctum' => []]],
        tags: ['Lookups'],
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function __invoke(): JsonResponse
    {
        $items = SeoGoal::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return ApiResponse::success(
            SeoGoalResource::collection($items)->resolve(request())
        );
    }
}
