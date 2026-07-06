<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_can_be_fetched_as_json(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/me/profile')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_profile_name_can_be_updated(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/me/profile', [
            'name' => 'Test User',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Test User');

        $this->assertSame('Test User', $user->refresh()->name);
    }

    public function test_empty_profile_update_is_rejected(): void
    {
        $user = User::factory()->create(['name' => 'Original Name']);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/me/profile', [])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors(['profile']);

        $this->assertSame('Original Name', $user->refresh()->name);
    }

    public function test_updating_name_only_preserves_profile_image(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['name' => 'Before']);
        Sanctum::actingAs($user);

        $this->post('/api/v1/me/profile', [
            'profile_image' => UploadedFile::fake()->image('avatar.jpg'),
        ], ['Accept' => 'application/json'])->assertOk();

        $imagePath = $user->refresh()->profile_image;
        $this->assertNotNull($imagePath);

        $this->postJson('/api/v1/me/profile', ['name' => 'After'])
            ->assertOk()
            ->assertJsonPath('data.name', 'After');

        $user->refresh();

        $this->assertSame('After', $user->name);
        $this->assertSame($imagePath, $user->profile_image);
        Storage::disk('public')->assertExists($imagePath);
    }

    public function test_removing_profile_image_only_preserves_name(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['name' => 'Keep This Name']);
        Sanctum::actingAs($user);

        $this->post('/api/v1/me/profile', [
            'profile_image' => UploadedFile::fake()->image('avatar.jpg'),
        ], ['Accept' => 'application/json'])->assertOk();

        $this->postJson('/api/v1/me/profile', ['remove_profile_image' => true])
            ->assertOk()
            ->assertJsonPath('data.profile_image', null);

        $user->refresh();

        $this->assertSame('Keep This Name', $user->name);
        $this->assertNull($user->profile_image);
    }

    public function test_profile_email_cannot_be_updated(): void
    {
        $user = User::factory()->create(['email' => 'original@example.com']);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/me/profile', [
            'name' => 'Test User',
            'email' => 'new@example.com',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors(['email']);

        $this->assertSame('original@example.com', $user->refresh()->email);
    }

    public function test_profile_image_can_be_uploaded_with_name(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->post('/api/v1/me/profile', [
            'name' => 'Test User',
            'profile_image' => UploadedFile::fake()->image('avatar.jpg', 200, 200),
        ], [
            'Accept' => 'application/json',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Test User');

        $user->refresh();
        $this->assertNotNull($user->profile_image);
        Storage::disk('public')->assertExists($user->profile_image);
        $this->assertNotNull($response->json('data.profile_image'));
    }

    public function test_profile_image_accepts_image_field_alias(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->post('/api/v1/me/profile', [
            'image' => UploadedFile::fake()->image('avatar.png', 100, 100),
        ], [
            'Accept' => 'application/json',
        ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $user->refresh();

        $this->assertNotNull($user->profile_image);
        $this->assertNotNull($user->fresh()->profile_image);
    }

    public function test_auth_user_includes_profile_image_url_after_upload(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->post('/api/v1/me/profile', [
            'profile_image' => UploadedFile::fake()->image('avatar.jpg'),
        ], ['Accept' => 'application/json'])->assertOk();

        $response = $this->getJson('/api/v1/auth/user');

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertNotNull($response->json('data.profile_image'));
    }

    public function test_profile_image_can_be_uploaded_without_name(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['name' => 'Original Name']);
        Sanctum::actingAs($user);

        $this->post('/api/v1/me/profile', [
            'profile_image' => UploadedFile::fake()->image('avatar.jpg', 200, 200),
        ], [
            'Accept' => 'application/json',
        ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $user->refresh();

        $this->assertSame('Original Name', $user->name);
        $this->assertNotNull($user->profile_image);
        Storage::disk('public')->assertExists($user->profile_image);
    }

    public function test_profile_image_can_be_removed(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->post('/api/v1/me/profile', [
            'profile_image' => UploadedFile::fake()->image('avatar.jpg'),
        ], ['Accept' => 'application/json'])->assertOk();

        $path = $user->refresh()->profile_image;
        $this->assertNotNull($path);

        $this->postJson('/api/v1/me/profile', [
            'remove_profile_image' => true,
        ])
            ->assertOk()
            ->assertJsonPath('data.profile_image', null);

        $this->assertNull($user->refresh()->profile_image);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->deleteJson('/api/v1/me/profile', [
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->deleteJson('/api/v1/me/profile', [
            'password' => 'wrong-password',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false);

        $this->assertNotNull($user->fresh());
    }
}
