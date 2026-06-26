<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Coinbase CDP — environment flag
    |--------------------------------------------------------------------------
    |
    | COINBASE_MODE=sandbox   → https://sandbox.cdp.coinbase.com (default, safe)
    | COINBASE_MODE=production → https://api.cdp.coinbase.com (real funds!)
    |
    | Legacy: COINBASE_SANDBOX=true|false still works if COINBASE_MODE is unset.
    |
    */
    'mode' => env('COINBASE_MODE'),

    'enabled' => filter_var(env('COINBASE_ENABLED', false), FILTER_VALIDATE_BOOL),

    // @deprecated Prefer COINBASE_MODE. Kept for backward compatibility.
    'sandbox' => filter_var(env('COINBASE_SANDBOX', true), FILTER_VALIDATE_BOOL),

    'api_key' => env('COINBASE_API_KEY'),
    'api_secret' => env('COINBASE_API_SECRET'),
    'timeout' => (int) env('COINBASE_TIMEOUT', 15),

    'cdp' => [
        'sandbox_base_url' => env('COINBASE_CDP_SANDBOX_URL', 'https://sandbox.cdp.coinbase.com'),
        'production_base_url' => env('COINBASE_CDP_PRODUCTION_URL', 'https://api.cdp.coinbase.com'),
        'api_key_name' => env('COINBASE_CDP_API_KEY_NAME'),
        'api_key_private' => env('COINBASE_CDP_API_KEY_PRIVATE'),
        'jwt_uri_sandbox' => env(
            'COINBASE_CDP_JWT_URI_SANDBOX',
            'GET sandbox.cdp.coinbase.com/platform/v2/accounts'
        ),
        'jwt_uri_production' => env(
            'COINBASE_CDP_JWT_URI_PRODUCTION',
            'GET api.cdp.coinbase.com/platform/v2/accounts'
        ),
    ],
];
