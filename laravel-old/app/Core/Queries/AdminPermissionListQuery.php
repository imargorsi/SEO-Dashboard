<?php

namespace App\Core\Queries;

use App\Models\Permission;
use App\Support\Api\ListQueryState;
use App\Support\Database\LikePattern;
use App\Support\Permission\PermissionGuard;
use Illuminate\Database\Eloquent\Builder;

final class AdminPermissionListQuery
{
    public static function apply(Builder $query, ListQueryState $state): Builder
    {
        $query->when($state->search !== null && $state->search !== '', function (Builder $q) use ($state): void {
            $like = LikePattern::wrap(LikePattern::escape((string) $state->search));
            $q->where('permissions.name', 'like', $like);
        });

        $direction = $state->direction === 'desc' ? 'desc' : 'asc';
        $column = match ($state->sort) {
            'guard_name' => 'permissions.guard_name',
            'created_at' => 'permissions.created_at',
            'roles_count' => 'roles_count',
            default => 'permissions.name',
        };

        $query->orderBy($column, $direction)->orderBy('permissions.id', $direction);

        return $query;
    }

    public static function base(): Builder
    {
        return Permission::query()
            ->where('guard_name', PermissionGuard::WEB)
            ->withCount('roles');
    }
}
