<?php

namespace App\Support;

use App\Enums\LedgerEntryType;
use App\Models\LedgerEntry;
use App\Models\UserBalance;

class LedgerBootstrap
{
    public static function recordOpeningBalance(UserBalance $wallet, string $available, string $locked = '0', string $pending = '0'): void
    {
        if (bccomp($available, '0', 8) === 0 && bccomp($locked, '0', 8) === 0 && bccomp($pending, '0', 8) === 0) {
            return;
        }

        LedgerEntry::query()->firstOrCreate(
            ['idempotency_key' => "opening:{$wallet->user_id}:{$wallet->asset}"],
            [
                'user_id' => $wallet->user_id,
                'asset' => $wallet->asset,
                'available_delta' => $available,
                'locked_delta' => $locked,
                'pending_delta' => $pending,
                'entry_type' => LedgerEntryType::OpeningBalance,
                'metadata' => ['source' => 'seed'],
                'created_at' => now(),
            ],
        );
    }
}
