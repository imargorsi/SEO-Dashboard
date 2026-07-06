<?php

namespace App\Core\Queries;

use App\Models\ProjectSheetEntry;
use App\Support\Api\ListQueryState;
use Illuminate\Database\Eloquent\Builder;

final class AdminSheetEntryListQuery
{
    /** @var list<string> */
    public const SORTABLE = [
        'source_row_number',
        'site',
        'days',
        'occurred_on',
        'synced_at',
        'created_at',
        'project_id',
    ];

    /**
     * @return Builder<ProjectSheetEntry>
     */
    public static function base(string $sheetType): Builder
    {
        return ProjectSheetEntry::query()
            ->with(['project:id,business_name,company_id,site_code'])
            ->where('sheet_type', $sheetType);
    }

    /**
     * @param  Builder<ProjectSheetEntry>  $query
     */
    public static function apply(
        Builder $query,
        ListQueryState $state,
        ?int $projectId = null,
        ?int $companyId = null,
        ?string $site = null,
    ): void {
        if ($projectId !== null) {
            $query->where('project_id', $projectId);
        }

        if ($companyId !== null) {
            $query->whereHas('project', fn (Builder $builder) => $builder->where('company_id', $companyId));
        }

        if ($site !== null && $site !== '') {
            $query->where('site', $site);
        }

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
