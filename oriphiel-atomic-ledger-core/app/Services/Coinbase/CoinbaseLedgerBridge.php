<?php

namespace App\Services\Coinbase;

use App\Models\Transaction;
use App\Services\Audit\TransactionAuditService;

class CoinbaseLedgerBridge
{
  public function __construct(
    private readonly CoinbaseClient $client,
    private readonly TransactionAuditService $auditService,
  ) {}

  public function syncCompletedTransfer(Transaction $transaction): void
  {
    if (! $this->client->isEnabled()) {
      return;
    }

    $reference = sprintf('txn-%d', $transaction->id);
    $result = $this->client->registerTransfer($reference, $transaction->amount);

    if ($result === null) {
      return;
    }

    $transaction->update([
      'external_reference' => $reference,
    ]);

    $this->auditService->log('coinbase.synced', [
      'external_reference' => $reference,
      'sandbox' => $this->client->isSandbox(),
      'payload' => $result,
    ], $transaction, $transaction->sender_id);
  }
}
