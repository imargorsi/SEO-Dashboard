<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCompanyAccount
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || $user->company_id === null) {
            abort(403);
        }

        $user->loadMissing('company');

        if ($user->company === null || ! $user->company->isAccessible()) {
            abort(403);
        }

        return $next($request);
    }
}
