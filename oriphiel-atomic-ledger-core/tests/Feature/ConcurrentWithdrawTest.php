<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserBalance;
use App\Support\LedgerBootstrap;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Process\Pool;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Process;
use Tests\TestCase;

class ConcurrentWithdrawTest extends TestCase
{
    use RefreshDatabase;

    private string $sharedDatabasePath;

    protected function setUp(): void
    {
        parent::setUp();

        if (config('cache.default') !== 'redis') {
            return;
        }

        $this->sharedDatabasePath = database_path('concurrent_withdraw_test.sqlite');

        if (file_exists($this->sharedDatabasePath)) {
            unlink($this->sharedDatabasePath);
        }

        touch($this->sharedDatabasePath);

        config()->set('database.default', 'sqlite');
        config()->set('database.connections.sqlite.database', $this->sharedDatabasePath);

        Artisan::call('migrate:fresh', ['--force' => true]);
    }

    protected function tearDown(): void
    {
        if (isset($this->sharedDatabasePath) && file_exists($this->sharedDatabasePath)) {
            unlink($this->sharedDatabasePath);
        }

        parent::tearDown();
    }

    public function test_concurrent_withdrawals_do_not_overdraw_available_balance(): void
    {
        if (config('cache.default') !== 'redis') {
            $this->markTestSkipped('Concurrent withdrawal test requires Redis cache driver.');
        }

        config()->set('database.connections.sqlite.database', $this->sharedDatabasePath);

        $user = User::factory()->create();
        UserBalance::query()->create([
            'user_id' => $user->id,
            'asset' => 'USDT',
            'available' => '50.00000000',
            'locked' => '0.00000000',
            'pending' => '0.00000000',
        ]);
        LedgerBootstrap::recordOpeningBalance(
            UserBalance::query()->where('user_id', $user->id)->where('asset', 'USDT')->first(),
            '50.00000000',
        );

        $amount = '10.00000000';
        $attempts = 10;
        $env = $this->subprocessEnvironment();

        $results = Process::pool(function (Pool $pool) use ($user, $amount, $attempts, $env) {
            for ($index = 0; $index < $attempts; $index++) {
                $pool
                    ->as("withdraw-{$index}")
                    ->path(base_path())
                    ->env($env)
                    ->command([
                        PHP_BINARY,
                        'artisan',
                        'ledger:simulate-withdraw',
                        (string) $user->id,
                        $amount,
                        'USDT',
                    ]);
            }
        })->start()->wait();

        $successCount = 0;

        foreach ($results->collect() as $result) {
            $payload = json_decode($result->output(), true, 512, JSON_THROW_ON_ERROR);
            if (($payload['success'] ?? false) === true) {
                $successCount++;
            }
        }

        $wallet = UserBalance::query()->where('user_id', $user->id)->where('asset', 'USDT')->first();
        $wallet->refresh();

        $this->assertSame(5, $successCount);
        $this->assertSame('0.00000000', $wallet->available);
        $this->assertSame('0.00000000', $wallet->locked);
        $this->assertGreaterThanOrEqual(0, bccomp($wallet->available, '0', 8));
    }

    /**
     * @return array<string, string>
     */
    private function subprocessEnvironment(): array
    {
        return [
            'APP_ENV' => 'testing',
            'APP_KEY' => config('app.key'),
            'DB_CONNECTION' => 'sqlite',
            'DB_DATABASE' => $this->sharedDatabasePath,
            'CACHE_STORE' => 'redis',
            'REDIS_CLIENT' => (string) config('database.redis.client'),
            'REDIS_HOST' => (string) config('database.redis.default.host'),
            'REDIS_PORT' => (string) config('database.redis.default.port'),
            'REDIS_PASSWORD' => (string) (config('database.redis.default.password') ?? ''),
            'LEDGER_LOCK_TTL_SECONDS' => '30',
            'LEDGER_LOCK_WAIT_SECONDS' => '30',
        ];
    }
}
