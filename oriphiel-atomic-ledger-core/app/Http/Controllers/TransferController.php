<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransferFundsRequest;
use App\Services\BalanceService;
use Illuminate\Http\JsonResponse;

class TransferController extends Controller
{
    public function __construct(
        private readonly BalanceService $balanceService,
    ) {}

    public function store(TransferFundsRequest $request): JsonResponse
    {
        $transaction = $this->balanceService->transferFunds(
            senderId: (int) $request->validated('sender_id'),
            receiverId: (int) $request->validated('receiver_id'),
            amount: (string) $request->validated('amount'),
            idempotencyKey: $request->validated('idempotency_key'),
            ipAddress: $request->ip(),
        );

        return response()->json([
            'data' => [
                'id' => $transaction->id,
                'sender_id' => $transaction->sender_id,
                'receiver_id' => $transaction->receiver_id,
                'amount' => $transaction->amount,
                'status' => $transaction->status->value,
                'external_reference' => $transaction->external_reference,
                'created_at' => $transaction->created_at?->toIso8601String(),
            ],
        ], 201);
    }
}
