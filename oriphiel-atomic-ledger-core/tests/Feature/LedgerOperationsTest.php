<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserBalance;
use App\Services\Ledger\ReconciliationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LedgerOperationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_deposit_confirm_updates_available_balance(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/deposits', [
            'asset' => 'USDT',
            'amount' => '25.5',
            'auto_confirm' => false,
        ])->assertCreated();

        $wallet = UserBalance::query()->where('user_id', $user->id)->where('asset', 'USDT')->first();
        $this->assertSame('0.00000000', $wallet->available);
        $this->assertSame('25.50000000', $wallet->pending);

        $operationId = $user->walletOperations()->first()->id;
        $this->postJson("/api/deposits/{$operationId}/confirm")->assertOk();

        $wallet->refresh();
        $this->assertSame('25.50000000', $wallet->available);
        $this->assertSame('0.00000000', $wallet->pending);
    }

    public function test_withdrawal_locks_and_completes_funds(): void
    {
        $user = User::factory()->withBalance('100.00000000')->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/withdrawals', [
            'asset' => 'USDT',
            'amount' => '30',
            'auto_complete' => false,
        ])->assertCreated();

        $wallet = UserBalance::query()->where('user_id', $user->id)->where('asset', 'USDT')->first();
        $this->assertSame('70.00000000', $wallet->available);
        $this->assertSame('30.00000000', $wallet->locked);

        $operationId = $response->json('data.id');
        $this->postJson("/api/withdrawals/{$operationId}/complete")->assertOk();

        $wallet->refresh();
        $this->assertSame('70.00000000', $wallet->available);
        $this->assertSame('0.00000000', $wallet->locked);
    }

    public function test_reconciliation_reports_in_sync_wallets(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->withBalance('42.00000000')->create();
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/reconciliation')->assertOk();

        $this->assertTrue($response->json('summary.healthy'));
        $rows = collect($response->json('data'));
        $userWallet = $rows->first(fn (array $row) => $row['user_id'] === $user->id && $row['asset'] === 'USDT');
        $this->assertTrue($userWallet['in_sync']);
    }

    public function test_authenticated_user_cannot_transfer_from_foreign_wallet(): void
    {
        $alice = User::factory()->withBalance('100.00000000')->create();
        $bob = User::factory()->withBalance('10.00000000')->create();
        $charlie = User::factory()->create();

        Sanctum::actingAs($bob);

        $this->postJson('/api/transfers', [
            'sender_id' => $alice->id,
            'receiver_id' => $charlie->id,
            'amount' => '5',
        ])->assertForbidden();
    }

    public function test_calculated_ledger_matches_stored_wallet(): void
    {
        $user = User::factory()->withBalance('10.00000000')->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/deposits', ['asset' => 'USDT', 'amount' => '5'])->assertCreated();

        $wallet = UserBalance::query()->where('user_id', $user->id)->where('asset', 'USDT')->first();
        $calculated = app(ReconciliationService::class)->calculateFromLedger($user->id, 'USDT');

        $this->assertSame($wallet->available, $calculated['available']);
        $this->assertSame($wallet->locked, $calculated['locked']);
        $this->assertSame($wallet->pending, $calculated['pending']);
    }
}
