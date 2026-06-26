<?php

namespace App\Console\Commands;

use App\Services\Ledger\LedgerService;
use Illuminate\Console\Command;
use Throwable;

class SimulateDepositCommand extends Command
{
    protected $signature = 'ledger:simulate-deposit
                            {user_id : User ID}
                            {amount : Deposit amount}
                            {asset=USDT : Asset code}';

    protected $description = 'Simulate deposit initiate + confirm (concurrency tests)';

    public function handle(LedgerService $ledgerService): int
    {
        try {
            $operation = $ledgerService->depositInitiate(
                userId: (int) $this->argument('user_id'),
                asset: (string) $this->argument('asset'),
                amount: (string) $this->argument('amount'),
            );

            $operation = $ledgerService->depositConfirm($operation->id);

            $this->line(json_encode([
                'success' => true,
                'operation_id' => $operation->id,
                'status' => $operation->status->value,
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
