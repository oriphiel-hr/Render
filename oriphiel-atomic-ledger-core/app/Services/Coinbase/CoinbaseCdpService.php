<?php

namespace App\Services\Coinbase;

use App\Enums\CoinbaseMode;
use App\Support\CoinbaseConfig;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CoinbaseCdpService
{
    public function __construct(
        private readonly CoinbaseCdpAuth $auth,
    ) {}

    public function isEnabled(): bool
    {
        return CoinbaseConfig::isEnabled();
    }

    public function mode(): CoinbaseMode
    {
        return CoinbaseConfig::mode();
    }

    public function isSandbox(): bool
    {
        return $this->mode()->isSandbox();
    }

    public function baseUrl(): string
    {
        return $this->mode()->cdpBaseUrl();
    }

    /**
     * @return array<string, mixed>
     */
    public function status(): array
    {
        $mode = $this->mode();
        $base = [
            'enabled' => $this->isEnabled(),
            'mode' => $mode->value,
            'mode_label' => $mode->label(),
            'sandbox' => $mode->isSandbox(),
            'connection_state' => $this->resolveConnectionState(),
            'base_url' => $this->baseUrl(),
            'portal_url' => $mode->portalUrl(),
            'docs_url' => 'https://docs.cdp.coinbase.com/get-started/sandbox/quickstart',
            'credentials_configured' => $this->auth->hasCredentials(),
            'cutover' => $mode->cutoverInstructions(),
            'env_flag' => 'COINBASE_MODE='.$mode->value,
        ];

        if (! $this->isEnabled()) {
            return array_merge($base, [
                'connection' => 'local_only',
                'message' => 'Ledger radi lokalno. Postavi COINBASE_ENABLED=true za CDP bridge.',
            ]);
        }

        if (! $this->auth->hasCredentials()) {
            return array_merge($base, [
                'connection' => 'awaiting_credentials',
                'message' => 'Postavi CDP API ključeve u Render env (sandbox ili production).',
            ]);
        }

        try {
            $response = $this->http()->get('/platform/v2/accounts');
            $envLabel = $mode->isSandbox() ? 'sandbox' : 'production';

            return array_merge($base, [
                'connection' => $response->successful() ? 'connected' : 'error',
                'http_status' => $response->status(),
                'message' => $response->successful()
                    ? "Povezano na Coinbase CDP ({$envLabel})."
                    : 'CDP API greška — provjeri ključeve i COINBASE_MODE.',
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
                'environment' => $this->mode()->value,
                'data' => $this->demoAccounts(),
                'note' => 'Demo računi — konfiguriraj CDP ključeve za live podatke.',
            ];
        }

        try {
            $response = $this->http()->get('/platform/v2/accounts');

            if ($response->successful()) {
                return [
                    'mode' => 'live',
                    'environment' => $this->mode()->value,
                    'data' => $response->json('accounts', $response->json()),
                ];
            }
        } catch (\Throwable $exception) {
            Log::warning('coinbase.cdp.accounts_failed', ['error' => $exception->getMessage()]);
        }

        return [
            'mode' => 'demo',
            'environment' => $this->mode()->value,
            'data' => $this->demoAccounts(),
            'note' => 'Fallback na demo — CDP nije dostupan.',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function registerLedgerTransfer(string $reference, string $amount, string $currency = 'USDC'): array
    {
        $mode = $this->mode();

        if (! $this->isEnabled()) {
            return [
                'type' => 'ledger_bridge_local',
                'reference' => $reference,
                'amount' => $amount,
                'currency' => $currency,
                'environment' => $mode->value,
                'note' => 'CDP disabled — postavi COINBASE_ENABLED=true.',
            ];
        }

        $payload = [
            'type' => 'ledger_to_cdp_bridge',
            'reference' => $reference,
            'amount' => $amount,
            'currency' => $currency,
            'environment' => $mode->value,
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

    private function resolveConnectionState(): string
    {
        if (! $this->isEnabled()) {
            return 'disabled';
        }

        if (! $this->auth->hasCredentials()) {
            return $this->mode()->isSandbox() ? 'sandbox_ready' : 'production_ready';
        }

        return $this->mode()->isSandbox() ? 'sandbox_live' : 'production_live';
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
