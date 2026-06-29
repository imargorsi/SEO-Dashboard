<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Middleware\EnsureEmailIsVerified;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Like {@see EnsureEmailIsVerified} but never redirects to
 * named web routes (this app has no `verification.notice` / session login for API clients).
 */
class EnsureApiEmailVerified
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user instanceof MustVerifyEmail && ! $user->hasVerifiedEmail()) {
            abort(403, __('Your email address is not verified.'));
        }

        return $next($request);
    }
}
