<?php

namespace App\OpenApi\Sheets;

use OpenApi\Attributes as OA;

/** OpenAPI component schemas for project Google Sheets sync (scanned by l5-swagger). */
#[OA\Schema(
    schema: 'ProjectSheetUpsertRequest',
    required: ['spreadsheet_url'],
    properties: [
        new OA\Property(
            property: 'spreadsheet_url',
            type: 'string',
            format: 'uri',
            maxLength: 512,
            description: 'Full Google Spreadsheet URL (may include `gid` for the tab)',
            example: 'https://docs.google.com/spreadsheets/d/1aCBQ30d9r3VSUbVxlrq4HC4t8x2CZaNCqjKehSgAXU4/edit?gid=1817011140'
        ),
        new OA\Property(
            property: 'tab_name',
            type: 'string',
            nullable: true,
            maxLength: 128,
            description: 'Worksheet tab name. Defaults per type: Blog (bp), GP (gp), Service (sp), KC (kc).',
            example: 'Blog'
        ),
        new OA\Property(
            property: 'tab_gid',
            type: 'string',
            nullable: true,
            maxLength: 32,
            description: 'Optional tab gid; parsed from URL when omitted.',
            example: '1817011140'
        ),
    ],
    example: [
        'spreadsheet_url' => 'https://docs.google.com/spreadsheets/d/1aCBQ30d9r3VSUbVxlrq4HC4t8x2CZaNCqjKehSgAXU4/edit?gid=1817011140',
        'tab_name' => 'Blog',
    ]
)]
#[OA\Schema(
    schema: 'ProjectSheetEntry',
    required: ['id', 'project_id', 'sheet_type', 'source_row_number'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'project_id', type: 'integer', example: 5),
        new OA\Property(property: 'sheet_type', type: 'string', enum: ['bp', 'gp', 'sp', 'kc'], example: 'kc'),
        new OA\Property(property: 'source_row_number', type: 'integer', example: 2),
        new OA\Property(property: 'site', type: 'string', nullable: true, example: 'MTC'),
        new OA\Property(property: 'days', type: 'string', nullable: true, example: 'Monday'),
        new OA\Property(property: 'page_link', type: 'string', nullable: true, format: 'uri'),
        new OA\Property(property: 'details', type: 'string', nullable: true, example: 'We fix H1 headings'),
        new OA\Property(property: 'occurred_on', type: 'string', format: 'date', nullable: true, example: '2026-06-02'),
        new OA\Property(
            property: 'extra_data',
            type: 'object',
            description: 'Type-specific columns not mapped to core fields',
            example: new \stdClass
        ),
        new OA\Property(property: 'synced_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', nullable: true),
    ]
)]
#[OA\Schema(
    schema: 'ProjectSheetEntryListFilters',
    description: 'Applied query state echoed in GET …/entries as `data.filters`.',
    properties: [
        new OA\Property(property: 'search', type: 'string', nullable: true, example: null),
        new OA\Property(property: 'sort', type: 'string', example: 'source_row_number'),
        new OA\Property(property: 'direction', type: 'string', enum: ['asc', 'desc'], example: 'asc'),
        new OA\Property(property: 'page', type: 'integer', example: 1),
        new OA\Property(property: 'per_page', type: 'integer', example: 15),
        new OA\Property(property: 'sheet_type', type: 'string', enum: ['bp', 'gp', 'sp', 'kc'], example: 'kc'),
    ]
)]
#[OA\Schema(
    schema: 'ProjectSheetConfig',
    properties: [
        new OA\Property(property: 'sheet_type', type: 'string', enum: ['bp', 'gp', 'sp', 'kc']),
        new OA\Property(property: 'label', type: 'string', example: 'Key Change'),
        new OA\Property(property: 'spreadsheet_id', type: 'string'),
        new OA\Property(property: 'spreadsheet_url', type: 'string', format: 'uri', nullable: true),
        new OA\Property(property: 'tab_name', type: 'string', nullable: true),
        new OA\Property(property: 'tab_gid', type: 'string', nullable: true),
        new OA\Property(property: 'status', type: 'string', enum: ['active', 'error', 'disabled']),
        new OA\Property(property: 'entry_count', type: 'integer', example: 4),
        new OA\Property(property: 'last_synced_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'last_error', type: 'string', nullable: true),
        new OA\Property(property: 'synced_by_user_id', type: 'integer', nullable: true),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', nullable: true),
    ]
)]
#[OA\Schema(
    schema: 'ProjectSheetStatusPayload',
    properties: [
        new OA\Property(property: 'project_id', type: 'integer', example: 5),
        new OA\Property(
            property: 'catalog',
            type: 'object',
            description: 'All supported sheet types with labels and default tab names'
        ),
        new OA\Property(
            property: 'sheets',
            type: 'object',
            description: 'Per-type config (null when not configured)',
            additionalProperties: new OA\AdditionalProperties(
                oneOf: [
                    new OA\Schema(ref: '#/components/schemas/ProjectSheetConfig'),
                    new OA\Schema(type: 'null'),
                ]
            )
        ),
    ]
)]
#[OA\Schema(
    schema: 'ProjectSheetSyncResult',
    properties: [
        new OA\Property(property: 'sheet_type', type: 'string', enum: ['bp', 'gp', 'sp', 'kc']),
        new OA\Property(property: 'imported', type: 'integer', example: 4),
        new OA\Property(property: 'skipped', type: 'integer', example: 1, description: 'Rows whose Site did not match any project.site_code'),
        new OA\Property(property: 'removed', type: 'integer', example: 0),
        new OA\Property(property: 'last_synced_at', type: 'string', format: 'date-time'),
    ]
)]
class ProjectSheetSchemas {}
