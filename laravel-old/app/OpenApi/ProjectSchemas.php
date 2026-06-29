<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

/** OpenAPI component schemas for projects (scanned by l5-swagger only). */
#[OA\Schema(
    schema: 'ProjectListFilters',
    description: 'Applied query state echoed in GET /api/v1/projects as `data.filters`.',
    properties: [
        new OA\Property(property: 'search', type: 'string', nullable: true, example: null),
        new OA\Property(property: 'sort', type: 'string', example: 'created_at'),
        new OA\Property(property: 'direction', type: 'string', enum: ['asc', 'desc'], example: 'desc'),
        new OA\Property(property: 'page', type: 'integer', example: 1),
        new OA\Property(property: 'per_page', type: 'integer', example: 15),
        new OA\Property(
            property: 'company_id',
            type: 'integer',
            nullable: true,
            example: 8,
            description: 'Set when the list is scoped to one company (`?company_id=` for super_admin, or implicit for company_admin). Omitted when super_admin lists all companies.'
        ),
    ]
)]
#[OA\Schema(
    schema: 'Project',
    required: ['id', 'company_id', 'business_name', 'website_url'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'company_id', type: 'integer', example: 8),
        new OA\Property(property: 'business_name', type: 'string', example: 'Acme Ltd'),
        new OA\Property(property: 'website_url', type: 'string', format: 'uri'),
        new OA\Property(property: 'cms_password_set', type: 'boolean', example: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ]
)]
#[OA\Schema(
    schema: 'ProjectStoreRequest',
    required: [
        'business_name',
        'website_url',
        'target_locations',
        'is_b2b',
        'is_b2c',
        'seo_goal_ids',
        'cms_login_page_url',
        'cms_username',
        'cms_password',
    ],
    properties: [
        new OA\Property(
            property: 'company_id',
            type: 'integer',
            description: '**super_admin only** — tenant company id from GET /api/v1/admin/companies. Omit when using a company_admin token.',
            example: 8
        ),
        new OA\Property(property: 'business_name', type: 'string', maxLength: 255, example: 'Acme Ltd'),
        new OA\Property(property: 'website_url', type: 'string', maxLength: 2048, format: 'uri', example: 'https://acme.example.com'),
        new OA\Property(
            property: 'industry_niche_id',
            type: 'integer',
            nullable: true,
            description: 'Optional — id from GET /api/v1/lookups/industry-niches'
        ),
        new OA\Property(property: 'industry_other', type: 'string', nullable: true, maxLength: 2000, description: 'Required when industry_niche_id is the "Other" option'),
        new OA\Property(
            property: 'target_locations',
            type: 'array',
            items: new OA\Items(type: 'string', maxLength: 120),
            example: ['Austin', 'Dallas']
        ),
        new OA\Property(property: 'is_b2b', type: 'boolean', example: true),
        new OA\Property(property: 'is_b2c', type: 'boolean', example: true),
        new OA\Property(property: 'brief_description', type: 'string', nullable: true, maxLength: 20000),
        new OA\Property(property: 'main_competitors', type: 'string', nullable: true, maxLength: 20000),
        new OA\Property(
            property: 'seo_goal_ids',
            type: 'array',
            items: new OA\Items(type: 'integer'),
            example: [1, 2],
            description: 'Ids from GET /api/v1/lookups/seo-goals'
        ),
        new OA\Property(property: 'seo_goal_other', type: 'string', nullable: true, maxLength: 2000, description: 'Required when "Other" is included in seo_goal_ids'),
        new OA\Property(property: 'has_google_analytics', type: 'boolean', nullable: true),
        new OA\Property(property: 'has_google_search_console', type: 'boolean', nullable: true),
        new OA\Property(property: 'has_google_tag_manager', type: 'boolean', nullable: true),
        new OA\Property(property: 'has_google_ads', type: 'boolean', nullable: true),
        new OA\Property(property: 'has_website_login_details', type: 'boolean', nullable: true),
        new OA\Property(property: 'cms_login_page_url', type: 'string', maxLength: 2048, format: 'uri', example: 'https://acme.example.com/wp-login.php'),
        new OA\Property(property: 'cms_username', type: 'string', maxLength: 255, example: 'admin'),
        new OA\Property(property: 'cms_password', type: 'string', format: 'password', maxLength: 2000),
    ],
    example: [
        'company_id' => 8,
        'business_name' => 'Acme Ltd',
        'website_url' => 'https://acme.example.com',
        'industry_niche_id' => 1,
        'target_locations' => ['Austin', 'Dallas'],
        'is_b2b' => true,
        'is_b2c' => true,
        'brief_description' => 'B2B wholesale supplier.',
        'seo_goal_ids' => [1, 2],
        'has_google_analytics' => true,
        'cms_login_page_url' => 'https://acme.example.com/wp-login.php',
        'cms_username' => 'admin',
        'cms_password' => 'secret-pass',
    ]
)]
#[OA\Schema(
    schema: 'ProjectUpdateRequest',
    description: 'Send only fields to change (PATCH). **super_admin** may include `company_id`; **company_admin** must not send `company_id`. Leave `cms_password` out to keep the existing password.',
    properties: [
        new OA\Property(
            property: 'company_id',
            type: 'integer',
            description: '**super_admin only** — move project to another tenant company'
        ),
        new OA\Property(property: 'business_name', type: 'string', maxLength: 255, example: 'Acme LLC'),
        new OA\Property(property: 'website_url', type: 'string', maxLength: 2048, format: 'uri'),
        new OA\Property(property: 'industry_niche_id', type: 'integer', nullable: true),
        new OA\Property(property: 'industry_other', type: 'string', nullable: true, maxLength: 2000),
        new OA\Property(
            property: 'target_locations',
            type: 'array',
            items: new OA\Items(type: 'string', maxLength: 120),
            example: ['Chicago', 'Milwaukee']
        ),
        new OA\Property(property: 'is_b2b', type: 'boolean'),
        new OA\Property(property: 'is_b2c', type: 'boolean'),
        new OA\Property(property: 'brief_description', type: 'string', nullable: true, maxLength: 20000),
        new OA\Property(property: 'main_competitors', type: 'string', nullable: true, maxLength: 20000),
        new OA\Property(
            property: 'seo_goal_ids',
            type: 'array',
            items: new OA\Items(type: 'integer'),
            example: [1, 3]
        ),
        new OA\Property(property: 'seo_goal_other', type: 'string', nullable: true, maxLength: 2000),
        new OA\Property(property: 'has_google_analytics', type: 'boolean', nullable: true),
        new OA\Property(property: 'has_google_search_console', type: 'boolean', nullable: true),
        new OA\Property(property: 'has_google_tag_manager', type: 'boolean', nullable: true),
        new OA\Property(property: 'has_google_ads', type: 'boolean', nullable: true),
        new OA\Property(property: 'has_website_login_details', type: 'boolean', nullable: true),
        new OA\Property(property: 'cms_login_page_url', type: 'string', maxLength: 2048, format: 'uri'),
        new OA\Property(property: 'cms_username', type: 'string', maxLength: 255),
        new OA\Property(property: 'cms_password', type: 'string', format: 'password', maxLength: 2000, description: 'Omit or send empty to keep existing password'),
    ],
    example: [
        'business_name' => 'Acme LLC',
        'target_locations' => ['Chicago', 'Milwaukee'],
        'is_b2b' => true,
        'is_b2c' => false,
        'seo_goal_ids' => [1, 3],
    ]
)]
class ProjectSchemas {}
