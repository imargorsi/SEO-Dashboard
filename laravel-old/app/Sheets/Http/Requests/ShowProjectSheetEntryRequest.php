<?php

namespace App\Sheets\Http\Requests;

use App\Sheets\Http\Concerns\AuthorizesProjectForSheet;
use App\Sheets\ProjectSheetType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ShowProjectSheetEntryRequest extends FormRequest
{
    use AuthorizesProjectForSheet;

    public function authorize(): bool
    {
        return $this->userCanAccessProjects();
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'type' => $this->route('type'),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in(ProjectSheetType::all())],
        ];
    }
}
