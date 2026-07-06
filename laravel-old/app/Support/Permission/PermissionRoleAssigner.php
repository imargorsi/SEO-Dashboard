<?php

namespace App\Support\Permission;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

final class PermissionRoleAssigner
{
    public const SUPER_ADMIN_ROLE = 'super_admin';

    /**
     * Attach a permission to the given roles. `super_admin` is always included.
     *
     * @param  list<string>  $roleNames
     */
    public static function attach(Permission $permission, array $roleNames): void
    {
        $roleNames = self::withSuperAdmin($roleNames);

        foreach ($roleNames as $roleName) {
            Role::findByName($roleName, PermissionGuard::WEB)->givePermissionTo($permission);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Replace which roles have this permission. `super_admin` is always kept.
     *
     * @param  list<string>  $roleNames
     */
    public static function syncRoles(Permission $permission, array $roleNames): void
    {
        $roleNames = self::withSuperAdmin($roleNames);
        $table = config('permission.table_names.role_has_permissions');
        $pivotPermission = config('permission.column_names.permission_pivot_key') ?? 'permission_id';
        $pivotRole = config('permission.column_names.role_pivot_key') ?? 'role_id';

        DB::transaction(function () use ($permission, $roleNames, $table, $pivotPermission, $pivotRole): void {
            DB::table($table)->where($pivotPermission, $permission->id)->delete();

            foreach ($roleNames as $roleName) {
                $role = Role::findByName($roleName, PermissionGuard::WEB);
                DB::table($table)->insert([
                    $pivotPermission => $permission->id,
                    $pivotRole => $role->id,
                ]);
            }
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Give `super_admin` every permission in the database (run after seed / bulk imports).
     */
    public static function syncSuperAdminWithAllPermissions(): void
    {
        $names = Permission::query()
            ->where('guard_name', PermissionGuard::WEB)
            ->orderBy('name')
            ->pluck('name')
            ->all();

        Role::findByName(self::SUPER_ADMIN_ROLE, PermissionGuard::WEB)
            ->syncPermissions($names);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Default roles when `roles` is omitted on create (super_admin is added automatically too).
     *
     * @return list<string>
     */
    public static function defaultRolesForPermissionName(string $name): array
    {
        if (str_starts_with($name, 'company.')) {
            return ['company_admin'];
        }

        return [];
    }

    /**
     * Delete a role and remove all permission links (role_has_permissions).
     */
    public static function deleteRole(Role $role): void
    {
        DB::transaction(function () use ($role): void {
            $role->permissions()->detach();
            $role->delete();
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Delete a permission and remove all role / direct model links.
     */
    public static function deletePermission(Permission $permission): void
    {
        $permissionId = $permission->id;
        $modelHasPermissions = config('permission.table_names.model_has_permissions');
        $permissionPivotKey = config('permission.column_names.permission_pivot_key') ?? 'permission_id';

        DB::transaction(function () use ($permission, $permissionId, $modelHasPermissions, $permissionPivotKey): void {
            $permission->roles()->detach();

            DB::table($modelHasPermissions)
                ->where($permissionPivotKey, $permissionId)
                ->delete();

            $permission->delete();
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * @param  list<string>  $roleNames
     * @return list<string>
     */
    private static function withSuperAdmin(array $roleNames): array
    {
        return array_values(array_unique([
            ...$roleNames,
            self::SUPER_ADMIN_ROLE,
        ]));
    }
}
