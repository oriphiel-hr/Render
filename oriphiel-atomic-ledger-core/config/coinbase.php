<?php

return [
    'enabled' => filter_var(env('COINBASE_ENABLED', false), FILTER_VALIDATE_BOOL),
    'sandbox' => filter_var(env('COINBASE_SANDBOX', true), FILTER_VALIDATE_BOOL),
    'api_key' => env('COINBASE_API_KEY'),
    'api_secret' => env('COINBASE_API_SECRET'),
    'sandbox_base_url' => env('COINBASE_SANDBOX_BASE_URL', 'https://api.coinbase.com'),
    'production_base_url' => env('COINBASE_PRODUCTION_BASE_URL', 'https://api.coinbase.com'),
    'timeout' => (int) env('COINBASE_TIMEOUT', 15),

    'cdp' => [
        'sandbox_base_url' => env('COINBASE_CDP_SANDBOX_URL', 'https://sandbox.cdp.coinbase.com'),
        'production_base_url' => env('COINBASE_CDP_PRODUCTION_URL', 'https://api.cdp.coinbase.com'),
        'api_key_name' => env('COINBASE_CDP_API_KEY_NAME'),
        'api_key_private' => env('COINBASE_CDP_API_KEY_PRIVATE'),
        'jwt_uri' => env('COINBASE_CDP_JWT_URI', 'GET api.cdp.coinbase.com/platform/v2/accounts'),
    ],
];
