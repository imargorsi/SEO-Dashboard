<?php

namespace App\Sheets\Http\Requests\Admin;

use App\Contracts\Http\ProvidesListQueryState;
use App\Core\Queries\AdminSheetEntryListQuery;
use App\Http\Requests\Api\Concerns\InteractsWithListQuery;
use App\Sheets\ProjectSheetType;
use App\Support\Api\ListQueryState;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListAdminSheetEntriesRequest extends FormRequest implements ProvidesListQueryState
{
    use InteractsWithListQuery;

    /** @var list<string> */
    public const SORTABLE = AdminSheetEntryListQuery::SORTABLE;

    public function authorize(): bool
    {
        return $this->user()?->hasRole('super_admin') === true;
    }

    protected function prepareForValidation(): void
    {
        $this->normalizeListQueryInput();

        $this->merge([
            'type' => $this->route('type'),
        ]);

        foreach (['project_id', 'company_id', 'site'] as $field) {
            if ($this->has($field) && $this->input($field) === '') {
                $this->merge([$field => null]);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return array_merge($this->listQueryRules(self::SORTABLE), [
            'type' => ['required', 'string', Rule::in(ProjectSheetType::all())],
            'project_id' => ['sometimes', 'nullable', 'integer', 'exists:projects,id'],
            'company_id' => ['sometimes', 'nullable', 'integer', 'exists:companies,id'],
            'site' => ['sometimes', 'nullable', 'string', 'max:128'],
        ]);
    }

    public function listState(): ListQueryState
    {
        return $this->resolveListQueryState(defaultSort: 'source_row_number', defaultPerPage: 15, defaultDirection: 'asc');
    }

    public function sheetType(): string
    {
        return (string) $this->validated('type');
    }

    public function projectIdFilter(): ?int
    {
        $v = $this->validated('project_id');

        return $v === null ? null : (int) $v;
    }

    public function companyIdFilter(): ?int
    {
        $v = $this->validated('company_id');

        return $v === null ? null : (int) $v;
    }

    public function siteFilter(): ?string
    {
        $v = $this->validated('site');

        return is_string($v) && $v !== '' ? $v : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function filterPayload(): array
    {
        $payload = array_merge(
            $this->listState()->toFilterPayload(),
            ['sheet_type' => $this->sheetType()]
        );

        $projectId = $this->projectIdFilter();
        if ($projectId !== null) {
            $payload['project_id'] = $projectId;
        }

        $companyId = $this->companyIdFilter();
        if ($companyId !== null) {
            $payload['company_id'] = $companyId;
        }

        $site = $this->siteFilter();
        if ($site !== null) {
            $payload['site'] = $site;
        }

        return $payload;
    }
}
