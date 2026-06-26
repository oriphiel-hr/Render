<?php

namespace App\Http\Controllers;

use App\Support\ExchangeConfig;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(): View
    {
        $mode = ExchangeConfig::mode();

        return view('dashboard', [
            'appName' => config('app.name'),
            'appUrl' => config('app.url'),
            'exchangeEnabled' => ExchangeConfig::isEnabled(),
            'exchangeMode' => $mode->value,
            'exchangeModeLabel' => $mode->label(),
            'exchangeIsTestnet' => $mode->isTestnet(),
        ]);
    }
}
