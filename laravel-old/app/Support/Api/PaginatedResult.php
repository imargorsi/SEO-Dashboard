<?php

namespace App\Support\Api;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Standard list payload: items + pagination + applied filters (for URL/query sync on the client).
 *
 * @phpstan-type FilterPayload array<string, mixed>
 */
final class PaginatedResult
{
    /**
     * @param  array<int, array<string, mixed>>  $items
     * @param  FilterPayload  $filtersApplied
     * @return array{items: array<int, array<string, mixed>>, pagination: array<string, mixed>, filters: FilterPayload}
     */
    public static function build(
        array $items,
        LengthAwarePaginator $paginator,
        array $filtersApplied,
    ): array {
        $lastPage = $paginator->lastPage();

        return [
            'items' => $items,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $lastPage,
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'has_more_pages' => $paginator->hasMorePages(),
                'links' => [
                    'first' => $paginator->url(1),
                    'last' => $lastPage > 0 ? $paginator->url($lastPage) : null,
                    'prev' => $paginator->previousPageUrl(),
                    'next' => $paginator->nextPageUrl(),
                ],
            ],
            'filters' => $filtersApplied,
        ];
    }
}
