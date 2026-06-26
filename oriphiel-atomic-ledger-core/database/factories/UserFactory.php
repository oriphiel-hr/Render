<?php

namespace Database\Factories;

use App\Models\User;
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
            'balance' => '0.00000000',
        ];
    }

    public function withBalance(string $balance): static
    {
        return $this->state(fn () => ['balance' => $balance]);
    }
}
