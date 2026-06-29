<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->string('business_name');
            $table->string('website_url', 2048);
            $table->foreignId('industry_niche_id')->nullable()->constrained('industry_niches')->nullOnDelete();
            $table->string('industry_other')->nullable();
            $table->json('target_locations');
            $table->boolean('is_b2b')->default(false);
            $table->boolean('is_b2c')->default(false);
            $table->text('brief_description')->nullable();
            $table->text('main_competitors')->nullable();
            $table->string('seo_goal_other')->nullable();
            $table->boolean('has_google_analytics')->nullable();
            $table->boolean('has_google_search_console')->nullable();
            $table->boolean('has_google_tag_manager')->nullable();
            $table->boolean('has_google_ads')->nullable();
            $table->boolean('has_website_login_details')->nullable();
            $table->string('cms_login_page_url', 2048);
            $table->string('cms_username');
            $table->text('cms_password');
            $table->timestamps();

            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
