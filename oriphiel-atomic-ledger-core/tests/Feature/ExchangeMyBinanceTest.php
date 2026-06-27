<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ExchangeMyBinanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_request_live_binance_snapshot(): void
    {
        config([
            'exchange.enabled' => true,
            'exchange.binance.api_key' => 'test-key',
            'exchange.binance.api_secret' => 'test-secret',
            'exchange.mode' => 'testnet',
        ]);

        $user = User::factory()->create([
            'email' => 'alice@demo.local',
            'password' => 'password',
        ]);

        Http::fake([
            'testnet.binance.vision/api/v3/account*' => Http::response([
                'uid' => 424242,
                'accountType' => 'SPOT',
                'canTrade' => true,
                'updateTime' => 1_700_000_000_000,
                'balances' => [
                    ['asset' => 'USDT', 'free' => '123.45000000', 'locked' => '0.00000000'],
                    ['asset' => 'BTC', 'free' => '0.00000000', 'locked' => '0.00000000'],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/exchange/my-binance')
            ->assertOk()
            ->assertJsonPath('requested_by.email', 'alice@demo.local')
            ->assertJsonPath('available', true)
            ->assertJsonPath('binance.account_uid', 424242)
            ->assertJsonPath('data_source.provider', 'binance')
            ->assertJsonPath('data_source.upstream_called', true);

        $this->assertNotEmpty($response->json('verification.response_sha256'));
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'exchange.binance_checked',
        ]);
    }

    public function test_guest_cannot_request_my_binance(): void
    {
        $this->getJson('/api/exchange/my-binance')->assertUnauthorized();
    }
}
