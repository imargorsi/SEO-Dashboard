<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SheetConfig extends Model
{
    public const STATUS_ACTIVE = 'active';

    public const STATUS_ERROR = 'error';

    public const STATUS_DISABLED = 'disabled';

    protected $fillable = [
        'sheet_type',
        'spreadsheet_id',
        'spreadsheet_url',
        'tab_name',
        'tab_gid',
        'status',
        'synced_by_user_id',
        'last_error',
        'last_synced_at',
        'metadata',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'last_synced_at' => 'datetime',
        ];
    }

    public function syncedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'synced_by_user_id');
    }
}
