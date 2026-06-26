<?php

return [
    'lock_ttl_seconds' => (int) env('LEDGER_LOCK_TTL_SECONDS', 10),
    'lock_wait_seconds' => (int) env('LEDGER_LOCK_WAIT_SECONDS', 5),
    'decimal_scale' => 8,

    'trade_rates' => [
        'USDT' => [
            'BTC' => '0.00001000',
            'ETH' => '0.00030000',
        ],
        'BTC' => [
            'USDT' => '100000.00000000',
            'ETH' => '30.00000000',
        ],
        'ETH' => [
            'USDT' => '3333.33333333',
            'BTC' => '0.03333333',
        ],
    ],
];
