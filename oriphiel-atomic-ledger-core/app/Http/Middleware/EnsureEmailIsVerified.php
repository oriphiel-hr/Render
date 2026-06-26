<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user !== null && ! $user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email address is not verified.',
                'code' => 'EMAIL_NOT_VERIFIED',
            ], 403);
        }

        return $next($request);
    }
}
