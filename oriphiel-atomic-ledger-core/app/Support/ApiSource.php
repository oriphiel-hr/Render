<?php

namespace App\Support;

use Illuminate\Http\Request;

class ApiSource
{
    /**
     * @return array<string, mixed>
     */
    public static function forRequest(Request $request): array
    {
        return [
            'endpoint' => $request->method().' '.$request->path(),
            'url' => $request->fullUrl(),
            'fetched_at' => now()->toIso8601String(),
            'authenticated' => $request->user() !== null,
        ];
    }

    /**
     * @param  array<string, mixed>  $upstream
     * @return array<string, mixed>
     */
    public static function upstream(string $provider, string $method, string $url, array $upstream = []): array
    {
        return array_merge([
            'provider' => $provider,
            'method' => $method,
            'url' => $url,
            'fetched_at' => now()->toIso8601String(),
        ], $upstream);
    }
}
