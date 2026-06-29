<?php

namespace App\Support\Permission;

use App\Models\Role;
use Illuminate\Support\Facades\DB;

final class RoleUserCount
{
    public static function for(Role $role): int
    {
        $table = config('permission.table_names.model_has_roles');
        $rolePivotKey = config('permission.column_names.role_pivot_key') ?? 'role_id';

        return (int) DB::table($table)
            ->where($rolePivotKey, $role->id)
            ->count();
    }

    public static function attach(Role $role): Role
    {
        $role->setAttribute('users_count', self::for($role));

        return $role;
    }
}
