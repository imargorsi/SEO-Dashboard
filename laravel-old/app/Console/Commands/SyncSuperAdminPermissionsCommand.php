<?php

namespace App\Console\Commands;

use App\Support\Permission\PermissionRoleAssigner;
use Illuminate\Console\Command;

class SyncSuperAdminPermissionsCommand extends Command
{
    protected $signature = 'permission:sync-super-admin';

    protected $description = 'Give the super_admin role every permission in the database';

    public function handle(): int
    {
        PermissionRoleAssigner::syncSuperAdminWithAllPermissions();

        $this->info('super_admin permissions synced with all permissions in the database.');

        return self::SUCCESS;
    }
}
