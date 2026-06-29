<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('super_admin') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'poc_name' => ['required', 'string', 'max:255'],
            'poc_email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
