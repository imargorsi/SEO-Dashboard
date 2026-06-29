<?php

namespace App\Integrations\Google\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Integrations\Google\OAuth\OAuthStateService;
use App\Integrations\Google\Services\ProjectIntegrationManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class OAuthCallbackController extends Controller
{
    public function __construct(
        private readonly ProjectIntegrationManager $integrations,
        private readonly OAuthStateService $stateService,
    ) {}

    #[OA\Get(
        path: '/api/v1/integrations/google/callback',
        operationId: 'integrationsGoogleCallback',
        summary: 'Google OAuth callback (browser redirect)',
        description: <<<'MD'
**Public** endpoint — Google redirects here after user consent. Do not call from SPA with Bearer token.

On success, redirects to `{FRONTEND_URL}{GOOGLE_OAUTH_FRONTEND_CALLBACK_PATH}?success=1&project_id=…&services=…&email=…` (default path `/projects/new`).

On failure: `success=0` and `error` message.

Register this exact URL as an authorized redirect URI in Google Cloud Console.
MD,
        tags: ['Integrations'],
        parameters: [
            new OA\Parameter(name: 'code', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'state', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'error', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 302, description: 'Redirect to SPA'),
        ]
    )]
    public function __invoke(Request $request): RedirectResponse
    {
        $frontendBase = $this->frontendCallbackUrl();

        if ($request->filled('error')) {
            return redirect()->away($this->frontendUrl($frontendBase, [
                'success' => '0',
                'error' => (string) $request->query('error'),
            ]));
        }

        $code = $request->query('code');
        $state = $request->query('state');

        if (! is_string($code) || $code === '' || ! is_string($state) || $state === '') {
            return redirect()->away($this->frontendUrl($frontendBase, [
                'success' => '0',
                'error' => 'missing_code_or_state',
            ]));
        }

        try {
            $oauthState = $this->stateService->resolve($state);
            $result = $this->integrations->completeConnect($code, $oauthState);

            return redirect()->away($this->frontendUrl($frontendBase, [
                'success' => '1',
                'project_id' => (string) $result['project_id'],
                'services' => implode(',', $result['connected_services']),
                'email' => $result['external_account_email'] ?? '',
            ]));
        } catch (\Throwable $e) {
            report($e);

            return redirect()->away($this->frontendUrl($frontendBase, [
                'success' => '0',
                'error' => 'connect_failed',
                'message' => $e->getMessage(),
            ]));
        }
    }

    private function frontendCallbackUrl(): string
    {
        $origin = rtrim((string) config('app.frontend_url', config('app.url')), '/');
        $path = (string) config('services.google.frontend_callback_path', '/projects/new');
        $path = '/'.ltrim($path, '/');

        return $origin.$path;
    }

    /**
     * @param  array<string, string>  $query
     */
    private function frontendUrl(string $url, array $query): string
    {
        $qs = http_build_query($query);

        return $url.($qs !== '' ? '?'.$qs : '');
    }
}
