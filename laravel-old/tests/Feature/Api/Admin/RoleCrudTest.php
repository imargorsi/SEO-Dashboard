<?php

namespace Tests\Feature\Api\Admin;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleCrudTest extends TestCase
{
    use RefreshDatabase;

    private function actingSuperAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        return $admin;
    }

    public function test_store_creates_role_with_permissions(): void
    {
        $this->actingSuperAdmin();
        Permission::findOrCreate('admin.dashboard.view', 'web');

        $this->postJson('/api/v1/admin/roles', [
            'name' => 'content_manager',
            'permissions' => ['admin.dashboard.view'],
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'content_manager');

        $this->assertTrue(Role::findByName('content_manager', 'web')->hasPermissionTo('admin.dashboard.view'));
    }

    public function test_show_resolves_role_by_name(): void
    {
        $this->actingSuperAdmin();
        Role::create(['name' => 'content_manager', 'guard_name' => 'web']);

        $this->getJson('/api/v1/admin/roles/content_manager')
            ->assertOk()
            ->assertJsonPath('data.name', 'content_manager');
    }

    public function test_company_admin_permissions_can_be_updated_when_name_unchanged_in_payload(): void
    {
        $this->actingSuperAdmin();
        Permission::findOrCreate('company.dashboard.view', 'web');
        Permission::findOrCreate('company.profile.view', 'web');

        $role = Role::findByName('company_admin', 'web');

        $this->patchJson("/api/v1/admin/roles/{$role->id}", [
            'name' => 'company_admin',
            'permissions' => ['company.dashboard.view', 'company.profile.view'],
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'company_admin')
            ->assertJsonPath('data.permissions_editable', true);

        $role->refresh();
        $this->assertSame(
            ['company.dashboard.view', 'company.profile.view'],
            $role->permissions->pluck('name')->sort()->values()->all()
        );
    }

    public function test_cannot_rename_system_role_even_when_name_sent_unchanged(): void
    {
        $this->actingSuperAdmin();

        $role = Role::findByName('company_admin', 'web');

        $this->patchJson("/api/v1/admin/roles/{$role->id}", [
            'name' => 'custom_company_admin',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_cannot_change_super_admin_permissions_via_update(): void
    {
        $this->actingSuperAdmin();
        Permission::findOrCreate('admin.dashboard.view', 'web');

        $role = Role::findByName('super_admin', 'web');

        $this->patchJson("/api/v1/admin/roles/{$role->id}", [
            'permissions' => ['admin.dashboard.view'],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['permissions']);
    }

    public function test_cannot_delete_system_role(): void
    {
        $this->actingSuperAdmin();
        $role = Role::findByName('super_admin', 'web');

        $this->deleteJson("/api/v1/admin/roles/{$role->id}")
            ->assertUnprocessable();
    }

    public function test_destroy_detaches_permissions_and_deletes_role(): void
    {
        $this->actingSuperAdmin();
        Permission::findOrCreate('admin.dashboard.view', 'web');

        $this->postJson('/api/v1/admin/roles', [
            'name' => 'temporary_role',
            'permissions' => ['admin.dashboard.view'],
        ])->assertCreated();

        $role = Role::findByName('temporary_role', 'web');
        $roleId = $role->id;

        $this->deleteJson("/api/v1/admin/roles/{$roleId}")
            ->assertOk();

        $this->assertDatabaseMissing('roles', ['id' => $roleId]);
        $this->assertDatabaseMissing('role_has_permissions', ['role_id' => $roleId]);
        $this->assertDatabaseHas('permissions', ['name' => 'admin.dashboard.view']);
    }
}
