<?php

namespace App\Http\Resources;

use App\Models\Role;
use App\Support\Permission\ProtectedRoles;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Role */
class RoleResource extends JsonResource
{
    public static $wrap = null;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'guard_name' => $this->guard_name,
            'permissions' => $this->whenLoaded(
                'permissions',
                fn () => $this->permissions->pluck('name')->values()->all()
            ),
            'users_count' => $this->whenCounted('users'),
            'permissions_count' => $this->whenCounted('permissions'),
            'is_system' => ProtectedRoles::isProtected($this->name),
            'name_editable' => ! ProtectedRoles::isProtected($this->name),
            'permissions_editable' => ! ProtectedRoles::permissionsAreManaged($this->name),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
