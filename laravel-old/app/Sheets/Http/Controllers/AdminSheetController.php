<?php

namespace App\Sheets\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Core\Queries\AdminSheetEntryListQuery;
use App\Models\ProjectSheetEntry;
use App\Sheets\Http\Requests\Admin\DestroyAdminSheetRequest;
use App\Sheets\Http\Requests\Admin\ListAdminSheetEntriesRequest;
use App\Sheets\Http\Requests\Admin\ListAdminSheetsRequest;
use App\Sheets\Http\Requests\Admin\SyncAdminSheetRequest;
use App\Sheets\Http\Requests\Admin\UpsertAdminSheetRequest;
use App\Sheets\Http\Resources\AdminSheetEntryResource;
use App\Sheets\Services\SheetManager;
use App\Sheets\Services\SheetSyncService;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class AdminSheetController extends Controller
{
    public function __construct(
        private readonly SheetManager $sheets,
        private readonly SheetSyncService $syncService,
    ) {}

    #[OA\Get(
        path: '/api/v1/admin/sheets',
        operationId: 'adminSheetsIndex',
        summary: 'List master spreadsheet configuration and sync status',
        description: '**super_admin only.** One shared Google Spreadsheet holds all clients. Configure each tab type (bp, gp, sp, kc) here.',
        security: [['sanctum' => []]],
        tags: ['Project Sheets'],
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(ListAdminSheetsRequest $request): JsonResponse
    {
        return ApiResponse::success(
            $this->sheets->adminStatusPayload(),
            __('Master sheet status retrieved.')
        );
    }

    #[OA\Put(
        path: '/api/v1/admin/sheets/{type}',
        operationId: 'adminSheetsUpsert',
        summary: 'Configure master spreadsheet tab for a sheet type',
        security: [['sanctum' => []]],
        tags: ['Project Sheets'],
        parameters: [
            new OA\Parameter(name: 'type', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['bp', 'gp', 'sp', 'kc'])),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/ProjectSheetUpsertRequest')
        ),
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function upsert(UpsertAdminSheetRequest $request, string $type): JsonResponse
    {
        $this->sheets->upsertConfig($type, $request->validated(), $request->user());

        return ApiResponse::success(
            $this->sheets->adminStatusPayload(),
            __('Master sheet configuration saved.')
        );
    }

    #[OA\Delete(
        path: '/api/v1/admin/sheets/{type}',
        operationId: 'adminSheetsDestroy',
        summary: 'Remove master sheet configuration for a type',
        security: [['sanctum' => []]],
        tags: ['Project Sheets'],
        parameters: [
            new OA\Parameter(name: 'type', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['bp', 'gp', 'sp', 'kc'])),
        ],
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function destroy(DestroyAdminSheetRequest $request, string $type): JsonResponse
    {
        $this->sheets->deleteConfig($type);

        return ApiResponse::success(
            $this->sheets->adminStatusPayload(),
            __('Master sheet configuration removed.')
        );
    }

    #[OA\Post(
        path: '/api/v1/admin/sheets/{type}/sync',
        operationId: 'adminSheetsSync',
        summary: 'Sync master spreadsheet tab for all projects',
        description: <<<'MD'
**super_admin only.** Fetches the full tab from the master Google Spreadsheet and imports **all rows**.

- Each row's **Site** column is matched to `projects.site_code`.
- Rows with unknown sites are skipped (`skipped` count in response).
- Companies/projects only **view** their own rows afterward via project endpoints.
- Spreadsheet must be shared as **Anyone with the link can view**.
MD,
        security: [['sanctum' => []]],
        tags: ['Project Sheets'],
        parameters: [
            new OA\Parameter(name: 'type', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['bp', 'gp', 'sp', 'kc'])),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Synced'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Sync failed'),
        ]
    )]
    public function sync(SyncAdminSheetRequest $request, string $type): JsonResponse
    {
        try {
            $result = $this->syncService->sync($type, $request->user());
        } catch (\Throwable $e) {
            return ApiResponse::error($e->getMessage(), status: 422);
        }

        return ApiResponse::success(
            array_merge(['sync' => $result], $this->sheets->adminStatusPayload()),
            __('Master sheet data synced.')
        );
    }

    #[OA\Get(
        path: '/api/v1/admin/sheets/{type}/entries',
        operationId: 'adminSheetEntriesIndex',
        summary: 'List all synced spreadsheet rows for a sheet type (all projects)',
        description: '**super_admin only.** Returns every imported row for the given type across all projects. Optional filters: `project_id`, `company_id`, `site`, `search`.',
        security: [['sanctum' => []]],
        tags: ['Project Sheets'],
        parameters: [
            new OA\Parameter(name: 'type', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['bp', 'gp', 'sp', 'kc'])),
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100)),
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'project_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'company_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'site', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(
                name: 'sort',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string', enum: ['source_row_number', 'site', 'days', 'occurred_on', 'synced_at', 'created_at', 'project_id'])
            ),
            new OA\Parameter(name: 'direction', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['asc', 'desc'])),
        ],
        responses: [
            new OA\Response(response: 200, description: 'OK — paginated entries with project info'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function entries(ListAdminSheetEntriesRequest $request, string $type): JsonResponse
    {
        $state = $request->listState();

        $query = AdminSheetEntryListQuery::base($type);
        AdminSheetEntryListQuery::apply(
            $query,
            $state,
            $request->projectIdFilter(),
            $request->companyIdFilter(),
            $request->siteFilter(),
        );

        $paginator = $query
            ->paginate($state->per_page)
            ->withQueryString();

        return ApiResponse::paginated(
            $paginator,
            AdminSheetEntryResource::class,
            $request->filterPayload(),
            $request
        );
    }

    #[OA\Get(
        path: '/api/v1/admin/sheets/{type}/entries/{entry}',
        operationId: 'adminSheetEntriesShow',
        summary: 'Get one synced spreadsheet row',
        security: [['sanctum' => []]],
        tags: ['Project Sheets'],
        parameters: [
            new OA\Parameter(name: 'type', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['bp', 'gp', 'sp', 'kc'])),
            new OA\Parameter(name: 'entry', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(ListAdminSheetEntriesRequest $request, string $type, int $entry): JsonResponse
    {
        $sheetEntry = ProjectSheetEntry::query()
            ->with(['project:id,business_name,company_id,site_code'])
            ->where('sheet_type', $type)
            ->findOrFail($entry);

        return ApiResponse::success(new AdminSheetEntryResource($sheetEntry));
    }
}
