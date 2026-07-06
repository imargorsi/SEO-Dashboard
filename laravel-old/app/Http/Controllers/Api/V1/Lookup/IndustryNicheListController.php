<?php

namespace App\Http\Controllers\Api\V1\Lookup;

use App\Http\Controllers\Controller;
use App\Http\Resources\IndustryNicheResource;
use App\Models\IndustryNiche;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Lookups', description: 'Reference data for forms')]
class IndustryNicheListController extends Controller
{
    #[OA\Get(
        path: '/api/v1/lookups/industry-niches',
        operationId: 'lookupsIndustryNiches',
        summary: 'List industry / niche options (onboarding & project forms)',
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
        $items = IndustryNiche::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return ApiResponse::success(
            IndustryNicheResource::collection($items)->resolve(request())
        );
    }
}
