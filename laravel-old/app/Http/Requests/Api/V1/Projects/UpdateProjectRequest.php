<?php

namespace App\Http\Requests\Api\V1\Projects;

use App\Http\Requests\Api\V1\Projects\Concerns\AuthorizesProjectAccess;
use App\Http\Requests\Api\V1\Projects\Concerns\NormalizesProjectInput;
use App\Models\IndustryNiche;
use App\Models\Project;
use App\Models\SeoGoal;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateProjectRequest extends FormRequest
{
    use AuthorizesProjectAccess;
    use NormalizesProjectInput;

    protected function prepareForValidation(): void
    {
        $this->normalizeNullableForeignKeys(['company_id', 'industry_niche_id']);

        if ($this->userIsCompanyAdminOnly()) {
            $this->offsetUnset('company_id');
        }
    }

    public function authorize(): bool
    {
        $user = $this->user();
        if ($user === null) {
            return false;
        }

        /** @var Project $project */
        $project = $this->route('project');

        if ($user->hasRole('super_admin')) {
            return true;
        }

        if ($user->hasRole('company_admin')) {
            if (! $this->userCanAccessProjects()) {
                return false;
            }

            return (int) $project->company_id === (int) $user->company_id;
        }

        return false;
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
                Rule::prohibitedIf(fn () => $this->userIsCompanyAdminOnly()),
                'sometimes',
                'integer',
                'exists:companies,id',
            ],
            'business_name' => ['sometimes', 'string', 'max:255'],
            'site_code' => ['sometimes', 'nullable', 'string', 'max:128'],
            'website_url' => ['sometimes', 'string', 'max:2048'],
            'industry_niche_id' => ['sometimes', 'nullable', 'integer', 'exists:industry_niches,id'],
            'industry_other' => [
                Rule::requiredIf(function () use ($otherIndustryId) {
                    if ($otherIndustryId === null) {
                        return false;
                    }
                    $nicheId = $this->input('industry_niche_id', $this->route('project')->industry_niche_id);

                    return (int) $nicheId === (int) $otherIndustryId;
                }),
                'nullable',
                'string',
                'max:2000',
            ],
            'target_locations' => ['sometimes', 'array', 'min:1'],
            'target_locations.*' => ['required', 'string', 'max:120'],
            'is_b2b' => ['sometimes', 'boolean'],
            'is_b2c' => ['sometimes', 'boolean'],
            'brief_description' => ['sometimes', 'nullable', 'string', 'max:20000'],
            'main_competitors' => ['sometimes', 'nullable', 'string', 'max:20000'],
            'seo_goal_ids' => ['sometimes', 'array', 'min:1'],
            'seo_goal_ids.*' => ['integer', 'distinct', 'exists:seo_goals,id'],
            'seo_goal_other' => [
                Rule::requiredIf(function () use ($otherGoalId) {
                    if ($otherGoalId === null) {
                        return false;
                    }
                    $ids = $this->input('seo_goal_ids');
                    if (! is_array($ids)) {
                        $ids = $this->route('project')->seoGoals()->pluck('seo_goals.id')->all();
                    }

                    return in_array((int) $otherGoalId, array_map('intval', $ids), true);
                }),
                'nullable',
                'string',
                'max:2000',
            ],
            'has_google_analytics' => ['sometimes', 'nullable', 'boolean'],
            'has_google_search_console' => ['sometimes', 'nullable', 'boolean'],
            'has_google_tag_manager' => ['sometimes', 'nullable', 'boolean'],
            'has_google_ads' => ['sometimes', 'nullable', 'boolean'],
            'has_website_login_details' => ['sometimes', 'nullable', 'boolean'],
            'cms_login_page_url' => ['sometimes', 'string', 'max:2048'],
            'cms_username' => ['sometimes', 'string', 'max:255'],
            'cms_password' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            if ($v->errors()->isNotEmpty()) {
                return;
            }
            if (! $this->has('is_b2b') && ! $this->has('is_b2c')) {
                return;
            }

            /** @var Project $project */
            $project = $this->route('project');
            $b2b = $this->has('is_b2b')
                ? filter_var($this->input('is_b2b'), FILTER_VALIDATE_BOOLEAN)
                : (bool) $project->is_b2b;
            $b2c = $this->has('is_b2c')
                ? filter_var($this->input('is_b2c'), FILTER_VALIDATE_BOOLEAN)
                : (bool) $project->is_b2c;

            if (! $b2b && ! $b2c) {
                $v->errors()->add('is_b2b', __('Select B2B and/or B2C.'));
            }
        });
    }
}
