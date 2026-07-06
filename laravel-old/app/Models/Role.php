<?php

namespace App\Models;

use App\Support\Permission\PermissionGuard;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    /**
     * Resolve route binding by numeric id or role name (e.g. content_manager).
     */
    public function resolveRouteBinding($value, $field = null): ?static
    {
        if ($field !== null) {
            return parent::resolveRouteBinding($value, $field);
        }

        $query = static::query()->where('guard_name', PermissionGuard::WEB);

        if (ctype_digit((string) $value)) {
            return $query->whereKey((int) $value)->first();
        }

        return $query->where('name', $value)->first();
    }
}
