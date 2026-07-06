<?php

namespace App\Integrations\Google\Http\Requests;

use App\Integrations\Google\Http\Concerns\AuthorizesProjectForIntegration;
use Illuminate\Foundation\Http\FormRequest;

class ListIntegrationsRequest extends FormRequest
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
        return [];
    }
}
