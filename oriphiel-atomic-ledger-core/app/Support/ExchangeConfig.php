<?php

namespace App\Support;

use App\Enums\ExchangeMode;

class ExchangeConfig
{
    public static function mode(): ExchangeMode
    {
        return ExchangeMode::from(strtolower((string) config('exchange.mode', 'testnet')));
    }

    public static function isEnabled(): bool
    {
        return (bool) config('exchange.enabled');
    }
}
