<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('production') && config('session.driver') === 'database') {
            if (! \Illuminate\Support\Facades\Schema::hasTable('sessions')) {
                config(['session.driver' => 'cookie']);
            }
        }
    }
}
