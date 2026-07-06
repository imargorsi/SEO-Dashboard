<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\ForgotPasswordRequest;
use App\Support\Auth\PasswordResetResponder;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class ForgotPasswordController extends Controller
{
    #[OA\Post(
        path: '/api/v1/auth/forgot-password',
        operationId: 'authForgotPassword',
        summary: 'Request a password reset link',
        description: 'Sends a reset link when the email belongs to an existing account. Returns **422** if no user is registered with that email. Link opens the SPA at `FRONTEND_URL/reset-password?token=…&email=…`.',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email'],
                properties: [
                    new OA\Property(
                        property: 'email',
                        type: 'string',
                        format: 'email',
                        description: 'Must match a registered user email.',
                        example: 'admin@example.com'
                    ),
                ]
            )
        ),
        tags: ['Auth'],
        responses: [
            new OA\Response(response: 202, description: 'Request accepted — check email'),
            new OA\Response(response: 422, description: 'Validation error'),
            new OA\Response(response: 429, description: 'Too many reset requests'),
            new OA\Response(response: 503, description: 'Email could not be sent'),
        ]
    )]
    public function __invoke(ForgotPasswordRequest $request): JsonResponse
    {
        return PasswordResetResponder::sendResetLink($request->validated('email'));
    }
}
