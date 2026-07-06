<?php

namespace App\Integrations\Google\OAuth;

use App\Integrations\Google\GoogleIntegrationService;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

final class OAuthClient
{
    private const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

    private const TOKEN_URL = 'https://oauth2.googleapis.com/token';

    private const REVOKE_URL = 'https://oauth2.googleapis.com/revoke';

    private const USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

    /**
     * @param  list<string>  $scopes
     */
    public function authorizationUrl(string $state, array $scopes): string
    {
        $this->ensureConfigured();

        $query = http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => config('services.google.redirect_uri'),
            'response_type' => 'code',
            'scope' => implode(' ', array_unique(array_merge($scopes, ['openid', 'email', 'profile']))),
            'access_type' => 'offline',
            'prompt' => 'consent',
            'state' => $state,
            'include_granted_scopes' => 'true',
        ]);

        return self::AUTH_URL.'?'.$query;
    }

    /**
     * @return array{
     *     access_token: string,
     *     refresh_token: ?string,
     *     expires_in: int,
     *     scope: ?string,
     *     token_type: ?string
     * }
     */
    public function exchangeAuthorizationCode(string $code): array
    {
        $this->ensureConfigured();

        $response = Http::asForm()
            ->acceptJson()
            ->post(self::TOKEN_URL, [
                'code' => $code,
                'client_id' => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'redirect_uri' => config('services.google.redirect_uri'),
                'grant_type' => 'authorization_code',
            ])
            ->throw();

        return $this->normalizeTokenResponse($response->json());
    }

    /**
     * @return array{
     *     access_token: string,
     *     refresh_token: ?string,
     *     expires_in: int,
     *     scope: ?string,
     *     token_type: ?string
     * }
     */
    public function refreshAccessToken(string $refreshToken): array
    {
        $this->ensureConfigured();

        $response = Http::asForm()
            ->acceptJson()
            ->post(self::TOKEN_URL, [
                'client_id' => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'refresh_token' => $refreshToken,
                'grant_type' => 'refresh_token',
            ])
            ->throw();

        return $this->normalizeTokenResponse($response->json());
    }

    public function revokeToken(string $token): void
    {
        try {
            Http::asForm()->post(self::REVOKE_URL, ['token' => $token]);
        } catch (RequestException) {
            // Best-effort revoke; local disconnect still proceeds.
        }
    }

    public function fetchAccountEmail(string $accessToken): ?string
    {
        try {
            $response = Http::withToken($accessToken)
                ->acceptJson()
                ->get(self::USERINFO_URL)
                ->throw();

            $email = $response->json('email');

            return is_string($email) && $email !== '' ? $email : null;
        } catch (RequestException) {
            return null;
        }
    }

    public function isConfigured(): bool
    {
        return is_string(config('services.google.client_id'))
            && config('services.google.client_id') !== ''
            && is_string(config('services.google.client_secret'))
            && config('services.google.client_secret') !== ''
            && is_string(config('services.google.redirect_uri'))
            && config('services.google.redirect_uri') !== '';
    }

    public function ensureConfigured(): void
    {
        if (! $this->isConfigured()) {
            throw new \RuntimeException(__('Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.'));
        }
    }

    /**
     * @param  array<string, mixed>|null  $payload
     * @return array{
     *     access_token: string,
     *     refresh_token: ?string,
     *     expires_in: int,
     *     scope: ?string,
     *     token_type: ?string
     * }
     */
    private function normalizeTokenResponse(?array $payload): array
    {
        if (! is_array($payload) || ! is_string($payload['access_token'] ?? null) || $payload['access_token'] === '') {
            throw new \RuntimeException(__('Google did not return an access token.'));
        }

        $refresh = $payload['refresh_token'] ?? null;

        return [
            'access_token' => $payload['access_token'],
            'refresh_token' => is_string($refresh) && $refresh !== '' ? $refresh : null,
            'expires_in' => max(0, (int) ($payload['expires_in'] ?? 0)),
            'scope' => is_string($payload['scope'] ?? null) ? $payload['scope'] : null,
            'token_type' => is_string($payload['token_type'] ?? null) ? $payload['token_type'] : null,
        ];
    }

    /**
     * @param  list<string>  $requestedServices
     * @return list<string>
     */
    public function grantedServicesFromScope(?string $scopeString, array $requestedServices): array
    {
        if (! is_string($scopeString) || trim($scopeString) === '') {
            return $requestedServices;
        }

        $grantedScopes = preg_split('/\s+/', trim($scopeString)) ?: [];
        $connected = [];

        foreach ($requestedServices as $service) {
            if (! GoogleIntegrationService::isValid($service)) {
                continue;
            }

            if (in_array(GoogleIntegrationService::scopeFor($service), $grantedScopes, true)) {
                $connected[] = $service;
            }
        }

        return $connected !== [] ? $connected : $requestedServices;
    }
}
