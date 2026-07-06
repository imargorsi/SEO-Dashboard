<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Support\Permission\PermissionRoleAssigner;
use Illuminate\Database\Seeder;

/**
 * Seeds permissions and assigns them to roles.
 * `super_admin` receives every permission; `company_admin` receives company.* only.
 */
class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $guard = 'web';

        $adminPermissions = [
            'admin.dashboard.view',
            'admin.companies.view',
            'admin.companies.create',
            'admin.companies.update',
            'admin.companies.delete',
            'admin.roles.view',
            'admin.roles.create',
            'admin.roles.update',
            'admin.roles.delete',
            'admin.permissions.view',
            'admin.permissions.create',
            'admin.permissions.update',
            'admin.permissions.delete',
        ];

        $companyAdminPermissions = [
            'company.dashboard.view',
            'company.profile.view',
            'company.profile.update',
        ];

        foreach (array_merge($adminPermissions, $companyAdminPermissions) as $name) {
            Permission::findOrCreate($name, $guard);
        }

        Role::findByName('company_admin', $guard)->syncPermissions($companyAdminPermissions);

        PermissionRoleAssigner::syncSuperAdminWithAllPermissions();
    }
}
