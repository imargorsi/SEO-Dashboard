<?php

namespace App\Http\Controllers\Api\V1\Concerns;

trait InteractsWithProjectPayload
{
    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    protected function projectAttributesFromValidated(array $validated, bool $forUpdate = false): array
    {
        $keys = [
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
        ];

        $out = [];
        foreach ($keys as $key) {
            if (! array_key_exists($key, $validated)) {
                continue;
            }
            if ($forUpdate && ! $this->shouldApplyUpdateValue($validated[$key])) {
                continue;
            }
            $out[$key] = $validated[$key];
        }

        if (! $forUpdate && array_key_exists('cms_password', $validated)) {
            $out['cms_password'] = $validated['cms_password'];
        }

        return $out;
    }

    protected function shouldApplyUpdateValue(mixed $value): bool
    {
        return $value !== null;
    }
}
