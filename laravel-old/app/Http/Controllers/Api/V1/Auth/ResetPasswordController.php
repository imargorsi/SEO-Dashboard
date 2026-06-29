<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\ResetPasswordRequest;
use App\Models\User;
use App\Support\Auth\PasswordResetResponder;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use OpenApi\Attributes as OA;

class ResetPasswordController extends Controller
{
    #[OA\Post(
        path: '/api/v1/auth/reset-password',
        operationId: 'authResetPassword',
        summary: 'Reset password with token from email',
        description: <<<'MD'
**Where does `token` come from?** It is **not** a Sanctum/API Bearer token and not the literal word `string`.

1. Call `POST /api/v1/auth/forgot-password` with a real user email.
2. Open the reset email (with `MAIL_MAILER=log`, read `storage/logs/laravel.log`).
3. Copy `token` and `email` from the link: `{FRONTEND_URL}/reset-password?token=COPY_THIS&email=...`
4. Paste those values here. Tokens expire (default 60 minutes) and are one-time use.

Revokes existing API tokens after a successful reset.
MD,
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['token', 'email', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(
                        property: 'token',
                        type: 'string',
                        description: 'Opaque reset token from the email link query parameter (64+ character string).',
                        example: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'
                    ),
                    new OA\Property(
                        property: 'email',
                        type: 'string',
                        format: 'email',
                        description: 'Same email used in forgot-password and in the reset link.',
                        example: 'admin@example.com'
                    ),
                    new OA\Property(property: 'password', type: 'string', format: 'password', minLength: 8, example: 'New-password-1'),
                    new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'New-password-1'),
                ]
            )
        ),
        tags: ['Auth'],
        responses: [
            new OA\Response(response: 200, description: 'Password reset'),
            new OA\Response(response: 422, description: 'Invalid token or validation error'),
            new OA\Response(response: 429, description: 'Too many requests'),
        ]
    )]
    public function __invoke(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => $password,
                ])->save();

                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        return PasswordResetResponder::resetCompleted($status);
    }
}
