<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Services\Exchange\BinanceExchangeService;
use Illuminate\Http\JsonResponse;

class ExchangeController extends Controller
{
    public function __construct(
        private readonly BinanceExchangeService $exchangeService,
    ) {}

    public function status(): JsonResponse
    {
        return response()->json($this->exchangeService->status());
    }

    public function accounts(): JsonResponse
    {
        return response()->json($this->exchangeService->accounts());
    }

    public function auditTrail(): JsonResponse
    {
        $logs = AuditLog::query()
            ->whereIn('action', ['exchange.synced', 'transfer.completed', 'transfer.failed'])
            ->orderByDesc('id')
            ->limit(20)
            ->get();

        return response()->json([
            'data' => $logs->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'payload' => $log->payload,
                'created_at' => $log->created_at?->toIso8601String(),
            ]),
        ]);
    }
}
