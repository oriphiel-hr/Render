<?php

namespace App\Enums;

enum CoinbaseMode: string
{
    case Sandbox = 'sandbox';
    case Production = 'production';

    public function isSandbox(): bool
    {
        return $this === self::Sandbox;
    }

    public function label(): string
    {
        return match ($this) {
            self::Sandbox => 'Sandbox',
            self::Production => 'Production',
        };
    }

    public function cdpBaseUrl(): string
    {
        return match ($this) {
            self::Sandbox => (string) config('coinbase.cdp.sandbox_base_url'),
            self::Production => (string) config('coinbase.cdp.production_base_url'),
        };
    }

    public function portalUrl(): string
    {
        return match ($this) {
            self::Sandbox => 'https://portal.cdp.coinbase.com/v2/sandbox',
            self::Production => 'https://portal.cdp.coinbase.com',
        };
    }

    public function jwtUri(): string
    {
        return match ($this) {
            self::Sandbox => (string) config('coinbase.cdp.jwt_uri_sandbox'),
            self::Production => (string) config('coinbase.cdp.jwt_uri_production'),
        };
    }

    /**
     * @return array<string, string>
     */
    public function cutoverInstructions(): array
    {
        if ($this === self::Production) {
            return [
                'status' => 'live',
                'message' => 'CDP production mode is active. Real funds may move.',
            ];
        }

        return [
            'status' => 'sandbox',
            'message' => 'Sandbox mode — safe for testing. No real funds.',
            'flag' => 'COINBASE_MODE=production',
            'steps' => implode(' | ', [
                '1. Create production API keys in CDP Portal',
                '2. Set COINBASE_MODE=production on Render',
                '3. Replace COINBASE_CDP_API_KEY_NAME / PRIVATE with production keys',
                '4. Redeploy',
            ]),
        ];
    }
}
