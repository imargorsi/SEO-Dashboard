<?php

namespace App\Http\Requests\Api\Concerns;

use App\Support\Api\ListQueryState;
use Illuminate\Validation\Rule;

/**
 * Reusable validation + normalization for paginated, searchable, sortable index endpoints.
 *
 * Usage:
 * - Call {@see normalizeListQueryInput()} from {@see prepareForValidation()}.
 * - Use {@see listQueryRules()} in {@see rules()}.
 * - Expose {@see listState()} by delegating to {@see resolveListQueryState()} with resource defaults.
 */
trait InteractsWithListQuery
{
    /**
     * Shared query rules for paginated, sortable list endpoints.
     *
     * @param  array<int, string>  $sortable
     * @return array<string, mixed>
     */
    protected function listQueryRules(array $sortable, int $defaultPerPage = 15, int $maxPerPage = 100): array
    {
        return [
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:'.$maxPerPage],
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sort' => ['sometimes', 'string', Rule::in($sortable)],
            'direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
        ];
    }

    /**
     * Trim search, normalize direction casing (call from the request's {@see prepareForValidation()}).
     */
    protected function normalizeListQueryInput(): void
    {
        if ($this->has('search')) {
            $s = trim((string) $this->input('search'));
            $this->merge(['search' => $s === '' ? null : $s]);
        }

        if ($this->has('direction') && is_string($this->input('direction'))) {
            $this->merge(['direction' => strtolower($this->input('direction'))]);
        }
    }

    /**
     * Build immutable list state from validated input (after rules ran).
     */
    protected function resolveListQueryState(
        string $defaultSort,
        int $defaultPerPage,
        string $defaultDirection = 'desc',
    ): ListQueryState {
        $validated = $this->validated();

        $search = $validated['search'] ?? null;
        if (! is_string($search) || $search === '') {
            $search = null;
        }

        return new ListQueryState(
            search: $search,
            sort: $validated['sort'] ?? $defaultSort,
            direction: $validated['direction'] ?? $defaultDirection,
            page: max(1, (int) ($validated['page'] ?? 1)),
            per_page: max(1, (int) ($validated['per_page'] ?? $defaultPerPage)),
        );
    }
}
