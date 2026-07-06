<?php

namespace App\Sheets\Http\Requests;

use App\Contracts\Http\ProvidesListQueryState;
use App\Core\Queries\ProjectSheetEntryListQuery;
use App\Http\Requests\Api\Concerns\InteractsWithListQuery;
use App\Sheets\Http\Concerns\AuthorizesProjectForSheet;
use App\Sheets\ProjectSheetType;
use App\Support\Api\ListQueryState;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListProjectSheetEntriesRequest extends FormRequest implements ProvidesListQueryState
{
    use AuthorizesProjectForSheet;
    use InteractsWithListQuery;

    /** @var list<string> */
    public const SORTABLE = ProjectSheetEntryListQuery::SORTABLE;

    public function authorize(): bool
    {
        return $this->userCanAccessProjects();
    }

    protected function prepareForValidation(): void
    {
        $this->normalizeListQueryInput();

        $this->merge([
            'type' => $this->route('type'),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return array_merge($this->listQueryRules(self::SORTABLE), [
            'type' => ['required', 'string', Rule::in(ProjectSheetType::all())],
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

    /**
     * @return array<string, mixed>
     */
    public function filterPayload(): array
    {
        return array_merge(
            $this->listState()->toFilterPayload(),
            ['sheet_type' => $this->sheetType()]
        );
    }
}
