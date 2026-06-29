<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_sheet_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('sheet_type', 8);
            $table->string('spreadsheet_id', 128);
            $table->string('spreadsheet_url', 512)->nullable();
            $table->string('tab_name', 128)->nullable();
            $table->string('tab_gid', 32)->nullable();
            $table->string('site_code', 128)->nullable();
            $table->string('status', 32)->default('active');
            $table->foreignId('synced_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('last_error')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'sheet_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_sheet_configs');
    }
};
