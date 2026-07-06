<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

/** OpenAPI component schemas for roles & permissions (scanned by l5-swagger only). */
#[OA\Schema(
    schema: 'Role',
    required: ['id', 'name', 'guard_name'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 3),
        new OA\Property(property: 'name', type: 'string', example: 'content_manager'),
        new OA\Property(property: 'guard_name', type: 'string', example: 'web'),
        new OA\Property(
            property: 'permissions',
            type: 'array',
            items: new OA\Items(type: 'string'),
            example: ['admin.dashboard.view', 'admin.companies.view']
        ),
        new OA\Property(property: 'users_count', type: 'integer', example: 0),
        new OA\Property(property: 'permissions_count', type: 'integer', example: 2),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ]
)]
#[OA\Schema(
    schema: 'RoleStoreRequest',
    required: ['name'],
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, pattern: '^[a-z][a-z0-9_]*$', example: 'content_manager'),
        new OA\Property(
            property: 'permissions',
            type: 'array',
            items: new OA\Items(type: 'string'),
            example: ['admin.dashboard.view']
        ),
    ]
)]
#[OA\Schema(
    schema: 'RoleUpdateRequest',
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, pattern: '^[a-z][a-z0-9_]*$', example: 'content_manager'),
        new OA\Property(
            property: 'permissions',
            type: 'array',
            items: new OA\Items(type: 'string'),
            example: ['admin.dashboard.view', 'admin.companies.view']
        ),
    ]
)]
#[OA\Schema(
    schema: 'Permission',
    required: ['id', 'name', 'guard_name'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 12),
        new OA\Property(property: 'name', type: 'string', example: 'admin.companies.view'),
        new OA\Property(property: 'guard_name', type: 'string', example: 'web'),
        new OA\Property(
            property: 'roles',
            type: 'array',
            items: new OA\Items(type: 'string'),
            example: ['super_admin']
        ),
        new OA\Property(property: 'roles_count', type: 'integer', example: 1),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ]
)]
#[OA\Schema(
    schema: 'PermissionStoreRequest',
    required: ['name'],
    properties: [
        new OA\Property(
            property: 'name',
            type: 'string',
            maxLength: 255,
            pattern: '^[a-z][a-z0-9_.]*$',
            example: 'admin.reports.export'
        ),
        new OA\Property(
            property: 'roles',
            description: 'Optional extra roles (super_admin is always added). If omitted, `company.*` also links to company_admin.',
            type: 'array',
            items: new OA\Items(type: 'string'),
            example: ['super_admin']
        ),
    ]
)]
#[OA\Schema(
    schema: 'PermissionUpdateRequest',
    properties: [
        new OA\Property(
            property: 'name',
            type: 'string',
            maxLength: 255,
            pattern: '^[a-z][a-z0-9_.]*$',
            example: 'admin.reports.view'
        ),
        new OA\Property(
            property: 'roles',
            description: 'Replace role assignments for this permission.',
            type: 'array',
            items: new OA\Items(type: 'string'),
            example: ['super_admin', 'company_admin']
        ),
    ]
)]
class RbacSchemas {}
