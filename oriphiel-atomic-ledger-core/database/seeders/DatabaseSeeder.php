<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->create([
            'name' => 'Alice',
            'balance' => '1000.00000000',
        ]);

        User::query()->create([
            'name' => 'Bob',
            'balance' => '500.00000000',
        ]);

        User::query()->create([
            'name' => 'Charlie',
            'balance' => '0.00000000',
        ]);
    }
}
