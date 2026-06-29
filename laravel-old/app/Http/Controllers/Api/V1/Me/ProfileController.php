<?php

namespace App\Http\Controllers\Api\V1\Me;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

class ProfileController extends Controller
{
    #[OA\Get(
        path: '/api/v1/me/profile',
        operationId: 'profileShow',
        summary: 'Get current user profile',
        security: [['sanctum' => []]],
        tags: ['Profile'],
        responses: [
            new OA\Response(response: 200, description: 'OK'),
        ]
    )]
    public function show(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    #[OA\Post(
        path: '/api/v1/me/profile',
        operationId: 'profileUpdate',
        summary: 'Update profile',
        description: 'Partial updates: send only the fields you want to change; omitted fields stay unchanged. JSON for name/remove only; multipart when uploading `profile_image`. Email cannot be changed.',
        security: [['sanctum' => []]],
        tags: ['Profile'],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                'application/json' => new OA\JsonContent(ref: '#/components/schemas/ProfileUpdateRequest'),
                'multipart/form-data' => new OA\MediaType(
                    mediaType: 'multipart/form-data',
                    schema: new OA\Schema(ref: '#/components/schemas/ProfileUpdateRequest')
                ),
            ]
        ),
        responses: [
            new OA\Response(response: 200, description: 'OK — updated user in `data` (includes `profile_image` URL when set)'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(ProfileUpdateRequest $request): UserResource
    {
        $user = $request->user();

        if ($request->has('name')) {
            $user->name = $request->validated('name');
        }

        if ($request->boolean('remove_profile_image')) {
            $this->deleteProfileImage($user->profile_image);
            $user->profile_image = null;
        } elseif ($file = $request->profileImageFile()) {
            $user->profile_image = $this->storeProfileImage($user, $file);
        }

        $user->save();

        return new UserResource($user->fresh());
    }

    #[OA\Delete(
        path: '/api/v1/me/profile',
        operationId: 'profileDestroy',
        summary: 'Delete account',
        description: 'Permanently deletes the signed-in user and revokes all API tokens. Requires the current password.',
        security: [['sanctum' => []]],
        tags: ['Profile'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/ProfileDeleteRequest')
        ),
        responses: [
            new OA\Response(response: 200, description: 'Deleted'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'current_password:sanctum'],
        ]);

        $user = $request->user();
        $this->deleteProfileImage($user->profile_image);
        $user->tokens()->delete();
        $user->delete();

        return ApiResponse::success(null, __('Account deleted.'));
    }

    private function storeProfileImage(User $user, UploadedFile $file): string
    {
        $this->deleteProfileImage($user->profile_image);

        $path = $file->store('profile-images/'.$user->id, 'public');

        if (! is_string($path) || $path === '') {
            abort(500, __('Failed to store profile image.'));
        }

        return $path;
    }

    private function deleteProfileImage(?string $path): void
    {
        if (! is_string($path) || $path === '') {
            return;
        }

        Storage::disk('public')->delete($path);
    }
}
