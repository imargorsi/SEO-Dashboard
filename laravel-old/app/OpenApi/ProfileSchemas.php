<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

/** OpenAPI component schemas for `/api/v1/me/*` (scanned by l5-swagger only). */
#[OA\Schema(
    schema: 'ProfileUpdateRequest',
    description: 'POST /api/v1/me/profile only (PATCH removed). Partial update: send only fields to change. Email is not accepted. Multipart for `profile_image` (aliases: image, avatar, file). Max 2 MB.',
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'Jane Doe'),
        new OA\Property(
            property: 'profile_image',
            type: 'string',
            format: 'binary',
            description: 'Profile photo (multipart only). Aliases: image, avatar, file.'
        ),
        new OA\Property(property: 'remove_profile_image', type: 'boolean', example: false, description: 'Set true to delete the current photo'),
    ],
    example: [
        'name' => 'Jane Doe',
    ]
)]
#[OA\Schema(
    schema: 'ProfileDeleteRequest',
    required: ['password'],
    properties: [
        new OA\Property(
            property: 'password',
            type: 'string',
            format: 'password',
            description: 'Current account password (required to confirm deletion)'
        ),
    ],
    example: [
        'password' => 'your-current-password',
    ]
)]
class ProfileSchemas {}
