<?php

namespace Tests\Feature;

use App\Enums\TransactionStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransferFundsTest extends TestCase
{
    use RefreshDatabase;

    public function test_successful_transfer_updates_balances_and_creates_audit_trail(): void
    {
        $sender = User::factory()->withBalance('100.00000000')->create();
        $receiver = User::factory()->withBalance('25.00000000')->create();

        $response = $this->postJson('/api/transfers', [
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'amount' => '10.5',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.status', TransactionStatus::Completed->value)
            ->assertJsonPath('data.amount', '10.50000000');

        $sender->refresh();
        $receiver->refresh();

        $this->assertSame('89.50000000', $sender->balance);
        $this->assertSame('35.50000000', $receiver->balance);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'transfer.completed',
            'user_id' => $sender->id,
        ]);
    }

    public function test_insufficient_funds_returns_structured_error(): void
    {
        $sender = User::factory()->withBalance('5.00000000')->create();
        $receiver = User::factory()->create();

        $response = $this->postJson('/api/transfers', [
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'amount' => '10.00000000',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('code', 'INSUFFICIENT_FUNDS');

        $sender->refresh();
        $receiver->refresh();

        $this->assertSame('5.00000000', $sender->balance);
        $this->assertSame('0.00000000', $receiver->balance);
    }

    public function test_idempotency_key_returns_existing_transaction(): void
    {
        $sender = User::factory()->withBalance('100.00000000')->create();
        $receiver = User::factory()->create();
        $payload = [
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'amount' => '1.00000000',
            'idempotency_key' => 'idem-001',
        ];

        $first = $this->postJson('/api/transfers', $payload)->assertCreated();
        $second = $this->postJson('/api/transfers', $payload)->assertCreated();

        $this->assertSame(
            $first->json('data.id'),
            $second->json('data.id')
        );

        $this->assertSame(1, $sender->sentTransactions()->count());
    }
}
