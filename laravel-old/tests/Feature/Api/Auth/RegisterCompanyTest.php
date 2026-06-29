<?php

namespace Tests\Feature\Api\Auth;

use App\Mail\CompanyRegistrationPendingMail;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RegisterCompanyTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_register_company_as_pending(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/v1/auth/register-company', [
            'company_name' => 'Self Serve SEO',
            'poc_name' => 'Alex Owner',
            'poc_email' => 'alex@selfserve.example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Self Serve SEO')
            ->assertJsonPath('data.status', Company::STATUS_PENDING)
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('companies', [
            'name' => 'Self Serve SEO',
            'status' => Company::STATUS_PENDING,
            'is_active' => false,
        ]);

        $poc = User::query()->where('email', 'alex@selfserve.example.com')->first();
        $this->assertNotNull($poc);
        $this->assertTrue($poc->hasRole('company_admin'));
        $this->assertTrue(Hash::check('Password1!', $poc->password));
        $this->assertNull($poc->email_verified_at);

        Mail::assertSent(CompanyRegistrationPendingMail::class);
    }

    public function test_pending_company_cannot_login(): void
    {
        Mail::fake();

        $this->postJson('/api/v1/auth/register-company', [
            'company_name' => 'Pending Co',
            'poc_name' => 'Pat',
            'poc_email' => 'pat@pending.example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ])->assertCreated();

        $this->postJson('/api/v1/auth/login', [
            'email' => 'pat@pending.example.com',
            'password' => 'Password1!',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_duplicate_poc_email_is_rejected(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/v1/auth/register-company', [
            'company_name' => 'Dup Co',
            'poc_name' => 'X',
            'poc_email' => 'taken@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false);
    }
}
