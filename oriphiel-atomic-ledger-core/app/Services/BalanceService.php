<?php

namespace App\Services;

use App\Enums\TransactionStatus;
use App\Exceptions\InsufficientFundsException;
use App\Exceptions\InvalidTransferException;
use App\Exceptions\LockAcquisitionException;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Audit\TransactionAuditService;
use App\Services\Coinbase\CoinbaseLedgerBridge;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class BalanceService
{
    private const SCALE = 8;

    public function __construct(
        private readonly TransactionAuditService $auditService,
        private readonly CoinbaseLedgerBridge $coinbaseBridge,
    ) {}

    public function transferFunds(
        int $senderId,
        int $receiverId,
        string $amount,
        ?string $idempotencyKey = null,
        ?string $ipAddress = null,
    ): Transaction {
        $normalizedAmount = $this->normalizeAmount($amount);

        if ($senderId === $receiverId) {
            throw new InvalidTransferException('Sender and receiver must be different users.');
        }

        if (bccomp($normalizedAmount, '0', self::SCALE) <= 0) {
            throw new InvalidTransferException('Transfer amount must be greater than zero.');
        }

        if ($idempotencyKey !== null) {
            $existing = Transaction::query()
                ->where('idempotency_key', $idempotencyKey)
                ->first();

            if ($existing !== null) {
                return $existing;
            }
        }

        $lockKey = $this->buildLockKey($senderId, $receiverId);
        $lock = Cache::lock($lockKey, config('ledger.lock_ttl_seconds', 10));

        try {
            return $lock->block(
                config('ledger.lock_wait_seconds', 5),
                fn () => $this->executeTransfer(
                    $senderId,
                    $receiverId,
                    $normalizedAmount,
                    $idempotencyKey,
                    $ipAddress,
                ),
            );
        } catch (LockTimeoutException) {
            throw new LockAcquisitionException($lockKey);
        }
    }

    private function executeTransfer(
        int $senderId,
        int $receiverId,
        string $amount,
        ?string $idempotencyKey,
        ?string $ipAddress,
    ): Transaction {
        try {
            return DB::transaction(function () use ($senderId, $receiverId, $amount, $idempotencyKey, $ipAddress) {
                $this->auditService->log('transfer.initiated', [
                    'sender_id' => $senderId,
                    'receiver_id' => $receiverId,
                    'amount' => $amount,
                    'idempotency_key' => $idempotencyKey,
                ], userId: $senderId, ipAddress: $ipAddress);

                $users = $this->lockUsersForUpdate($senderId, $receiverId);

                /** @var User $sender */
                $sender = $users[$senderId];
                /** @var User $receiver */
                $receiver = $users[$receiverId];

                if (bccomp($sender->balance, $amount, self::SCALE) < 0) {
                    throw new InsufficientFundsException($sender->balance, $amount, $senderId);
                }

                $sender->balance = bcsub($sender->balance, $amount, self::SCALE);
                $receiver->balance = bcadd($receiver->balance, $amount, self::SCALE);

                $sender->save();
                $receiver->save();

                $transaction = Transaction::query()->create([
                    'sender_id' => $senderId,
                    'receiver_id' => $receiverId,
                    'amount' => $amount,
                    'status' => TransactionStatus::Completed,
                    'idempotency_key' => $idempotencyKey,
                ]);

                $this->auditService->log('transfer.completed', [
                    'sender_balance_after' => $sender->balance,
                    'receiver_balance_after' => $receiver->balance,
                    'amount' => $amount,
                ], $transaction, $senderId, $ipAddress);

                $this->coinbaseBridge->syncCompletedTransfer($transaction);

                return $transaction->fresh(['sender', 'receiver']);
            });
        } catch (InsufficientFundsException $exception) {
            $this->auditService->log('transfer.failed', [
                'reason' => 'insufficient_funds',
                'available' => $exception->context()['available'],
                'requested' => $exception->context()['requested'],
            ], userId: $senderId, ipAddress: $ipAddress);

            throw $exception;
        }
    }

    /**
     * @return array<int, User>
     */
    private function lockUsersForUpdate(int $senderId, int $receiverId): array
    {
        $orderedIds = [$senderId, $receiverId];
        sort($orderedIds);

        return User::query()
            ->whereIn('id', $orderedIds)
            ->orderBy('id')
            ->lockForUpdate()
            ->get()
            ->keyBy('id')
            ->all();
    }

    private function buildLockKey(int $senderId, int $receiverId): string
    {
        $orderedIds = [$senderId, $receiverId];
        sort($orderedIds);

        return sprintf('ledger:transfer:%d:%d', $orderedIds[0], $orderedIds[1]);
    }

    private function normalizeAmount(string $amount): string
    {
        if (! preg_match('/^\d+(\.\d+)?$/', $amount)) {
            throw new InvalidTransferException('Amount must be a positive decimal string.');
        }

        return bcadd($amount, '0', self::SCALE);
    }
}
