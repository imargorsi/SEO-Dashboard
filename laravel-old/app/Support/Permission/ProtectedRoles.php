<?php

namespace App\Support\Permission;

final class ProtectedRoles
{
    /** @var list<string> */
    public const NAMES = ['super_admin', 'company_admin'];

    public static function isProtected(string $name): bool
    {
        return in_array($name, self::NAMES, true);
    }

    /**
     * System roles whose permission set is managed by seeders / sync, not role PATCH.
     */
    public static function permissionsAreManaged(string $name): bool
    {
        return $name === 'super_admin';
    }
}
