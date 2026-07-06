<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_sheet_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('sheet_type', 8);
            $table->unsignedInteger('source_row_number');
            $table->string('site', 128)->nullable();
            $table->string('days', 32)->nullable();
            $table->text('page_link')->nullable();
            $table->text('details')->nullable();
            $table->date('occurred_on')->nullable();
            $table->json('extra_data')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'sheet_type', 'source_row_number'], 'sheet_entries_project_type_row_unique');
            $table->index(['project_id', 'sheet_type']);
            $table->index(['project_id', 'occurred_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_sheet_entries');
    }
};
