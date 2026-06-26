<?php

namespace App\Support;

use App\Enums\CoinbaseMode;

class CoinbaseConfig
{
    public static function mode(): CoinbaseMode
    {
        $explicit = strtolower((string) config('coinbase.mode', ''));

        if (in_array($explicit, ['sandbox', 'production'], true)) {
            return CoinbaseMode::from($explicit);
        }

        return filter_var(config('coinbase.sandbox'), FILTER_VALIDATE_BOOL)
            ? CoinbaseMode::Sandbox
            : CoinbaseMode::Production;
    }

    public static function isEnabled(): bool
    {
        return (bool) config('coinbase.enabled');
    }
}
