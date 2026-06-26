<?php

namespace App\Services\Exchange;

use App\Models\Transaction;
use App\Services\Audit\TransactionAuditService;

class ExchangeLedgerBridge
{
    public function __construct(
        private readonly BinanceExchangeService $exchangeService,
        private readonly TransactionAuditService $auditService,
    ) {}

    public function syncCompletedTransfer(Transaction $transaction): void
    {
        $reference = sprintf('txn-%d', $transaction->id);
        $result = $this->exchangeService->registerLedgerTransfer($reference, $transaction->amount);

        $transaction->update([
            'external_reference' => $reference,
        ]);

        $this->auditService->log('exchange.synced', [
            'external_reference' => $reference,
            'testnet' => $this->exchangeService->isTestnet(),
            'mode' => $this->exchangeService->status()['mode'] ?? 'unknown',
            'payload' => $result,
        ], $transaction, $transaction->sender_id);
    }
}
