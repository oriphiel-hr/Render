<?php

namespace App\Http\Middleware;

use App\Support\ApiSource;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AddApiSourceMetadata
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $response instanceof JsonResponse) {
            return $response;
        }

        $data = $response->getData(true);

        if (! is_array($data)) {
            return $response;
        }

        if (! isset($data['_source'])) {
            $data['_source'] = ApiSource::forRequest($request);
        }

        $response->setData($data);

        return $response;
    }
}
