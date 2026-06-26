<?php

use App\Http\Controllers\Api\CoinbaseController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\LedgerStatusController;
use App\Http\Controllers\TransferController;
use Illuminate\Support\Facades\Route;

Route::get('/status', [LedgerStatusController::class, 'show']);
Route::get('/users', [UserController::class, 'index']);
Route::get('/transactions', [TransactionController::class, 'index']);
Route::post('/transfers', [TransferController::class, 'store']);

Route::prefix('coinbase')->group(function () {
    Route::get('/status', [CoinbaseController::class, 'status']);
    Route::get('/accounts', [CoinbaseController::class, 'accounts']);
    Route::get('/audit', [CoinbaseController::class, 'auditTrail']);
});
