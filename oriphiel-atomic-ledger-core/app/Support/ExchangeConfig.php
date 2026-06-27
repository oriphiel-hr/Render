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
        if (self::hasCredentials()) {
            return true;
        }

        return (bool) config('exchange.enabled');
    }

    public static function hasCredentials(): bool
    {
        return filled(config('exchange.binance.api_key'))
            && filled(config('exchange.binance.api_secret'));
    }
}
