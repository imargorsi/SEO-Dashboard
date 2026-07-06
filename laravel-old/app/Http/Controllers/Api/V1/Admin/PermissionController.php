<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Core\Queries\AdminPermissionListQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\IndexPermissionsRequest;
use App\Http\Requests\Api\V1\Admin\StorePermissionRequest;
use App\Http\Requests\Api\V1\Admin\UpdatePermissionRequest;
use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use App\Support\Api\ApiResponse;
use App\Support\Permission\PermissionGuard;
use App\Support\Permission\PermissionRoleAssigner;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class PermissionController extends Controller
{
    #[OA\Get(
        path: '/api/v1/admin/permissions',
        operationId: 'adminPermissionsIndex',
        summary: 'List permissions (paginated, searchable, sortable)',
        security: [['sanctum' => []]],
        tags: ['Permissions'],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100)),
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(
                name: 'sort',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string', enum: ['name', 'guard_name', 'created_at', 'roles_count'])
            ),
            new OA\Parameter(name: 'direction', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['asc', 'desc'])),
        ],
        responses: [
            new OA\Response(response: 200, description: 'OK — data.items (Permission[]), data.pagination, data.filters'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function index(IndexPermissionsRequest $request): JsonResponse
    {
        $state = $request->listState();

        $query = AdminPermissionListQuery::base();
        AdminPermissionListQuery::apply($query, $state);

        $paginator = $query->paginate($state->per_page)->withQueryString();

        return ApiResponse::paginated($paginator, PermissionResource::class, $state, $request);
    }

    #[OA\Get(
        path: '/api/v1/admin/permissions/{permission}',
        operationId: 'adminPermissionsShow',
        summary: 'Get one permission',
        security: [['sanctum' => []]],
        tags: ['Permissions'],
        parameters: [
            new OA\Parameter(
                name: 'permission',
                in: 'path',
                required: true,
                description: 'Permission id (e.g. `12`) or name (e.g. `admin.companies.view`)',
                schema: new OA\Schema(type: 'string', example: 'admin.companies.view')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'OK',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', nullable: true),
                        new OA\Property(property: 'data', ref: '#/components/schemas/Permission'),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(Permission $permission): JsonResponse
    {
        $this->ensureWebGuard($permission);

        $permission->load('roles')->loadCount('roles');

        return ApiResponse::success(new PermissionResource($permission));
    }

    #[OA\Post(
        path: '/api/v1/admin/permissions',
        operationId: 'adminPermissionsStore',
        summary: 'Create permission and attach to role(s)',
        description: 'Creates the permission and links it in `role_has_permissions`. `super_admin` always receives the new permission. If `roles` is omitted, `company.*` is also linked to `company_admin`.',
        security: [['sanctum' => []]],
        tags: ['Permissions'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/PermissionStoreRequest')
        ),
        responses: [
            new OA\Response(response: 201, description: 'Created'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StorePermissionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $permission = Permission::create([
            'name' => $validated['name'],
            'guard_name' => PermissionGuard::WEB,
        ]);

        $roleNames = $validated['roles']
            ?? PermissionRoleAssigner::defaultRolesForPermissionName($validated['name']);

        PermissionRoleAssigner::attach($permission, $roleNames);

        $permission->load('roles')->loadCount('roles');

        return (new PermissionResource($permission))->response()->setStatusCode(201);
    }

    #[OA\Put(
        path: '/api/v1/admin/permissions/{permission}',
        operationId: 'adminPermissionsUpdate',
        summary: 'Update permission name',
        security: [['sanctum' => []]],
        tags: ['Permissions'],
        parameters: [
            new OA\Parameter(
                name: 'permission',
                in: 'path',
                required: true,
                description: 'Permission id (e.g. `12`) or name (e.g. `admin.companies.view`)',
                schema: new OA\Schema(type: 'string', example: 'admin.companies.view')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/PermissionUpdateRequest')
        ),
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    #[OA\Patch(
        path: '/api/v1/admin/permissions/{permission}',
        operationId: 'adminPermissionsUpdatePatch',
        summary: 'Partially update permission',
        security: [['sanctum' => []]],
        tags: ['Permissions'],
        parameters: [
            new OA\Parameter(
                name: 'permission',
                in: 'path',
                required: true,
                description: 'Permission id (e.g. `12`) or name (e.g. `admin.companies.view`)',
                schema: new OA\Schema(type: 'string', example: 'admin.companies.view')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/PermissionUpdateRequest')
        ),
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdatePermissionRequest $request, Permission $permission): JsonResponse
    {
        $this->ensureWebGuard($permission);

        $validated = $request->validated();

        if ($validated === []) {
            return ApiResponse::success(new PermissionResource($permission->loadCount('roles')));
        }

        if (array_key_exists('name', $validated)) {
            $permission->name = $validated['name'];
            $permission->save();
        }

        if (array_key_exists('roles', $validated)) {
            PermissionRoleAssigner::syncRoles($permission, $validated['roles']);
        }

        $permission->refresh()->load('roles')->loadCount('roles');

        return ApiResponse::success(new PermissionResource($permission), __('Permission updated.'));
    }

    #[OA\Delete(
        path: '/api/v1/admin/permissions/{permission}',
        operationId: 'adminPermissionsDestroy',
        summary: 'Delete permission',
        security: [['sanctum' => []]],
        tags: ['Permissions'],
        parameters: [
            new OA\Parameter(
                name: 'permission',
                in: 'path',
                required: true,
                description: 'Permission id (e.g. `12`) or name (e.g. `admin.companies.view`)',
                schema: new OA\Schema(type: 'string', example: 'admin.companies.view')
            ),
        ],
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function destroy(Permission $permission): JsonResponse
    {
        $this->ensureWebGuard($permission);

        PermissionRoleAssigner::deletePermission($permission);

        return ApiResponse::success(null, __('Permission deleted.'));
    }

    private function ensureWebGuard(Permission $permission): void
    {
        if ($permission->guard_name !== PermissionGuard::WEB) {
            abort(404);
        }
    }
}
