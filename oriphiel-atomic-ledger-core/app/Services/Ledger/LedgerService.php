<?php

namespace App\Services\Ledger;

use App\Enums\LedgerEntryType;
use App\Enums\TransactionStatus;
use App\Enums\WalletOperationStatus;
use App\Enums\WalletOperationType;
use App\Exceptions\InsufficientFundsException;
use App\Exceptions\InvalidTransferException;
use App\Exceptions\LedgerException;
use App\Exceptions\LockAcquisitionException;
use App\Models\LedgerEntry;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserBalance;
use App\Models\WalletOperation;
use App\Services\Audit\TransactionAuditService;
use App\Services\Exchange\ExchangeLedgerBridge;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class LedgerService
{
    private const SCALE = 8;

    public function __construct(
        private readonly TransactionAuditService $auditService,
        private readonly ExchangeLedgerBridge $exchangeBridge,
    ) {}

    public function depositInitiate(
        int $userId,
        string $asset,
        string $amount,
        ?string $idempotencyKey = null,
        ?string $ipAddress = null,
    ): WalletOperation {
        $normalized = $this->normalizeAmount($amount);
        $asset = strtoupper($asset);

        return $this->withUserAssetLock($userId, $asset, function () use ($userId, $asset, $normalized, $idempotencyKey, $ipAddress) {
            if ($idempotencyKey !== null) {
                $existing = $this->findOperationByKey($idempotencyKey);
                if ($existing !== null) {
                    return $existing;
                }
            }

            return DB::transaction(function () use ($userId, $asset, $normalized, $idempotencyKey, $ipAddress) {
                $operation = WalletOperation::query()->create([
                    'user_id' => $userId,
                    'operation_type' => WalletOperationType::Deposit,
                    'asset' => $asset,
                    'amount' => $normalized,
                    'status' => WalletOperationStatus::Pending,
                    'idempotency_key' => $idempotencyKey,
                ]);

                $wallet = $this->lockWallet($userId, $asset);

                $this->applyLedgerChange(
                    wallet: $wallet,
                    availableDelta: '0',
                    lockedDelta: '0',
                    pendingDelta: $normalized,
                    type: LedgerEntryType::DepositPending,
                    referenceType: WalletOperation::class,
                    referenceId: $operation->id,
                    idempotencyKey: $idempotencyKey ?? "deposit:{$operation->id}:pending",
                    metadata: ['operation_id' => $operation->id],
                );

                $this->auditService->log('deposit.initiated', [
                    'operation_id' => $operation->id,
                    'asset' => $asset,
                    'amount' => $normalized,
                ], userId: $userId, ipAddress: $ipAddress);

                return $operation->fresh();
            });
        }, "ledger:user:{$userId}:{$asset}");
    }

    public function depositConfirm(
        int $operationId,
        ?int $actorId = null,
        ?string $ipAddress = null,
    ): WalletOperation {
        return DB::transaction(function () use ($operationId, $actorId, $ipAddress) {
            $operation = WalletOperation::query()->lockForUpdate()->findOrFail($operationId);

            if ($operation->operation_type !== WalletOperationType::Deposit) {
                throw new InvalidTransferException('Operation is not a deposit.');
            }

            if ($operation->status === WalletOperationStatus::Completed) {
                return $operation;
            }

            if ($operation->status !== WalletOperationStatus::Pending) {
                throw new InvalidTransferException('Deposit cannot be confirmed in current status.');
            }

            $wallet = $this->lockWallet($operation->user_id, $operation->asset);
            $amount = $operation->amount;

            $this->applyLedgerChange(
                wallet: $wallet,
                availableDelta: $amount,
                lockedDelta: '0',
                pendingDelta: bcsub('0', $amount, self::SCALE),
                type: LedgerEntryType::DepositConfirm,
                referenceType: WalletOperation::class,
                referenceId: $operation->id,
                idempotencyKey: "deposit:{$operation->id}:confirm",
                metadata: ['operation_id' => $operation->id],
            );

            $operation->update(['status' => WalletOperationStatus::Completed]);

            $this->auditService->log('deposit.confirmed', [
                'operation_id' => $operation->id,
                'asset' => $operation->asset,
                'amount' => $amount,
            ], userId: $operation->user_id, ipAddress: $ipAddress);

            return $operation->fresh();
        });
    }

    public function withdrawInitiate(
        int $userId,
        string $asset,
        string $amount,
        ?string $idempotencyKey = null,
        ?string $ipAddress = null,
    ): WalletOperation {
        $normalized = $this->normalizeAmount($amount);
        $asset = strtoupper($asset);

        return $this->withUserAssetLock($userId, $asset, function () use ($userId, $asset, $normalized, $idempotencyKey, $ipAddress) {
            if ($idempotencyKey !== null) {
                $existing = $this->findOperationByKey($idempotencyKey);
                if ($existing !== null) {
                    return $existing;
                }
            }

            return DB::transaction(function () use ($userId, $asset, $normalized, $idempotencyKey, $ipAddress) {
                $wallet = $this->lockWallet($userId, $asset);

                if (bccomp($wallet->available, $normalized, self::SCALE) < 0) {
                    throw new InsufficientFundsException($wallet->available, $normalized, $userId);
                }

                $operation = WalletOperation::query()->create([
                    'user_id' => $userId,
                    'operation_type' => WalletOperationType::Withdrawal,
                    'asset' => $asset,
                    'amount' => $normalized,
                    'status' => WalletOperationStatus::Pending,
                    'idempotency_key' => $idempotencyKey,
                ]);

                $this->applyLedgerChange(
                    wallet: $wallet,
                    availableDelta: bcsub('0', $normalized, self::SCALE),
                    lockedDelta: $normalized,
                    pendingDelta: '0',
                    type: LedgerEntryType::WithdrawalLock,
                    referenceType: WalletOperation::class,
                    referenceId: $operation->id,
                    idempotencyKey: $idempotencyKey ?? "withdraw:{$operation->id}:lock",
                );

                $this->auditService->log('withdrawal.initiated', [
                    'operation_id' => $operation->id,
                    'asset' => $asset,
                    'amount' => $normalized,
                ], userId: $userId, ipAddress: $ipAddress);

                return $operation->fresh();
            });
        }, "ledger:user:{$userId}:{$asset}");
    }

    public function withdrawComplete(
        int $operationId,
        ?string $ipAddress = null,
    ): WalletOperation {
        return DB::transaction(function () use ($operationId, $ipAddress) {
            $operation = WalletOperation::query()->lockForUpdate()->findOrFail($operationId);

            if ($operation->operation_type !== WalletOperationType::Withdrawal) {
                throw new InvalidTransferException('Operation is not a withdrawal.');
            }

            if ($operation->status === WalletOperationStatus::Completed) {
                return $operation;
            }

            $wallet = $this->lockWallet($operation->user_id, $operation->asset);
            $amount = $operation->amount;

            if (bccomp($wallet->locked, $amount, self::SCALE) < 0) {
                throw new InsufficientFundsException($wallet->locked, $amount, $operation->user_id);
            }

            $this->applyLedgerChange(
                wallet: $wallet,
                availableDelta: '0',
                lockedDelta: bcsub('0', $amount, self::SCALE),
                pendingDelta: '0',
                type: LedgerEntryType::WithdrawalComplete,
                referenceType: WalletOperation::class,
                referenceId: $operation->id,
                idempotencyKey: "withdraw:{$operation->id}:complete",
            );

            $operation->update(['status' => WalletOperationStatus::Completed]);

            $this->auditService->log('withdrawal.completed', [
                'operation_id' => $operation->id,
                'asset' => $operation->asset,
                'amount' => $amount,
            ], userId: $operation->user_id, ipAddress: $ipAddress);

            return $operation->fresh();
        });
    }

    public function trade(
        int $userId,
        string $fromAsset,
        string $toAsset,
        string $fromAmount,
        ?string $idempotencyKey = null,
        ?string $ipAddress = null,
    ): WalletOperation {
        $fromAsset = strtoupper($fromAsset);
        $toAsset = strtoupper($toAsset);
        $normalizedFrom = $this->normalizeAmount($fromAmount);

        if ($fromAsset === $toAsset) {
            throw new InvalidTransferException('Trade assets must differ.');
        }

        $toAmount = $this->convertAmount($fromAsset, $toAsset, $normalizedFrom);

        $lockKey = $this->buildUserAssetsLockKey($userId, [$fromAsset, $toAsset]);

        return $this->withCacheLock($lockKey, function () use ($userId, $fromAsset, $toAsset, $normalizedFrom, $toAmount, $idempotencyKey, $ipAddress) {
            if ($idempotencyKey !== null) {
                $existing = $this->findOperationByKey($idempotencyKey);
                if ($existing !== null) {
                    return $existing;
                }
            }

            return DB::transaction(function () use ($userId, $fromAsset, $toAsset, $normalizedFrom, $toAmount, $idempotencyKey, $ipAddress) {
                $fromWallet = $this->lockWallet($userId, $fromAsset);
                $toWallet = $this->lockWallet($userId, $toAsset);

                if (bccomp($fromWallet->available, $normalizedFrom, self::SCALE) < 0) {
                    throw new InsufficientFundsException($fromWallet->available, $normalizedFrom, $userId);
                }

                $operation = WalletOperation::query()->create([
                    'user_id' => $userId,
                    'operation_type' => WalletOperationType::Trade,
                    'asset' => $fromAsset,
                    'amount' => $normalizedFrom,
                    'quote_asset' => $toAsset,
                    'quote_amount' => $toAmount,
                    'status' => WalletOperationStatus::Pending,
                    'idempotency_key' => $idempotencyKey,
                ]);

                $this->applyLedgerChange(
                    wallet: $fromWallet,
                    availableDelta: bcsub('0', $normalizedFrom, self::SCALE),
                    lockedDelta: $normalizedFrom,
                    pendingDelta: '0',
                    type: LedgerEntryType::TradeLock,
                    referenceType: WalletOperation::class,
                    referenceId: $operation->id,
                    idempotencyKey: $idempotencyKey ?? "trade:{$operation->id}:lock",
                );

                $this->applyLedgerChange(
                    wallet: $fromWallet,
                    availableDelta: '0',
                    lockedDelta: bcsub('0', $normalizedFrom, self::SCALE),
                    pendingDelta: '0',
                    type: LedgerEntryType::TradeSettle,
                    referenceType: WalletOperation::class,
                    referenceId: $operation->id,
                    idempotencyKey: "trade:{$operation->id}:debit",
                    metadata: ['leg' => 'debit'],
                );

                $this->applyLedgerChange(
                    wallet: $toWallet,
                    availableDelta: $toAmount,
                    lockedDelta: '0',
                    pendingDelta: '0',
                    type: LedgerEntryType::TradeSettle,
                    referenceType: WalletOperation::class,
                    referenceId: $operation->id,
                    idempotencyKey: "trade:{$operation->id}:credit",
                    metadata: ['leg' => 'credit'],
                );

                $operation->update(['status' => WalletOperationStatus::Completed]);

                $this->auditService->log('trade.completed', [
                    'operation_id' => $operation->id,
                    'from_asset' => $fromAsset,
                    'to_asset' => $toAsset,
                    'from_amount' => $normalizedFrom,
                    'to_amount' => $toAmount,
                ], userId: $userId, ipAddress: $ipAddress);

                return $operation->fresh();
            });
        });
    }

    public function transferFunds(
        int $senderId,
        int $receiverId,
        string $amount,
        string $asset = 'USDT',
        ?string $idempotencyKey = null,
        ?string $ipAddress = null,
    ): Transaction {
        $normalizedAmount = $this->normalizeAmount($amount);
        $asset = strtoupper($asset);

        if ($senderId === $receiverId) {
            throw new InvalidTransferException('Sender and receiver must be different users.');
        }

        if ($idempotencyKey !== null) {
            $existing = Transaction::query()->where('idempotency_key', $idempotencyKey)->first();
            if ($existing !== null) {
                return $existing;
            }
        }

        $lockKey = $this->buildTransferLockKey($senderId, $receiverId, $asset);

        return $this->withCacheLock($lockKey, function () use ($senderId, $receiverId, $normalizedAmount, $asset, $idempotencyKey, $ipAddress) {
            try {
                return DB::transaction(function () use ($senderId, $receiverId, $normalizedAmount, $asset, $idempotencyKey, $ipAddress) {
                    $this->auditService->log('transfer.initiated', [
                        'sender_id' => $senderId,
                        'receiver_id' => $receiverId,
                        'amount' => $normalizedAmount,
                        'asset' => $asset,
                        'idempotency_key' => $idempotencyKey,
                    ], userId: $senderId, ipAddress: $ipAddress);

                    $senderWallet = $this->lockWallet($senderId, $asset);
                    $receiverWallet = $this->lockWallet($receiverId, $asset);

                    if (bccomp($senderWallet->available, $normalizedAmount, self::SCALE) < 0) {
                        throw new InsufficientFundsException($senderWallet->available, $normalizedAmount, $senderId);
                    }

                    $this->applyLedgerChange(
                        wallet: $senderWallet,
                        availableDelta: bcsub('0', $normalizedAmount, self::SCALE),
                        lockedDelta: '0',
                        pendingDelta: '0',
                        type: LedgerEntryType::TransferOut,
                        referenceType: null,
                        referenceId: null,
                        idempotencyKey: $idempotencyKey ? "{$idempotencyKey}:out" : null,
                    );

                    $transaction = Transaction::query()->create([
                        'sender_id' => $senderId,
                        'receiver_id' => $receiverId,
                        'amount' => $normalizedAmount,
                        'asset' => $asset,
                        'status' => TransactionStatus::Completed,
                        'idempotency_key' => $idempotencyKey,
                    ]);

                    $this->applyLedgerChange(
                        wallet: $receiverWallet,
                        availableDelta: $normalizedAmount,
                        lockedDelta: '0',
                        pendingDelta: '0',
                        type: LedgerEntryType::TransferIn,
                        referenceType: Transaction::class,
                        referenceId: $transaction->id,
                        idempotencyKey: $idempotencyKey ? "{$idempotencyKey}:in" : null,
                    );

                    $this->auditService->log('transfer.completed', [
                        'sender_available_after' => $senderWallet->fresh()->available,
                        'receiver_available_after' => $receiverWallet->fresh()->available,
                        'amount' => $normalizedAmount,
                        'asset' => $asset,
                    ], $transaction, $senderId, $ipAddress);

                    $this->exchangeBridge->syncCompletedTransfer($transaction);

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
        });
    }

    public function adminAdjust(
        int $userId,
        string $asset,
        string $availableDelta,
        string $reason,
        int $adminId,
        ?string $ipAddress = null,
    ): LedgerEntry {
        $asset = strtoupper($asset);

        return $this->withUserAssetLock($userId, $asset, function () use ($userId, $asset, $availableDelta, $reason, $adminId, $ipAddress) {
            return DB::transaction(function () use ($userId, $asset, $availableDelta, $reason, $adminId, $ipAddress) {
                $wallet = $this->lockWallet($userId, $asset);
                $normalizedDelta = bcadd($availableDelta, '0', self::SCALE);

                $entry = $this->applyLedgerChange(
                    wallet: $wallet,
                    availableDelta: $normalizedDelta,
                    lockedDelta: '0',
                    pendingDelta: '0',
                    type: LedgerEntryType::AdminAdjustment,
                    referenceType: null,
                    referenceId: null,
                    idempotencyKey: 'admin-adjust:'.uniqid('', true),
                    metadata: ['reason' => $reason, 'admin_id' => $adminId],
                );

                $this->auditService->log('admin.adjustment', [
                    'user_id' => $userId,
                    'asset' => $asset,
                    'available_delta' => $normalizedDelta,
                    'reason' => $reason,
                    'admin_id' => $adminId,
                ], userId: $adminId, ipAddress: $ipAddress);

                return $entry;
            });
        }, "ledger:user:{$userId}:{$asset}");
    }

    private function applyLedgerChange(
        UserBalance $wallet,
        string $availableDelta,
        string $lockedDelta,
        string $pendingDelta,
        LedgerEntryType $type,
        ?string $referenceType,
        ?int $referenceId,
        ?string $idempotencyKey,
        array $metadata = [],
    ): LedgerEntry {
        if ($idempotencyKey !== null) {
            $existing = LedgerEntry::query()->where('idempotency_key', $idempotencyKey)->first();
            if ($existing !== null) {
                return $existing;
            }
        }

        $wallet->available = bcadd($wallet->available, $availableDelta, self::SCALE);
        $wallet->locked = bcadd($wallet->locked, $lockedDelta, self::SCALE);
        $wallet->pending = bcadd($wallet->pending, $pendingDelta, self::SCALE);

        $this->assertNonNegative($wallet);
        $wallet->save();

        return LedgerEntry::query()->create([
            'user_id' => $wallet->user_id,
            'asset' => $wallet->asset,
            'available_delta' => bcadd($availableDelta, '0', self::SCALE),
            'locked_delta' => bcadd($lockedDelta, '0', self::SCALE),
            'pending_delta' => bcadd($pendingDelta, '0', self::SCALE),
            'entry_type' => $type,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'idempotency_key' => $idempotencyKey,
            'metadata' => $metadata,
            'created_at' => now(),
        ]);
    }

    private function assertNonNegative(UserBalance $wallet): void
    {
        foreach (['available', 'locked', 'pending'] as $bucket) {
            if (bccomp($wallet->{$bucket}, '0', self::SCALE) < 0) {
                throw new LedgerException("Negative {$bucket} balance detected for user {$wallet->user_id} ({$wallet->asset}).");
            }
        }
    }

    private function lockWallet(int $userId, string $asset): UserBalance
    {
        $wallet = UserBalance::query()
            ->where('user_id', $userId)
            ->where('asset', $asset)
            ->lockForUpdate()
            ->first();

        if ($wallet !== null) {
            return $wallet;
        }

        return UserBalance::query()->create([
            'user_id' => $userId,
            'asset' => $asset,
            'available' => '0.00000000',
            'locked' => '0.00000000',
            'pending' => '0.00000000',
        ]);
    }

    private function findOperationByKey(string $key): ?WalletOperation
    {
        return WalletOperation::query()->where('idempotency_key', $key)->first();
    }

    private function convertAmount(string $fromAsset, string $toAsset, string $amount): string
    {
        $rates = config('ledger.trade_rates', []);
        $rate = $rates[$fromAsset][$toAsset] ?? null;

        if ($rate === null) {
            throw new InvalidTransferException("No trade rate configured for {$fromAsset}/{$toAsset}.");
        }

        return bcmul($amount, (string) $rate, self::SCALE);
    }

    private function normalizeAmount(string $amount): string
    {
        if (! preg_match('/^\d+(\.\d+)?$/', $amount)) {
            throw new InvalidTransferException('Amount must be a positive decimal string.');
        }

        $normalized = bcadd($amount, '0', self::SCALE);

        if (bccomp($normalized, '0', self::SCALE) <= 0) {
            throw new InvalidTransferException('Amount must be greater than zero.');
        }

        return $normalized;
    }

    /**
     * @template T
     *
     * @param  callable(): T  $callback
     * @return T
     */
    private function withCacheLock(string $lockKey, callable $callback)
    {
        $lock = Cache::lock($lockKey, config('ledger.lock_ttl_seconds', 10));

        try {
            return $lock->block(
                config('ledger.lock_wait_seconds', 5),
                $callback,
            );
        } catch (LockTimeoutException) {
            throw new LockAcquisitionException($lockKey);
        }
    }

    /**
     * @template T
     *
     * @param  callable(): T  $callback
     * @return T
     */
    private function withUserAssetLock(int $userId, string $asset, callable $callback, ?string $lockKey = null)
    {
        return $this->withCacheLock($lockKey ?? "ledger:user:{$userId}:{$asset}", $callback);
    }

    private function buildTransferLockKey(int $senderId, int $receiverId, string $asset): string
    {
        $pair = [$senderId, $receiverId];
        sort($pair);

        return sprintf('ledger:transfer:%s:%d:%d', $asset, $pair[0], $pair[1]);
    }

    /**
     * @param  list<string>  $assets
     */
    private function buildUserAssetsLockKey(int $userId, array $assets): string
    {
        sort($assets);

        return sprintf('ledger:user:%d:%s', $userId, implode('-', $assets));
    }
}
