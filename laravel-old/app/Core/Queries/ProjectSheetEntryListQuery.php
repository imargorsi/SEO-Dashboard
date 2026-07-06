<?php

namespace App\Core\Queries;

use App\Models\ProjectSheetEntry;
use App\Support\Api\ListQueryState;
use Illuminate\Database\Eloquent\Builder;

final class ProjectSheetEntryListQuery
{
    /** @var list<string> */
    public const SORTABLE = [
        'source_row_number',
        'site',
        'days',
        'occurred_on',
        'synced_at',
        'created_at',
    ];

    /**
     * @return Builder<ProjectSheetEntry>
     */
    public static function base(int $projectId, string $sheetType): Builder
    {
        return ProjectSheetEntry::query()
            ->where('project_id', $projectId)
            ->where('sheet_type', $sheetType);
    }

    /**
     * @param  Builder<ProjectSheetEntry>  $query
     */
    public static function apply(Builder $query, ListQueryState $state): void
    {
        if ($state->search !== null) {
            $term = '%'.$state->search.'%';
            $query->where(function (Builder $builder) use ($term): void {
                $builder
                    ->where('site', 'like', $term)
                    ->orWhere('days', 'like', $term)
                    ->orWhere('page_link', 'like', $term)
                    ->orWhere('details', 'like', $term);
            });
        }

        $sort = in_array($state->sort, self::SORTABLE, true) ? $state->sort : 'source_row_number';
        $query->orderBy($sort, $state->direction === 'asc' ? 'asc' : 'desc');
    }
}
