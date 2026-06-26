<?php

namespace App\Services\Coinbase;

use Firebase\JWT\JWT;

class CoinbaseCdpAuth
{
    public function hasCredentials(): bool
    {
        return filled(config('coinbase.cdp.api_key_name'))
            && filled(config('coinbase.cdp.api_key_private'));
    }

    public function bearerToken(): ?string
    {
        if (! $this->hasCredentials()) {
            return null;
        }

        $now = time();
        $payload = [
            'sub' => config('coinbase.cdp.api_key_name'),
            'iss' => 'cdp',
            'nbf' => $now,
            'exp' => $now + 120,
            'uri' => config('coinbase.cdp.jwt_uri', 'GET api.cdp.coinbase.com/platform/v2/accounts'),
        ];

        $privateKey = str_replace('\\n', "\n", (string) config('coinbase.cdp.api_key_private'));

        return JWT::encode($payload, $privateKey, 'ES256');
    }
}
