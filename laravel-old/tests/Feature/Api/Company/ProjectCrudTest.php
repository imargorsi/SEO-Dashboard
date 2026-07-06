<?php

namespace Tests\Feature\Api\Company;

use App\Models\Company;
use App\Models\Project;
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

    private function makeCompany(string $slugSuffix): Company
    {
        return Company::query()->create([
            'name' => 'Co '.$slugSuffix,
            'slug' => 'co-'.$slugSuffix,
            'poc_name' => 'POC',
            'poc_email' => 'poc-'.$slugSuffix.'@example.com',
            'is_active' => true,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validProjectPayloadWithoutCompanyId(): array
    {
        $goalIds = SeoGoal::query()->whereIn('slug', ['organic-traffic', 'leads'])->pluck('id')->all();

        return [
            'business_name' => 'Contoso Retail',
            'website_url' => 'https://contoso.example.com',
            'industry_niche_id' => null,
            'industry_other' => null,
            'target_locations' => ['Seattle'],
            'is_b2b' => false,
            'is_b2c' => true,
            'brief_description' => null,
            'main_competitors' => null,
            'seo_goal_ids' => $goalIds,
            'seo_goal_other' => null,
            'has_google_analytics' => null,
            'has_google_search_console' => null,
            'has_google_tag_manager' => null,
            'has_google_ads' => null,
            'has_website_login_details' => null,
            'cms_login_page_url' => 'https://contoso.example.com/login',
            'cms_username' => 'webmaster',
            'cms_password' => 'cms-secret',
        ];
    }

    public function test_company_admin_crud_scoped_to_own_company(): void
    {
        $company = $this->makeCompany('alpha');
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->assignRole('company_admin');
        Sanctum::actingAs($user);

        $create = $this->postJson('/api/v1/projects', $this->validProjectPayloadWithoutCompanyId());
        $create->assertCreated()->assertJsonPath('data.company_id', $company->id);

        $projectId = (int) $create->json('data.id');

        $this->getJson('/api/v1/projects')->assertOk()
            ->assertJsonPath('data.pagination.total', 1);

        $this->patchJson("/api/v1/projects/{$projectId}", [
            'business_name' => 'Contoso Retail US',
        ])->assertOk()->assertJsonPath('data.business_name', 'Contoso Retail US');

        $this->deleteJson("/api/v1/projects/{$projectId}")->assertOk();
        $this->assertDatabaseMissing('projects', ['id' => $projectId]);
    }

    public function test_company_admin_gets_404_for_project_of_another_company(): void
    {
        $companyA = $this->makeCompany('a');
        $companyB = $this->makeCompany('b');

        $goalIds = SeoGoal::query()->whereIn('slug', ['organic-traffic'])->pluck('id')->all();
        $foreign = Project::query()->create([
            'company_id' => $companyB->id,
            'business_name' => 'Other',
            'website_url' => 'https://other.example.com',
            'industry_niche_id' => null,
            'industry_other' => null,
            'target_locations' => ['NYC'],
            'is_b2b' => true,
            'is_b2c' => false,
            'brief_description' => null,
            'main_competitors' => null,
            'seo_goal_other' => null,
            'has_google_analytics' => null,
            'has_google_search_console' => null,
            'has_google_tag_manager' => null,
            'has_google_ads' => null,
            'has_website_login_details' => null,
            'cms_login_page_url' => 'https://other.example.com/wp-login.php',
            'cms_username' => 'x',
            'cms_password' => 'y',
        ]);
        $foreign->seoGoals()->sync($goalIds);

        $userA = User::factory()->create(['company_id' => $companyA->id]);
        $userA->assignRole('company_admin');
        Sanctum::actingAs($userA);

        $this->getJson('/api/v1/projects/'.$foreign->id)->assertNotFound();
    }
}
