<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        $map = [
            'Alice' => 'alice@demo.local',
            'Bob' => 'bob@demo.local',
            'Charlie' => 'charlie@demo.local',
            'Admin' => 'admin@demo.local',
        ];

        foreach ($map as $name => $email) {
            User::query()
                ->where('name', $name)
                ->whereNull('email')
                ->update([
                    'email' => $email,
                    'password' => Hash::make('password'),
                    'role' => $name === 'Admin' ? UserRole::Admin->value : UserRole::User->value,
                ]);
        }
    }

    public function down(): void
    {
        // Non-destructive data migration.
    }
};
