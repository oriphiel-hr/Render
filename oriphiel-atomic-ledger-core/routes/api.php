<?php

use App\Http\Controllers\Api\ExchangeController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\LedgerStatusController;
use App\Http\Controllers\TransferController;
use Illuminate\Support\Facades\Route;

Route::get('/status', [LedgerStatusController::class, 'show']);
Route::get('/users', [UserController::class, 'index']);
Route::get('/transactions', [TransactionController::class, 'index']);
Route::post('/transfers', [TransferController::class, 'store']);

Route::prefix('exchange')->group(function () {
    Route::get('/status', [ExchangeController::class, 'status']);
    Route::get('/accounts', [ExchangeController::class, 'accounts']);
    Route::get('/audit', [ExchangeController::class, 'auditTrail']);
});
