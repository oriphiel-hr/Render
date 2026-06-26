<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'balance',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'string',
        ];
    }

    public function getBalanceAttribute(mixed $value): string
    {
        return bcadd((string) $value, '0', 8);
    }

    public function setBalanceAttribute(mixed $value): void
    {
        $this->attributes['balance'] = bcadd((string) $value, '0', 8);
    }

    public function sentTransactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'sender_id');
    }

    public function receivedTransactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'receiver_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }
}
