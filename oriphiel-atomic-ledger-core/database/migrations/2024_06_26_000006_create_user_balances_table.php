<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('asset', 16);
            $table->decimal('available', 24, 8)->default('0.00000000');
            $table->decimal('locked', 24, 8)->default('0.00000000');
            $table->decimal('pending', 24, 8)->default('0.00000000');
            $table->timestamps();

            $table->unique(['user_id', 'asset']);
            $table->index(['asset', 'available']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_balances');
    }
};
