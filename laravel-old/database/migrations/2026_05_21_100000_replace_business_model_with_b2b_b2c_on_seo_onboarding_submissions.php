<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('seo_onboarding_submissions')) {
            return;
        }

        if (! Schema::hasColumn('seo_onboarding_submissions', 'business_model')) {
            return;
        }

        Schema::table('seo_onboarding_submissions', function (Blueprint $table) {
            $table->boolean('is_b2b')->default(false)->after('target_locations');
            $table->boolean('is_b2c')->default(false)->after('is_b2b');
        });

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("
                UPDATE seo_onboarding_submissions
                SET is_b2b = (LOWER(business_model) IN ('b2b', 'both')),
                    is_b2c = (LOWER(business_model) IN ('b2c', 'both'))
            ");
        } else {
            foreach (DB::table('seo_onboarding_submissions')->select('id', 'business_model')->cursor() as $row) {
                $m = strtolower((string) $row->business_model);
                DB::table('seo_onboarding_submissions')->where('id', $row->id)->update([
                    'is_b2b' => in_array($m, ['b2b', 'both'], true),
                    'is_b2c' => in_array($m, ['b2c', 'both'], true),
                ]);
            }
        }

        Schema::table('seo_onboarding_submissions', function (Blueprint $table) {
            $table->dropColumn('business_model');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('seo_onboarding_submissions')) {
            return;
        }

        if (Schema::hasColumn('seo_onboarding_submissions', 'business_model')) {
            return;
        }

        Schema::table('seo_onboarding_submissions', function (Blueprint $table) {
            $table->string('business_model', 8)->default('b2b')->after('target_locations');
        });

        foreach (DB::table('seo_onboarding_submissions')->select('id', 'is_b2b', 'is_b2c')->cursor() as $row) {
            $legacy = match (true) {
                $row->is_b2b && $row->is_b2c => 'both',
                $row->is_b2c => 'b2c',
                default => 'b2b',
            };
            DB::table('seo_onboarding_submissions')->where('id', $row->id)->update([
                'business_model' => $legacy,
            ]);
        }

        Schema::table('seo_onboarding_submissions', function (Blueprint $table) {
            $table->dropColumn(['is_b2b', 'is_b2c']);
        });
    }
};
