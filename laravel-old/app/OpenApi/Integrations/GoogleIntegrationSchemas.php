<?php

namespace App\OpenApi\Integrations;

use OpenApi\Attributes as OA;

/** OpenAPI component schemas for Google OAuth (scanned by l5-swagger). */
#[OA\Schema(
    schema: 'GoogleIntegrationConnectRequest',
    required: ['services'],
    properties: [
        new OA\Property(
            property: 'services',
            type: 'array',
            items: new OA\Items(
                type: 'string',
                enum: ['analytics', 'search_console', 'tag_manager', 'ads']
            ),
            example: ['analytics', 'search_console']
        ),
    ],
    example: [
        'services' => ['analytics', 'search_console'],
    ]
)]
#[OA\Schema(
    schema: 'GoogleIntegrationConnectResponse',
    properties: [
        new OA\Property(
            property: 'auth_url',
            type: 'string',
            format: 'uri',
            description: 'Redirect the signed-in user here to grant Google access'
        ),
        new OA\Property(property: 'state', type: 'string', description: 'Opaque state passed through OAuth (encrypted)'),
        new OA\Property(property: 'expires_in_seconds', type: 'integer', example: 1800),
        new OA\Property(
            property: 'services',
            type: 'array',
            items: new OA\Items(type: 'string'),
            example: ['analytics', 'search_console']
        ),
        new OA\Property(
            property: 'scopes',
            type: 'array',
            items: new OA\Items(type: 'string'),
            description: 'Google OAuth scope URLs requested'
        ),
    ]
)]
class GoogleIntegrationSchemas {}
