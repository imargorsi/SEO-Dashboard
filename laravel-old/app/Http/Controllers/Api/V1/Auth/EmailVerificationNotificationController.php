<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class EmailVerificationNotificationController extends Controller
{
    #[OA\Post(
        path: '/api/v1/auth/email/verification-notification',
        operationId: 'authEmailVerificationNotification',
        summary: 'Resend email verification link',
        security: [['sanctum' => []]],
        tags: ['Auth'],
        responses: [
            new OA\Response(response: 200, description: 'Already verified'),
            new OA\Response(response: 202, description: 'Verification email queued/sent'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return ApiResponse::success(null, __('Already verified.'));
        }

        $request->user()->sendEmailVerificationNotification();

        return ApiResponse::success(null, __('Verification link sent.'), 202);
    }
}
