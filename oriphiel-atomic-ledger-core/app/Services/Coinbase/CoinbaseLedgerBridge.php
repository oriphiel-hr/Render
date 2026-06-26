<?php

namespace App\Services\Coinbase;

use App\Models\Transaction;
use App\Services\Audit\TransactionAuditService;

class CoinbaseLedgerBridge
{
    public function __construct(
        private readonly CoinbaseCdpService $cdpService,
        private readonly TransactionAuditService $auditService,
    ) {}

    public function syncCompletedTransfer(Transaction $transaction): void
    {
        $reference = sprintf('txn-%d', $transaction->id);
        $result = $this->cdpService->registerLedgerTransfer($reference, $transaction->amount);

        $transaction->update([
            'external_reference' => $reference,
        ]);

        $this->auditService->log('coinbase.synced', [
            'external_reference' => $reference,
            'sandbox' => $this->cdpService->isSandbox(),
            'mode' => $this->cdpService->status()['mode'] ?? 'unknown',
            'payload' => $result,
        ], $transaction, $transaction->sender_id);
    }
}
