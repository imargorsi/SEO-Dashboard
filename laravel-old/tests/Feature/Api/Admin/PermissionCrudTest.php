<?php

namespace Tests\Feature\Api\Admin;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PermissionCrudTest extends TestCase
{
    use RefreshDatabase;

    private function actingSuperAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        return $admin;
    }

    public function test_index_lists_permissions(): void
    {
        $this->actingSuperAdmin();
        Permission::findOrCreate('admin.dashboard.view', 'web');

        $this->getJson('/api/v1/admin/permissions')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.filters.sort', 'created_at')
            ->assertJsonPath('data.filters.direction', 'desc');
    }

    public function test_store_creates_permission_and_assigns_to_super_admin_by_default(): void
    {
        $this->actingSuperAdmin();

        $this->postJson('/api/v1/admin/permissions', [
            'name' => 'admin.reports.export',
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'admin.reports.export')
            ->assertJsonPath('data.roles.0', 'super_admin');

        $permission = Permission::findByName('admin.reports.export', 'web');
        $this->assertTrue(Role::findByName('super_admin', 'web')->hasPermissionTo($permission));
    }

    public function test_store_assigns_company_permission_to_company_admin_and_super_admin(): void
    {
        $this->actingSuperAdmin();

        $response = $this->postJson('/api/v1/admin/permissions', [
            'name' => 'company.reports.view',
        ])->assertCreated();

        $roles = collect($response->json('data.roles'));
        $this->assertTrue($roles->contains('super_admin'));
        $this->assertTrue($roles->contains('company_admin'));

        $permission = Permission::findByName('company.reports.view', 'web');
        $this->assertTrue(Role::findByName('company_admin', 'web')->hasPermissionTo($permission));
        $this->assertTrue(Role::findByName('super_admin', 'web')->hasPermissionTo($permission));
    }

    public function test_super_admin_has_all_permissions_after_seeder(): void
    {
        $this->seed(PermissionSeeder::class);

        $all = Permission::query()->where('guard_name', 'web')->pluck('name')->sort()->values();
        $super = Role::findByName('super_admin', 'web')->permissions->pluck('name')->sort()->values();

        $this->assertTrue($all->diff($super)->isEmpty(), 'super_admin is missing: '.$all->diff($super)->implode(', '));
    }

    public function test_show_returns_permission(): void
    {
        $this->actingSuperAdmin();
        $permission = Permission::findOrCreate('admin.companies.view', 'web');

        $this->getJson("/api/v1/admin/permissions/{$permission->id}")
            ->assertOk()
            ->assertJsonPath('data.name', 'admin.companies.view');
    }

    public function test_show_resolves_permission_by_name(): void
    {
        $this->actingSuperAdmin();
        Permission::findOrCreate('admin.companies.view', 'web');

        $this->getJson('/api/v1/admin/permissions/admin.companies.view')
            ->assertOk()
            ->assertJsonPath('data.name', 'admin.companies.view');
    }

    public function test_update_renames_permission(): void
    {
        $this->actingSuperAdmin();
        $permission = Permission::create([
            'name' => 'admin.old.name',
            'guard_name' => 'web',
        ]);

        $this->patchJson("/api/v1/admin/permissions/{$permission->id}", [
            'name' => 'admin.new.name',
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'admin.new.name');

        $this->assertDatabaseHas('permissions', ['name' => 'admin.new.name']);
    }

    public function test_destroy_detaches_from_roles_and_deletes_permission(): void
    {
        $this->actingSuperAdmin();

        $this->postJson('/api/v1/admin/permissions', [
            'name' => 'admin.temp.delete',
        ])->assertCreated();

        $permission = Permission::findByName('admin.temp.delete', 'web');
        $permissionId = $permission->id;

        $this->assertDatabaseHas('role_has_permissions', [
            'permission_id' => $permissionId,
            'role_id' => Role::findByName('super_admin', 'web')->id,
        ]);

        $this->deleteJson("/api/v1/admin/permissions/{$permissionId}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('permissions', ['id' => $permissionId]);
        $this->assertDatabaseMissing('role_has_permissions', ['permission_id' => $permissionId]);

        $superAdmin = Role::findByName('super_admin', 'web')->load('permissions');
        $this->assertFalse(
            $superAdmin->permissions->contains('name', 'admin.temp.delete')
        );
    }

    public function test_non_super_admin_cannot_access_permission_routes(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $permission = Permission::findOrCreate('admin.dashboard.view', 'web');

        $this->getJson('/api/v1/admin/permissions')->assertForbidden();
        $this->postJson('/api/v1/admin/permissions', ['name' => 'x.y'])->assertForbidden();
        $this->getJson("/api/v1/admin/permissions/{$permission->id}")->assertForbidden();
        $this->patchJson("/api/v1/admin/permissions/{$permission->id}", ['name' => 'a.b'])->assertForbidden();
        $this->deleteJson("/api/v1/admin/permissions/{$permission->id}")->assertForbidden();
    }
}
