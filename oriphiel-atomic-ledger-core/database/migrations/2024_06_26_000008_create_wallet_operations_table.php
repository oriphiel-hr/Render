<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_operations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('operation_type', 32);
            $table->string('asset', 16);
            $table->decimal('amount', 24, 8);
            $table->string('quote_asset', 16)->nullable();
            $table->decimal('quote_amount', 24, 8)->nullable();
            $table->string('status', 16)->default('pending');
            $table->string('idempotency_key')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'operation_type', 'status']);
            $table->unique(['idempotency_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_operations');
    }
};
