<?php

namespace App\Http\Requests\Api\V1\Projects\Concerns;

trait AuthorizesProjectAccess
{
    protected function userCanAccessProjects(): bool
    {
        $user = $this->user();

        if ($user === null) {
            return false;
        }

        if ($user->hasRole('super_admin')) {
            return true;
        }

        if (! $user->hasRole('company_admin')) {
            return false;
        }

        $user->loadMissing('company');

        return $user->company_id !== null && $user->company?->isAccessible() === true;
    }

    protected function userIsCompanyAdminOnly(): bool
    {
        $user = $this->user();

        return $user !== null
            && $user->hasRole('company_admin')
            && ! $user->hasRole('super_admin');
    }
}
