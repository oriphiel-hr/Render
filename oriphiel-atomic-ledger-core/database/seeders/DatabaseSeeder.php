<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\UserBalance;
use App\Support\LedgerBootstrap;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedDemoUser('Alice', 'alice@demo.local', UserRole::User, [
            'USDT' => ['available' => '1000.00000000', 'locked' => '0.00000000', 'pending' => '0.00000000'],
            'BTC' => ['available' => '0.01000000', 'locked' => '0.00000000', 'pending' => '0.00000000'],
        ]);

        $this->seedDemoUser('Bob', 'bob@demo.local', UserRole::User, [
            'USDT' => ['available' => '500.00000000', 'locked' => '0.00000000', 'pending' => '0.00000000'],
            'ETH' => ['available' => '1.50000000', 'locked' => '0.00000000', 'pending' => '0.00000000'],
        ]);

        $this->seedDemoUser('Charlie', 'charlie@demo.local', UserRole::User, [
            'USDT' => ['available' => '0.00000000', 'locked' => '0.00000000', 'pending' => '0.00000000'],
        ]);

        $this->seedDemoUser('Admin', 'admin@demo.local', UserRole::Admin, [
            'USDT' => ['available' => '0.00000000', 'locked' => '0.00000000', 'pending' => '0.00000000'],
        ]);
    }

    /**
     * @param  array<string, array{available: string, locked: string, pending: string}>  $wallets
     */
    private function seedDemoUser(string $name, string $email, UserRole $role, array $wallets): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
                'role' => $role,
                'email_verified_at' => now(),
            ],
        );

        foreach ($wallets as $asset => $amounts) {
            $wallet = UserBalance::query()->updateOrCreate(
                ['user_id' => $user->id, 'asset' => $asset],
                $amounts,
            );

            LedgerBootstrap::recordOpeningBalance(
                $wallet,
                $amounts['available'],
                $amounts['locked'],
                $amounts['pending'],
            );
        }
    }
}
