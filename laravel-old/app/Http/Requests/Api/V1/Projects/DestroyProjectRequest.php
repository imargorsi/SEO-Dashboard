<?php

namespace App\Http\Requests\Api\V1\Projects;

use App\Http\Requests\Api\V1\Projects\Concerns\AuthorizesProjectAccess;
use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;

class DestroyProjectRequest extends FormRequest
{
    use AuthorizesProjectAccess;

    public function authorize(): bool
    {
        $user = $this->user();
        if ($user === null) {
            return false;
        }

        /** @var Project $project */
        $project = $this->route('project');

        if ($user->hasRole('super_admin')) {
            return true;
        }

        if ($user->hasRole('company_admin')) {
            if (! $this->userCanAccessProjects()) {
                return false;
            }

            return (int) $project->company_id === (int) $user->company_id;
        }

        return false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [];
    }
}
