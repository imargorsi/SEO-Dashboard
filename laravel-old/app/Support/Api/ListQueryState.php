<?php

namespace App\Support\Api;

/**
 * Immutable list query state (pagination + sort + search) for APIs and query objects.
 */
final readonly class ListQueryState
{
    public function __construct(
        public ?string $search,
        public string $sort,
        public string $direction,
        public int $page,
        public int $per_page,
    ) {}

    /**
     * Echoed in list responses as `data.filters` so clients can sync URL ↔ UI ↔ server.
     *
     * @return array{search: ?string, sort: string, direction: string, page: int, per_page: int}
     */
    public function toFilterPayload(): array
    {
        return [
            'search' => $this->search,
            'sort' => $this->sort,
            'direction' => $this->direction,
            'page' => $this->page,
            'per_page' => $this->per_page,
        ];
    }
}
