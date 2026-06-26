<?php

use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\InviteController;
use Illuminate\Support\Facades\Route;

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::get('/invite/{token}', [InviteController::class, 'show'])->name('invite.show');
