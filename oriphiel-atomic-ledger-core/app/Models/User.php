<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'role' => UserRole::class,
            'email_verified_at' => 'datetime',
        ];
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification);
    }

    public function isAdmin(): bool
    {
        return $this->role->isAdmin();
    }

    public function wallets(): HasMany
    {
        return $this->hasMany(UserBalance::class);
    }

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(LedgerEntry::class);
    }

    public function walletOperations(): HasMany
    {
        return $this->hasMany(WalletOperation::class);
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

    public function getBalanceAttribute(): string
    {
        $available = $this->wallets()
            ->where('asset', 'USDT')
            ->value('available');

        return bcadd((string) ($available ?? '0'), '0', 8);
    }
}
