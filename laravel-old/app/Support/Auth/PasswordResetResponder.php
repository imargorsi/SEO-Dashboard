<?php

namespace App\Support\Auth;

use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Throwable;

final class PasswordResetResponder
{
    /**
     * Handle {@see Password::sendResetLink()} result for the forgot-password API.
     */
    public static function forgotPassword(string $status): JsonResponse
    {
        if ($status === Password::RESET_THROTTLED) {
            return ApiResponse::error(
                self::throttleMessage(),
                status: 429
            );
        }

        if ($status === Password::INVALID_USER) {
            return ApiResponse::error(
                __('We could not find an account with that email address.'),
                ['email' => [__('We could not find an account with that email address.')]],
                422
            );
        }

        if ($status === Password::RESET_LINK_SENT) {
            return ApiResponse::success(
                null,
                __('passwords.sent_notice'),
                202
            );
        }

        return ApiResponse::error(
            __('passwords.unable_to_send'),
            status: 503
        );
    }

    /**
     * Send reset link; catches mail/transport failures.
     */
    public static function sendResetLink(string $email): JsonResponse
    {
        try {
            $status = Password::sendResetLink(['email' => $email]);
        } catch (Throwable $e) {
            report($e);

            return ApiResponse::error(
                __('passwords.unable_to_send'),
                status: 503
            );
        }

        return self::forgotPassword($status);
    }

    /**
     * Handle {@see Password::reset()} result for the reset-password API.
     */
    public static function resetCompleted(string $status): JsonResponse
    {
        if ($status === Password::PASSWORD_RESET) {
            return ApiResponse::success(null, trans('passwords.reset'));
        }

        if ($status === Password::RESET_THROTTLED) {
            return ApiResponse::error(
                self::throttleMessage(),
                status: 429
            );
        }

        $message = match ($status) {
            Password::INVALID_TOKEN,
            Password::INVALID_USER => trans('passwords.token'),
            default => self::translateBrokerStatus($status, trans('passwords.unable_to_reset')),
        };

        return ApiResponse::error($message, status: 422);
    }

    private static function throttleMessage(): string
    {
        $seconds = (int) config('auth.passwords.'.config('auth.defaults.passwords').'.throttle', 60);

        return trans('passwords.throttled', [
            'seconds' => $seconds,
        ]);
    }

    /**
     * Map broker status strings (e.g. `passwords.token`) to lang lines when present.
     */
    private static function translateBrokerStatus(string $status, string $fallback): string
    {
        $translated = trans($status);

        return $translated !== $status ? $translated : $fallback;
    }
}
