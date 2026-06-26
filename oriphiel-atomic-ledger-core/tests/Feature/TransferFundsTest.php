<?php

namespace Tests\Feature;

use App\Enums\TransactionStatus;
use App\Models\User;
use App\Models\UserBalance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TransferFundsTest extends TestCase
{
    use RefreshDatabase;

    public function test_successful_transfer_updates_balances_and_creates_audit_trail(): void
    {
        $sender = User::factory()->withBalance('100.00000000')->create();
        $receiver = User::factory()->withBalance('25.00000000')->create();
        Sanctum::actingAs($sender);

        $response = $this->postJson('/api/transfers', [
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'amount' => '10.5',
            'asset' => 'USDT',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.status', TransactionStatus::Completed->value)
            ->assertJsonPath('data.amount', '10.50000000');

        $senderWallet = UserBalance::query()->where('user_id', $sender->id)->where('asset', 'USDT')->first();
        $receiverWallet = UserBalance::query()->where('user_id', $receiver->id)->where('asset', 'USDT')->first();

        $this->assertSame('89.50000000', $senderWallet->available);
        $this->assertSame('35.50000000', $receiverWallet->available);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'transfer.completed',
            'user_id' => $sender->id,
        ]);
    }

    public function test_insufficient_funds_returns_structured_error(): void
    {
        $sender = User::factory()->withBalance('5.00000000')->create();
        $receiver = User::factory()->create();
        Sanctum::actingAs($sender);

        $response = $this->postJson('/api/transfers', [
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'amount' => '10.00000000',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('code', 'INSUFFICIENT_FUNDS');

        $senderWallet = UserBalance::query()->where('user_id', $sender->id)->where('asset', 'USDT')->first();
        $this->assertSame('5.00000000', $senderWallet->available);
    }

    public function test_idempotency_key_returns_existing_transaction(): void
    {
        $sender = User::factory()->withBalance('100.00000000')->create();
        $receiver = User::factory()->create();
        Sanctum::actingAs($sender);

        $payload = [
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'amount' => '1.00000000',
            'idempotency_key' => 'idem-001',
        ];

        $first = $this->postJson('/api/transfers', $payload)->assertCreated();
        $second = $this->postJson('/api/transfers', $payload)->assertCreated();

        $this->assertSame($first->json('data.id'), $second->json('data.id'));
        $this->assertSame(1, $sender->sentTransactions()->count());
    }
}
