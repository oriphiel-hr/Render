<?php

namespace App\Services\Exchange;

use App\Enums\ExchangeMode;
use App\Support\ApiSource;
use App\Support\ExchangeConfig;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BinanceExchangeService
{
    public function __construct(
        private readonly BinanceAuth $auth,
    ) {}

    public function isEnabled(): bool
    {
        return ExchangeConfig::isEnabled();
    }

    public function mode(): ExchangeMode
    {
        return ExchangeConfig::mode();
    }

    public function isTestnet(): bool
    {
        return $this->mode()->isTestnet();
    }

    public function baseUrl(): string
    {
        return $this->mode()->baseUrl();
    }

    /**
     * Live spot balances keyed by asset symbol.
     *
     * @return array{
     *     balances: array<string, array{free: string, locked: string, total: string}>,
     *     http_status: int,
     *     response_sha256: string,
     *     account_uid: int|string|null
     * }
     */
    public function fetchSpotBalances(): array
    {
        if (! $this->isEnabled() || ! $this->auth->hasCredentials()) {
            throw new \RuntimeException('Binance API keys are not configured.');
        }

        $response = $this->signedGet('/api/v3/account');
        $body = $response->body();
        $json = $response->json() ?? [];

        if (! $response->successful()) {
            throw new \RuntimeException('Binance API returned HTTP '.$response->status());
        }

        $balances = [];

        foreach ($json['balances'] ?? [] as $row) {
            $asset = (string) ($row['asset'] ?? '');
            if ($asset === '') {
                continue;
            }

            $free = bcadd((string) ($row['free'] ?? '0'), '0', 8);
            $locked = bcadd((string) ($row['locked'] ?? '0'), '0', 8);

            $balances[$asset] = [
                'free' => $free,
                'locked' => $locked,
                'total' => bcadd($free, $locked, 8),
            ];
        }

        return [
            'balances' => $balances,
            'http_status' => $response->status(),
            'response_sha256' => hash('sha256', $body),
            'account_uid' => $json['uid'] ?? null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function status(): array
    {
        $mode = $this->mode();
        $accountUrl = $this->baseUrl().'/api/v3/account';

        $base = [
            'enabled' => $this->isEnabled(),
            'enabled_reason' => $this->enabledReason(),
            'provider' => 'binance',
            'mode' => $mode->value,
            'mode_label' => $mode->label(),
            'testnet' => $mode->isTestnet(),
            'connection_state' => $this->resolveConnectionState(),
            'base_url' => $this->baseUrl(),
            'portal_url' => $mode->portalUrl(),
            'docs_url' => 'https://testnet.binance.vision',
            'credentials_configured' => $this->auth->hasCredentials(),
            'cutover' => $mode->cutoverInstructions(),
            'env_flag' => 'EXCHANGE_MODE='.$mode->value,
            'ledger_api' => url('/api/exchange/status'),
        ];

        if (! $this->isEnabled()) {
            return array_merge($base, [
                'connection' => 'awaiting_credentials',
                'message' => 'Binance bridge is off — add BINANCE_API_KEY and BINANCE_API_SECRET in Render env.',
                'data_source' => ApiSource::upstream('ledger_api', 'GET', url('/api/exchange/status'), [
                    'note' => 'API keys missing; Binance upstream not contacted.',
                ]),
            ]);
        }

        if (! $this->auth->hasCredentials()) {
            return array_merge($base, [
                'connection' => 'awaiting_credentials',
                'message' => 'Postavi BINANCE_API_KEY i BINANCE_API_SECRET u Render env.',
                'data_source' => ApiSource::upstream('ledger_api', 'GET', url('/api/exchange/status'), [
                    'note' => 'Binance credentials missing; upstream not contacted.',
                ]),
            ]);
        }

        try {
            $response = $this->signedGet('/api/v3/account');
            $envLabel = $mode->isTestnet() ? 'testnet' : 'production';

            return array_merge($base, [
                'connection' => $response->successful() ? 'connected' : 'error',
                'http_status' => $response->status(),
                'message' => $response->successful()
                    ? "Povezano na Binance Spot ({$envLabel})."
                    : 'Binance API greška — provjeri ključeve i EXCHANGE_MODE.',
                'data_source' => ApiSource::upstream('binance', 'GET', $accountUrl, [
                    'http_status' => $response->status(),
                    'verify' => 'Open GET /api/exchange/status and compare base_url with Binance docs.',
                ]),
            ]);
        } catch (\Throwable $exception) {
            Log::warning('exchange.binance.status_failed', ['error' => $exception->getMessage()]);

            return array_merge($base, [
                'connection' => 'unreachable',
                'message' => $exception->getMessage(),
                'data_source' => ApiSource::upstream('binance', 'GET', $accountUrl, [
                    'error' => $exception->getMessage(),
                ]),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function accounts(): array
    {
        $accountUrl = $this->baseUrl().'/api/v3/account';

        if (! $this->isEnabled() || ! $this->auth->hasCredentials()) {
            return [
                'provider' => 'binance',
                'mode' => 'demo',
                'environment' => $this->mode()->value,
                'data' => $this->demoAccounts(),
                'note' => 'Demo računi — postavi BINANCE_API_KEY i BINANCE_API_SECRET za live podatke.',
                'data_source' => ApiSource::upstream('ledger_api', 'GET', url('/api/exchange/accounts'), [
                    'upstream' => $accountUrl,
                    'upstream_called' => false,
                ]),
            ];
        }

        try {
            $response = $this->signedGet('/api/v3/account');

            if ($response->successful()) {
                return [
                    'provider' => 'binance',
                    'mode' => 'live',
                    'environment' => $this->mode()->value,
                    'data' => $this->mapBalances($response->json('balances', [])),
                    'data_source' => ApiSource::upstream('binance', 'GET', $accountUrl, [
                        'http_status' => $response->status(),
                        'upstream_called' => true,
                    ]),
                ];
            }
        } catch (\Throwable $exception) {
            Log::warning('exchange.binance.accounts_failed', ['error' => $exception->getMessage()]);
        }

        return [
            'provider' => 'binance',
            'mode' => 'demo',
            'environment' => $this->mode()->value,
            'data' => $this->demoAccounts(),
            'note' => 'Fallback na demo — Binance API nije dostupan.',
            'data_source' => ApiSource::upstream('binance', 'GET', $accountUrl, [
                'upstream_called' => false,
            ]),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function registerLedgerTransfer(string $reference, string $amount, string $currency = 'USDT'): array
    {
        $mode = $this->mode();

        if (! $this->isEnabled()) {
            return [
                'type' => 'ledger_bridge_local',
                'reference' => $reference,
                'amount' => $amount,
                'currency' => $currency,
                'environment' => $mode->value,
                'note' => 'Exchange disabled — postavi EXCHANGE_ENABLED=true.',
            ];
        }

        $payload = [
            'type' => 'ledger_to_binance_bridge',
            'reference' => $reference,
            'amount' => $amount,
            'currency' => $currency,
            'environment' => $mode->value,
            'base_url' => $this->baseUrl(),
            'synced_at' => now()->toIso8601String(),
        ];

        if ($this->auth->hasCredentials()) {
            try {
                $response = $this->signedGet('/api/v3/account');
                $payload['binance_response_status'] = $response->status();
                $payload['binance_account_type'] = $response->json('accountType');
            } catch (\Throwable $exception) {
                $payload['binance_error'] = $exception->getMessage();
            }
        }

        Log::channel('ledger')->info('exchange.binance.transfer_registered', $payload);

        return $payload;
    }

    private function resolveConnectionState(): string
    {
        if (! $this->isEnabled()) {
            return 'disabled';
        }

        if (! $this->auth->hasCredentials()) {
            return $this->mode()->isTestnet() ? 'testnet_ready' : 'production_ready';
        }

        return $this->mode()->isTestnet() ? 'testnet_live' : 'production_live';
    }

    private function enabledReason(): string
    {
        if ($this->auth->hasCredentials()) {
            return 'api_keys_configured';
        }

        if ($this->isEnabled()) {
            return 'exchange_enabled_flag';
        }

        return 'no_api_keys';
    }

    /**
     * Live Binance account snapshot for an authenticated demo user (on-demand).
     *
     * Uses the application's Binance API keys — all demo users see the same
     * testnet account; ledger_balances are per-user from PostgreSQL.
     *
     * @return array<string, mixed>
     */
    public function myBinanceStatus(\App\Models\User $user): array
    {
        $mode = $this->mode();
        $accountUrl = $this->baseUrl().'/api/v3/account';

        $ledgerBalances = $user->wallets()
            ->orderBy('asset')
            ->get()
            ->map(fn ($wallet) => [
                'asset' => $wallet->asset,
                'available' => $wallet->available,
                'locked' => $wallet->locked,
                'pending' => $wallet->pending,
            ])
            ->values()
            ->all();

        $base = [
            'requested_by' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'scope' => 'shared_application_binance_account',
            'scope_note' => 'This live fetch uses the Binance API keys configured on the server (one testnet account). '
                .'It is not a personal Binance login per demo user. ledger_balances are yours in this app; binance.balances are from the shared testnet wallet.',
            'ledger_balances' => $ledgerBalances,
            'binance' => null,
            'available' => false,
        ];

        if (! $this->isEnabled() || ! $this->auth->hasCredentials()) {
            return array_merge($base, [
                'message' => 'Binance API keys are not configured on the server.',
                'data_source' => ApiSource::upstream('ledger_api', 'GET', url('/api/exchange/my-binance'), [
                    'upstream_called' => false,
                ]),
            ]);
        }

        try {
            $started = microtime(true);
            $response = $this->signedGet('/api/v3/account');
            $latencyMs = (int) round((microtime(true) - $started) * 1000);
            $body = $response->body();
            $json = $response->json() ?? [];

            if (! $response->successful()) {
                return array_merge($base, [
                    'message' => 'Binance API returned HTTP '.$response->status(),
                    'verification' => [
                        'upstream_url' => $accountUrl,
                        'http_status' => $response->status(),
                        'latency_ms' => $latencyMs,
                    ],
                    'data_source' => ApiSource::upstream('binance', 'GET', $accountUrl, [
                        'upstream_called' => true,
                        'http_status' => $response->status(),
                    ]),
                ]);
            }

            $updateTime = $json['updateTime'] ?? null;

            return array_merge($base, [
                'available' => true,
                'message' => 'Live Binance '.$mode->label().' account fetched on your request.',
                'binance' => [
                    'provider' => 'binance',
                    'mode' => $mode->value,
                    'mode_label' => $mode->label(),
                    'base_url' => $this->baseUrl(),
                    'account_uid' => $json['uid'] ?? null,
                    'account_type' => $json['accountType'] ?? null,
                    'update_time' => is_numeric($updateTime)
                        ? gmdate('c', (int) floor((int) $updateTime / 1000))
                        : null,
                    'can_trade' => $json['canTrade'] ?? null,
                    'balances' => $this->mapBalances($json['balances'] ?? []),
                ],
                'verification' => [
                    'upstream_url' => $accountUrl,
                    'http_status' => $response->status(),
                    'latency_ms' => $latencyMs,
                    'response_sha256' => hash('sha256', $body),
                    'binance_account_uid' => $json['uid'] ?? null,
                    'verify_independently' => [
                        'Log in to '.$mode->portalUrl().' and compare spot balances.',
                        'Or call GET '.$accountUrl.' with your own signed request using the same API keys.',
                        'response_sha256 is the SHA-256 of the raw JSON body returned by Binance (proves this payload came from an upstream HTTP response at fetch time).',
                    ],
                    'portal_url' => $mode->portalUrl(),
                ],
                'data_source' => ApiSource::upstream('binance', 'GET', $accountUrl, [
                    'upstream_called' => true,
                    'http_status' => $response->status(),
                    'response_sha256' => hash('sha256', $body),
                    'binance_account_uid' => $json['uid'] ?? null,
                ]),
            ]);
        } catch (\Throwable $exception) {
            Log::warning('exchange.binance.my_status_failed', [
                'user_id' => $user->id,
                'error' => $exception->getMessage(),
            ]);

            return array_merge($base, [
                'message' => $exception->getMessage(),
                'data_source' => ApiSource::upstream('binance', 'GET', $accountUrl, [
                    'upstream_called' => false,
                    'error' => $exception->getMessage(),
                ]),
            ]);
        }
    }

    /**
     * @return list<array<string, string>>
     */
    private function demoAccounts(): array
    {
        return [
            ['id' => 'demo_btc', 'name' => 'BTC Wallet (demo)', 'currency' => 'BTC', 'balance' => '0.50000000'],
            ['id' => 'demo_usdt', 'name' => 'USDT Wallet (demo)', 'currency' => 'USDT', 'balance' => '10000.00000000'],
            ['id' => 'demo_eth', 'name' => 'ETH Wallet (demo)', 'currency' => 'ETH', 'balance' => '2.25000000'],
        ];
    }

    /**
     * @param  list<array<string, string>>  $balances
     * @return list<array<string, string>>
     */
    private function mapBalances(array $balances): array
    {
        $accounts = [];

        foreach ($balances as $row) {
            $free = $row['free'] ?? '0';
            if (bccomp((string) $free, '0', 8) <= 0) {
                continue;
            }

            $asset = (string) ($row['asset'] ?? 'UNKNOWN');
            $accounts[] = [
                'id' => strtolower($asset),
                'name' => $asset.' Wallet',
                'currency' => $asset,
                'balance' => $free,
            ];
        }

        if ($accounts === []) {
            return $this->demoAccounts();
        }

        usort($accounts, fn (array $a, array $b) => bccomp($b['balance'], $a['balance'], 8));

        return array_slice($accounts, 0, 10);
    }

    /**
     * @param  array<string, int|string>  $params
     */
    private function signedGet(string $path, array $params = []): \Illuminate\Http\Client\Response
    {
        $params['timestamp'] = (int) round(microtime(true) * 1000);
        $params['recvWindow'] = 5000;
        $params['signature'] = $this->auth->sign($params);

        return Http::baseUrl($this->baseUrl())
            ->timeout((int) config('exchange.timeout', 15))
            ->acceptJson()
            ->withHeaders(['X-MBX-APIKEY' => $this->auth->apiKey()])
            ->get($path, $params);
    }
}
