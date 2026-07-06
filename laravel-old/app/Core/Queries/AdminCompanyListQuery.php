<?php

namespace App\Core\Queries;

use App\Models\Company;
use App\Support\Api\ListQueryState;
use App\Support\Database\LikePattern;
use Illuminate\Database\Eloquent\Builder;

final class AdminCompanyListQuery
{
    public static function apply(Builder $query, ListQueryState $state, ?string $status = null): Builder
    {
        $query->when(is_string($status) && $status !== '', function (Builder $q) use ($status): void {
            $q->where('companies.status', $status);
        });

        $query->when($state->search !== null && $state->search !== '', function (Builder $q) use ($state): void {
            $term = LikePattern::escape((string) $state->search);
            $like = LikePattern::wrap($term);

            $q->where(function (Builder $inner) use ($like): void {
                $inner->where('companies.name', 'like', $like)
                    ->orWhere('companies.slug', 'like', $like)
                    ->orWhere('companies.poc_name', 'like', $like)
                    ->orWhere('companies.poc_email', 'like', $like);
            });
        });

        $direction = $state->direction === 'desc' ? 'desc' : 'asc';
        $sort = $state->sort;

        if ($sort === 'users_count') {
            $query->orderBy('users_count', $direction);
        } else {
            $column = match ($sort) {
                'slug' => 'companies.slug',
                'created_at' => 'companies.created_at',
                'poc_name' => 'companies.poc_name',
                'poc_email' => 'companies.poc_email',
                'is_active' => 'companies.is_active',
                'status' => 'companies.status',
                default => 'companies.name',
            };
            $query->orderBy($column, $direction);
        }

        $query->orderBy('companies.id', $direction);

        return $query;
    }

    public static function base(): Builder
    {
        return Company::query()->withCount('users');
    }
}
