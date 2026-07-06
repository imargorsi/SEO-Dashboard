<?php

namespace Tests\Feature\Api\Admin;

use App\Mail\PocCompanyWelcomeMail;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CreateCompanyTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_create_company_with_poc(): void
    {
        Mail::fake();

        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/companies', [
            'company_name' => 'Acme SEO',
            'poc_name' => 'Jane Doe',
            'poc_email' => 'jane@acme.example.com',
            'is_active' => true,
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Acme SEO')
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.poc_name', 'Jane Doe')
            ->assertJsonPath('data.poc_email', 'jane@acme.example.com')
            ->assertJsonMissing(['data.urls', 'data.url']);

        $this->assertDatabaseHas('companies', [
            'name' => 'Acme SEO',
            'poc_name' => 'Jane Doe',
            'poc_email' => 'jane@acme.example.com',
            'is_active' => true,
        ]);

        $company = Company::query()->where('name', 'Acme SEO')->first();
        $this->assertNotNull($company);
        $poc = User::query()->where('email', 'jane@acme.example.com')->first();
        $this->assertNotNull($poc);
        $this->assertTrue($poc->hasRole('company_admin'));
        $this->assertSame($company->id, $poc->company_id);

        Mail::assertSent(PocCompanyWelcomeMail::class, function (PocCompanyWelcomeMail $mail) use ($company, $poc): bool {
            $poc->refresh();

            return $mail->hasTo($poc->email)
                && $mail->company->is($company)
                && $mail->user->is($poc)
                && strlen($mail->plainPassword) >= 8
                && Hash::check($mail->plainPassword, $poc->password);
        });
    }

    public function test_create_defaults_is_active_to_true(): void
    {
        Mail::fake();

        $admin = User::factory()->create();
        $admin->assignRole('super_admin');
        Sanctum::actingAs($admin);

        $this->postJson('/api/v1/admin/companies', [
            'company_name' => 'Beta Co',
            'poc_name' => 'Bob',
            'poc_email' => 'bob@beta.example.com',
        ])->assertCreated()
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('companies', [
            'name' => 'Beta Co',
            'is_active' => true,
        ]);
    }
}
