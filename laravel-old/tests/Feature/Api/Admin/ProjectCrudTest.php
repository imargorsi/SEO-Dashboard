<?php

namespace Tests\Feature\Api\Admin;

use App\Models\Company;
use App\Models\SeoGoal;
use App\Models\User;
use Database\Seeders\IndustryNicheSeeder;
use Database\Seeders\SeoGoalSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProjectCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndustryNicheSeeder::class);
        $this->seed(SeoGoalSeeder::class);
    }

    /**
     * @return array<string, mixed>
     */
    private function validProjectPayload(int $companyId): array
    {
        $goalIds = SeoGoal::query()->whereIn('slug', ['organic-traffic', 'leads'])->pluck('id')->all();

        return [
            'company_id' => $companyId,
            'business_name' => 'Northwind Traders',
            'website_url' => 'https://northwind.example.com',
            'industry_niche_id' => null,
            'industry_other' => null,
            'target_locations' => ['Chicago', 'Milwaukee'],
            'is_b2b' => true,
            'is_b2c' => true,
            'brief_description' => 'B2B wholesale.',
            'main_competitors' => 'https://contoso.example.com',
            'seo_goal_ids' => $goalIds,
            'seo_goal_other' => null,
            'has_google_analytics' => true,
            'has_google_search_console' => null,
            'has_google_tag_manager' => null,
            'has_google_ads' => false,
            'has_website_login_details' => null,
            'cms_login_page_url' => 'https://northwind.example.com/wp-login.php',
            'cms_username' => 'admin',
            'cms_password' => 'secret-pass',
        ];
    }

    public function test_super_admin_can_create_list_show_update_delete_project(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        $company = Company::query()->create([
            'name' => 'Gamma LLC',
            'slug' => 'gamma-'.uniqid(),
            'poc_name' => 'Pat',
            'poc_email' => 'pat@gamma.example.com',
            'is_active' => true,
        ]);

        $create = $this->postJson('/api/v1/projects', $this->validProjectPayload($company->id));
        $create->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.business_name', 'Northwind Traders')
            ->assertJsonPath('data.cms_password_set', true);

        $projectId = (int) $create->json('data.id');
        $this->assertGreaterThan(0, $projectId);

        $this->getJson("/api/v1/projects?company_id={$company->id}")
            ->assertOk()
            ->assertJsonPath('data.pagination.total', 1);

        $this->getJson("/api/v1/projects/{$projectId}")
            ->assertOk()
            ->assertJsonPath('data.id', $projectId);

        $patch = $this->patchJson("/api/v1/projects/{$projectId}", [
            'business_name' => 'Northwind LLC',
        ]);
        $patch->assertOk()
            ->assertJsonPath('data.business_name', 'Northwind LLC');

        $this->deleteJson("/api/v1/projects/{$projectId}")
            ->assertOk();

        $this->assertDatabaseMissing('projects', ['id' => $projectId]);
    }

    public function test_store_accepts_empty_string_industry_niche_id(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        $company = Company::query()->create([
            'name' => 'Epsilon Co',
            'slug' => 'epsilon-'.uniqid(),
            'poc_name' => 'Eve',
            'poc_email' => 'eve@epsilon.example.com',
            'is_active' => true,
        ]);

        $payload = $this->validProjectPayload($company->id);
        $payload['industry_niche_id'] = '';

        $this->postJson('/api/v1/projects', $payload)->assertCreated();
    }

    public function test_index_filters_projects_by_company_id_for_super_admin(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        $companyA = Company::query()->create([
            'name' => 'Company A',
            'slug' => 'company-a-'.uniqid(),
            'poc_name' => 'A',
            'poc_email' => 'a@example.com',
            'is_active' => true,
        ]);

        $companyB = Company::query()->create([
            'name' => 'Company B',
            'slug' => 'company-b-'.uniqid(),
            'poc_name' => 'B',
            'poc_email' => 'b@example.com',
            'is_active' => true,
        ]);

        $this->postJson('/api/v1/projects', $this->validProjectPayload($companyA->id))->assertCreated();
        $this->postJson('/api/v1/projects', $this->validProjectPayload($companyB->id))->assertCreated();

        $this->getJson('/api/v1/projects')
            ->assertOk()
            ->assertJsonPath('data.pagination.total', 2)
            ->assertJsonMissingPath('data.filters.company_id');

        $this->getJson("/api/v1/projects?company_id={$companyA->id}")
            ->assertOk()
            ->assertJsonPath('data.pagination.total', 1)
            ->assertJsonPath('data.filters.company_id', $companyA->id)
            ->assertJsonPath('data.items.0.company_id', $companyA->id);

        $this->getJson("/api/v1/projects?company_id={$companyB->id}")
            ->assertOk()
            ->assertJsonPath('data.pagination.total', 1)
            ->assertJsonPath('data.items.0.company_id', $companyB->id);
    }

    public function test_company_admin_cannot_pass_company_id_query_param(): void
    {
        $company = Company::query()->create([
            'name' => 'Scoped Co',
            'slug' => 'scoped-'.uniqid(),
            'poc_name' => 'POC',
            'poc_email' => 'poc@scoped.example.com',
            'is_active' => true,
        ]);

        $user = User::factory()->create(['company_id' => $company->id]);
        $user->assignRole('company_admin');
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/projects?company_id=999')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['company_id']);
    }

    public function test_company_admin_without_company_cannot_access_projects(): void
    {
        $user = User::factory()->create(['company_id' => null]);
        $user->assignRole('company_admin');
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/projects')->assertForbidden();
    }
}
