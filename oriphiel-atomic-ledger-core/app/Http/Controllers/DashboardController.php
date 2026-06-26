<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(): View
    {
        return view('dashboard', [
            'coinbaseEnabled' => (bool) config('coinbase.enabled'),
            'coinbaseSandbox' => (bool) config('coinbase.sandbox'),
            'appName' => config('app.name', 'Oriphiel Atomic Ledger'),
        ]);
    }
}
