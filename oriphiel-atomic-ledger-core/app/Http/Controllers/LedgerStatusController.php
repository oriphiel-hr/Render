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
            'data_paths' => [
                'ledger_wallets' => [
                    'endpoint' => url('/api/wallets'),
                    'provider' => 'local_ledger',
                    'storage' => 'postgresql',
                    'note' => 'User balances from atomic ledger in this app.',
                ],
                'binance_spot' => [
                    'endpoint' => url('/api/exchange/accounts'),
                    'provider' => 'binance',
                    'base_url' => $exchangeService->baseUrl(),
                    'note' => 'Live spot balances from Binance API when EXCHANGE_ENABLED and keys are set.',
                ],
            ],
            'verify_endpoints' => [
                'status' => url('/api/status'),
                'exchange_status' => url('/api/exchange/status'),
                'exchange_accounts' => url('/api/exchange/accounts'),
            ],
        ]);
    }
}
