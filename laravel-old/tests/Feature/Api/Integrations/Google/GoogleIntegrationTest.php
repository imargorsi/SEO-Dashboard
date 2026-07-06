<?php

namespace Tests\Feature\Api\Integrations\Google;

use App\Integrations\Google\GoogleIntegrationService;
use App\Models\Company;
use App\Models\Project;
use App\Models\ProjectIntegration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GoogleIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Config::set('services.google.client_id', 'test-client-id');
        Config::set('services.google.client_secret', 'test-client-secret');
        Config::set('services.google.redirect_uri', 'http://localhost/api/v1/integrations/google/callback');
        Config::set('services.google.frontend_callback_path', '/projects/new');
        Config::set('app.frontend_url', 'http://localhost:5173');
    }

    private function actingSuperAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        return $admin;
    }

    private function makeProject(): Project
    {
        $company = Company::query()->create([
            'name' => 'OAuth Co',
            'slug' => 'oauth-'.uniqid(),
            'poc_name' => 'POC',
            'poc_email' => 'poc@oauth.example.com',
            'is_active' => true,
        ]);

        return Project::query()->create([
            'company_id' => $company->id,
            'business_name' => 'OAuth Project',
            'website_url' => 'https://oauth.example.com',
            'target_locations' => ['NYC'],
            'is_b2b' => true,
            'is_b2c' => false,
            'seo_goal_other' => null,
            'cms_login_page_url' => 'https://oauth.example.com/wp-login.php',
            'cms_username' => 'admin',
            'cms_password' => 'secret',
        ]);
    }

    public function test_connect_returns_auth_url_for_requested_services(): void
    {
        $this->actingSuperAdmin();
        $project = $this->makeProject();

        $response = $this->postJson("/api/v1/projects/{$project->id}/integrations/google/connect", [
            'services' => ['analytics', 'search_console'],
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.services', ['analytics', 'search_console'])
            ->assertJsonStructure(['data' => ['auth_url', 'state', 'expires_in_seconds', 'scopes']]);

        $authUrl = (string) $response->json('data.auth_url');
        $this->assertStringContainsString('accounts.google.com', $authUrl);
        $this->assertStringNotContainsString('", "state":', $authUrl, 'auth_url must be a single URL, not JSON fragments');

        parse_str((string) parse_url($authUrl, PHP_URL_QUERY), $query);
        $this->assertSame('true', $query['include_granted_scopes'] ?? null);
        $this->assertNotEmpty($query['state'] ?? null);

        $this->assertDatabaseHas('project_integrations', [
            'project_id' => $project->id,
            'service' => 'analytics',
            'status' => 'pending',
        ]);
    }

    public function test_callback_stores_tokens_and_redirects_to_frontend(): void
    {
        $admin = $this->actingSuperAdmin();
        $project = $this->makeProject();

        $connect = $this->postJson("/api/v1/projects/{$project->id}/integrations/google/connect", [
            'services' => ['analytics'],
        ])->assertOk();

        $state = (string) $connect->json('data.state');

        Http::fake([
            'oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'access-token-xyz',
                'refresh_token' => 'refresh-token-xyz',
                'expires_in' => 3600,
                'scope' => 'https://www.googleapis.com/auth/analytics.readonly openid email profile',
                'token_type' => 'Bearer',
            ]),
            'www.googleapis.com/oauth2/v2/userinfo' => Http::response([
                'email' => 'client@gmail.com',
            ]),
        ]);

        $callback = $this->get('/api/v1/integrations/google/callback?code=fake-auth-code&state='.urlencode($state));

        $callback->assertRedirect();
        $location = $callback->headers->get('Location');
        $this->assertStringContainsString('http://localhost:5173/projects/new', (string) $location);
        $this->assertStringContainsString('success=1', (string) $location);
        $this->assertStringContainsString('project_id='.$project->id, (string) $location);

        $integration = ProjectIntegration::query()
            ->where('project_id', $project->id)
            ->where('service', 'analytics')
            ->first();

        $this->assertNotNull($integration);
        $this->assertSame('connected', $integration->status);
        $this->assertSame('client@gmail.com', $integration->external_account_email);
        $this->assertSame((int) $admin->id, (int) $integration->connected_by_user_id);
        $this->assertNotNull($integration->access_token);
    }

    public function test_index_returns_status_without_tokens(): void
    {
        $this->actingSuperAdmin();
        $project = $this->makeProject();

        ProjectIntegration::query()->create([
            'project_id' => $project->id,
            'provider' => GoogleIntegrationService::PROVIDER,
            'service' => GoogleIntegrationService::ANALYTICS,
            'status' => ProjectIntegration::STATUS_CONNECTED,
            'external_account_email' => 'client@gmail.com',
            'access_token' => 'secret-access',
            'refresh_token' => 'secret-refresh',
            'connected_at' => now(),
            'scopes' => [GoogleIntegrationService::scopeFor(GoogleIntegrationService::ANALYTICS)],
        ]);

        $response = $this->getJson("/api/v1/projects/{$project->id}/integrations");

        $response->assertOk()
            ->assertJsonPath('data.services.analytics.status', 'connected')
            ->assertJsonPath('data.services.analytics.is_connected', true)
            ->assertJsonPath('data.services.analytics.external_account_email', 'client@gmail.com')
            ->assertJsonPath('data.services.search_console.status', 'disconnected');

        $json = json_encode($response->json());
        $this->assertIsString($json);
        $this->assertStringNotContainsString('secret-access', $json);
        $this->assertStringNotContainsString('secret-refresh', $json);
    }

    public function test_disconnect_removes_integration(): void
    {
        $this->actingSuperAdmin();
        $project = $this->makeProject();

        ProjectIntegration::query()->create([
            'project_id' => $project->id,
            'provider' => GoogleIntegrationService::PROVIDER,
            'service' => GoogleIntegrationService::ANALYTICS,
            'status' => ProjectIntegration::STATUS_CONNECTED,
            'access_token' => 'token',
        ]);

        Http::fake();

        $this->deleteJson("/api/v1/projects/{$project->id}/integrations/google/analytics")
            ->assertOk()
            ->assertJsonPath('data.services.analytics.status', 'disconnected');

        $this->assertDatabaseMissing('project_integrations', [
            'project_id' => $project->id,
            'service' => 'analytics',
        ]);
    }

    public function test_token_refresh_updates_expired_token(): void
    {
        $this->actingSuperAdmin();
        $project = $this->makeProject();

        $integration = ProjectIntegration::query()->create([
            'project_id' => $project->id,
            'provider' => GoogleIntegrationService::PROVIDER,
            'service' => GoogleIntegrationService::ANALYTICS,
            'status' => ProjectIntegration::STATUS_CONNECTED,
            'external_account_email' => 'client@gmail.com',
            'access_token' => 'old-access-token',
            'refresh_token' => 'valid-refresh-token',
            'token_expires_at' => now()->subMinutes(10), // Expired
            'connected_at' => now(),
            'scopes' => [GoogleIntegrationService::scopeFor(GoogleIntegrationService::ANALYTICS)],
        ]);

        Http::fake([
            'oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'new-access-token',
                'refresh_token' => 'new-refresh-token',
                'expires_in' => 3600,
                'scope' => 'https://www.googleapis.com/auth/analytics.readonly openid email profile',
                'token_type' => 'Bearer',
            ]),
        ]);

        $refreshService = app(\App\Integrations\Google\Services\TokenRefreshService::class);
        $result = $refreshService->refreshToken($integration);

        $this->assertTrue($result);

        $integration->refresh();
        $this->assertSame('new-access-token', $integration->access_token);
        $this->assertSame('new-refresh-token', $integration->refresh_token);
        $this->assertNull($integration->last_error);
    }

    public function test_get_valid_access_token_refreshes_when_expired(): void
    {
        $this->actingSuperAdmin();
        $project = $this->makeProject();

        $integration = ProjectIntegration::query()->create([
            'project_id' => $project->id,
            'provider' => GoogleIntegrationService::PROVIDER,
            'service' => GoogleIntegrationService::ANALYTICS,
            'status' => ProjectIntegration::STATUS_CONNECTED,
            'external_account_email' => 'client@gmail.com',
            'access_token' => 'old-access-token',
            'refresh_token' => 'valid-refresh-token',
            'token_expires_at' => now()->subMinutes(10), // Expired
            'connected_at' => now(),
            'scopes' => [GoogleIntegrationService::scopeFor(GoogleIntegrationService::ANALYTICS)],
        ]);

        Http::fake([
            'oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'new-access-token',
                'refresh_token' => 'new-refresh-token',
                'expires_in' => 3600,
                'scope' => 'https://www.googleapis.com/auth/analytics.readonly openid email profile',
                'token_type' => 'Bearer',
            ]),
        ]);

        $refreshService = app(\App\Integrations\Google\Services\TokenRefreshService::class);
        $token = $refreshService->getValidAccessToken($integration);

        $this->assertSame('new-access-token', $token);

        $integration->refresh();
        $this->assertSame('new-access-token', $integration->access_token);
    }

    public function test_tokens_are_stored_against_project_not_user(): void
    {
        $this->actingSuperAdmin();
        $project = $this->makeProject();

        // Create integration with project_id
        $integration = ProjectIntegration::query()->create([
            'project_id' => $project->id,
            'provider' => GoogleIntegrationService::PROVIDER,
            'service' => GoogleIntegrationService::ANALYTICS,
            'status' => ProjectIntegration::STATUS_CONNECTED,
            'external_account_email' => 'client@gmail.com',
            'access_token' => 'client-access-token',
            'refresh_token' => 'client-refresh-token',
            'connected_by_user_id' => 1, // Some user ID
            'connected_at' => now(),
            'scopes' => [GoogleIntegrationService::scopeFor(GoogleIntegrationService::ANALYTICS)],
        ]);

        // Verify token is stored against project
        $this->assertSame($project->id, $integration->project_id);
        $this->assertSame('client-access-token', $integration->access_token);
        $this->assertSame('client@gmail.com', $integration->external_account_email);

        // Verify different users can access the same project's integration
        $anotherAdmin = User::factory()->create();
        $anotherAdmin->assignRole('super_admin');

        $integrationFromAnotherUser = ProjectIntegration::query()
            ->where('project_id', $project->id)
            ->where('service', 'analytics')
            ->first();

        $this->assertNotNull($integrationFromAnotherUser);
        $this->assertSame('client-access-token', $integrationFromAnotherUser->access_token);
    }
}
