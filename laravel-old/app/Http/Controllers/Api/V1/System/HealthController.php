<?php

namespace App\Http\Controllers\Api\V1\System;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'System', description: 'Service status and connectivity')]
class HealthController extends Controller
{
    #[OA\Get(
        path: '/api/v1/ping',
        operationId: 'apiPing',
        summary: 'Health check',
        description: 'Returns a small JSON payload so clients can verify the API is reachable.',
        tags: ['System'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'API is online',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'pong'),
                    ]
                )
            ),
        ]
    )]
    public function ping(): JsonResponse
    {
        return response()->json(['message' => 'pong']);
    }
}
