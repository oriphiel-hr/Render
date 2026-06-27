<?php

namespace App\Support;

use Illuminate\Http\Request;

class ApiSource
{
    /**
     * @return array<string, mixed>
     */
    public static function forRequest(Request $request): array
    {
        return [
            'endpoint' => $request->method().' '.$request->path(),
            'url' => $request->fullUrl(),
            'fetched_at' => now()->toIso8601String(),
            'authenticated' => $request->user() !== null,
        ];
    }

    /**
     * Provenance for atomic-ledger data stored in PostgreSQL (not Binance spot API).
     *
     * @return array<string, mixed>
     */
    public static function forLedger(string $table, string $apiPath, ?string $note = null): array
    {
        $mode = ExchangeConfig::mode();
        $credentialsConfigured = ExchangeConfig::hasCredentials();
        $exchangeEnabled = ExchangeConfig::isEnabled();

        return [
            'provider' => 'local_ledger',
            'origin_label' => 'Local atomic ledger (PostgreSQL)',
            'storage' => 'postgresql',
            'table' => $table,
            'method' => 'SELECT',
            'url' => url($apiPath),
            'fetched_at' => now()->toIso8601String(),
            'upstream_called' => false,
            'note' => $note ?? 'Balances from this app\'s atomic ledger in PostgreSQL — not live Binance spot balances.',
            'exchange_bridge' => [
                'enabled' => $exchangeEnabled,
                'provider' => 'binance',
                'mode' => $mode->value,
                'mode_label' => $mode->label(),
                'base_url' => $mode->baseUrl(),
                'credentials_configured' => $credentialsConfigured,
                'live_balances_endpoint' => url('/api/exchange/accounts'),
                'status_endpoint' => url('/api/exchange/status'),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $upstream
     * @return array<string, mixed>
     */
    public static function upstream(string $provider, string $method, string $url, array $upstream = []): array
    {
        $originLabel = match ($provider) {
            'binance' => str_contains($url, 'testnet.binance.vision')
                ? 'Binance Spot API — testnet (live upstream)'
                : 'Binance Spot API — production (live upstream)',
            'ledger_api' => 'This application only (Binance not called)',
            default => ucfirst($provider).' API',
        };

        return array_merge([
            'provider' => $provider,
            'origin_label' => $originLabel,
            'method' => $method,
            'url' => $url,
            'fetched_at' => now()->toIso8601String(),
        ], $upstream);
    }
}
