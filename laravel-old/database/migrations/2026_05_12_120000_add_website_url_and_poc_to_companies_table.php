<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('website_url', 2048)->nullable()->after('slug');
            $table->string('poc_name')->nullable()->after('website_url');
            $table->string('poc_email')->nullable()->after('poc_name');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['website_url', 'poc_name', 'poc_email']);
        });
    }
};
