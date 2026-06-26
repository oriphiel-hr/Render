<?php

namespace App\Services\Coinbase;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CoinbaseCdpService
{
    public function __construct(
        private readonly CoinbaseCdpAuth $auth,
    ) {}

    public function isEnabled(): bool
    {
        return (bool) config('coinbase.enabled');
    }

    public function isSandbox(): bool
    {
        return (bool) config('coinbase.sandbox');
    }

    public function baseUrl(): string
    {
        return $this->isSandbox()
            ? (string) config('coinbase.cdp.sandbox_base_url')
            : (string) config('coinbase.cdp.production_base_url');
    }

    /**
     * @return array<string, mixed>
     */
    public function status(): array
    {
        $base = [
            'enabled' => $this->isEnabled(),
            'sandbox' => $this->isSandbox(),
            'mode' => $this->resolveMode(),
            'base_url' => $this->baseUrl(),
            'portal_url' => $this->isSandbox()
                ? 'https://portal.cdp.coinbase.com/v2/sandbox'
                : 'https://portal.cdp.coinbase.com',
            'docs_url' => 'https://docs.cdp.coinbase.com/get-started/sandbox/quickstart',
            'credentials_configured' => $this->auth->hasCredentials(),
        ];

        if (! $this->isEnabled()) {
            return array_merge($base, [
                'connection' => 'local_only',
                'message' => 'Ledger radi lokalno. Uključi COINBASE_ENABLED=true za CDP sandbox bridge.',
            ]);
        }

        if (! $this->auth->hasCredentials()) {
            return array_merge($base, [
                'connection' => 'awaiting_credentials',
                'message' => 'Postavi COINBASE_CDP_API_KEY_NAME i COINBASE_CDP_API_KEY_PRIVATE u Render env.',
            ]);
        }

        try {
            $response = $this->http()->get('/platform/v2/accounts');

            return array_merge($base, [
                'connection' => $response->successful() ? 'connected' : 'error',
                'http_status' => $response->status(),
                'message' => $response->successful()
                    ? 'Povezano na Coinbase Developer Platform sandbox.'
                    : 'CDP API vratio grešku — provjeri API ključeve.',
            ]);
        } catch (\Throwable $exception) {
            Log::warning('coinbase.cdp.status_failed', ['error' => $exception->getMessage()]);

            return array_merge($base, [
                'connection' => 'unreachable',
                'message' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function accounts(): array
    {
        if (! $this->isEnabled() || ! $this->auth->hasCredentials()) {
            return [
                'mode' => 'demo',
                'data' => $this->demoAccounts(),
                'note' => 'Demo sandbox računi — konfiguriraj CDP ključeve za live podatke.',
            ];
        }

        try {
            $response = $this->http()->get('/platform/v2/accounts');

            if ($response->successful()) {
                return [
                    'mode' => 'live',
                    'data' => $response->json('accounts', $response->json()),
                ];
            }
        } catch (\Throwable $exception) {
            Log::warning('coinbase.cdp.accounts_failed', ['error' => $exception->getMessage()]);
        }

        return [
            'mode' => 'demo',
            'data' => $this->demoAccounts(),
            'note' => 'Fallback na demo prikaz — CDP nije dostupan.',
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function registerLedgerTransfer(string $reference, string $amount, string $currency = 'USDC'): ?array
    {
        if (! $this->isEnabled()) {
            return [
                'type' => 'ledger_bridge_local',
                'reference' => $reference,
                'amount' => $amount,
                'currency' => $currency,
                'sandbox' => $this->isSandbox(),
                'note' => 'CDP disabled — postavi COINBASE_ENABLED=true za sandbox sync.',
            ];
        }

        $payload = [
            'type' => 'ledger_to_cdp_bridge',
            'reference' => $reference,
            'amount' => $amount,
            'currency' => $currency,
            'sandbox' => $this->isSandbox(),
            'cdp_base_url' => $this->baseUrl(),
            'synced_at' => now()->toIso8601String(),
        ];

        if ($this->auth->hasCredentials()) {
            try {
                $response = $this->http()->post('/platform/v2/transfers', [
                    'idempotency_key' => $reference,
                    'amount' => $amount,
                    'currency' => $currency,
                    'metadata' => ['ledger_reference' => $reference],
                ]);

                $payload['cdp_response_status'] = $response->status();
                $payload['cdp_response'] = $response->json();
            } catch (\Throwable $exception) {
                $payload['cdp_error'] = $exception->getMessage();
            }
        }

        Log::channel('ledger')->info('coinbase.cdp.transfer_registered', $payload);

        return $payload;
    }

    private function resolveMode(): string
    {
        if (! $this->isEnabled()) {
            return 'disabled';
        }

        if (! $this->auth->hasCredentials()) {
            return 'sandbox_ready';
        }

        return $this->isSandbox() ? 'sandbox_live' : 'production';
    }

    /**
     * @return list<array<string, string>>
     */
    private function demoAccounts(): array
    {
        return [
            ['id' => 'sandbox_btc', 'name' => 'BTC Wallet (demo)', 'currency' => 'BTC', 'balance' => '0.50000000'],
            ['id' => 'sandbox_usdc', 'name' => 'USDC Wallet (demo)', 'currency' => 'USDC', 'balance' => '10000.00000000'],
            ['id' => 'sandbox_eth', 'name' => 'ETH Wallet (demo)', 'currency' => 'ETH', 'balance' => '2.25000000'],
        ];
    }

    private function http(): \Illuminate\Http\Client\PendingRequest
    {
        $request = Http::baseUrl($this->baseUrl())
            ->timeout((int) config('coinbase.timeout', 15))
            ->acceptJson();

        $token = $this->auth->bearerToken();
        if ($token !== null) {
            $request = $request->withToken($token);
        }

        return $request;
    }
}
