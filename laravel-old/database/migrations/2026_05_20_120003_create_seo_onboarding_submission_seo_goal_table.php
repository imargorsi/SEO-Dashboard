<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_seo_goal', function (Blueprint $table) {
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('seo_goal_id')->constrained('seo_goals')->cascadeOnDelete();

            $table->primary(['project_id', 'seo_goal_id'], 'project_seo_goal_pk');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_seo_goal');
    }
};
