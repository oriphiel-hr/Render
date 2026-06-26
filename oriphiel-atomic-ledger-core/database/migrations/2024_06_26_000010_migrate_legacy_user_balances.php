<?php

use App\Models\User;
use App\Models\UserBalance;
use App\Support\LedgerBootstrap;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'balance')) {
            User::query()->each(function (User $user): void {
                if (UserBalance::query()->where('user_id', $user->id)->where('asset', 'USDT')->exists()) {
                    return;
                }

                UserBalance::query()->create([
                    'user_id' => $user->id,
                    'asset' => 'USDT',
                    'available' => $user->getRawOriginal('balance') ?? '0.00000000',
                    'locked' => '0.00000000',
                    'pending' => '0.00000000',
                ]);

                $wallet = UserBalance::query()
                    ->where('user_id', $user->id)
                    ->where('asset', 'USDT')
                    ->first();

                if ($wallet !== null) {
                    LedgerBootstrap::recordOpeningBalance($wallet, $wallet->available);
                }
            });

            Schema::table('users', function (Blueprint $table) {
                $table->dropIndex('users_balance_index');
            });

            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('balance');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('users', 'balance')) {
            Schema::table('users', function (Blueprint $table) {
                $table->decimal('balance', 24, 8)->default('0.00000000')->after('name');
                $table->index('balance');
            });

            User::query()->each(function (User $user): void {
                $wallet = UserBalance::query()
                    ->where('user_id', $user->id)
                    ->where('asset', 'USDT')
                    ->first();

                $user->update([
                    'balance' => $wallet?->available ?? '0.00000000',
                ]);
            });
        }
    }
};
