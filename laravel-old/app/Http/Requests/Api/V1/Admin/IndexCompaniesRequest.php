<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Contracts\Http\ProvidesListQueryState;
use App\Http\Requests\Api\Concerns\InteractsWithListQuery;
use App\Models\Company;
use App\Support\Api\ListQueryState;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexCompaniesRequest extends FormRequest implements ProvidesListQueryState
{
    use InteractsWithListQuery;

    /** @var list<string> */
    public const SORTABLE = ['name', 'slug', 'created_at', 'poc_name', 'poc_email', 'status', 'is_active', 'users_count'];

    public function authorize(): bool
    {
        return $this->user()?->hasRole('super_admin') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->normalizeListQueryInput();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return array_merge($this->listQueryRules(self::SORTABLE), [
            'status' => ['sometimes', 'string', Rule::in(Company::STATUSES)],
        ]);
    }

    public function listState(): ListQueryState
    {
        return $this->resolveListQueryState(defaultSort: 'created_at', defaultPerPage: 15);
    }

    public function statusFilter(): ?string
    {
        $status = $this->validated('status');

        return is_string($status) && $status !== '' ? $status : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function filterPayload(): array
    {
        $payload = $this->listState()->toFilterPayload();
        $status = $this->statusFilter();

        if ($status !== null) {
            $payload['status'] = $status;
        }

        return $payload;
    }
}
