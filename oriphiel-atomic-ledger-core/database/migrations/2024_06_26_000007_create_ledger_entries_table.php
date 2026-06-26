<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('asset', 16);
            $table->decimal('available_delta', 24, 8)->default('0.00000000');
            $table->decimal('locked_delta', 24, 8)->default('0.00000000');
            $table->decimal('pending_delta', 24, 8)->default('0.00000000');
            $table->string('entry_type', 32);
            $table->string('reference_type', 64)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('idempotency_key')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'asset', 'created_at']);
            $table->index(['entry_type', 'created_at']);
            $table->unique(['idempotency_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledger_entries');
    }
};
