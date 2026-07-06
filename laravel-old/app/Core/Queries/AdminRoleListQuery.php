<?php

namespace App\Core\Queries;

use App\Models\Role;
use App\Support\Api\ListQueryState;
use App\Support\Database\LikePattern;
use App\Support\Permission\PermissionGuard;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

final class AdminRoleListQuery
{
    public static function apply(Builder $query, ListQueryState $state): Builder
    {
        $query->when($state->search !== null && $state->search !== '', function (Builder $q) use ($state): void {
            $like = LikePattern::wrap(LikePattern::escape((string) $state->search));
            $q->where('roles.name', 'like', $like);
        });

        $direction = $state->direction === 'desc' ? 'desc' : 'asc';
        $column = match ($state->sort) {
            'guard_name' => 'roles.guard_name',
            'created_at' => 'roles.created_at',
            'permissions_count' => 'permissions_count',
            'users_count' => 'users_count',
            default => 'roles.name',
        };

        $query->orderBy($column, $direction)->orderBy('roles.id', $direction);

        return $query;
    }

    public static function base(): Builder
    {
        $pivotTable = config('permission.table_names.model_has_roles');
        $rolePivotKey = config('permission.column_names.role_pivot_key') ?? 'role_id';

        return Role::query()
            ->where('guard_name', PermissionGuard::WEB)
            ->with('permissions')
            ->withCount('permissions')
            ->selectSub(
                DB::table($pivotTable)
                    ->selectRaw('count(*)')
                    ->whereColumn("{$pivotTable}.{$rolePivotKey}", 'roles.id'),
                'users_count'
            );
    }
}
