<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserBalance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PooledExchangeReconciliationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_reconciliation_includes_pooled_exchange_comparison(): void
    {
        config([
            'exchange.enabled' => true,
            'exchange.binance.api_key' => 'test-key',
            'exchange.binance.api_secret' => 'test-secret',
            'exchange.mode' => 'testnet',
        ]);

        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        UserBalance::query()->create([
            'user_id' => $user->id,
            'asset' => 'USDT',
            'available' => '100.00000000',
            'locked' => '0.00000000',
            'pending' => '0.00000000',
        ]);

        Http::fake([
            'testnet.binance.vision/api/v3/account*' => Http::response([
                'uid' => 99,
                'balances' => [
                    ['asset' => 'USDT', 'free' => '150.00000000', 'locked' => '0.00000000'],
                ],
            ], 200),
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/reconciliation')
            ->assertOk()
            ->assertJsonPath('exchange_pool.model', 'pooled_omnibus')
            ->assertJsonPath('exchange_pool.healthy', true)
            ->assertJsonPath('summary_combined.exchange_pool_healthy', true);

        $usdt = collect($response->json('exchange_pool.assets'))
            ->firstWhere('asset', 'USDT');

        $this->assertSame('100.00000000', $usdt['ledger']['total_liabilities']);
        $this->assertSame('150.00000000', $usdt['binance']['total_custody']);
        $this->assertSame('50.00000000', $usdt['diff']);
        $this->assertSame('surplus', $usdt['status']);
    }

    public function test_pooled_reconciliation_flags_deficit_when_binance_is_short(): void
    {
        config([
            'exchange.enabled' => true,
            'exchange.binance.api_key' => 'test-key',
            'exchange.binance.api_secret' => 'test-secret',
            'exchange.mode' => 'testnet',
        ]);

        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        UserBalance::query()->create([
            'user_id' => $user->id,
            'asset' => 'USDT',
            'available' => '500.00000000',
            'locked' => '0.00000000',
            'pending' => '0.00000000',
        ]);

        Http::fake([
            'testnet.binance.vision/api/v3/account*' => Http::response([
                'uid' => 99,
                'balances' => [
                    ['asset' => 'USDT', 'free' => '100.00000000', 'locked' => '0.00000000'],
                ],
            ], 200),
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/reconciliation')
            ->assertOk()
            ->assertJsonPath('exchange_pool.status', 'deficit')
            ->assertJsonPath('exchange_pool.healthy', false)
            ->assertJsonPath('summary_combined.overall_healthy', false);
    }
}
