<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LedgerEntry;
use App\Models\Transaction;
use App\Models\User;
use App\Models\WalletOperation;
use App\Services\Ledger\LedgerService;
use App\Support\ApiSource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(
        private readonly LedgerService $ledgerService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $wallets = $request->user()
            ->wallets()
            ->orderBy('asset')
            ->get()
            ->map(fn ($wallet) => [
                'asset' => $wallet->asset,
                'available' => $wallet->available,
                'locked' => $wallet->locked,
                'pending' => $wallet->pending,
                'total' => $wallet->total(),
            ]);

        return response()->json([
            'data' => $wallets,
            'data_source' => ApiSource::forLedger('user_balances', '/api/wallets'),
        ]);
    }

    public function deposit(Request $request): JsonResponse
    {
        $data = $request->validate([
            'asset' => ['required', 'string', 'max:16'],
            'amount' => ['required', 'regex:/^\d+(\.\d{1,8})?$/'],
            'idempotency_key' => ['nullable', 'string', 'max:64'],
            'auto_confirm' => ['nullable', 'boolean'],
        ]);

        $operation = $this->ledgerService->depositInitiate(
            userId: $request->user()->id,
            asset: $data['asset'],
            amount: $data['amount'],
            idempotencyKey: $data['idempotency_key'] ?? null,
            ipAddress: $request->ip(),
        );

        if ($request->boolean('auto_confirm', true)) {
            $operation = $this->ledgerService->depositConfirm($operation->id, $request->user()->id, $request->ip());
        }

        return response()->json(['data' => $this->operationPayload($operation)], 201);
    }

    public function confirmDeposit(Request $request, int $operationId): JsonResponse
    {
        $operation = WalletOperation::query()->findOrFail($operationId);

        if ($operation->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $operation = $this->ledgerService->depositConfirm($operationId, $request->user()->id, $request->ip());

        return response()->json(['data' => $this->operationPayload($operation)]);
    }

    public function withdraw(Request $request): JsonResponse
    {
        $data = $request->validate([
            'asset' => ['required', 'string', 'max:16'],
            'amount' => ['required', 'regex:/^\d+(\.\d{1,8})?$/'],
            'idempotency_key' => ['nullable', 'string', 'max:64'],
            'auto_complete' => ['nullable', 'boolean'],
        ]);

        $operation = $this->ledgerService->withdrawInitiate(
            userId: $request->user()->id,
            asset: $data['asset'],
            amount: $data['amount'],
            idempotencyKey: $data['idempotency_key'] ?? null,
            ipAddress: $request->ip(),
        );

        if ($request->boolean('auto_complete', false)) {
            $operation = $this->ledgerService->withdrawComplete($operation->id, $request->ip());
        }

        return response()->json(['data' => $this->operationPayload($operation)], 201);
    }

    public function completeWithdrawal(Request $request, int $operationId): JsonResponse
    {
        $operation = WalletOperation::query()->findOrFail($operationId);

        if ($operation->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $operation = $this->ledgerService->withdrawComplete($operationId, $request->ip());

        return response()->json(['data' => $this->operationPayload($operation)]);
    }

    public function trade(Request $request): JsonResponse
    {
        $data = $request->validate([
            'from_asset' => ['required', 'string', 'max:16'],
            'to_asset' => ['required', 'string', 'max:16', 'different:from_asset'],
            'amount' => ['required', 'regex:/^\d+(\.\d{1,8})?$/'],
            'idempotency_key' => ['nullable', 'string', 'max:64'],
        ]);

        $operation = $this->ledgerService->trade(
            userId: $request->user()->id,
            fromAsset: $data['from_asset'],
            toAsset: $data['to_asset'],
            fromAmount: $data['amount'],
            idempotencyKey: $data['idempotency_key'] ?? null,
            ipAddress: $request->ip(),
        );

        return response()->json(['data' => $this->operationPayload($operation)], 201);
    }

    public function ledger(Request $request): JsonResponse
    {
        $entries = LedgerEntry::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->map(fn (LedgerEntry $entry) => [
                'id' => $entry->id,
                'asset' => $entry->asset,
                'entry_type' => $entry->entry_type->value,
                'available_delta' => $entry->available_delta,
                'locked_delta' => $entry->locked_delta,
                'pending_delta' => $entry->pending_delta,
                'created_at' => $entry->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'data' => $entries,
            'data_source' => ApiSource::forLedger('ledger_entries', '/api/ledger', 'Append-only ledger entries in PostgreSQL.'),
        ]);
    }

    public function operations(Request $request): JsonResponse
    {
        $operations = WalletOperation::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('id')
            ->limit(30)
            ->get()
            ->map(fn (WalletOperation $op) => $this->operationPayload($op));

        return response()->json([
            'data' => $operations,
            'data_source' => ApiSource::forLedger('wallet_operations', '/api/operations'),
        ]);
    }

    public function transactions(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $transactions = Transaction::query()
            ->with(['sender:id,name', 'receiver:id,name'])
            ->where(function ($query) use ($userId) {
                $query->where('sender_id', $userId)->orWhere('receiver_id', $userId);
            })
            ->orderByDesc('id')
            ->limit(30)
            ->get()
            ->map(fn (Transaction $tx) => [
                'id' => $tx->id,
                'sender' => $tx->sender?->only(['id', 'name']),
                'receiver' => $tx->receiver?->only(['id', 'name']),
                'amount' => $tx->amount,
                'asset' => $tx->asset,
                'status' => $tx->status->value,
                'external_reference' => $tx->external_reference,
                'created_at' => $tx->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'data' => $transactions,
            'data_source' => ApiSource::forLedger('transactions', '/api/my/transactions'),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function operationPayload(WalletOperation $operation): array
    {
        return [
            'id' => $operation->id,
            'operation_type' => $operation->operation_type->value,
            'asset' => $operation->asset,
            'amount' => $operation->amount,
            'quote_asset' => $operation->quote_asset,
            'quote_amount' => $operation->quote_amount,
            'status' => $operation->status->value,
            'created_at' => $operation->created_at?->toIso8601String(),
        ];
    }
}
