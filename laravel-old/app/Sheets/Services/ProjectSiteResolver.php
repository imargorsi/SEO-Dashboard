<?php

namespace App\Sheets\Services;

use App\Models\Project;

final class ProjectSiteResolver
{
    /** @var array<string, int>|null */
    private static ?array $map = null;

    public function resolve(?string $site): ?int
    {
        $site = trim((string) $site);
        if ($site === '') {
            return null;
        }

        return $this->map()[strtolower($site)] ?? null;
    }

    /**
     * @return array<string, int> lowercase site_code => project_id
     */
    public function map(): array
    {
        if (self::$map !== null) {
            return self::$map;
        }

        self::$map = [];

        Project::query()
            ->whereNotNull('site_code')
            ->where('site_code', '!=', '')
            ->get(['id', 'site_code'])
            ->each(function (Project $project): void {
                self::$map[strtolower(trim($project->site_code))] = $project->id;
            });

        return self::$map;
    }

    public static function reset(): void
    {
        self::$map = null;
    }
}
