<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Models\Role;
use App\Support\Permission\PermissionGuard;
use App\Support\Permission\ProtectedRoles;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateRoleRequest extends FormRequest
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
        /** @var Role $role */
        $role = $this->route('role');

        return [
            'name' => [
                'sometimes',
                'string',
                'max:255',
                'regex:/^[a-z][a-z0-9_]*$/',
                Rule::unique('roles', 'name')
                    ->where('guard_name', PermissionGuard::WEB)
                    ->ignore($role->id),
            ],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => [
                'required',
                'string',
                'max:255',
                Rule::exists('permissions', 'name')->where('guard_name', PermissionGuard::WEB),
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            /** @var Role $role */
            $role = $this->route('role');

            if ($this->filled('name') && ProtectedRoles::isProtected($role->name)) {
                $requestedName = (string) $this->input('name');

                if ($requestedName !== $role->name) {
                    $validator->errors()->add('name', __('System roles cannot be renamed.'));
                }
            }

            if ($this->has('permissions') && ProtectedRoles::permissionsAreManaged($role->name)) {
                $validator->errors()->add(
                    'permissions',
                    __('super_admin always has every permission; use permission create/update to change access.')
                );
            }
        });
    }
}
