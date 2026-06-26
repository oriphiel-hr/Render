<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\Coinbase\CoinbaseClient;
use Illuminate\Http\JsonResponse;

class LedgerStatusController extends Controller
{
    public function show(CoinbaseClient $coinbaseClient): JsonResponse
    {
        return response()->json([
            'service' => 'oriphiel-atomic-ledger-core',
            'coinbase' => $coinbaseClient->ping(),
            'users_count' => User::query()->count(),
        ]);
    }
}
