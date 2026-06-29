<?php

namespace App\Http\Requests\Api\V1\Projects;

use App\Http\Requests\Api\V1\Projects\Concerns\AuthorizesProjectAccess;
use App\Http\Requests\Api\V1\Projects\Concerns\NormalizesProjectInput;
use App\Models\IndustryNiche;
use App\Models\SeoGoal;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreProjectRequest extends FormRequest
{
    use AuthorizesProjectAccess;
    use NormalizesProjectInput;

    public function authorize(): bool
    {
        return $this->userCanAccessProjects();
    }

    protected function prepareForValidation(): void
    {
        $this->normalizeNullableForeignKeys(['company_id', 'industry_niche_id']);

        if ($this->user()?->hasRole('company_admin')) {
            $this->merge([
                'company_id' => $this->user()->company_id,
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $otherIndustryId = IndustryNiche::query()->where('slug', 'industry-other')->value('id');
        $otherGoalId = SeoGoal::query()->where('slug', 'seo-goal-other')->value('id');

        return [
            'company_id' => [
                Rule::requiredIf(fn () => $this->user()?->hasRole('super_admin')),
                'nullable',
                'integer',
                'exists:companies,id',
            ],
            'business_name' => ['required', 'string', 'max:255'],
            'site_code' => ['nullable', 'string', 'max:128'],
            'website_url' => ['required', 'string', 'max:2048'],
            'industry_niche_id' => ['nullable', 'integer', 'exists:industry_niches,id'],
            'industry_other' => [
                Rule::requiredIf(fn () => $otherIndustryId !== null
                    && (int) $this->input('industry_niche_id') === (int) $otherIndustryId),
                'nullable',
                'string',
                'max:2000',
            ],
            'target_locations' => ['required', 'array', 'min:1'],
            'target_locations.*' => ['required', 'string', 'max:120'],
            'is_b2b' => ['required', 'boolean'],
            'is_b2c' => ['required', 'boolean'],
            'brief_description' => ['nullable', 'string', 'max:20000'],
            'main_competitors' => ['nullable', 'string', 'max:20000'],
            'seo_goal_ids' => ['required', 'array', 'min:1'],
            'seo_goal_ids.*' => ['integer', 'distinct', 'exists:seo_goals,id'],
            'seo_goal_other' => [
                Rule::requiredIf(function () use ($otherGoalId) {
                    if ($otherGoalId === null) {
                        return false;
                    }
                    $ids = $this->input('seo_goal_ids', []);

                    return is_array($ids) && in_array((int) $otherGoalId, array_map('intval', $ids), true);
                }),
                'nullable',
                'string',
                'max:2000',
            ],
            'has_google_analytics' => ['nullable', 'boolean'],
            'has_google_search_console' => ['nullable', 'boolean'],
            'has_google_tag_manager' => ['nullable', 'boolean'],
            'has_google_ads' => ['nullable', 'boolean'],
            'has_website_login_details' => ['nullable', 'boolean'],
            'cms_login_page_url' => ['required', 'string', 'max:2048'],
            'cms_username' => ['required', 'string', 'max:255'],
            'cms_password' => ['required', 'string', 'max:2000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            if ($v->errors()->isNotEmpty()) {
                return;
            }
            $b2b = filter_var($this->input('is_b2b'), FILTER_VALIDATE_BOOLEAN);
            $b2c = filter_var($this->input('is_b2c'), FILTER_VALIDATE_BOOLEAN);
            if (! $b2b && ! $b2c) {
                $v->errors()->add('is_b2b', __('Select B2B and/or B2C.'));
            }
        });
    }
}
