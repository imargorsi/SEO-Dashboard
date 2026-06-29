<?php

namespace App\Http\Controllers\Api\V1;

use App\Core\Queries\AdminProjectListQuery;
use App\Http\Controllers\Api\V1\Concerns\InteractsWithProjectPayload;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Projects\DestroyProjectRequest;
use App\Http\Requests\Api\V1\Projects\IndexProjectsRequest;
use App\Http\Requests\Api\V1\Projects\StoreProjectRequest;
use App\Http\Requests\Api\V1\Projects\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class ProjectController extends Controller
{
    use InteractsWithProjectPayload;

    #[OA\Get(
        path: '/api/v1/projects',
        operationId: 'projectsIndex',
        summary: 'List SEO projects (paginated, searchable, sortable)',
        description: <<<'MD'
**super_admin** — list all projects, or pass optional query `company_id` to return only that tenant's projects.

**company_admin** — always scoped to own company (`company_id` query param is prohibited).

Response `data.filters` echoes applied list state, including `company_id` when scoped.
MD,
        security: [['sanctum' => []]],
        tags: ['Projects'],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100)),
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'sort', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['business_name', 'website_url', 'created_at', 'company_id'])),
            new OA\Parameter(name: 'direction', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['asc', 'desc'])),
            new OA\Parameter(
                name: 'company_id',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer', example: 8),
                description: 'Optional. **super_admin** — return only projects for this company; omit for all companies. **company_admin** — ignored (always scoped to own company).'
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'OK — paginated projects',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', nullable: true, example: null),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(
                                    property: 'items',
                                    type: 'array',
                                    items: new OA\Items(ref: '#/components/schemas/Project')
                                ),
                                new OA\Property(
                                    property: 'pagination',
                                    properties: [
                                        new OA\Property(property: 'total', type: 'integer', example: 1),
                                        new OA\Property(property: 'current_page', type: 'integer', example: 1),
                                        new OA\Property(property: 'per_page', type: 'integer', example: 15),
                                        new OA\Property(property: 'last_page', type: 'integer', example: 1),
                                    ],
                                    type: 'object'
                                ),
                                new OA\Property(property: 'filters', ref: '#/components/schemas/ProjectListFilters'),
                            ],
                            type: 'object'
                        ),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error (e.g. company_admin sent `company_id`)'),
        ]
    )]
    public function index(IndexProjectsRequest $request): JsonResponse
    {
        $state = $request->listState();
        $companyFilter = $request->companyIdFilter();

        $query = AdminProjectListQuery::base();
        AdminProjectListQuery::apply($query, $state, $companyFilter);

        $paginator = $query
            ->paginate($state->per_page)
            ->withQueryString();

        return ApiResponse::paginated($paginator, ProjectResource::class, $request->filterPayload(), $request);
    }

    #[OA\Get(
        path: '/api/v1/projects/{project}',
        operationId: 'projectsShow',
        summary: 'Get one project',
        description: '**company_admin** only sees projects belonging to their company.',
        security: [['sanctum' => []]],
        tags: ['Projects'],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(Project $project): JsonResponse
    {
        $project->load(['seoGoals', 'industryNiche']);

        return ApiResponse::success(new ProjectResource($project));
    }

    #[OA\Post(
        path: '/api/v1/projects',
        operationId: 'projectsStore',
        summary: 'Create project',
        description: '**super_admin** — send `company_id`. **company_admin** — `company_id` is taken from the signed-in user (do not send it).',
        security: [['sanctum' => []]],
        tags: ['Projects'],
        requestBody: new OA\RequestBody(
            required: true,
            description: 'Send a JSON object. In Swagger **Try it out**, edit the **Request body** JSON below.',
            content: new OA\JsonContent(ref: '#/components/schemas/ProjectStoreRequest')
        ),
        responses: [
            new OA\Response(response: 201, description: 'Created'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreProjectRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $project = DB::transaction(function () use ($validated) {
            $project = new Project($this->projectAttributesFromValidated($validated));
            $project->company_id = (int) $validated['company_id'];
            $project->save();
            $project->seoGoals()->sync($validated['seo_goal_ids']);

            return $project;
        });

        $project->load(['seoGoals', 'industryNiche']);

        return (new ProjectResource($project))->response()->setStatusCode(201);
    }

    #[OA\Put(
        path: '/api/v1/projects/{project}',
        operationId: 'projectsUpdate',
        summary: 'Update project',
        description: 'Send only the fields you want to change. **super_admin** may reassign `company_id`; **company_admin** cannot send `company_id`.',
        security: [['sanctum' => []]],
        tags: ['Projects'],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            description: 'Partial JSON body — same fields as create, all optional except you must keep B2B/B2C valid when sending `is_b2b` / `is_b2c`.',
            content: new OA\JsonContent(ref: '#/components/schemas/ProjectUpdateRequest')
        ),
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    #[OA\Patch(
        path: '/api/v1/projects/{project}',
        operationId: 'projectsUpdatePatch',
        summary: 'Partially update project',
        description: 'Same body as PUT — send only fields to change. **company_admin** only updates projects belonging to their company.',
        security: [['sanctum' => []]],
        tags: ['Projects'],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/ProjectUpdateRequest')
        ),
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($project, $validated): void {
            if ($validated === []) {
                return;
            }

            if (array_key_exists('company_id', $validated)) {
                $project->company_id = (int) $validated['company_id'];
            }

            $project->fill($this->projectAttributesFromValidated($validated, forUpdate: true));

            if (array_key_exists('cms_password', $validated)
                && is_string($validated['cms_password'])
                && $validated['cms_password'] !== '') {
                $project->cms_password = $validated['cms_password'];
            }

            $project->save();

            if (array_key_exists('seo_goal_ids', $validated) && is_array($validated['seo_goal_ids'])) {
                $project->seoGoals()->sync($validated['seo_goal_ids']);
            }
        });

        $project->refresh()->load(['seoGoals', 'industryNiche']);

        return ApiResponse::success(
            new ProjectResource($project),
            __('Project updated.')
        );
    }

    #[OA\Delete(
        path: '/api/v1/projects/{project}',
        operationId: 'projectsDestroy',
        summary: 'Delete project',
        security: [['sanctum' => []]],
        tags: ['Projects'],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function destroy(DestroyProjectRequest $request, Project $project): JsonResponse
    {
        $project->delete();

        return ApiResponse::success(null, __('Project deleted.'));
    }
}
