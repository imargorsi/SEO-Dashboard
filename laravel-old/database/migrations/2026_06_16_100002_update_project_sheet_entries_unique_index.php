<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_sheet_entries', function (Blueprint $table) {
            $table->dropUnique('sheet_entries_project_type_row_unique');
            $table->unique(['sheet_type', 'source_row_number'], 'sheet_entries_type_row_unique');
        });
    }

    public function down(): void
    {
        Schema::table('project_sheet_entries', function (Blueprint $table) {
            $table->dropUnique('sheet_entries_type_row_unique');
            $table->unique(['project_id', 'sheet_type', 'source_row_number'], 'sheet_entries_project_type_row_unique');
        });
    }
};
