<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class DashboardController extends Controller
{
    #[OA\Get(
        path: '/api/v1/admin/dashboard',
        operationId: 'adminDashboard',
        summary: 'Super admin dashboard payload',
        security: [['sanctum' => []]],
        tags: ['Admin'],
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'role' => 'super_admin',
            'message' => __('Welcome. Use companies endpoints to manage tenants.'),
        ]);
    }
}
