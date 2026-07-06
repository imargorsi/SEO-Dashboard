<?php

namespace App\Sheets\Http\Resources;

use App\Models\ProjectSheetEntry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ProjectSheetEntry */
class ProjectSheetEntryResource extends JsonResource
{
    public static $wrap = null;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'sheet_type' => $this->sheet_type,
            'source_row_number' => $this->source_row_number,
            'site' => $this->site,
            'days' => $this->days,
            'page_link' => $this->page_link,
            'details' => $this->details,
            'occurred_on' => $this->occurred_on?->toDateString(),
            'extra_data' => $this->extra_data ?? new \stdClass,
            'synced_at' => $this->synced_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
