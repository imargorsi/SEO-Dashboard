<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

/** OpenAPI component schemas for user resources (scanned by l5-swagger only). */
#[OA\Schema(
    schema: 'User',
    required: ['id', 'name', 'email', 'company_id', 'roles', 'permissions'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 12),
        new OA\Property(property: 'name', type: 'string', example: 'John Doe'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john.doe@example.com'),
        new OA\Property(property: 'profile_image', type: 'string', format: 'uri', nullable: true, example: null),
        new OA\Property(property: 'email_verified_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'company_id', type: 'integer', nullable: true, example: 8),
        new OA\Property(
            property: 'roles',
            type: 'array',
            items: new OA\Items(type: 'string'),
            example: ['content_manager']
        ),
        new OA\Property(
            property: 'permissions',
            type: 'array',
            items: new OA\Items(type: 'string'),
            example: ['company.dashboard.view']
        ),
        new OA\Property(
            property: 'home_api_path',
            type: 'string',
            nullable: true,
            example: '/api/v1/company/dashboard',
            description: 'Default dashboard path for the user role; null for roles without a dedicated dashboard.'
        ),
    ]
)]
class UserSchemas {}
