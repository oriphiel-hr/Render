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
            Route::middleware('api')->get('/', function () {
                return response()->json([
                    'service' => 'oriphiel-atomic-ledger-core',
                    'description' => 'Laravel fintech ledger — Redis lock + PostgreSQL row-level safety + BCMath',
                    'endpoints' => [
                        'health' => '/up',
                        'status' => '/api/status',
                        'transfer' => '/api/transfers (POST)',
                    ],
                    'github' => 'https://github.com/oriphiel-hr/Render/tree/main/oriphiel-atomic-ledger-core',
                ]);
            });
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (LedgerException $exception, Request $request) {
            return $exception->render($request);
        });
    })->create();
