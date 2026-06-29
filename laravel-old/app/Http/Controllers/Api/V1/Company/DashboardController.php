<?php

namespace App\Http\Controllers\Api\V1\Company;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class DashboardController extends Controller
{
    #[OA\Get(
        path: '/api/v1/company/dashboard',
        operationId: 'companyDashboard',
        summary: 'Company admin dashboard payload',
        security: [['sanctum' => []]],
        tags: ['Company'],
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function __invoke(Request $request): JsonResponse
    {
        return response()->json([
            'role' => 'company_admin',
            'company' => [
                'id' => $request->user()->company?->id,
                'name' => $request->user()->company?->name,
                'slug' => $request->user()->company?->slug,
            ],
        ]);
    }
}
