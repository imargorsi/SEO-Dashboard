<?php

namespace App\Integrations\Google\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Integrations\Google\Http\Requests\ConnectIntegrationRequest;
use App\Integrations\Google\Http\Requests\DisconnectIntegrationRequest;
use App\Integrations\Google\Http\Requests\ListIntegrationsRequest;
use App\Integrations\Google\Services\ProjectIntegrationManager;
use App\Models\Project;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class IntegrationController extends Controller
{
    public function __construct(
        private readonly ProjectIntegrationManager $integrations,
    ) {}

    #[OA\Get(
        path: '/api/v1/projects/{project}/integrations',
        operationId: 'projectIntegrationsIndex',
        summary: 'List Google integration status for a project',
        description: 'Shows Google Analytics, Search Console, Tag Manager, and Ads connection state. Tokens are never returned — only status and Google account email when connected.',
        security: [['sanctum' => []]],
        tags: ['Integrations'],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function index(ListIntegrationsRequest $request, Project $project): JsonResponse
    {
        return ApiResponse::success(
            $this->integrations->statusPayload($project),
            __('Integration status retrieved.')
        );
    }

    #[OA\Post(
        path: '/api/v1/projects/{project}/integrations/google/connect',
        operationId: 'projectIntegrationsGoogleConnect',
        summary: 'Start Google OAuth (redirect user to auth_url)',
        description: <<<'MD'
Creates/updates pending integration rows, then returns **`auth_url`**. The frontend must redirect the user's browser to that URL (same tab or popup).

After the user approves, Google redirects to the backend callback; the user lands on the SPA at `{FRONTEND_URL}{GOOGLE_OAUTH_FRONTEND_CALLBACK_PATH}` (default `/projects/new`) with query params `success`, `project_id`, `services`, etc.

**Does not call Google APIs yet** — only stores OAuth tokens so later jobs can read Analytics / Search Console / GTM / Ads on the user's behalf.
MD,
        security: [['sanctum' => []]],
        tags: ['Integrations'],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/GoogleIntegrationConnectRequest')
        ),
        responses: [
            new OA\Response(response: 200, description: 'OK — redirect user to `data.auth_url`'),
            new OA\Response(response: 422, description: 'Validation error'),
            new OA\Response(response: 503, description: 'Google OAuth not configured'),
        ]
    )]
    public function connect(ConnectIntegrationRequest $request, Project $project): JsonResponse
    {
        try {
            $payload = $this->integrations->startConnect(
                $project,
                $request->user(),
                $request->validated('services')
            );
        } catch (\RuntimeException $e) {
            return ApiResponse::error($e->getMessage(), status: 503);
        }

        return ApiResponse::success(
            $payload,
            __('Redirect the user to auth_url to grant Google access for this project.')
        );
    }

    #[OA\Delete(
        path: '/api/v1/projects/{project}/integrations/google/{service}',
        operationId: 'projectIntegrationsGoogleDisconnect',
        summary: 'Disconnect a Google service',
        description: 'Revokes the stored token (best effort) and removes the connection for one service: `analytics`, `search_console`, `tag_manager`, or `ads`.',
        security: [['sanctum' => []]],
        tags: ['Integrations'],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(
                name: 'service',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'string', enum: ['analytics', 'search_console', 'tag_manager', 'ads'])
            ),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Disconnected'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function disconnect(DisconnectIntegrationRequest $request, Project $project, string $service): JsonResponse
    {
        $this->integrations->disconnect($project, $service);

        return ApiResponse::success(
            $this->integrations->statusPayload($project),
            __('Google integration disconnected.')
        );
    }
}
