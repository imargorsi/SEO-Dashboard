<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SeoGoal extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'sort_order',
        'is_other',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_other' => 'boolean',
        ];
    }

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_seo_goal', 'seo_goal_id', 'project_id');
    }
}
