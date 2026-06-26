<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;

class TransactionController extends Controller
{
    public function index(): JsonResponse
    {
        $transactions = Transaction::query()
            ->with(['sender:id,name', 'receiver:id,name'])
            ->orderByDesc('id')
            ->limit(50)
            ->get();

        return response()->json([
            'data' => $transactions->map(fn (Transaction $tx) => [
                'id' => $tx->id,
                'sender' => ['id' => $tx->sender_id, 'name' => $tx->sender?->name],
                'receiver' => ['id' => $tx->receiver_id, 'name' => $tx->receiver?->name],
                'amount' => $tx->amount,
                'asset' => $tx->asset,
                'status' => $tx->status->value,
                'external_reference' => $tx->external_reference,
                'created_at' => $tx->created_at?->toIso8601String(),
            ]),
        ]);
    }
}
