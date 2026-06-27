<?php

namespace App\Services\Exchange;

use App\Models\UserBalance;
use App\Support\ApiSource;
use App\Support\ExchangeConfig;

class PooledExchangeReconciliationService
{
    private const SCALE = 8;

    public function __construct(
        private readonly BinanceExchangeService $exchangeService,
    ) {}

    /**
     * Compare pooled ledger liabilities (all users) vs Binance custody on the shared account.
     *
     * @return array<string, mixed>
     */
    public function reconcile(): array
    {
        $mode = $this->exchangeService->mode();
        $accountUrl = $this->exchangeService->baseUrl().'/api/v3/account';
        $ledgerTotals = $this->sumLedgerByAsset();

        $base = [
            'model' => 'pooled_omnibus',
            'description' => 'Sum of all user ledger balances (liabilities) vs balances on the shared Binance account.',
            'mode' => $mode->value,
            'mode_label' => $mode->label(),
            'ledger_user_count' => UserBalance::query()->distinct('user_id')->count('user_id'),
        ];

        if (! ExchangeConfig::isEnabled() || ! ExchangeConfig::hasCredentials()) {
            return array_merge($base, [
                'status' => 'unavailable',
                'healthy' => null,
                'message' => 'Binance API keys not configured — cannot compare with exchange custody.',
                'assets' => $this->assetsFromLedgerOnly($ledgerTotals),
                'data_source' => ApiSource::upstream('ledger_api', 'GET', url('/api/admin/reconciliation'), [
                    'upstream_called' => false,
                ]),
            ]);
        }

        try {
            $fetch = $this->exchangeService->fetchSpotBalances();
            $binanceBalances = $fetch['balances'];
            $assets = $this->compareAssets($ledgerTotals, $binanceBalances);
            $hasDeficit = collect($assets)->contains(fn (array $row) => $row['status'] === 'deficit');

            return array_merge($base, [
                'status' => $hasDeficit ? 'deficit' : 'ok',
                'healthy' => ! $hasDeficit,
                'message' => $hasDeficit
                    ? 'ALARM: Binance custody is below ledger liabilities for at least one asset.'
                    : 'Pooled custody covers ledger liabilities (surplus or exact match).',
                'assets' => $assets,
                'data_source' => ApiSource::upstream('binance', 'GET', $accountUrl, [
                    'upstream_called' => true,
                    'http_status' => $fetch['http_status'],
                    'response_sha256' => $fetch['response_sha256'],
                    'binance_account_uid' => $fetch['account_uid'],
                ]),
            ]);
        } catch (\Throwable $exception) {
            return array_merge($base, [
                'status' => 'error',
                'healthy' => false,
                'message' => $exception->getMessage(),
                'assets' => $this->assetsFromLedgerOnly($ledgerTotals),
                'data_source' => ApiSource::upstream('binance', 'GET', $accountUrl, [
                    'upstream_called' => false,
                    'error' => $exception->getMessage(),
                ]),
            ]);
        }
    }

    /**
     * @return array<string, array{available: string, locked: string, pending: string, total: string}>
     */
    private function sumLedgerByAsset(): array
    {
        $totals = [];

        UserBalance::query()
            ->orderBy('asset')
            ->each(function (UserBalance $wallet) use (&$totals): void {
                $asset = $wallet->asset;

                if (! isset($totals[$asset])) {
                    $totals[$asset] = [
                        'available' => '0.00000000',
                        'locked' => '0.00000000',
                        'pending' => '0.00000000',
                        'total' => '0.00000000',
                    ];
                }

                $totals[$asset]['available'] = bcadd($totals[$asset]['available'], $wallet->available, self::SCALE);
                $totals[$asset]['locked'] = bcadd($totals[$asset]['locked'], $wallet->locked, self::SCALE);
                $totals[$asset]['pending'] = bcadd($totals[$asset]['pending'], $wallet->pending, self::SCALE);
                $totals[$asset]['total'] = bcadd($totals[$asset]['total'], $wallet->total(), self::SCALE);
            });

        return $totals;
    }

    /**
     * @param  array<string, array{available: string, locked: string, pending: string, total: string}>  $ledgerTotals
     * @param  array<string, array{free: string, locked: string, total: string}>  $binanceBalances
     * @return list<array<string, mixed>>
     */
    private function compareAssets(array $ledgerTotals, array $binanceBalances): array
    {
        $assets = array_unique(array_merge(array_keys($ledgerTotals), array_keys($binanceBalances)));
        sort($assets);

        $rows = [];

        foreach ($assets as $asset) {
            $ledger = $ledgerTotals[$asset] ?? [
                'available' => '0.00000000',
                'locked' => '0.00000000',
                'pending' => '0.00000000',
                'total' => '0.00000000',
            ];
            $binance = $binanceBalances[$asset] ?? [
                'free' => '0.00000000',
                'locked' => '0.00000000',
                'total' => '0.00000000',
            ];

            $diff = bcsub($binance['total'], $ledger['total'], self::SCALE);
            $status = $this->resolveAssetStatus($ledger['total'], $binance['total'], $diff);

            $rows[] = [
                'asset' => $asset,
                'ledger' => [
                    'available' => $ledger['available'],
                    'locked' => $ledger['locked'],
                    'pending' => $ledger['pending'],
                    'total_liabilities' => $ledger['total'],
                ],
                'binance' => [
                    'free' => $binance['free'],
                    'locked' => $binance['locked'],
                    'total_custody' => $binance['total'],
                ],
                'diff' => $diff,
                'status' => $status,
                'in_sync' => in_array($status, ['matched', 'surplus', 'no_exposure'], true),
                'alarm' => $status === 'deficit',
            ];
        }

        return $rows;
    }

    /**
     * @param  array<string, array{available: string, locked: string, pending: string, total: string}>  $ledgerTotals
     * @return list<array<string, mixed>>
     */
    private function assetsFromLedgerOnly(array $ledgerTotals): array
    {
        return collect($ledgerTotals)
            ->map(fn (array $ledger, string $asset) => [
                'asset' => $asset,
                'ledger' => [
                    'available' => $ledger['available'],
                    'locked' => $ledger['locked'],
                    'pending' => $ledger['pending'],
                    'total_liabilities' => $ledger['total'],
                ],
                'binance' => null,
                'diff' => null,
                'status' => 'binance_unavailable',
                'in_sync' => null,
                'alarm' => false,
            ])
            ->values()
            ->all();
    }

    private function resolveAssetStatus(string $ledgerTotal, string $binanceTotal, string $diff): string
    {
        if (bccomp($ledgerTotal, '0', self::SCALE) === 0 && bccomp($binanceTotal, '0', self::SCALE) === 0) {
            return 'no_exposure';
        }

        if (bccomp($diff, '0', self::SCALE) < 0) {
            return 'deficit';
        }

        if (bccomp($diff, '0', self::SCALE) === 0) {
            return 'matched';
        }

        return 'surplus';
    }
}
