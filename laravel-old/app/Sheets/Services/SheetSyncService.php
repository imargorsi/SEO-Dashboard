<?php

namespace App\Sheets\Services;

use App\Models\Project;
use App\Models\ProjectSheetEntry;
use App\Models\SheetConfig;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class SheetSyncService
{
    public function __construct(
        private readonly SpreadsheetFetcher $fetcher,
        private readonly SheetColumnMapper $columnMapper,
        private readonly ProjectSiteResolver $siteResolver,
    ) {}

    /**
     * @return array{
     *     sheet_type: string,
     *     imported: int,
     *     skipped: int,
     *     removed: int,
     *     last_synced_at: string
     * }
     */
    public function sync(string $sheetType, User $user): array
    {
        $config = SheetConfig::query()
            ->where('sheet_type', $sheetType)
            ->first();

        if ($config === null) {
            throw new \RuntimeException(__('Sheet configuration not found. Configure the master spreadsheet before syncing.'));
        }

        if ($config->status === SheetConfig::STATUS_DISABLED) {
            throw new \RuntimeException(__('This sheet sync is disabled.'));
        }

        ProjectSiteResolver::reset();

        try {
            $csv = $this->fetcher->fetchCsv($config);
            $rows = $this->parseCsv($csv);
            $mappedRows = $this->columnMapper->mapRows($sheetType, $rows);
            $syncedAt = now();

            $result = DB::transaction(function () use ($sheetType, $mappedRows, $syncedAt): array {
                $existingRowNumbers = ProjectSheetEntry::query()
                    ->where('sheet_type', $sheetType)
                    ->pluck('source_row_number')
                    ->all();

                $incomingRowNumbers = [];
                $imported = 0;
                $skipped = 0;

                foreach ($mappedRows as $row) {
                    $incomingRowNumbers[] = $row['source_row_number'];

                    $projectId = $this->siteResolver->resolve($row['site'] ?? null);
                    if ($projectId === null) {
                        $skipped++;

                        continue;
                    }

                    ProjectSheetEntry::query()->updateOrCreate(
                        [
                            'sheet_type' => $sheetType,
                            'source_row_number' => $row['source_row_number'],
                        ],
                        [
                            'project_id' => $projectId,
                            'site' => $row['site'],
                            'days' => $row['days'],
                            'page_link' => $row['page_link'],
                            'details' => $row['details'],
                            'occurred_on' => $row['occurred_on'],
                            'extra_data' => $row['extra_data'] === [] ? null : $row['extra_data'],
                            'synced_at' => $syncedAt,
                        ]
                    );

                    $imported++;
                }

                $removed = 0;
                $staleRowNumbers = array_diff($existingRowNumbers, $incomingRowNumbers);
                if ($staleRowNumbers !== []) {
                    $removed = ProjectSheetEntry::query()
                        ->where('sheet_type', $sheetType)
                        ->whereIn('source_row_number', $staleRowNumbers)
                        ->delete();
                }

                return [
                    'imported' => $imported,
                    'skipped' => $skipped,
                    'removed' => $removed,
                ];
            });

            $config->forceFill([
                'status' => SheetConfig::STATUS_ACTIVE,
                'last_error' => null,
                'last_synced_at' => $syncedAt,
                'synced_by_user_id' => $user->id,
            ])->save();

            if ($result['imported'] === 0 && $result['skipped'] > 0) {
                $projectsWithSiteCode = Project::query()
                    ->whereNotNull('site_code')
                    ->where('site_code', '!=', '')
                    ->count();

                $message = $projectsWithSiteCode === 0
                    ? __('No rows were imported. Create projects first and set site_code to match the spreadsheet Site column (e.g. MTC, Pecto, Pets, Reachware). :skipped row(s) skipped.', ['skipped' => $result['skipped']])
                    : __('No rows were imported. Check that projects.site_code matches the spreadsheet Site column exactly (e.g. MTC, Pecto). :skipped row(s) skipped.', ['skipped' => $result['skipped']]);

                throw new \RuntimeException($message);
            }

            return [
                'sheet_type' => $sheetType,
                'imported' => $result['imported'],
                'skipped' => $result['skipped'],
                'removed' => $result['removed'],
                'last_synced_at' => $syncedAt->toIso8601String(),
            ];
        } catch (\Throwable $e) {
            $config->forceFill([
                'status' => SheetConfig::STATUS_ERROR,
                'last_error' => $e->getMessage(),
            ])->save();

            throw $e;
        }
    }

    /**
     * @return list<list<string>>
     */
    private function parseCsv(string $csv): array
    {
        $stream = fopen('php://temp', 'r+');
        if ($stream === false) {
            throw new \RuntimeException(__('Unable to parse spreadsheet CSV.'));
        }

        fwrite($stream, $csv);
        rewind($stream);

        $rows = [];
        while (($row = fgetcsv($stream)) !== false) {
            $rows[] = array_map(fn (mixed $cell): string => (string) $cell, $row);
        }

        fclose($stream);

        return $rows;
    }
}
