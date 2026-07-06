<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\Permission\PermissionRoleAssigner;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = (string) env('SUPER_ADMIN_EMAIL', 'superadmin@example.com');
        $password = (string) env('SUPER_ADMIN_PASSWORD', '123456');

        $user = User::query()->firstOrCreate(
            ['email' => $email],
            [
                'company_id' => null,
                'name' => 'Super Admin',
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]
        );

        // Super admin is global: never tied to a tenant company.
        $user->forceFill(['company_id' => null])->save();

        if (! $user->hasRole('super_admin')) {
            $user->assignRole('super_admin');
        }

        PermissionRoleAssigner::syncSuperAdminWithAllPermissions();
    }
}
