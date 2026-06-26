<?php

return [
    'lock_ttl_seconds' => (int) env('LEDGER_LOCK_TTL_SECONDS', 10),
    'lock_wait_seconds' => (int) env('LEDGER_LOCK_WAIT_SECONDS', 5),
    'decimal_scale' => 8,
];
