<?php

namespace App\Services\Exchange;

class BinanceAuth
{
    public function hasCredentials(): bool
    {
        return filled(config('exchange.binance.api_key'))
            && filled(config('exchange.binance.api_secret'));
    }

    /**
     * @param  array<string, int|string>  $params
     */
    public function sign(array $params): string
    {
        $query = http_build_query($params);

        return hash_hmac(
            'sha256',
            $query,
            (string) config('exchange.binance.api_secret'),
        );
    }

    public function apiKey(): string
    {
        return (string) config('exchange.binance.api_key');
    }
}
