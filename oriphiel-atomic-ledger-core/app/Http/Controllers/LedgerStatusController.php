<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\Coinbase\CoinbaseCdpService;
use Illuminate\Http\JsonResponse;

class LedgerStatusController extends Controller
{
    public function show(CoinbaseCdpService $cdpService): JsonResponse
    {
        return response()->json([
            'service' => 'oriphiel-atomic-ledger-core',
            'coinbase' => $cdpService->status(),
            'users_count' => User::query()->count(),
        ]);
    }
}
