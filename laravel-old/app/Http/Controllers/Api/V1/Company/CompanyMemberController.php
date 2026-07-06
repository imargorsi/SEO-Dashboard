<?php

namespace App\Http\Controllers\Api\V1\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Company\StoreCompanyMemberRequest;
use App\Http\Requests\Api\V1\Company\UpdateCompanyMemberRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use OpenApi\Attributes as OA;

class CompanyMemberController extends Controller
{
    #[OA\Get(
        path: '/api/v1/company/members',
        operationId: 'companyMembersIndex',
        summary: 'List company members (paginated, searchable)',
        security: [['sanctum' => []]],
        tags: ['Company'],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100)),
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'OK — paginated members',
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
                                    items: new OA\Items(ref: '#/components/schemas/User')
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
                            ],
                            type: 'object'
                        ),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $company = $request->user()->company;

        $query = User::query()
            ->where('company_id', $company->id)
            ->with('roles');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $paginator = $query
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15))
            ->withQueryString();

        return ApiResponse::paginated($paginator, UserResource::class, [], $request);
    }

    #[OA\Post(
        path: '/api/v1/company/members',
        operationId: 'companyMembersStore',
        summary: 'Add a member to company',
        description: 'Creates a new user and assigns them to the company with the specified role. A password reset link will be sent to the user.',
        security: [['sanctum' => []]],
        tags: ['Company'],
        requestBody: new OA\RequestBody(
            required: true,
            description: 'Send a JSON object. In Swagger **Try it out**, edit the **Request body** JSON below.',
            content: new OA\JsonContent(ref: '#/components/schemas/CompanyMemberStoreRequest')
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Created',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string'),
                        new OA\Property(property: 'data', ref: '#/components/schemas/User'),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreCompanyMemberRequest $request): JsonResponse
    {
        $company = $request->user()->company;

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make(str()->random(32)),
            'company_id' => $company->id,
        ]);

        $user->assignRole($request->role);

        Password::sendResetLink(['email' => $user->email]);

        return ApiResponse::success(
            new UserResource($user->load('roles')),
            __('Member added successfully. Password reset link sent.')
        )->setStatusCode(201);
    }

    #[OA\Get(
        path: '/api/v1/company/members/{user}',
        operationId: 'companyMembersShow',
        summary: 'Get a company member',
        security: [['sanctum' => []]],
        tags: ['Company'],
        parameters: [
            new OA\Parameter(name: 'user', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'OK',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', nullable: true),
                        new OA\Property(property: 'data', ref: '#/components/schemas/User'),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(Request $request, User $user): JsonResponse
    {
        $company = $request->user()->company;

        if ($user->company_id !== $company->id) {
            return ApiResponse::error(__('Member not found in your company.'), status: 404);
        }

        return ApiResponse::success(
            new UserResource($user->load('roles'))
        );
    }

    #[OA\Put(
        path: '/api/v1/company/members/{user}',
        operationId: 'companyMembersUpdate',
        summary: 'Update a company member',
        description: 'Send only the fields you want to change.',
        security: [['sanctum' => []]],
        tags: ['Company'],
        parameters: [
            new OA\Parameter(name: 'user', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            description: 'Partial JSON body — send only fields to change.',
            content: new OA\JsonContent(ref: '#/components/schemas/CompanyMemberUpdateRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'OK',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string'),
                        new OA\Property(property: 'data', ref: '#/components/schemas/User'),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    #[OA\Patch(
        path: '/api/v1/company/members/{user}',
        operationId: 'companyMembersUpdatePatch',
        summary: 'Partially update a company member',
        description: 'Same body as PUT — send only fields to change.',
        security: [['sanctum' => []]],
        tags: ['Company'],
        parameters: [
            new OA\Parameter(name: 'user', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/CompanyMemberUpdateRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'OK',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string'),
                        new OA\Property(property: 'data', ref: '#/components/schemas/User'),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateCompanyMemberRequest $request, User $user): JsonResponse
    {
        $company = $request->user()->company;

        if ($user->company_id !== $company->id) {
            return ApiResponse::error(__('Member not found in your company.'), status: 404);
        }

        if ($request->filled('name')) {
            $user->name = $request->name;
        }

        if ($request->filled('role')) {
            $user->syncRoles([$request->role]);
        }

        $user->save();

        return ApiResponse::success(
            new UserResource($user->load('roles')),
            __('Member updated successfully.')
        );
    }

    #[OA\Delete(
        path: '/api/v1/company/members/{user}',
        operationId: 'companyMembersDestroy',
        summary: 'Remove a member from company',
        security: [['sanctum' => []]],
        tags: ['Company'],
        parameters: [
            new OA\Parameter(name: 'user', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'OK',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string'),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function destroy(Request $request, User $user): JsonResponse
    {
        $company = $request->user()->company;

        if ($user->company_id !== $company->id) {
            return ApiResponse::error(__('Member not found in your company.'), status: 404);
        }

        if ($user->id === $request->user()->id) {
            return ApiResponse::error(__('You cannot remove yourself from the company.'), status: 403);
        }

        $user->delete();

        return ApiResponse::success(null, __('Member removed successfully.'));
    }
}
