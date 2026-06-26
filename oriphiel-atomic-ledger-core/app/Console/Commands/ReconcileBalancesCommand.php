<?php

namespace App\Console\Commands;

use App\Services\Ledger\ReconciliationService;
use Illuminate\Console\Command;

class ReconcileBalancesCommand extends Command
{
    protected $signature = 'ledger:reconcile';

    protected $description = 'Compare stored wallet balances against immutable ledger entries';

    public function handle(ReconciliationService $reconciliationService): int
    {
        $rows = $reconciliationService->reconcileAll();
        $outOfSync = $rows->where('in_sync', false);

        foreach ($rows as $row) {
            $status = $row['in_sync'] ? 'OK' : 'DIFF';
            $this->line(sprintf(
                '[%s] user=%d asset=%s stored=%s/%s/%s calc=%s/%s/%s',
                $status,
                $row['user_id'],
                $row['asset'],
                $row['stored']['available'],
                $row['stored']['locked'],
                $row['stored']['pending'],
                $row['calculated']['available'],
                $row['calculated']['locked'],
                $row['calculated']['pending'],
            ));
        }

        if ($outOfSync->isNotEmpty()) {
            $this->error("{$outOfSync->count()} wallet(s) out of sync.");

            return self::FAILURE;
        }

        $this->info('All wallets in sync.');

        return self::SUCCESS;
    }
}
