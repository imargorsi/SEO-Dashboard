<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = [
        'company_id',
        'business_name',
        'site_code',
        'website_url',
        'industry_niche_id',
        'industry_other',
        'target_locations',
        'is_b2b',
        'is_b2c',
        'brief_description',
        'main_competitors',
        'seo_goal_other',
        'has_google_analytics',
        'has_google_search_console',
        'has_google_tag_manager',
        'has_google_ads',
        'has_website_login_details',
        'cms_login_page_url',
        'cms_username',
        'cms_password',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_locations' => 'array',
            'is_b2b' => 'boolean',
            'is_b2c' => 'boolean',
            'has_google_analytics' => 'boolean',
            'has_google_search_console' => 'boolean',
            'has_google_tag_manager' => 'boolean',
            'has_google_ads' => 'boolean',
            'has_website_login_details' => 'boolean',
            'cms_password' => 'encrypted',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function industryNiche(): BelongsTo
    {
        return $this->belongsTo(IndustryNiche::class);
    }

    public function seoGoals(): BelongsToMany
    {
        return $this->belongsToMany(SeoGoal::class, 'project_seo_goal', 'project_id', 'seo_goal_id');
    }

    public function integrations(): HasMany
    {
        return $this->hasMany(ProjectIntegration::class);
    }

    public function sheetEntries(): HasMany
    {
        return $this->hasMany(ProjectSheetEntry::class);
    }

    public function hasCmsPassword(): bool
    {
        $raw = $this->getRawOriginal('cms_password');

        return is_string($raw) && $raw !== '';
    }
}
