<?php

namespace App\Console\Commands;

use App\Services\Ledger\LedgerService;
use Illuminate\Console\Command;
use Throwable;

class SimulateWithdrawCommand extends Command
{
    protected $signature = 'ledger:simulate-withdraw
                            {user_id : User ID}
                            {amount : Withdrawal amount}
                            {asset=USDT : Asset code}';

    protected $description = 'Simulate withdrawal initiate + complete (concurrency tests)';

    public function handle(LedgerService $ledgerService): int
    {
        try {
            $operation = $ledgerService->withdrawInitiate(
                userId: (int) $this->argument('user_id'),
                asset: (string) $this->argument('asset'),
                amount: (string) $this->argument('amount'),
            );

            $operation = $ledgerService->withdrawComplete($operation->id);

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
