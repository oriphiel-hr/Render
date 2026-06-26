<?php

namespace App\Models;

use App\Enums\TransactionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'amount',
        'asset',
        'status',
        'idempotency_key',
        'external_reference',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'string',
            'status' => TransactionStatus::class,
        ];
    }

    public function getAmountAttribute(mixed $value): string
    {
        return bcadd((string) $value, '0', 8);
    }

    public function setAmountAttribute(mixed $value): void
    {
        $this->attributes['amount'] = bcadd((string) $value, '0', 8);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }
}
