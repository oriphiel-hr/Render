<?php

use App\Exceptions\LedgerException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
        then: function () {
            Route::middleware('api')->get('/', [\App\Http\Controllers\DashboardController::class, 'index']);
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');
        $middleware->encryptCookies(except: [
            'ledger_api_token',
        ]);
        $middleware->redirectGuestsTo(fn (Request $request) => $request->is('api/*') ? null : '/');
        $middleware->api(prepend: [
            \App\Http\Middleware\AuthenticateApiTokenFromCookie::class,
        ]);
        $middleware->api(append: [
            \App\Http\Middleware\AddApiSourceMetadata::class,
        ]);
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureAdmin::class,
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(fn (Request $request, \Throwable $e) => $request->is('api/*') || $request->expectsJson());

        $exceptions->render(function (LedgerException $exception, Request $request) {
            return $exception->render($request);
        });
    })->create();
