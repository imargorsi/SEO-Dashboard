<?php

namespace App\Integrations\Google\Http\Concerns;

use App\Integrations\Google\Services\TokenRefreshService;
use App\Models\ProjectIntegration;

trait RequiresValidToken
{
    /**
     * Get a valid access token for a project integration, refreshing if necessary.
     *
     * @return string|null The access token, or null if unavailable
     */
    protected function getValidToken(ProjectIntegration $integration): ?string
    {
        $refreshService = app(TokenRefreshService::class);

        return $refreshService->getValidAccessToken($integration);
    }

    /**
     * Ensure a project integration has a valid token, throwing an exception if not.
     *
     * @throws \RuntimeException
     */
    protected function ensureValidToken(ProjectIntegration $integration): string
    {
        $token = $this->getValidToken($integration);

        if ($token === null) {
            throw new \RuntimeException(
                sprintf(
                    'No valid access token available for project %d, service %s. Please reconnect the integration.',
                    $integration->project_id,
                    $integration->service
                )
            );
        }

        return $token;
    }
}
