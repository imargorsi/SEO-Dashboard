<?php

namespace Tests\Feature\Api\Sheets;

use App\Models\Company;
use App\Models\Project;
use App\Models\ProjectSheetEntry;
use App\Models\SheetConfig;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProjectSheetTest extends TestCase
{
    use RefreshDatabase;

    private function actingSuperAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        return $admin;
    }

    /**
     * @return array{company: Company, project: Project}
     */
    private function makeTenant(string $suffix, ?string $siteCode = null): array
    {
        $company = Company::query()->create([
            'name' => 'Sheet Co '.$suffix,
            'slug' => 'sheet-co-'.$suffix,
            'poc_name' => 'POC',
            'poc_email' => 'poc-'.$suffix.'@example.com',
            'is_active' => true,
        ]);

        $project = Project::query()->create([
            'company_id' => $company->id,
            'business_name' => 'Sheet Project '.$suffix,
            'site_code' => $siteCode,
            'website_url' => 'https://'.$suffix.'.example.com',
            'target_locations' => ['NYC'],
            'is_b2b' => true,
            'is_b2c' => false,
            'seo_goal_other' => null,
            'cms_login_page_url' => 'https://'.$suffix.'.example.com/wp-login.php',
            'cms_username' => 'admin',
            'cms_password' => 'secret',
        ]);

        return ['company' => $company, 'project' => $project];
    }

    public function test_admin_index_returns_catalog(): void
    {
        $this->actingSuperAdmin();

        $this->getJson('/api/v1/admin/sheets')
            ->assertOk()
            ->assertJsonPath('data.sheets.bp', null)
            ->assertJsonPath('data.catalog.bp.type', 'bp');
    }

    public function test_admin_upsert_saves_master_sheet_configuration(): void
    {
        $this->actingSuperAdmin();

        $url = 'https://docs.google.com/spreadsheets/d/abc123XYZ/edit?gid=1817011140#gid=1817011140';

        $this->putJson('/api/v1/admin/sheets/kc', [
            'spreadsheet_url' => $url,
            'tab_name' => 'Blog',
        ])
            ->assertOk()
            ->assertJsonPath('data.sheets.kc.spreadsheet_id', 'abc123XYZ')
            ->assertJsonPath('data.sheets.kc.tab_gid', '1817011140');

        $this->assertDatabaseHas('sheet_configs', [
            'sheet_type' => 'kc',
            'spreadsheet_id' => 'abc123XYZ',
        ]);
    }

    public function test_admin_sync_imports_rows_for_all_matching_projects(): void
    {
        $this->actingSuperAdmin();
        ['project' => $mtc] = $this->makeTenant('mtc', 'MTC');
        ['project' => $pecto] = $this->makeTenant('pecto', 'Pecto');

        SheetConfig::query()->create([
            'sheet_type' => 'kc',
            'spreadsheet_id' => 'abc123XYZ',
            'spreadsheet_url' => 'https://docs.google.com/spreadsheets/d/abc123XYZ/edit',
            'tab_gid' => '1817011140',
            'tab_name' => 'Blog',
            'status' => SheetConfig::STATUS_ACTIVE,
        ]);

        $csv = <<<CSV
Days,Site,Page Link,Details,Change Date
Monday,MTC,https://multitech.sa/example,We fix H1 headings,02-Jun-2026
,Pecto,https://petco.pk/example,Optimized images,02-Jun-2026
,Unknown,https://unknown.example,Should skip,02-Jun-2026
CSV;

        Http::fake(['docs.google.com/*' => Http::response($csv, 200)]);

        $this->postJson('/api/v1/admin/sheets/kc/sync')
            ->assertOk()
            ->assertJsonPath('data.sync.imported', 2)
            ->assertJsonPath('data.sync.skipped', 1);

        $this->assertDatabaseHas('project_sheet_entries', [
            'project_id' => $mtc->id,
            'sheet_type' => 'kc',
            'site' => 'MTC',
        ]);

        $this->assertDatabaseHas('project_sheet_entries', [
            'project_id' => $pecto->id,
            'sheet_type' => 'kc',
            'site' => 'Pecto',
        ]);
    }

    public function test_company_admin_cannot_sync(): void
    {
        ['company' => $company] = $this->makeTenant('no-sync', 'MTC');
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->assignRole('company_admin');
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/admin/sheets/kc/sync')->assertForbidden();
    }

    public function test_company_admin_cannot_access_other_company_project_sheets(): void
    {
        ['company' => $companyA, 'project' => $projectA] = $this->makeTenant('tenant-a', 'A');
        ['project' => $projectB] = $this->makeTenant('tenant-b', 'B');

        $user = User::factory()->create(['company_id' => $companyA->id]);
        $user->assignRole('company_admin');
        Sanctum::actingAs($user);

        $this->getJson("/api/v1/projects/{$projectB->id}/sheets/kc/entries")->assertNotFound();
    }

    public function test_entries_are_scoped_to_project(): void
    {
        $this->actingSuperAdmin();
        ['project' => $mtc] = $this->makeTenant('mtc-entries', 'MTC');
        ['project' => $pecto] = $this->makeTenant('pecto-entries', 'Pecto');

        ProjectSheetEntry::query()->create([
            'project_id' => $mtc->id,
            'sheet_type' => 'kc',
            'source_row_number' => 2,
            'site' => 'MTC',
            'details' => 'MTC only',
            'synced_at' => now(),
        ]);

        ProjectSheetEntry::query()->create([
            'project_id' => $pecto->id,
            'sheet_type' => 'kc',
            'source_row_number' => 3,
            'site' => 'Pecto',
            'details' => 'Pecto only',
            'synced_at' => now(),
        ]);

        $this->getJson("/api/v1/projects/{$mtc->id}/sheets/kc/entries")
            ->assertOk()
            ->assertJsonPath('data.pagination.total', 1)
            ->assertJsonPath('data.items.0.details', 'MTC only');
    }

    public function test_admin_lists_all_entries_across_projects(): void
    {
        $this->actingSuperAdmin();
        ['project' => $mtc] = $this->makeTenant('admin-all-mtc', 'MTC');
        ['project' => $pecto] = $this->makeTenant('admin-all-pecto', 'Pecto');

        ProjectSheetEntry::query()->create([
            'project_id' => $mtc->id,
            'sheet_type' => 'kc',
            'source_row_number' => 2,
            'site' => 'MTC',
            'details' => 'MTC row',
            'synced_at' => now(),
        ]);

        ProjectSheetEntry::query()->create([
            'project_id' => $pecto->id,
            'sheet_type' => 'kc',
            'source_row_number' => 3,
            'site' => 'Pecto',
            'details' => 'Pecto row',
            'synced_at' => now(),
        ]);

        $this->getJson('/api/v1/admin/sheets/kc/entries')
            ->assertOk()
            ->assertJsonPath('data.pagination.total', 2)
            ->assertJsonPath('data.items.0.project.business_name', fn ($value) => $value !== null);
    }

    public function test_admin_entries_can_filter_by_project(): void
    {
        $this->actingSuperAdmin();
        ['project' => $mtc] = $this->makeTenant('filter-mtc', 'MTC');
        ['project' => $pecto] = $this->makeTenant('filter-pecto', 'Pecto');

        ProjectSheetEntry::query()->create([
            'project_id' => $mtc->id,
            'sheet_type' => 'bp',
            'source_row_number' => 2,
            'site' => 'MTC',
            'synced_at' => now(),
        ]);

        ProjectSheetEntry::query()->create([
            'project_id' => $pecto->id,
            'sheet_type' => 'bp',
            'source_row_number' => 3,
            'site' => 'Pecto',
            'synced_at' => now(),
        ]);

        $this->getJson("/api/v1/admin/sheets/bp/entries?project_id={$mtc->id}")
            ->assertOk()
            ->assertJsonPath('data.pagination.total', 1)
            ->assertJsonPath('data.items.0.site', 'MTC');
    }
}
