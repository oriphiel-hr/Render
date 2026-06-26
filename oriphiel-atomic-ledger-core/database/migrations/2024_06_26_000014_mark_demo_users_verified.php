<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        User::query()
            ->whereNull('email_verified_at')
            ->whereNotNull('email')
            ->update(['email_verified_at' => now()]);
    }

    public function down(): void
    {
        // Non-destructive.
    }
};
