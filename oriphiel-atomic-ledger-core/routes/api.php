<?php

use App\Http\Controllers\LedgerStatusController;
use App\Http\Controllers\TransferController;
use Illuminate\Support\Facades\Route;

Route::get('/status', [LedgerStatusController::class, 'show']);
Route::post('/transfers', [TransferController::class, 'store']);
