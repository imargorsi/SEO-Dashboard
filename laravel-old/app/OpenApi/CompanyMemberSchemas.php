<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

/** OpenAPI component schemas for company members (scanned by l5-swagger only). */
#[OA\Schema(
    schema: 'CompanyMemberStoreRequest',
    required: ['name', 'email', 'role'],
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'John Doe'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john.doe@example.com'),
        new OA\Property(
            property: 'role',
            type: 'string',
            example: 'content_manager',
            description: 'Role name (e.g., company_admin, content_manager, seo_specialist)'
        ),
    ],
    example: [
        'name' => 'John Doe',
        'email' => 'john.doe@example.com',
        'role' => 'content_manager',
    ]
)]
#[OA\Schema(
    schema: 'CompanyMemberUpdateRequest',
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'John Smith'),
        new OA\Property(
            property: 'role',
            type: 'string',
            example: 'seo_specialist',
            description: 'Role name (e.g., company_admin, content_manager, seo_specialist)'
        ),
    ],
    example: [
        'name' => 'John Smith',
        'role' => 'seo_specialist',
    ]
)]
class CompanyMemberSchemas {}
