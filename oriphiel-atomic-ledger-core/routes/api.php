<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ExchangeController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\LedgerStatusController;
use App\Http\Controllers\TransferController;
use Illuminate\Support\Facades\Route;

Route::get('/status', [LedgerStatusController::class, 'show']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/verification/resend', [AuthController::class, 'resendVerification'])->middleware('throttle:6,1');
    Route::post('/accept-invite', [AuthController::class, 'acceptInvite']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/wallets', [WalletController::class, 'index']);
    Route::post('/deposits', [WalletController::class, 'deposit']);
    Route::post('/deposits/{operationId}/confirm', [WalletController::class, 'confirmDeposit']);
    Route::post('/withdrawals', [WalletController::class, 'withdraw']);
    Route::post('/withdrawals/{operationId}/complete', [WalletController::class, 'completeWithdrawal']);
    Route::post('/trades', [WalletController::class, 'trade']);
    Route::get('/ledger', [WalletController::class, 'ledger']);
    Route::get('/operations', [WalletController::class, 'operations']);
    Route::get('/my/transactions', [WalletController::class, 'transactions']);
    Route::post('/transfers', [TransferController::class, 'store']);
    Route::get('/users', [UserController::class, 'index']);

    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/reconciliation', [AdminController::class, 'reconciliation']);
        Route::post('/adjustments', [AdminController::class, 'adjust']);
        Route::post('/invites', [AdminController::class, 'invite']);
        Route::get('/invites', [AdminController::class, 'invitations']);
    });
});

Route::get('/transactions', [TransactionController::class, 'index']);

Route::prefix('exchange')->group(function () {
    Route::get('/status', [ExchangeController::class, 'status']);
    Route::get('/accounts', [ExchangeController::class, 'accounts']);
    Route::get('/audit', [ExchangeController::class, 'auditTrail']);
});
