<?php

namespace App\Sheets\Http\Requests\Admin;

use App\Sheets\ProjectSheetType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertAdminSheetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('super_admin') === true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'type' => $this->route('type'),
        ]);

        foreach (['tab_name', 'tab_gid'] as $field) {
            if ($this->has($field) && $this->input($field) === '') {
                $this->merge([$field => null]);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in(ProjectSheetType::all())],
            'spreadsheet_url' => ['required', 'string', 'url', 'max:512'],
            'tab_name' => ['sometimes', 'nullable', 'string', 'max:128'],
            'tab_gid' => ['sometimes', 'nullable', 'string', 'max:32'],
        ];
    }
}
