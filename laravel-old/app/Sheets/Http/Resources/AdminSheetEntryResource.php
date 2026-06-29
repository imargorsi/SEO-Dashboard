<?php

namespace App\Sheets\Http\Resources;

use App\Models\ProjectSheetEntry;
use Illuminate\Http\Request;

/** @mixin ProjectSheetEntry */
class AdminSheetEntryResource extends ProjectSheetEntryResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        $data['project'] = $this->whenLoaded('project', fn () => [
            'id' => $this->project->id,
            'business_name' => $this->project->business_name,
            'company_id' => $this->project->company_id,
            'site_code' => $this->project->site_code,
        ]);

        return $data;
    }
}
