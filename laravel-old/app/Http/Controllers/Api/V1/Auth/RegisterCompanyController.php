<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Core\Services\CompanyProvisioner;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\RegisterCompanyRequest;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class RegisterCompanyController extends Controller
{
    #[OA\Post(
        path: '/api/v1/auth/register-company',
        operationId: 'authRegisterCompany',
        summary: 'Self-register a company (pending admin approval)',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/RegisterCompanyRequest')
        ),
        tags: ['Auth'],
        responses: [
            new OA\Response(
                response: 201,
                description: 'Registered — `data.status` is `pending`; POC cannot log in until admin approves',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string'),
                        new OA\Property(property: 'data', ref: '#/components/schemas/Company'),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function __invoke(RegisterCompanyRequest $request, CompanyProvisioner $provisioner): JsonResponse
    {
        $validated = $request->validated();

        $company = $provisioner->provision([
            'company_name' => $validated['company_name'],
            'poc_name' => $validated['poc_name'],
            'poc_email' => $validated['poc_email'],
            'password' => $validated['password'],
            'status' => Company::STATUS_PENDING,
            'is_active' => false,
        ]);

        return ApiResponse::success(
            new CompanyResource($company->loadCount('users')),
            __('Registration received. Your account is pending admin approval.'),
            201
        );
    }
}
