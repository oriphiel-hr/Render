<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

abstract class LedgerException extends Exception
{
    abstract public function errorCode(): string;

    public function statusCode(): int
    {
        return 422;
    }

    public function context(): array
    {
        return [];
    }

    public function render(Request $request): ?JsonResponse
    {
        if (! $request->expectsJson()) {
            return null;
        }

        return response()->json([
            'error' => $this->getMessage(),
            'code' => $this->errorCode(),
            'context' => $this->context(),
        ], $this->statusCode());
    }
}
