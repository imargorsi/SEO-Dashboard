<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Support\Permission\PermissionGuard;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePermissionRequest extends FormRequest
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
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z][a-z0-9_.]*$/',
                Rule::unique('permissions', 'name')->where('guard_name', PermissionGuard::WEB),
            ],
            'roles' => ['sometimes', 'array', 'min:1'],
            'roles.*' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z][a-z0-9_]*$/',
                Rule::exists('roles', 'name')->where('guard_name', PermissionGuard::WEB),
            ],
        ];
    }
}
