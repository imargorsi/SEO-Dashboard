<?php

namespace App\Integrations\Google\Http\Requests;

use App\Integrations\Google\GoogleIntegrationService;
use App\Integrations\Google\Http\Concerns\AuthorizesProjectForIntegration;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DisconnectIntegrationRequest extends FormRequest
{
    use AuthorizesProjectForIntegration;

    public function authorize(): bool
    {
        return $this->userCanAccessProjects();
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'service' => $this->route('service'),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'service' => ['required', 'string', Rule::in(GoogleIntegrationService::all())],
        ];
    }
}
