<?php

namespace App\Sheets\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectSheetEntry;
use App\Sheets\Http\Requests\ListProjectSheetEntriesRequest;
use App\Sheets\Http\Requests\ShowProjectSheetEntryRequest;
use App\Sheets\Http\Resources\ProjectSheetEntryResource;
use App\Core\Queries\ProjectSheetEntryListQuery;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class ProjectSheetController extends Controller
{
    #[OA\Get(
        path: '/api/v1/projects/{project}/sheets/{type}/entries',
        operationId: 'projectSheetEntriesIndex',
        summary: 'List synced sheet entries for a project and sheet type',
        security: [['sanctum' => []]],
        tags: ['Project Sheets'],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'type', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['bp', 'gp', 'sp', 'kc'])),
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100)),
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(
                name: 'sort',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string', enum: ['source_row_number', 'site', 'days', 'occurred_on', 'synced_at', 'created_at'])
            ),
            new OA\Parameter(name: 'direction', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['asc', 'desc'])),
        ],
        responses: [
            new OA\Response(response: 200, description: 'OK — paginated entries'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function entries(ListProjectSheetEntriesRequest $request, Project $project, string $type): JsonResponse
    {
        $state = $request->listState();

        $query = ProjectSheetEntryListQuery::base($project->id, $type);
        ProjectSheetEntryListQuery::apply($query, $state);

        $paginator = $query
            ->paginate($state->per_page)
            ->withQueryString();

        return ApiResponse::paginated(
            $paginator,
            ProjectSheetEntryResource::class,
            $request->filterPayload(),
            $request
        );
    }

    #[OA\Get(
        path: '/api/v1/projects/{project}/sheets/{type}/entries/{entry}',
        operationId: 'projectSheetEntriesShow',
        summary: 'Get one synced sheet entry',
        security: [['sanctum' => []]],
        tags: ['Project Sheets'],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'type', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['bp', 'gp', 'sp', 'kc'])),
            new OA\Parameter(name: 'entry', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(ShowProjectSheetEntryRequest $request, Project $project, string $type, int $entry): JsonResponse
    {
        $sheetEntry = ProjectSheetEntry::query()
            ->where('project_id', $project->id)
            ->where('sheet_type', $type)
            ->findOrFail($entry);

        return ApiResponse::success(new ProjectSheetEntryResource($sheetEntry));
    }
}
