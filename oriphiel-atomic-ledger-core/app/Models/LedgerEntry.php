<?php

namespace App\Models;

use App\Enums\LedgerEntryType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LedgerEntry extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'asset',
        'available_delta',
        'locked_delta',
        'pending_delta',
        'entry_type',
        'reference_type',
        'reference_id',
        'idempotency_key',
        'metadata',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'entry_type' => LedgerEntryType::class,
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
