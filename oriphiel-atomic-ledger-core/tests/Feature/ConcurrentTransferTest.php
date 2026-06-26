<?php

namespace Tests\Feature;

use App\Enums\TransactionStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Process\Pool;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Process;
use Tests\TestCase;

class ConcurrentTransferTest extends TestCase
{
    use RefreshDatabase;

    private string $sharedDatabasePath;

    protected function setUp(): void
    {
        parent::setUp();

        if (config('cache.default') !== 'redis') {
            return;
        }

        $this->sharedDatabasePath = database_path('concurrent_test.sqlite');

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

    public function test_ten_concurrent_transfers_prevent_double_spending(): void
    {
        if (config('cache.default') !== 'redis') {
            $this->markTestSkipped('Concurrent transfer test requires Redis cache driver (CACHE_STORE=redis).');
        }

        config()->set('database.connections.sqlite.database', $this->sharedDatabasePath);

        $sender = User::query()->create([
            'name' => 'Sender',
            'balance' => '50.00000000',
        ]);
        $receiver = User::query()->create([
            'name' => 'Receiver',
            'balance' => '0.00000000',
        ]);

        $amount = '10.00000000';
        $attempts = 10;
        $subprocessEnv = $this->subprocessEnvironment();

        $results = Process::pool(function (Pool $pool) use ($sender, $receiver, $amount, $attempts, $subprocessEnv) {
            for ($index = 0; $index < $attempts; $index++) {
                $pool
                    ->as("transfer-{$index}")
                    ->path(base_path())
                    ->env($subprocessEnv)
                    ->command([
                        PHP_BINARY,
                        'artisan',
                        'ledger:simulate-transfer',
                        (string) $sender->id,
                        (string) $receiver->id,
                        $amount,
                    ]);
            }
        })->start()->wait();

        $successCount = 0;
        $insufficientFundsCount = 0;
        $lockFailureCount = 0;

        foreach ($results->collect() as $result) {
            $payload = json_decode($result->output(), true, 512, JSON_THROW_ON_ERROR);

            if (($payload['success'] ?? false) === true) {
                $successCount++;

                continue;
            }

            if (str_contains((string) ($payload['error'] ?? ''), 'InsufficientFundsException')) {
                $insufficientFundsCount++;

                continue;
            }

            if (str_contains((string) ($payload['error'] ?? ''), 'LockAcquisitionException')) {
                $lockFailureCount++;
            }
        }

        $sender->refresh();
        $receiver->refresh();

        $completedTransfers = $sender->sentTransactions()
            ->where('status', TransactionStatus::Completed)
            ->count();

        $this->assertSame(5, $successCount, 'Exactly five transfers of 10 should succeed from a balance of 50.');
        $this->assertSame(5, $attempts - $successCount, 'All non-successful attempts must be rejected.');
        $this->assertGreaterThanOrEqual(5, $insufficientFundsCount + $lockFailureCount);
        $this->assertSame(5, $completedTransfers);
        $this->assertSame('0.00000000', $sender->balance, 'Sender balance must not go negative (no double spending).');
        $this->assertSame('50.00000000', $receiver->balance, 'Receiver balance must equal sum of successful transfers.');
        $this->assertGreaterThan(0, $sender->auditLogs()->count());
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
