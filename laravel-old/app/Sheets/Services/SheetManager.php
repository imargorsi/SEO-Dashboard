<?php

namespace App\Sheets\Services;

use App\Models\ProjectSheetEntry;
use App\Models\SheetConfig;
use App\Models\User;
use App\Sheets\Data\SpreadsheetUrl;
use App\Sheets\ProjectSheetType;

final class SheetManager
{
    /**
     * @return array{
     *     catalog: array<string, array{type: string, label: string, default_tab_name: string}>,
     *     sheets: array<string, array<string, mixed>|null>
     * }
     */
    public function adminStatusPayload(): array
    {
        $configs = SheetConfig::query()
            ->get()
            ->keyBy('sheet_type');

        $sheets = [];
        foreach (ProjectSheetType::all() as $type) {
            $config = $configs->get($type);
            $sheets[$type] = $config === null
                ? null
                : $this->adminConfigPayload($config);
        }

        return [
            'catalog' => ProjectSheetType::catalog(),
            'sheets' => $sheets,
        ];
    }

    /**
     * @param  array{
     *     spreadsheet_url: string,
     *     tab_name?: ?string,
     *     tab_gid?: ?string
     * }  $input
     */
    public function upsertConfig(string $sheetType, array $input, User $user): SheetConfig
    {
        $parsed = SpreadsheetUrl::parse($input['spreadsheet_url']);

        $tabGid = $input['tab_gid'] ?? $parsed->tabGid;
        $tabName = $input['tab_name'] ?? ProjectSheetType::defaultTabName($sheetType);

        return SheetConfig::query()->updateOrCreate(
            ['sheet_type' => $sheetType],
            [
                'spreadsheet_id' => $parsed->spreadsheetId,
                'spreadsheet_url' => $input['spreadsheet_url'],
                'tab_name' => $tabName,
                'tab_gid' => $tabGid,
                'status' => SheetConfig::STATUS_ACTIVE,
                'synced_by_user_id' => $user->id,
                'last_error' => null,
            ]
        );
    }

    public function deleteConfig(string $sheetType): void
    {
        SheetConfig::query()
            ->where('sheet_type', $sheetType)
            ->delete();
    }

    /**
     * @return array<string, mixed>
     */
    private function adminConfigPayload(SheetConfig $config): array
    {
        $entryCount = ProjectSheetEntry::query()
            ->where('sheet_type', $config->sheet_type)
            ->count();

        return [
            'sheet_type' => $config->sheet_type,
            'label' => ProjectSheetType::label($config->sheet_type),
            'spreadsheet_id' => $config->spreadsheet_id,
            'spreadsheet_url' => $config->spreadsheet_url,
            'tab_name' => $config->tab_name,
            'tab_gid' => $config->tab_gid,
            'status' => $config->status,
            'entry_count' => $entryCount,
            'last_synced_at' => $config->last_synced_at?->toIso8601String(),
            'last_error' => $config->last_error,
            'synced_by_user_id' => $config->synced_by_user_id,
            'updated_at' => $config->updated_at?->toIso8601String(),
        ];
    }
}
