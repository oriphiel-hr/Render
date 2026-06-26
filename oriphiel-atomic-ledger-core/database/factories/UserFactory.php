<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\UserBalance;
use App\Support\LedgerBootstrap;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => 'password',
            'role' => UserRole::User,
            'email_verified_at' => now(),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }

    public function withBalance(string $balance, string $asset = 'USDT'): static
    {
        return $this->afterCreating(function (User $user) use ($balance, $asset): void {
            $wallet = UserBalance::query()->updateOrCreate(
                ['user_id' => $user->id, 'asset' => $asset],
                [
                    'available' => $balance,
                    'locked' => '0.00000000',
                    'pending' => '0.00000000',
                ],
            );

            LedgerBootstrap::recordOpeningBalance($wallet, $balance);
        });
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => UserRole::Admin]);
    }
}
