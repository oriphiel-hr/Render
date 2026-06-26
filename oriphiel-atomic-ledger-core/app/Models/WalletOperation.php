<?php

namespace App\Models;

use App\Enums\WalletOperationStatus;
use App\Enums\WalletOperationType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletOperation extends Model
{
    protected $fillable = [
        'user_id',
        'operation_type',
        'asset',
        'amount',
        'quote_asset',
        'quote_amount',
        'status',
        'idempotency_key',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'operation_type' => WalletOperationType::class,
            'status' => WalletOperationStatus::class,
            'amount' => 'string',
            'quote_amount' => 'string',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
