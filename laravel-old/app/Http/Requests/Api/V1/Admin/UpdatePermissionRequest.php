<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Models\Permission;
use App\Support\Permission\PermissionGuard;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePermissionRequest extends FormRequest
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
        /** @var Permission $permission */
        $permission = $this->route('permission');

        return [
            'name' => [
                'sometimes',
                'string',
                'max:255',
                'regex:/^[a-z][a-z0-9_.]*$/',
                Rule::unique('permissions', 'name')
                    ->where('guard_name', PermissionGuard::WEB)
                    ->ignore($permission->id),
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
