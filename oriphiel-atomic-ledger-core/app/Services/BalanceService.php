<?php

namespace App\Services;

use App\Models\Transaction;
use App\Services\Ledger\LedgerService;

/**
 * Backward-compatible facade over the ledger engine.
 */
class BalanceService
{
    public function __construct(
        private readonly LedgerService $ledgerService,
    ) {}

    public function transferFunds(
        int $senderId,
        int $receiverId,
        string $amount,
        ?string $idempotencyKey = null,
        ?string $ipAddress = null,
        string $asset = 'USDT',
    ): Transaction {
        return $this->ledgerService->transferFunds(
            senderId: $senderId,
            receiverId: $receiverId,
            amount: $amount,
            asset: $asset,
            idempotencyKey: $idempotencyKey,
            ipAddress: $ipAddress,
        );
    }
}
