<?php

namespace App\Integrations\Google\Http\Requests;

use App\Integrations\Google\GoogleIntegrationService;
use App\Integrations\Google\Http\Concerns\AuthorizesProjectForIntegration;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ConnectIntegrationRequest extends FormRequest
{
    use AuthorizesProjectForIntegration;

    public function authorize(): bool
    {
        return $this->userCanAccessProjects();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'services' => ['required', 'array', 'min:1'],
            'services.*' => ['required', 'string', Rule::in(GoogleIntegrationService::all())],
        ];
    }
}
