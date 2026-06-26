<?php

return [
    'enabled' => filter_var(env('COINBASE_ENABLED', false), FILTER_VALIDATE_BOOL),
    'sandbox' => filter_var(env('COINBASE_SANDBOX', true), FILTER_VALIDATE_BOOL),
    'api_key' => env('COINBASE_API_KEY'),
    'api_secret' => env('COINBASE_API_SECRET'),
    'sandbox_base_url' => env('COINBASE_SANDBOX_BASE_URL', 'https://api.coinbase.com'),
    'production_base_url' => env('COINBASE_PRODUCTION_BASE_URL', 'https://api.coinbase.com'),
    'timeout' => (int) env('COINBASE_TIMEOUT', 15),
];
