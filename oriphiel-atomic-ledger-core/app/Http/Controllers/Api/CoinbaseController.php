<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Services\Coinbase\CoinbaseCdpService;
use Illuminate\Http\JsonResponse;

class CoinbaseController extends Controller
{
    public function __construct(
        private readonly CoinbaseCdpService $cdpService,
    ) {}

    public function status(): JsonResponse
    {
        return response()->json($this->cdpService->status());
    }

    public function accounts(): JsonResponse
    {
        return response()->json($this->cdpService->accounts());
    }

    public function auditTrail(): JsonResponse
    {
        $logs = AuditLog::query()
            ->whereIn('action', ['coinbase.synced', 'transfer.completed', 'transfer.failed'])
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
