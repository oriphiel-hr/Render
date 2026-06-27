<?php

namespace App\Console\Commands;

use App\Services\Exchange\PooledExchangeReconciliationService;
use App\Services\Ledger\ReconciliationService;
use Illuminate\Console\Command;

class ReconcileBalancesCommand extends Command
{
    protected $signature = 'ledger:reconcile {--exchange : Also compare pooled ledger totals vs Binance custody}';

    protected $description = 'Compare stored wallet balances against immutable ledger entries';

    public function handle(
        ReconciliationService $reconciliationService,
        PooledExchangeReconciliationService $pooledReconciliationService,
    ): int {
        $rows = $reconciliationService->reconcileAll();
        $outOfSync = $rows->where('in_sync', false);

        $this->info('Internal ledger reconciliation (stored vs calculated):');

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

        $exitCode = self::SUCCESS;

        if ($outOfSync->isNotEmpty()) {
            $this->error("{$outOfSync->count()} wallet(s) out of sync.");
            $exitCode = self::FAILURE;
        } else {
            $this->info('All wallets in sync.');
        }

        if ($this->option('exchange')) {
            $this->newLine();
            $this->info('Pooled exchange reconciliation (ledger liabilities vs Binance custody):');
            $pool = $pooledReconciliationService->reconcile();

            foreach ($pool['assets'] ?? [] as $asset) {
                $binanceTotal = $asset['binance']['total_custody'] ?? '—';
                $this->line(sprintf(
                    '[%s] %s ledger=%s binance=%s diff=%s',
                    strtoupper((string) $asset['status']),
                    $asset['asset'],
                    $asset['ledger']['total_liabilities'] ?? '—',
                    $binanceTotal,
                    $asset['diff'] ?? '—',
                ));
            }

            $this->line($pool['message'] ?? '');

            if (($pool['healthy'] ?? null) === false) {
                $exitCode = self::FAILURE;
            }
        }

        return $exitCode;
    }
}
