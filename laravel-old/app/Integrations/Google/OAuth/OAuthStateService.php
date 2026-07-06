<?php

namespace App\Integrations\Google\OAuth;

use App\Integrations\Google\Data\OAuthState;
use App\Integrations\Google\GoogleIntegrationService;
use App\Models\Project;
use App\Models\User;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

final class OAuthStateService
{
    /** Default 30 minutes — user may need time for Google test-user setup / consent. */
    public const TTL_SECONDS = 1800;

    /**
     * @param  list<string>  $services
     */
    public function create(Project $project, User $user, array $services): string
    {
        $state = new OAuthState(
            projectId: (int) $project->id,
            userId: (int) $user->id,
            services: $services,
            expiresAt: now()->addSeconds(self::TTL_SECONDS)->getTimestamp(),
            nonce: Str::random(32),
        );

        return Crypt::encryptString(json_encode($state->toPayload(), JSON_THROW_ON_ERROR));
    }

    public function resolve(string $encryptedState): OAuthState
    {
        try {
            $json = Crypt::decryptString($encryptedState);
            /** @var array<string, mixed> $payload */
            $payload = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (DecryptException|\JsonException) {
            throw new \InvalidArgumentException(__('Invalid OAuth state.'));
        }

        $state = OAuthState::fromPayload($payload);

        if ($state->projectId < 1 || $state->userId < 1 || $state->nonce === '') {
            throw new \InvalidArgumentException(__('Invalid OAuth state.'));
        }

        if ($state->expiresAt < now()->getTimestamp()) {
            throw new \InvalidArgumentException(__('OAuth state has expired. Please start connect again.'));
        }

        foreach ($state->services as $service) {
            if (! GoogleIntegrationService::isValid($service)) {
                throw new \InvalidArgumentException(__('Invalid OAuth state services.'));
            }
        }

        return $state;
    }
}
