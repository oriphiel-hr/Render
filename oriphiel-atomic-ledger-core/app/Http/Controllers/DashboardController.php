<?php

namespace App\Http\Controllers;

use App\Support\CoinbaseConfig;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(): View
    {
        $mode = CoinbaseConfig::mode();

        return view('dashboard', [
            'coinbaseEnabled' => CoinbaseConfig::isEnabled(),
            'coinbaseMode' => $mode->value,
            'coinbaseModeLabel' => $mode->label(),
            'coinbaseIsSandbox' => $mode->isSandbox(),
            'appName' => config('app.name', 'Oriphiel Atomic Ledger'),
        ]);
    }
}
