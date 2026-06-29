<?php

namespace App\Core\Queries;

use App\Models\Project;
use App\Support\Api\ListQueryState;
use App\Support\Database\LikePattern;
use Illuminate\Database\Eloquent\Builder;

final class AdminProjectListQuery
{
    /** @var list<string> */
    public const SORTABLE = ['business_name', 'website_url', 'created_at', 'company_id'];

    public static function apply(Builder $query, ListQueryState $state, ?int $companyIdFilter): Builder
    {
        $query->when($companyIdFilter !== null, function (Builder $q) use ($companyIdFilter): void {
            $q->where('projects.company_id', $companyIdFilter);
        });

        $query->when($state->search !== null && $state->search !== '', function (Builder $q) use ($state): void {
            $term = LikePattern::escape((string) $state->search);
            $like = LikePattern::wrap($term);

            $q->where(function (Builder $inner) use ($like): void {
                $inner->where('projects.business_name', 'like', $like)
                    ->orWhere('projects.website_url', 'like', $like);
            });
        });

        $direction = $state->direction === 'desc' ? 'desc' : 'asc';
        $sort = $state->sort;

        $column = match ($sort) {
            'website_url' => 'projects.website_url',
            'created_at' => 'projects.created_at',
            'company_id' => 'projects.company_id',
            default => 'projects.business_name',
        };
        $query->orderBy($column, $direction)->orderBy('projects.id', $direction);

        return $query;
    }

    public static function base(): Builder
    {
        return Project::query()->with(['seoGoals', 'industryNiche']);
    }
}
