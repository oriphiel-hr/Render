<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserBalance extends Model
{
    protected $fillable = [
        'user_id',
        'asset',
        'available',
        'locked',
        'pending',
    ];

    protected function casts(): array
    {
        return [
            'available' => 'string',
            'locked' => 'string',
            'pending' => 'string',
        ];
    }

    public function getAvailableAttribute(mixed $value): string
    {
        return bcadd((string) $value, '0', 8);
    }

    public function setAvailableAttribute(mixed $value): void
    {
        $this->attributes['available'] = bcadd((string) $value, '0', 8);
    }

    public function getLockedAttribute(mixed $value): string
    {
        return bcadd((string) $value, '0', 8);
    }

    public function setLockedAttribute(mixed $value): void
    {
        $this->attributes['locked'] = bcadd((string) $value, '0', 8);
    }

    public function getPendingAttribute(mixed $value): string
    {
        return bcadd((string) $value, '0', 8);
    }

    public function setPendingAttribute(mixed $value): void
    {
        $this->attributes['pending'] = bcadd((string) $value, '0', 8);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function total(): string
    {
        return bcadd(bcadd($this->available, $this->locked, 8), $this->pending, 8);
    }
}
