<?php

return [

    /*
    |--------------------------------------------------------------------------
    | External exchange bridge (Binance Spot)
    |--------------------------------------------------------------------------
    |
    | EXCHANGE_MODE=testnet   → https://testnet.binance.vision (default, safe)
    | EXCHANGE_MODE=production → https://api.binance.com (real funds!)
    |
    */

    'enabled' => filter_var(env('EXCHANGE_ENABLED', false), FILTER_VALIDATE_BOOL),

    'mode' => env('EXCHANGE_MODE', 'testnet'),

    'timeout' => (int) env('EXCHANGE_TIMEOUT', 15),

    'binance' => [
        'api_key' => env('BINANCE_API_KEY'),
        'api_secret' => env('BINANCE_API_SECRET'),
        'testnet_base_url' => env('BINANCE_TESTNET_BASE_URL', 'https://testnet.binance.vision'),
        'production_base_url' => env('BINANCE_PRODUCTION_BASE_URL', 'https://api.binance.com'),
    ],

];
