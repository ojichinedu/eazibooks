<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void {
  Schema::table('users', function (Blueprint $table): void { $table->uuid('company_id')->nullable()->index(); });
  Schema::create('business_records', function (Blueprint $table): void {
   $table->string('id')->primary();
   $table->uuid('company_id')->index();
   $table->string('table_name', 80)->index();
   $table->json('payload');
   $table->timestamps();
   $table->index(['company_id','table_name']);
  });
 }
 public function down(): void { Schema::dropIfExists('business_records'); Schema::table('users', function (Blueprint $table): void { $table->dropColumn('company_id'); }); }
};