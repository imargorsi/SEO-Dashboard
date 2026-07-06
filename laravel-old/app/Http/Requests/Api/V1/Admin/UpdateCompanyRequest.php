<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('super_admin') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Company $company */
        $company = $this->route('company');

        $pocUser = User::query()
            ->where('company_id', $company->id)
            ->where('email', $company->poc_email)
            ->first();

        return [
            'company_name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('companies', 'slug')->ignore($company->id)],
            'poc_name' => ['sometimes', 'string', 'max:255'],
            'poc_email' => [
                'sometimes',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($pocUser?->id),
            ],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
