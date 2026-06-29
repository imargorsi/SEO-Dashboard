<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator as ValidatorFactory;

class ProfileUpdateRequest extends FormRequest
{
    /** @var list<string> */
    public const PROFILE_IMAGE_FIELD_ALIASES = ['profile_image', 'image', 'avatar', 'file'];

    public function profileImageFile(): ?UploadedFile
    {
        foreach (self::PROFILE_IMAGE_FIELD_ALIASES as $field) {
            if ($this->hasFile($field)) {
                return $this->file($field);
            }
        }

        return null;
    }

    public function hasAnyProfileUpdate(): bool
    {
        if ($this->boolean('remove_profile_image')) {
            return true;
        }

        if ($this->profileImageFile() !== null) {
            return true;
        }

        return $this->has('name');
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            if (! $this->hasAnyProfileUpdate()) {
                $validator->errors()->add(
                    'profile',
                    __('Provide at least one field to update: name, profile_image, or remove_profile_image.')
                );

                return;
            }

            $file = $this->profileImageFile();

            if ($file !== null) {
                $imageValidator = ValidatorFactory::make(
                    ['profile_image' => $file],
                    [
                        'profile_image' => ['required', 'image', 'mimes:jpeg,jpg,png,webp,gif', 'max:2048'],
                    ]
                );

                if ($imageValidator->fails()) {
                    $validator->errors()->merge($imageValidator->errors());
                }

                return;
            }

            if ($this->expectsProfileImageUpload()) {
                $validator->errors()->add(
                    'profile_image',
                    __('The profile image did not upload. Use multipart/form-data, field name profile_image, max 2 MB, and check server post_max_size / upload_max_filesize.')
                );
            }
        });
    }

    public function expectsProfileImageUpload(): bool
    {
        if (! str_contains((string) $this->header('Content-Type', ''), 'multipart/form-data')) {
            return false;
        }

        foreach (self::PROFILE_IMAGE_FIELD_ALIASES as $field) {
            if ($this->hasFile($field) || $this->has($field)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['prohibited'],
            'remove_profile_image' => ['sometimes', 'boolean'],
        ];
    }
}
