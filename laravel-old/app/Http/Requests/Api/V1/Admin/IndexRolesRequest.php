<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Contracts\Http\ProvidesListQueryState;
use App\Http\Requests\Api\Concerns\InteractsWithListQuery;
use App\Support\Api\ListQueryState;
use Illuminate\Foundation\Http\FormRequest;

class IndexRolesRequest extends FormRequest implements ProvidesListQueryState
{
    use InteractsWithListQuery;

    /** @var list<string> */
    public const SORTABLE = ['name', 'guard_name', 'created_at', 'permissions_count', 'users_count'];

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
        return $this->listQueryRules(self::SORTABLE);
    }

    public function listState(): ListQueryState
    {
        return $this->resolveListQueryState(defaultSort: 'created_at', defaultPerPage: 15);
    }
}
