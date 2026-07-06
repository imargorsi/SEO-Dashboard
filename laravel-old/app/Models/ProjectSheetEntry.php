<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectSheetEntry extends Model
{
    protected $fillable = [
        'project_id',
        'sheet_type',
        'source_row_number',
        'site',
        'days',
        'page_link',
        'details',
        'occurred_on',
        'extra_data',
        'synced_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'extra_data' => 'array',
            'occurred_on' => 'date',
            'synced_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
