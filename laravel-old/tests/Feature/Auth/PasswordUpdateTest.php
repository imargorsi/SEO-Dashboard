<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PasswordUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_can_be_updated(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/me/password', [
            'current_password' => 'password',
            'password' => 'New-password-1',
            'password_confirmation' => 'New-password-1',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', __('Password updated.'));

        $this->assertTrue(Hash::check('New-password-1', $user->refresh()->password));
    }

    public function test_correct_password_must_be_provided_to_update_password(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/me/password', [
            'current_password' => 'wrong-password',
            'password' => 'New-password-1',
            'password_confirmation' => 'New-password-1',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false);
    }
}
