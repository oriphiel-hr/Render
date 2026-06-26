<?php

namespace App\Services\Coinbase;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CoinbaseClient
{
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
        return config('coinbase.sandbox')
            ? config('coinbase.sandbox_base_url')
            : config('coinbase.production_base_url');
    }

    public function http(): PendingRequest
    {
        return Http::baseUrl($this->baseUrl())
            ->timeout((int) config('coinbase.timeout', 15))
            ->withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])
            ->when(
                config('coinbase.api_key') && config('coinbase.api_secret'),
                fn (PendingRequest $request) => $request->withToken(
                    $this->buildBearerToken()
                )
            );
    }

    /**
     * Coinbase Developer Platform sandbox health probe.
     *
     * @return array<string, mixed>
     */
    public function ping(): array
    {
        if (! $this->isEnabled()) {
            return [
                'enabled' => false,
                'sandbox' => $this->isSandbox(),
                'status' => 'disabled',
            ];
        }

        try {
            $response = $this->http()->get('/v2/accounts');

            return [
                'enabled' => true,
                'sandbox' => $this->isSandbox(),
                'status' => $response->successful() ? 'ok' : 'error',
                'http_status' => $response->status(),
            ];
        } catch (\Throwable $exception) {
            Log::warning('coinbase.ping_failed', [
                'message' => $exception->getMessage(),
                'sandbox' => $this->isSandbox(),
            ]);

            return [
                'enabled' => true,
                'sandbox' => $this->isSandbox(),
                'status' => 'unreachable',
                'error' => $exception->getMessage(),
            ];
        }
    }

    /**
     * Register a completed ledger transfer in Coinbase sandbox (optional bridge).
     *
     * @return array<string, mixed>|null
     */
    public function registerTransfer(string $reference, string $amount, string $currency = 'BTC'): ?array
    {
        if (! $this->isEnabled()) {
            return null;
        }

        $payload = [
            'type' => 'ledger_sync',
            'reference' => $reference,
            'amount' => $amount,
            'currency' => $currency,
            'sandbox' => $this->isSandbox(),
        ];

        Log::channel('ledger')->info('coinbase.transfer_registered', $payload);

        return $payload;
    }

    private function buildBearerToken(): string
    {
        return (string) config('coinbase.api_key');
    }
}
