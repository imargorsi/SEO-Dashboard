<?php

namespace Tests\Feature\Api\Admin;

use App\Mail\CompanyApprovedMail;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApproveCompanyTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_approve_pending_company(): void
    {
        Mail::fake();

        $this->postJson('/api/v1/auth/register-company', [
            'company_name' => 'Awaiting Approval LLC',
            'poc_name' => 'Sam',
            'poc_email' => 'sam@awaiting.example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ])->assertCreated();

        $company = Company::query()->where('name', 'Awaiting Approval LLC')->first();
        $this->assertNotNull($company);
        $this->assertTrue($company->isPending());

        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/admin/companies/{$company->id}/approve")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', Company::STATUS_APPROVED)
            ->assertJsonPath('data.is_active', true);

        $company->refresh();
        $this->assertTrue($company->isApproved());
        $this->assertTrue($company->is_active);

        $poc = User::query()->where('email', 'sam@awaiting.example.com')->first();
        $this->assertNotNull($poc);
        $this->assertNotNull($poc->email_verified_at);

        Mail::assertSent(CompanyApprovedMail::class);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'sam@awaiting.example.com',
            'password' => 'Password1!',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['token', 'user']]);
    }

    public function test_approve_non_pending_company_returns_422(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        $this->postJson('/api/v1/admin/companies', [
            'company_name' => 'Already Live',
            'poc_name' => 'Live',
            'poc_email' => 'live@example.com',
        ])->assertCreated();

        $company = Company::query()->where('name', 'Already Live')->first();
        $this->assertNotNull($company);

        $this->postJson("/api/v1/admin/companies/{$company->id}/approve")
            ->assertStatus(422);
    }
}
