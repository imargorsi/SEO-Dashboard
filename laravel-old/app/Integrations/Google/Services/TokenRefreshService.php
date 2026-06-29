<?php

namespace App\Integrations\Google\Services;

use App\Integrations\Google\OAuth\OAuthClient;
use App\Models\ProjectIntegration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class TokenRefreshService
{
    public function __construct(
        private readonly OAuthClient $oauthClient,
    ) {}

    /**
     * Refresh an expired or expiring access token for a project integration.
     *
     * @return bool True if refresh was successful, false otherwise
     */
    public function refreshToken(ProjectIntegration $integration): bool
    {
        if (! $integration->refresh_token) {
            Log::warning('Cannot refresh token: no refresh_token available', [
                'project_id' => $integration->project_id,
                'service' => $integration->service,
            ]);

            $this->markAsError($integration, 'No refresh token available. Please reconnect the integration.');

            return false;
        }

        try {
            $this->oauthClient->ensureConfigured();

            $tokenPayload = $this->oauthClient->refreshAccessToken($integration->refresh_token);

            $expiresAt = $tokenPayload['expires_in'] > 0
                ? now()->addSeconds($tokenPayload['expires_in'])
                : null;

            $integration->update([
                'access_token' => $tokenPayload['access_token'],
                'refresh_token' => $tokenPayload['refresh_token'] ?? $integration->refresh_token,
                'token_expires_at' => $expiresAt,
                'last_error' => null,
            ]);

            Log::info('Token refreshed successfully', [
                'project_id' => $integration->project_id,
                'service' => $integration->service,
            ]);

            return true;
        } catch (\Throwable $e) {
            Log::error('Failed to refresh token', [
                'project_id' => $integration->project_id,
                'service' => $integration->service,
                'error' => $e->getMessage(),
            ]);

            $this->markAsError($integration, 'Failed to refresh token: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Get a valid access token, refreshing if necessary.
     *
     * @return string|null The access token, or null if unavailable
     */
    public function getValidAccessToken(ProjectIntegration $integration): ?string
    {
        if (! $integration->access_token) {
            return null;
        }

        // Check if token is expired or will expire soon (within 5 minutes)
        if ($this->isTokenExpiredOrExpiring($integration)) {
            if (! $this->refreshToken($integration)) {
                return null;
            }
            $integration->refresh();
        }

        return $integration->access_token;
    }

    /**
     * Check if a token is expired or will expire soon.
     */
    public function isTokenExpiredOrExpiring(ProjectIntegration $integration): bool
    {
        if (! $integration->token_expires_at) {
            return false; // Token doesn't expire
        }

        return $integration->token_expires_at->subMinutes(5)->isPast();
    }

    /**
     * Mark an integration as having an error.
     */
    private function markAsError(ProjectIntegration $integration, string $errorMessage): void
    {
        $integration->update([
            'status' => ProjectIntegration::STATUS_ERROR,
            'last_error' => $errorMessage,
        ]);
    }

    /**
     * Refresh all expiring tokens for a project.
     *
     * @return int Number of tokens refreshed
     */
    public function refreshExpiringTokensForProject(int $projectId): int
    {
        $integrations = ProjectIntegration::query()
            ->where('project_id', $projectId)
            ->where('provider', 'google')
            ->where('status', ProjectIntegration::STATUS_CONNECTED)
            ->whereHas('project') // Ensure project exists
            ->get();

        $refreshed = 0;
        foreach ($integrations as $integration) {
            if ($this->isTokenExpiredOrExpiring($integration)) {
                if ($this->refreshToken($integration)) {
                    $refreshed++;
                }
            }
        }

        return $refreshed;
    }

    /**
     * Refresh all expiring tokens across all projects.
     *
     * @return array{total: int, refreshed: int, failed: int}
     */
    public function refreshAllExpiringTokens(): array
    {
        $integrations = ProjectIntegration::query()
            ->where('provider', 'google')
            ->where('status', ProjectIntegration::STATUS_CONNECTED)
            ->whereHas('project')
            ->get();

        $total = $integrations->count();
        $refreshed = 0;
        $failed = 0;

        foreach ($integrations as $integration) {
            if ($this->isTokenExpiredOrExpiring($integration)) {
                if ($this->refreshToken($integration)) {
                    $refreshed++;
                } else {
                    $failed++;
                }
            }
        }

        return [
            'total' => $total,
            'refreshed' => $refreshed,
            'failed' => $failed,
        ];
    }
}
