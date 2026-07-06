<?php

namespace App\Http\Resources;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Project */
class ProjectResource extends JsonResource
{
    public static $wrap = null;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'business_name' => $this->business_name,
            'site_code' => $this->site_code,
            'website_url' => $this->website_url,
            'industry_niche_id' => $this->industry_niche_id,
            'industry_other' => $this->industry_other,
            'target_locations' => $this->target_locations,
            'is_b2b' => $this->is_b2b,
            'is_b2c' => $this->is_b2c,
            'brief_description' => $this->brief_description,
            'main_competitors' => $this->main_competitors,
            'seo_goal_other' => $this->seo_goal_other,
            'has_google_analytics' => $this->has_google_analytics,
            'has_google_search_console' => $this->has_google_search_console,
            'has_google_tag_manager' => $this->has_google_tag_manager,
            'has_google_ads' => $this->has_google_ads,
            'has_website_login_details' => $this->has_website_login_details,
            'cms_login_page_url' => $this->cms_login_page_url,
            'cms_username' => $this->cms_username,
            'cms_password_set' => $this->resource->hasCmsPassword(),
            'seo_goals' => SeoGoalResource::collection($this->whenLoaded('seoGoals')),
            'seo_goal_ids' => $this->when(
                $this->relationLoaded('seoGoals'),
                fn () => $this->seoGoals->pluck('id')->values()->all()
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
