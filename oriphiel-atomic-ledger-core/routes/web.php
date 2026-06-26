<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'service' => 'oriphiel-atomic-ledger-core',
        'description' => 'Laravel fintech ledger — Redis lock + PostgreSQL row-level safety + BCMath',
        'endpoints' => [
            'health' => url('/up'),
            'status' => url('/api/status'),
            'transfer' => url('/api/transfers').' (POST)',
        ],
        'github' => 'https://github.com/oriphiel-hr/Render/tree/main/oriphiel-atomic-ledger-core',
    ]);
});
