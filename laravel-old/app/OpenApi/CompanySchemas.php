<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

/** OpenAPI component schemas for companies (scanned by l5-swagger only). */
#[OA\Schema(
    schema: 'Company',
    required: ['id', 'name', 'slug', 'status', 'is_active', 'poc_name', 'poc_email'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 8),
        new OA\Property(property: 'name', type: 'string', example: 'Acme SEO Agency'),
        new OA\Property(property: 'slug', type: 'string', example: 'acme-seo-agency'),
        new OA\Property(
            property: 'status',
            type: 'string',
            enum: ['pending', 'approved', 'rejected'],
            example: 'approved',
            description: 'Registration / approval state. Existing admin-created companies are `approved`. Self-signup starts as `pending`.'
        ),
        new OA\Property(
            property: 'is_active',
            type: 'boolean',
            example: true,
            description: 'Tenant access flag. `false` while `pending` or when disabled by admin.'
        ),
        new OA\Property(property: 'poc_name', type: 'string', example: 'Jane Doe'),
        new OA\Property(property: 'poc_email', type: 'string', format: 'email', example: 'jane.doe@acme.example.com'),
        new OA\Property(property: 'users_count', type: 'integer', example: 1, description: 'Present on list/show when loaded with `users_count`.'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ]
)]
#[OA\Schema(
    schema: 'CompanyListFilters',
    description: 'Applied query state echoed in GET /api/v1/admin/companies as `data.filters`.',
    properties: [
        new OA\Property(property: 'search', type: 'string', nullable: true, example: null),
        new OA\Property(property: 'sort', type: 'string', example: 'created_at'),
        new OA\Property(property: 'direction', type: 'string', enum: ['asc', 'desc'], example: 'desc'),
        new OA\Property(property: 'page', type: 'integer', example: 1),
        new OA\Property(property: 'per_page', type: 'integer', example: 15),
        new OA\Property(
            property: 'status',
            type: 'string',
            nullable: true,
            enum: ['pending', 'approved', 'rejected'],
            example: 'pending',
            description: 'Echoed when `GET ?status=` is used. Omitted when listing all companies (backward compatible).'
        ),
    ]
)]
#[OA\Schema(
    schema: 'AdminStoreCompanyRequest',
    required: ['company_name', 'poc_name', 'poc_email'],
    properties: [
        new OA\Property(property: 'company_name', type: 'string', maxLength: 255, example: 'Acme SEO Agency'),
        new OA\Property(property: 'poc_name', type: 'string', maxLength: 255, example: 'Jane Doe'),
        new OA\Property(property: 'poc_email', type: 'string', format: 'email', example: 'jane.doe@acme.example.com'),
        new OA\Property(
            property: 'is_active',
            type: 'boolean',
            example: true,
            description: 'Optional. Defaults to `true`. Company `status` is always set to `approved` for admin create (unchanged behavior).'
        ),
    ],
    example: [
        'company_name' => 'Acme SEO Agency',
        'poc_name' => 'Jane Doe',
        'poc_email' => 'jane.doe@acme.example.com',
        'is_active' => true,
    ]
)]
#[OA\Schema(
    schema: 'AdminUpdateCompanyRequest',
    properties: [
        new OA\Property(property: 'company_name', type: 'string', maxLength: 255),
        new OA\Property(property: 'slug', type: 'string', maxLength: 255),
        new OA\Property(property: 'poc_name', type: 'string', maxLength: 255),
        new OA\Property(property: 'poc_email', type: 'string', format: 'email'),
        new OA\Property(property: 'is_active', type: 'boolean', description: 'Disable/enable an approved company without changing `status`.'),
    ]
)]
#[OA\Schema(
    schema: 'RegisterCompanyRequest',
    required: ['company_name', 'poc_name', 'poc_email', 'password', 'password_confirmation'],
    properties: [
        new OA\Property(property: 'company_name', type: 'string', maxLength: 255, example: 'Acme SEO Agency'),
        new OA\Property(property: 'poc_name', type: 'string', maxLength: 255, example: 'Jane Doe'),
        new OA\Property(property: 'poc_email', type: 'string', format: 'email', example: 'jane.doe@acme.example.com'),
        new OA\Property(property: 'password', type: 'string', format: 'password', example: 'SecurePass1!'),
        new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'SecurePass1!'),
    ],
    example: [
        'company_name' => 'Acme SEO Agency',
        'poc_name' => 'Jane Doe',
        'poc_email' => 'jane.doe@acme.example.com',
        'password' => 'SecurePass1!',
        'password_confirmation' => 'SecurePass1!',
    ]
)]
class CompanySchemas {}
