<?php

namespace App\Integrations\Google\Services;

use App\Integrations\Contracts\ProjectIntegrationProvider;
use App\Integrations\Google\Data\OAuthState;
use App\Integrations\Google\GoogleIntegrationService;
use App\Integrations\Google\OAuth\OAuthClient;
use App\Integrations\Google\OAuth\OAuthStateService;
use App\Models\Project;
use App\Models\ProjectIntegration;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class ProjectIntegrationManager implements ProjectIntegrationProvider
{
    public function __construct(
        private readonly OAuthClient $oauthClient,
        private readonly OAuthStateService $stateService,
        private readonly TokenRefreshService $tokenRefreshService,
    ) {}

    public function providerKey(): string
    {
        return GoogleIntegrationService::PROVIDER;
    }

    /**
     * @param  list<string>  $services
     * @return array{
     *     auth_url: string,
     *     state: string,
     *     expires_in_seconds: int,
     *     services: list<string>,
     *     scopes: list<string>
     * }
     */
    public function startConnect(Project $project, User $user, array $services): array
    {
        $this->oauthClient->ensureConfigured();

        $services = $this->normalizeServices($services);
        $scopes = GoogleIntegrationService::scopesFor($services);
        $encryptedState = $this->stateService->create($project, $user, $services);

        foreach ($services as $service) {
            ProjectIntegration::query()->updateOrCreate(
                [
                    'project_id' => $project->id,
                    'provider' => GoogleIntegrationService::PROVIDER,
                    'service' => $service,
                ],
                [
                    'status' => ProjectIntegration::STATUS_PENDING,
                    'connected_by_user_id' => $user->id,
                    'last_error' => null,
                ]
            );
        }

        return [
            'auth_url' => $this->oauthClient->authorizationUrl($encryptedState, $scopes),
            'state' => $encryptedState,
            'expires_in_seconds' => OAuthStateService::TTL_SECONDS,
            'services' => $services,
            'scopes' => $scopes,
        ];
    }

    /**
     * @return array{
     *     project_id: int,
     *     connected_services: list<string>,
     *     external_account_email: ?string
     * }
     */
    public function completeConnect(string $authorizationCode, OAuthState $state): array
    {
        $this->oauthClient->ensureConfigured();

        $project = Project::query()->findOrFail($state->projectId);
        $user = User::query()->findOrFail($state->userId);
        $tokenPayload = $this->oauthClient->exchangeAuthorizationCode($authorizationCode);
        $email = $this->oauthClient->fetchAccountEmail($tokenPayload['access_token']);

        $connectedServices = $this->oauthClient->grantedServicesFromScope(
            $tokenPayload['scope'],
            $state->services
        );

        $expiresAt = $tokenPayload['expires_in'] > 0
            ? now()->addSeconds($tokenPayload['expires_in'])
            : null;

        $scopeList = GoogleIntegrationService::scopesFor($connectedServices);

        DB::transaction(function () use (
            $project,
            $user,
            $connectedServices,
            $tokenPayload,
            $email,
            $expiresAt,
            $scopeList,
            $state,
        ): void {
            foreach ($connectedServices as $service) {
                $existing = ProjectIntegration::query()
                    ->where('project_id', $project->id)
                    ->where('provider', GoogleIntegrationService::PROVIDER)
                    ->where('service', $service)
                    ->first();

                $refreshToken = $tokenPayload['refresh_token']
                    ?? $existing?->refresh_token;

                ProjectIntegration::query()->updateOrCreate(
                    [
                        'project_id' => $project->id,
                        'provider' => GoogleIntegrationService::PROVIDER,
                        'service' => $service,
                    ],
                    [
                        'status' => ProjectIntegration::STATUS_CONNECTED,
                        'connected_by_user_id' => $user->id,
                        'external_account_email' => $email,
                        'access_token' => $tokenPayload['access_token'],
                        'refresh_token' => $refreshToken,
                        'token_expires_at' => $expiresAt,
                        'scopes' => $scopeList,
                        'metadata' => null,
                        'last_error' => null,
                        'connected_at' => now(),
                    ]
                );
            }

            $skipped = array_values(array_diff($state->services, $connectedServices));
            foreach ($skipped as $service) {
                ProjectIntegration::query()
                    ->where('project_id', $project->id)
                    ->where('provider', GoogleIntegrationService::PROVIDER)
                    ->where('service', $service)
                    ->update([
                        'status' => ProjectIntegration::STATUS_ERROR,
                        'last_error' => __('Google did not grant access for this service.'),
                    ]);
            }
        });

        return [
            'project_id' => (int) $project->id,
            'connected_services' => $connectedServices,
            'external_account_email' => $email,
        ];
    }

    public function disconnect(Project $project, string $service): void
    {
        if (! GoogleIntegrationService::isValid($service)) {
            throw new \InvalidArgumentException("Unknown Google integration service [{$service}].");
        }

        $integration = ProjectIntegration::query()
            ->where('project_id', $project->id)
            ->where('provider', GoogleIntegrationService::PROVIDER)
            ->where('service', $service)
            ->first();

        if ($integration === null) {
            return;
        }

        if (is_string($integration->access_token) && $integration->access_token !== '') {
            $this->oauthClient->revokeToken($integration->access_token);
        }

        $integration->delete();
    }

    /**
     * @return array{
     *     provider: string,
     *     project_id: int,
     *     catalog: array<string, array{service: string, label: string, scope: string}>,
     *     services: array<string, array<string, mixed>>
     * }
     */
    public function statusPayload(Project $project): array
    {
        $rows = ProjectIntegration::query()
            ->where('project_id', $project->id)
            ->where('provider', GoogleIntegrationService::PROVIDER)
            ->get()
            ->keyBy('service');

        $services = [];
        foreach (GoogleIntegrationService::all() as $service) {
            $row = $rows->get($service);
            $services[$service] = $this->serviceStatusArray($service, $row);
        }

        return [
            'provider' => GoogleIntegrationService::PROVIDER,
            'project_id' => (int) $project->id,
            'catalog' => GoogleIntegrationService::catalog(),
            'services' => $services,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serviceStatusArray(string $service, ?ProjectIntegration $row): array
    {
        if ($row === null) {
            return [
                'service' => $service,
                'label' => GoogleIntegrationService::label($service),
                'status' => 'disconnected',
                'external_account_email' => null,
                'connected_at' => null,
                'token_expires_at' => null,
                'scopes' => [],
                'last_error' => null,
                'is_connected' => false,
            ];
        }

        return [
            'service' => $service,
            'label' => GoogleIntegrationService::label($service),
            'status' => $row->status,
            'external_account_email' => $row->external_account_email,
            'connected_at' => $row->connected_at,
            'token_expires_at' => $row->token_expires_at,
            'scopes' => $row->scopes ?? [],
            'last_error' => $row->last_error,
            'is_connected' => $row->isConnected(),
        ];
    }

    /**
     * @param  list<string>  $services
     * @return list<string>
     */
    private function normalizeServices(array $services): array
    {
        $services = array_values(array_unique(array_map('strval', $services)));

        if ($services === []) {
            throw new \InvalidArgumentException(__('At least one Google service is required.'));
        }

        foreach ($services as $service) {
            if (! GoogleIntegrationService::isValid($service)) {
                throw new \InvalidArgumentException("Unknown Google integration service [{$service}].");
            }
        }

        return $services;
    }

    /**
     * Get a valid access token for a project's integration, refreshing if necessary.
     *
     * @return string|null The access token, or null if unavailable
     */
    public function getValidAccessToken(Project $project, string $service): ?string
    {
        $integration = ProjectIntegration::query()
            ->where('project_id', $project->id)
            ->where('provider', GoogleIntegrationService::PROVIDER)
            ->where('service', $service)
            ->where('status', ProjectIntegration::STATUS_CONNECTED)
            ->first();

        if ($integration === null) {
            return null;
        }

        return $this->tokenRefreshService->getValidAccessToken($integration);
    }

    /**
     * Ensure a project has a valid access token for a service, throwing an exception if not.
     *
     * @throws \RuntimeException
     */
    public function ensureValidAccessToken(Project $project, string $service): string
    {
        $token = $this->getValidAccessToken($project, $service);

        if ($token === null) {
            throw new \RuntimeException(
                sprintf(
                    'No valid Google %s integration for project %d. Please connect the integration first.',
                    GoogleIntegrationService::label($service),
                    $project->id
                )
            );
        }

        return $token;
    }
}
