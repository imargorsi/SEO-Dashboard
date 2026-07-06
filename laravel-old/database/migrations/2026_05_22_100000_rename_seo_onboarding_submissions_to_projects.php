<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('projects') || ! Schema::hasTable('seo_onboarding_submissions')) {
            return;
        }

        $pivotRows = Schema::hasTable('onboarding_seo_goal')
            ? DB::table('onboarding_seo_goal')->get()
            : collect();

        Schema::dropIfExists('onboarding_seo_goal');

        Schema::rename('seo_onboarding_submissions', 'projects');

        Schema::create('project_seo_goal', function (Blueprint $table) {
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('seo_goal_id')->constrained('seo_goals')->cascadeOnDelete();

            $table->primary(['project_id', 'seo_goal_id'], 'project_seo_goal_pk');
        });

        foreach ($pivotRows as $row) {
            DB::table('project_seo_goal')->insert([
                'project_id' => $row->submission_id,
                'seo_goal_id' => $row->seo_goal_id,
            ]);
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('projects') || Schema::hasTable('seo_onboarding_submissions')) {
            return;
        }

        $pivotRows = DB::table('project_seo_goal')->get();

        Schema::dropIfExists('project_seo_goal');

        Schema::rename('projects', 'seo_onboarding_submissions');

        Schema::create('onboarding_seo_goal', function (Blueprint $table) {
            $table->foreignId('submission_id')->constrained('seo_onboarding_submissions')->cascadeOnDelete();
            $table->foreignId('seo_goal_id')->constrained('seo_goals')->cascadeOnDelete();

            $table->primary(['submission_id', 'seo_goal_id'], 'onboarding_seo_goal_pk');
        });

        foreach ($pivotRows as $row) {
            DB::table('onboarding_seo_goal')->insert([
                'submission_id' => $row->project_id,
                'seo_goal_id' => $row->seo_goal_id,
            ]);
        }
    }
};
