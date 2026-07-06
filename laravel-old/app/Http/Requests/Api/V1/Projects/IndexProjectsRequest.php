<?php

namespace App\Http\Requests\Api\V1\Projects;

use App\Contracts\Http\ProvidesListQueryState;
use App\Core\Queries\AdminProjectListQuery;
use App\Http\Requests\Api\Concerns\InteractsWithListQuery;
use App\Http\Requests\Api\V1\Projects\Concerns\AuthorizesProjectAccess;
use App\Support\Api\ListQueryState;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexProjectsRequest extends FormRequest implements ProvidesListQueryState
{
    use AuthorizesProjectAccess;
    use InteractsWithListQuery;

    /** @var list<string> */
    public const SORTABLE = AdminProjectListQuery::SORTABLE;

    public function authorize(): bool
    {
        return $this->userCanAccessProjects();
    }

    protected function prepareForValidation(): void
    {
        $this->normalizeListQueryInput();

        if ($this->has('company_id') && $this->input('company_id') === '') {
            $this->merge(['company_id' => null]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return array_merge($this->listQueryRules(self::SORTABLE), [
            'company_id' => [
                Rule::prohibitedIf(fn () => $this->userIsCompanyAdminOnly()),
                'sometimes',
                'nullable',
                'integer',
                'exists:companies,id',
            ],
        ]);
    }

    public function listState(): ListQueryState
    {
        return $this->resolveListQueryState(defaultSort: 'created_at', defaultPerPage: 15);
    }

    public function companyIdFilter(): ?int
    {
        if ($this->userIsCompanyAdminOnly()) {
            return (int) $this->user()->company_id;
        }

        $v = $this->validated('company_id');

        return $v === null ? null : (int) $v;
    }

    /**
     * Applied filters echoed in list responses (`data.filters`).
     *
     * @return array<string, mixed>
     */
    public function filterPayload(): array
    {
        $payload = $this->listState()->toFilterPayload();

        $companyId = $this->companyIdFilter();
        if ($companyId !== null) {
            $payload['company_id'] = $companyId;
        }

        return $payload;
    }
}
