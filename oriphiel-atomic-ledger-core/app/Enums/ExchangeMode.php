<?php

namespace App\Enums;

enum ExchangeMode: string
{
    case Testnet = 'testnet';
    case Production = 'production';

    public function label(): string
    {
        return match ($this) {
            self::Testnet => 'Binance Testnet',
            self::Production => 'Binance Production',
        };
    }

    public function isTestnet(): bool
    {
        return $this === self::Testnet;
    }

    public function baseUrl(): string
    {
        return match ($this) {
            self::Testnet => (string) config('exchange.binance.testnet_base_url'),
            self::Production => (string) config('exchange.binance.production_base_url'),
        };
    }

    public function portalUrl(): string
    {
        return match ($this) {
            self::Testnet => 'https://testnet.binance.vision',
            self::Production => 'https://www.binance.com',
        };
    }

    /**
     * @return array<string, mixed>
     */
    public function cutoverInstructions(): array
    {
        return [
            'flag' => 'EXCHANGE_MODE=production',
            'steps' => implode(' ', [
                '1. Create production API keys on binance.com',
                '2. Set EXCHANGE_MODE=production on Render',
                '3. Replace BINANCE_API_KEY / BINANCE_API_SECRET with production keys',
                '4. Redeploy',
            ]),
        ];
    }
}
