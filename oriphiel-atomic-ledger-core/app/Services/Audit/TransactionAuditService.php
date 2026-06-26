<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;

class TransactionAuditService
{
    public function log(
        string $action,
        array $payload,
        ?Transaction $transaction = null,
        ?int $userId = null,
        ?string $ipAddress = null,
    ): AuditLog {
        $auditLog = AuditLog::query()->create([
            'transaction_id' => $transaction?->id,
            'user_id' => $userId,
            'action' => $action,
            'payload' => $payload,
            'ip_address' => $ipAddress,
            'created_at' => now(),
        ]);

        Log::channel('ledger')->info($action, [
            'audit_log_id' => $auditLog->id,
            'transaction_id' => $transaction?->id,
            'user_id' => $userId,
            'payload' => $payload,
        ]);

        return $auditLog;
    }
}
