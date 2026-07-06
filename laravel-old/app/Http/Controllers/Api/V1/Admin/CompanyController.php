<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Core\Queries\AdminCompanyListQuery;
use App\Core\Services\CompanyProvisioner;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\IndexCompaniesRequest;
use App\Http\Requests\Api\V1\Admin\StoreCompanyRequest;
use App\Http\Requests\Api\V1\Admin\UpdateCompanyRequest;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use App\Models\User;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class CompanyController extends Controller
{
    #[OA\Get(
        path: '/api/v1/admin/companies',
        operationId: 'adminCompaniesIndex',
        summary: 'List companies (paginated, searchable, sortable)',
        description: 'Omit `status` to list all companies (same as before). Use `?status=pending` for self-registration requests awaiting approval.',
        security: [['sanctum' => []]],
        tags: ['Admin'],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100)),
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(
                name: 'status',
                in: 'query',
                required: false,
                description: 'Optional filter. Omit for all companies (backward compatible).',
                schema: new OA\Schema(type: 'string', enum: ['pending', 'approved', 'rejected'])
            ),
            new OA\Parameter(name: 'sort', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['name', 'slug', 'created_at', 'poc_name', 'poc_email', 'status', 'is_active', 'users_count'])),
            new OA\Parameter(name: 'direction', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['asc', 'desc'])),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'OK — data.items (Company[]), data.pagination, data.filters (CompanyListFilters)',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(
                                    property: 'items',
                                    type: 'array',
                                    items: new OA\Items(ref: '#/components/schemas/Company')
                                ),
                                new OA\Property(property: 'pagination', type: 'object'),
                                new OA\Property(property: 'filters', ref: '#/components/schemas/CompanyListFilters'),
                            ],
                            type: 'object'
                        ),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function index(IndexCompaniesRequest $request): JsonResponse
    {
        $state = $request->listState();

        $query = AdminCompanyListQuery::base();
        AdminCompanyListQuery::apply($query, $state, $request->statusFilter());

        $paginator = $query
            ->paginate($state->per_page)
            ->withQueryString();

        return ApiResponse::paginated($paginator, CompanyResource::class, $request->filterPayload(), $request);
    }

    #[OA\Get(
        path: '/api/v1/admin/companies/{company}',
        operationId: 'adminCompaniesShow',
        summary: 'Get one company',
        security: [['sanctum' => []]],
        tags: ['Admin'],
        parameters: [
            new OA\Parameter(name: 'company', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'OK',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'data', ref: '#/components/schemas/Company'),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function show(Company $company): JsonResponse
    {
        return ApiResponse::success(
            new CompanyResource($company->loadCount('users'))
        );
    }

    #[OA\Post(
        path: '/api/v1/admin/companies',
        operationId: 'adminCompaniesStore',
        summary: 'Create company and company-admin account for the POC',
        description: 'Backward compatible: same JSON body as before. Server sets `status` to `approved` and emails a generated password to the POC.',
        requestBody: new OA\RequestBody(
            required: true,
            description: 'Send a JSON object. In Swagger **Try it out**, scroll to **Request body** and edit the JSON (Swagger shows one editor, not separate form fields).',
            content: new OA\JsonContent(ref: '#/components/schemas/AdminStoreCompanyRequest')
        ),
        security: [['sanctum' => []]],
        tags: ['Admin'],
        responses: [
            new OA\Response(
                response: 201,
                description: 'Created — `data.status` is `approved`',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'data', ref: '#/components/schemas/Company'),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreCompanyRequest $request, CompanyProvisioner $provisioner): JsonResponse
    {
        $validated = $request->validated();

        $company = $provisioner->provision([
            'company_name' => $validated['company_name'],
            'poc_name' => $validated['poc_name'],
            'poc_email' => $validated['poc_email'],
            'status' => Company::STATUS_APPROVED,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return (new CompanyResource($company->loadCount('users')))->response()->setStatusCode(201);
    }

    #[OA\Post(
        path: '/api/v1/admin/companies/{company}/approve',
        operationId: 'adminCompaniesApprove',
        summary: 'Approve a pending company registration',
        description: 'Sets `status` to `approved`, `is_active` to `true`, verifies POC email, and sends an approval email. Returns 422 if the company is not `pending`.',
        security: [['sanctum' => []]],
        tags: ['Admin'],
        parameters: [
            new OA\Parameter(name: 'company', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Approved — company active, POC can sign in',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string'),
                        new OA\Property(property: 'data', ref: '#/components/schemas/Company'),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Not pending'),
        ]
    )]
    public function approve(Company $company, CompanyProvisioner $provisioner): JsonResponse
    {
        $company = $provisioner->approve($company);

        return ApiResponse::success(
            new CompanyResource($company->loadCount('users')),
            __('Company approved.')
        );
    }

    #[OA\Put(
        path: '/api/v1/admin/companies/{company}',
        operationId: 'adminCompaniesUpdate',
        summary: 'Update company',
        security: [['sanctum' => []]],
        tags: ['Admin'],
        parameters: [
            new OA\Parameter(name: 'company', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(ref: '#/components/schemas/AdminUpdateCompanyRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'OK',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'data', ref: '#/components/schemas/Company'),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    #[OA\Patch(
        path: '/api/v1/admin/companies/{company}',
        operationId: 'adminCompaniesUpdatePatch',
        summary: 'Partially update company',
        security: [['sanctum' => []]],
        tags: ['Admin'],
        parameters: [
            new OA\Parameter(name: 'company', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(ref: '#/components/schemas/AdminUpdateCompanyRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'OK',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'data', ref: '#/components/schemas/Company'),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateCompanyRequest $request, Company $company): JsonResponse
    {
        $validated = $request->validated();

        if ($validated === []) {
            return ApiResponse::success(
                new CompanyResource($company->loadCount('users'))
            );
        }

        $oldPocEmail = $company->poc_email;

        DB::transaction(function () use ($company, $validated, $oldPocEmail): void {
            if (array_key_exists('company_name', $validated)) {
                $company->name = $validated['company_name'];
            }
            if (array_key_exists('slug', $validated)) {
                $company->slug = $validated['slug'];
            }
            if (array_key_exists('poc_name', $validated)) {
                $company->poc_name = $validated['poc_name'];
            }
            if (array_key_exists('poc_email', $validated)) {
                $company->poc_email = $validated['poc_email'];
            }
            if (array_key_exists('is_active', $validated)) {
                $company->is_active = $validated['is_active'];
            }
            $company->save();

            $pocUser = User::query()
                ->where('company_id', $company->id)
                ->where('email', $oldPocEmail)
                ->first();

            if ($pocUser === null) {
                $pocUser = User::query()
                    ->where('company_id', $company->id)
                    ->role('company_admin')
                    ->first();
            }

            if ($pocUser !== null) {
                $pocUser->fill([
                    'name' => $company->poc_name ?? $pocUser->name,
                    'email' => $company->poc_email ?? $pocUser->email,
                ]);
                $pocUser->save();
            }
        });

        $company->refresh();

        return ApiResponse::success(
            new CompanyResource($company->loadCount('users')),
            __('Company updated.')
        );
    }

    #[OA\Delete(
        path: '/api/v1/admin/companies/{company}',
        operationId: 'adminCompaniesDestroy',
        summary: 'Delete company',
        security: [['sanctum' => []]],
        tags: ['Admin'],
        parameters: [
            new OA\Parameter(name: 'company', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 403, description: 'Forbidden'),
        ]
    )]
    public function destroy(Company $company): JsonResponse
    {
        $company->delete();

        return ApiResponse::success(null, __('Company deleted.'));
    }
}
