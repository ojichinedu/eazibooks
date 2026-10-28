<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('currency', 3)->default('USD');
            $table->timestamps();
        });
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('business_id')->constrained('businesses')->cascadeOnDelete();
            $table->string('code', 20);
            $table->string('name');
            $table->string('type', 20);
            $table->foreignId('parent_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['business_id', 'code']);
        });
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('business_id')->constrained('businesses')->cascadeOnDelete();
            $table->string('name');
            $table->string('direction', 10)->default('expense');
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['business_id', 'name']);
        });
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('business_id')->constrained('businesses')->cascadeOnDelete();
            $table->string('name');
            $table->string('type', 20)->default('customer');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
        });
        Schema::create('capture_inputs', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('business_id')->constrained('businesses')->cascadeOnDelete();
            $table->string('channel', 20);
            $table->string('status', 20)->default('needs_review');
            $table->json('payload');
            $table->json('parsed_data')->nullable();
            $table->decimal('confidence', 5, 4)->nullable();
            $table->string('media_path')->nullable();
            $table->text('error')->nullable();
            $table->timestamps();
        });
        Schema::create('ledger_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('business_id')->constrained('businesses')->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained('contacts')->nullOnDelete();
            $table->foreignId('capture_input_id')->nullable()->constrained('capture_inputs')->nullOnDelete();
            $table->string('source', 20)->default('manual');
            $table->string('status', 20)->default('posted');
            $table->decimal('amount', 14, 2);
            $table->string('direction', 10);
            $table->text('note')->nullable();
            $table->date('occurred_at');
            $table->timestamps();
            $table->index(['business_id', 'occurred_at']);
        });
        Schema::create('transaction_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ledger_transaction_id')->constrained('ledger_transactions')->cascadeOnDelete();
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->decimal('debit', 14, 2)->default(0);
            $table->decimal('credit', 14, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_entries');
        Schema::dropIfExists('ledger_transactions');
        Schema::dropIfExists('capture_inputs');
        Schema::dropIfExists('contacts');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('accounts');
        Schema::dropIfExists('businesses');
    }
};
