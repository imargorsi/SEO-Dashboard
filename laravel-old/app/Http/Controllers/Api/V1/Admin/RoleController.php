<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Core\Queries\AdminRoleListQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\IndexRolesRequest;
use App\Http\Requests\Api\V1\Admin\StoreRoleRequest;
use App\Http\Requests\Api\V1\Admin\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Support\Api\ApiResponse;
use App\Support\Permission\PermissionGuard;
use App\Support\Permission\PermissionRoleAssigner;
use App\Support\Permission\ProtectedRoles;
use App\Support\Permission\RoleUserCount;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class RoleController extends Controller
{
    #[OA\Get(
        path: '/api/v1/admin/roles',
        operationId: 'adminRolesIndex',
        summary: 'List roles (paginated, searchable, sortable)',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100)),
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(
                name: 'sort',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string', enum: ['name', 'guard_name', 'created_at', 'permissions_count', 'users_count'])
            ),
            new OA\Parameter(name: 'direction', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['asc', 'desc'])),
        ],
        responses: [
            new OA\Response(response: 200, description: 'OK — data.items (Role[]), data.pagination, data.filters'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function index(IndexRolesRequest $request): JsonResponse
    {
        $state = $request->listState();

        $query = AdminRoleListQuery::base();
        AdminRoleListQuery::apply($query, $state);

        $paginator = $query->paginate($state->per_page)->withQueryString();

        return ApiResponse::paginated($paginator, RoleResource::class, $state, $request);
    }

    #[OA\Get(
        path: '/api/v1/admin/roles/{role}',
        operationId: 'adminRolesShow',
        summary: 'Get one role with permissions',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        parameters: [
            new OA\Parameter(
                name: 'role',
                in: 'path',
                required: true,
                description: 'Role id (e.g. `3`) or name (e.g. `content_manager`)',
                schema: new OA\Schema(type: 'string', example: 'content_manager')
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
                        new OA\Property(property: 'data', ref: '#/components/schemas/Role'),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(Role $role): JsonResponse
    {
        $this->ensureWebGuard($role);

        RoleUserCount::attach($role->load('permissions')->loadCount('permissions'));

        return ApiResponse::success(new RoleResource($role));
    }

    #[OA\Post(
        path: '/api/v1/admin/roles',
        operationId: 'adminRolesStore',
        summary: 'Create role',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/RoleStoreRequest')
        ),
        responses: [
            new OA\Response(response: 201, description: 'Created'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => PermissionGuard::WEB,
        ]);

        if (array_key_exists('permissions', $validated)) {
            $role->syncPermissions($validated['permissions']);
        }

        RoleUserCount::attach($role->load('permissions')->loadCount('permissions'));

        return (new RoleResource($role))->response()->setStatusCode(201);
    }

    #[OA\Put(
        path: '/api/v1/admin/roles/{role}',
        operationId: 'adminRolesUpdate',
        summary: 'Update role (name and/or sync permissions)',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        parameters: [
            new OA\Parameter(
                name: 'role',
                in: 'path',
                required: true,
                description: 'Role id or name',
                schema: new OA\Schema(type: 'string', example: 'content_manager')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/RoleUpdateRequest')
        ),
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error (includes protected system roles)'),
        ]
    )]
    #[OA\Patch(
        path: '/api/v1/admin/roles/{role}',
        operationId: 'adminRolesUpdatePatch',
        summary: 'Partially update role',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        parameters: [
            new OA\Parameter(
                name: 'role',
                in: 'path',
                required: true,
                description: 'Role id or name',
                schema: new OA\Schema(type: 'string', example: 'content_manager')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/RoleUpdateRequest')
        ),
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $this->ensureWebGuard($role);

        $validated = $request->validated();

        if ($validated === []) {
            return ApiResponse::success(
                new RoleResource(RoleUserCount::attach($role->load('permissions')->loadCount('permissions')))
            );
        }

        if (array_key_exists('name', $validated)) {
            $role->name = $validated['name'];
            $role->save();
        }

        if (array_key_exists('permissions', $validated)) {
            $role->syncPermissions($validated['permissions']);
        }

        RoleUserCount::attach($role->refresh()->load('permissions')->loadCount('permissions'));

        return ApiResponse::success(new RoleResource($role), __('Role updated.'));
    }

    #[OA\Delete(
        path: '/api/v1/admin/roles/{role}',
        operationId: 'adminRolesDestroy',
        summary: 'Delete role',
        description: 'Cannot delete system roles (`super_admin`, `company_admin`) or roles assigned to users.',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        parameters: [
            new OA\Parameter(
                name: 'role',
                in: 'path',
                required: true,
                description: 'Role id or name',
                schema: new OA\Schema(type: 'string', example: 'content_manager')
            ),
        ],
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Cannot delete (protected or in use)'),
        ]
    )]
    public function destroy(Role $role): JsonResponse
    {
        $this->ensureWebGuard($role);

        if (ProtectedRoles::isProtected($role->name)) {
            return ApiResponse::error(__('System roles cannot be deleted.'), status: 422);
        }

        if (RoleUserCount::for($role) > 0) {
            return ApiResponse::error(__('Roles assigned to users cannot be deleted.'), status: 422);
        }

        PermissionRoleAssigner::deleteRole($role);

        return ApiResponse::success(null, __('Role deleted.'));
    }

    private function ensureWebGuard(Role $role): void
    {
        if ($role->guard_name !== PermissionGuard::WEB) {
            abort(404);
        }
    }
}
