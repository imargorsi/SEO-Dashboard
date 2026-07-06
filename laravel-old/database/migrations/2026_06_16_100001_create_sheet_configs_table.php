<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sheet_configs', function (Blueprint $table) {
            $table->id();
            $table->string('sheet_type', 8)->unique();
            $table->string('spreadsheet_id', 128);
            $table->string('spreadsheet_url', 512)->nullable();
            $table->string('tab_name', 128)->nullable();
            $table->string('tab_gid', 32)->nullable();
            $table->string('status', 32)->default('active');
            $table->foreignId('synced_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('last_error')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        if (Schema::hasTable('project_sheet_configs')) {
            $legacy = DB::table('project_sheet_configs')
                ->orderByDesc('updated_at')
                ->get()
                ->unique('sheet_type');

            foreach ($legacy as $row) {
                DB::table('sheet_configs')->insert([
                    'sheet_type' => $row->sheet_type,
                    'spreadsheet_id' => $row->spreadsheet_id,
                    'spreadsheet_url' => $row->spreadsheet_url,
                    'tab_name' => $row->tab_name,
                    'tab_gid' => $row->tab_gid,
                    'status' => $row->status,
                    'synced_by_user_id' => $row->synced_by_user_id,
                    'last_error' => $row->last_error,
                    'last_synced_at' => $row->last_synced_at,
                    'metadata' => $row->metadata,
                    'created_at' => $row->created_at,
                    'updated_at' => $row->updated_at,
                ]);
            }

            Schema::dropIfExists('project_sheet_configs');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sheet_configs');
    }
};
