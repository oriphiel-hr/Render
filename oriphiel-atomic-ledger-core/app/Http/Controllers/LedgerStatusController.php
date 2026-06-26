<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\Exchange\BinanceExchangeService;
use Illuminate\Http\JsonResponse;

class LedgerStatusController extends Controller
{
    public function show(BinanceExchangeService $exchangeService): JsonResponse
    {
        return response()->json([
            'service' => 'oriphiel-atomic-ledger-core',
            'environment' => config('app.env'),
            'exchange' => $exchangeService->status(),
            'users_count' => User::query()->count(),
            'verify_endpoints' => [
                'status' => url('/api/status'),
                'exchange_status' => url('/api/exchange/status'),
                'exchange_accounts' => url('/api/exchange/accounts'),
            ],
        ]);
    }
}
