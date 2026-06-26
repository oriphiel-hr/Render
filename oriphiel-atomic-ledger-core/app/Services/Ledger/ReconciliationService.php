<?php

namespace App\Services\Ledger;

use App\Models\LedgerEntry;
use App\Models\UserBalance;
use Illuminate\Support\Collection;

class ReconciliationService
{
    private const SCALE = 8;

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function reconcileAll(): Collection
    {
        return UserBalance::query()
            ->orderBy('user_id')
            ->orderBy('asset')
            ->get()
            ->map(fn (UserBalance $wallet) => $this->reconcileWallet($wallet));
    }

    /**
     * @return array<string, mixed>
     */
    public function reconcileWallet(UserBalance $wallet): array
    {
        $calculated = $this->calculateFromLedger($wallet->user_id, $wallet->asset);

        return [
            'user_id' => $wallet->user_id,
            'asset' => $wallet->asset,
            'stored' => [
                'available' => $wallet->available,
                'locked' => $wallet->locked,
                'pending' => $wallet->pending,
            ],
            'calculated' => $calculated,
            'diff' => [
                'available' => bcsub($wallet->available, $calculated['available'], self::SCALE),
                'locked' => bcsub($wallet->locked, $calculated['locked'], self::SCALE),
                'pending' => bcsub($wallet->pending, $calculated['pending'], self::SCALE),
            ],
            'in_sync' => $this->isInSync($wallet, $calculated),
        ];
    }

    /**
     * @return array{available: string, locked: string, pending: string}
     */
    public function calculateFromLedger(int $userId, string $asset): array
    {
        $totals = [
            'available' => '0.00000000',
            'locked' => '0.00000000',
            'pending' => '0.00000000',
        ];

        LedgerEntry::query()
            ->where('user_id', $userId)
            ->where('asset', $asset)
            ->orderBy('id')
            ->each(function (LedgerEntry $entry) use (&$totals): void {
                $totals['available'] = bcadd($totals['available'], $entry->available_delta, self::SCALE);
                $totals['locked'] = bcadd($totals['locked'], $entry->locked_delta, self::SCALE);
                $totals['pending'] = bcadd($totals['pending'], $entry->pending_delta, self::SCALE);
            });

        return $totals;
    }

    /**
     * @param  array{available: string, locked: string, pending: string}  $calculated
     */
    private function isInSync(UserBalance $wallet, array $calculated): bool
    {
        return bccomp($wallet->available, $calculated['available'], self::SCALE) === 0
            && bccomp($wallet->locked, $calculated['locked'], self::SCALE) === 0
            && bccomp($wallet->pending, $calculated['pending'], self::SCALE) === 0;
    }
}
