<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->unique()->after('name');
            $table->string('password')->nullable()->after('email');
            $table->string('role', 16)->default('user')->after('password');
            $table->rememberToken();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropRememberToken();
            $table->dropColumn(['email', 'password', 'role']);
        });
    }
};
