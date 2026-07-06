<?php

namespace Tests\Feature\Api\Admin;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompanyCrudTest extends TestCase
{
    use RefreshDatabase;

    private function actingSuperAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        return $admin;
    }

    private function createCompanyViaApi(bool $isActive = true): Company
    {
        $this->actingSuperAdmin();

        $this->postJson('/api/v1/admin/companies', [
            'company_name' => 'Gamma LLC',
            'poc_name' => 'Pat',
            'poc_email' => 'pat@gamma.example.com',
            'is_active' => $isActive,
        ])->assertCreated();

        $company = Company::query()->where('name', 'Gamma LLC')->first();
        $this->assertNotNull($company);

        return $company;
    }

    public function test_index_lists_companies_with_is_active(): void
    {
        $this->actingSuperAdmin();
        $this->createCompanyViaApi();
        $this->flushHeaders();

        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/companies');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.items.0.name', 'Gamma LLC')
            ->assertJsonPath('data.items.0.is_active', true)
            ->assertJsonPath('data.pagination.current_page', 1)
            ->assertJsonPath('data.pagination.per_page', 15)
            ->assertJsonPath('data.pagination.total', 1)
            ->assertJsonPath('data.filters.sort', 'created_at')
            ->assertJsonPath('data.filters.direction', 'desc');
    }

    public function test_index_search_and_sort_query(): void
    {
        $this->actingSuperAdmin();
        $this->postJson('/api/v1/admin/companies', [
            'company_name' => 'Alpha Corp',
            'poc_name' => 'Alex',
            'poc_email' => 'alex@alpha.example.com',
        ])->assertCreated();
        $this->postJson('/api/v1/admin/companies', [
            'company_name' => 'Beta Inc',
            'poc_name' => 'Ben',
            'poc_email' => 'ben@beta.example.com',
        ])->assertCreated();
        $this->flushHeaders();

        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        $this->getJson('/api/v1/admin/companies?search=Beta')
            ->assertOk()
            ->assertJsonPath('data.items.0.name', 'Beta Inc')
            ->assertJsonPath('data.pagination.total', 1)
            ->assertJsonPath('data.filters.search', 'Beta');

        $this->getJson('/api/v1/admin/companies?sort=slug&direction=desc&per_page=1')
            ->assertOk()
            ->assertJsonPath('data.pagination.per_page', 1)
            ->assertJsonPath('data.pagination.last_page', 2)
            ->assertJsonPath('data.filters.sort', 'slug')
            ->assertJsonPath('data.filters.direction', 'desc');
    }

    public function test_index_rejects_invalid_sort(): void
    {
        $this->actingSuperAdmin();

        $this->getJson('/api/v1/admin/companies?sort=invalid_column')
            ->assertUnprocessable()
            ->assertJsonPath('success', false);
    }

    public function test_show_returns_company(): void
    {
        $company = $this->createCompanyViaApi();
        $this->flushHeaders();

        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        $this->getJson("/api/v1/admin/companies/{$company->id}")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $company->id)
            ->assertJsonPath('data.is_active', true);
    }

    public function test_update_poc_and_is_active(): void
    {
        $company = $this->createCompanyViaApi();
        $this->flushHeaders();

        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/admin/companies/{$company->id}", [
            'poc_name' => 'Pat Lee',
            'poc_email' => 'pat.lee@gamma.example.com',
            'is_active' => false,
        ])
            ->assertOk()
            ->assertJsonPath('data.is_active', false)
            ->assertJsonPath('data.poc_email', 'pat.lee@gamma.example.com');

        $this->assertDatabaseHas('users', [
            'email' => 'pat.lee@gamma.example.com',
            'name' => 'Pat Lee',
            'company_id' => $company->id,
        ]);

        $this->assertDatabaseHas('companies', [
            'id' => $company->id,
            'is_active' => false,
        ]);
    }

    public function test_inactive_company_user_cannot_login(): void
    {
        $company = $this->createCompanyViaApi(isActive: false);
        $poc = User::query()->where('company_id', $company->id)->first();
        $this->assertNotNull($poc);
        $poc->forceFill(['password' => Hash::make('secret-pass')])->save();

        $this->postJson('/api/v1/auth/login', [
            'email' => $poc->email,
            'password' => 'secret-pass',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_destroy_deletes_company(): void
    {
        $company = $this->createCompanyViaApi();
        $this->flushHeaders();

        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        $this->deleteJson("/api/v1/admin/companies/{$company->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('companies', ['id' => $company->id]);
    }

    public function test_non_super_admin_cannot_access_company_routes(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $company = Company::query()->create([
            'name' => 'Orphan Co',
            'slug' => 'orphan-co-'.uniqid('', true),
            'poc_name' => 'P',
            'poc_email' => 'p@example.test',
            'status' => Company::STATUS_APPROVED,
            'is_active' => true,
        ]);

        $this->getJson('/api/v1/admin/companies')->assertForbidden();
        $this->getJson("/api/v1/admin/companies/{$company->id}")->assertForbidden();
        $this->patchJson("/api/v1/admin/companies/{$company->id}", ['poc_name' => 'X'])->assertForbidden();
        $this->deleteJson("/api/v1/admin/companies/{$company->id}")->assertForbidden();
    }
}
