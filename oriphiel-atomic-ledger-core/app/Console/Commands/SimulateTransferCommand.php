<?php

namespace App\Console\Commands;

use App\Services\BalanceService;
use Illuminate\Console\Command;
use Throwable;

class SimulateTransferCommand extends Command
{
    protected $signature = 'ledger:simulate-transfer
                            {sender_id : Sender user ID}
                            {receiver_id : Receiver user ID}
                            {amount : Transfer amount as decimal string}';

    protected $description = 'Execute a single transfer (used by concurrency tests)';

    public function handle(BalanceService $balanceService): int
    {
        try {
            $transaction = $balanceService->transferFunds(
                senderId: (int) $this->argument('sender_id'),
                receiverId: (int) $this->argument('receiver_id'),
                amount: (string) $this->argument('amount'),
            );

            $this->line(json_encode([
                'success' => true,
                'transaction_id' => $transaction->id,
                'status' => $transaction->status->value,
            ], JSON_THROW_ON_ERROR));

            return self::SUCCESS;
        } catch (Throwable $exception) {
            $this->line(json_encode([
                'success' => false,
                'error' => $exception::class,
                'message' => $exception->getMessage(),
            ], JSON_THROW_ON_ERROR));

            return self::FAILURE;
        }
    }
}
