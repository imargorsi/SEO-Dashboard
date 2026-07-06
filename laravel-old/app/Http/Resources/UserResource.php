<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin User */
class UserResource extends JsonResource
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
            'email' => $this->email,
            'profile_image' => $this->profileImageUrl(),
            'email_verified_at' => $this->email_verified_at,
            'company_id' => $this->company_id,
            'roles' => $this->getRoleNames()->values(),
            'permissions' => $this->resource->getAllPermissions()->pluck('name')->unique()->values(),
            'home_api_path' => $this->homeApiPath(),
        ];
    }

    private function homeApiPath(): ?string
    {
        if ($this->resource->hasRole('super_admin')) {
            return '/api/v1/admin/dashboard';
        }

        if ($this->resource->hasRole('company_admin')) {
            return '/api/v1/company/dashboard';
        }

        return null;
    }

    private function profileImageUrl(): ?string
    {
        if (! is_string($this->profile_image) || $this->profile_image === '') {
            return null;
        }

        return url(Storage::disk('public')->url($this->profile_image));
    }
}
