<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserInvitation;
use App\Services\Auth\InvitationService;
use App\Services\Exchange\PooledExchangeReconciliationService;
use App\Services\Ledger\LedgerService;
use App\Services\Ledger\ReconciliationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(
        private readonly ReconciliationService $reconciliationService,
        private readonly PooledExchangeReconciliationService $pooledReconciliationService,
        private readonly LedgerService $ledgerService,
        private readonly InvitationService $invitationService,
    ) {}

    public function users(): JsonResponse
    {
        $users = User::query()
            ->with('wallets')
            ->orderBy('id')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'wallets' => $user->wallets->map(fn ($w) => [
                    'asset' => $w->asset,
                    'available' => $w->available,
                    'locked' => $w->locked,
                    'pending' => $w->pending,
                ]),
            ]);

        return response()->json(['data' => $users]);
    }

    public function reconciliation(): JsonResponse
    {
        $rows = $this->reconciliationService->reconcileAll();
        $outOfSync = $rows->where('in_sync', false)->count();
        $exchangePool = $this->pooledReconciliationService->reconcile();

        return response()->json([
            'summary' => [
                'total_wallets' => $rows->count(),
                'out_of_sync' => $outOfSync,
                'healthy' => $outOfSync === 0,
            ],
            'data' => $rows->values(),
            'exchange_pool' => $exchangePool,
            'summary_combined' => [
                'ledger_healthy' => $outOfSync === 0,
                'exchange_pool_healthy' => $exchangePool['healthy'],
                'overall_healthy' => $outOfSync === 0 && ($exchangePool['healthy'] ?? false) === true,
            ],
        ]);
    }

    public function adjust(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'asset' => ['required', 'string', 'max:16'],
            'available_delta' => ['required', 'regex:/^-?\d+(\.\d{1,8})?$/'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $entry = $this->ledgerService->adminAdjust(
            userId: (int) $data['user_id'],
            asset: $data['asset'],
            availableDelta: $data['available_delta'],
            reason: $data['reason'],
            adminId: $request->user()->id,
            ipAddress: $request->ip(),
        );

        return response()->json(['data' => [
            'id' => $entry->id,
            'entry_type' => $entry->entry_type->value,
            'asset' => $entry->asset,
            'available_delta' => $entry->available_delta,
        ]], 201);
    }

    public function invite(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'name' => ['required', 'string', 'max:120'],
        ]);

        $invitation = $this->invitationService->invite(
            email: $data['email'],
            name: $data['name'],
            inviter: $request->user(),
        );

        return response()->json([
            'message' => 'Invitation email sent.',
            'data' => [
                'id' => $invitation->id,
                'email' => $invitation->email,
                'name' => $invitation->name,
                'expires_at' => $invitation->expires_at->toIso8601String(),
                'invite_url' => url('/invite/'.$invitation->token),
            ],
        ], 201);
    }

    public function invitations(): JsonResponse
    {
        $invitations = UserInvitation::query()
            ->with('inviter:id,name,email')
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->map(fn (UserInvitation $invitation) => [
                'id' => $invitation->id,
                'email' => $invitation->email,
                'name' => $invitation->name,
                'invited_by' => $invitation->inviter?->only(['id', 'name', 'email']),
                'expires_at' => $invitation->expires_at->toIso8601String(),
                'accepted_at' => $invitation->accepted_at?->toIso8601String(),
                'status' => $invitation->isAccepted() ? 'accepted' : ($invitation->isExpired() ? 'expired' : 'pending'),
                'invite_url' => url('/invite/'.$invitation->token),
            ]);

        return response()->json(['data' => $invitations]);
    }
}
