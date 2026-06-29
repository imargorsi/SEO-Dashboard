<?php

namespace App\Sheets\Services;

use App\Models\SheetConfig;
use Illuminate\Support\Facades\Http;

final class SpreadsheetFetcher
{
    public function fetchCsv(SheetConfig $config): string
    {
        $url = $this->buildExportUrl($config);

        $response = Http::timeout(30)
            ->retry(2, 200)
            ->get($url);

        if (! $response->successful()) {
            throw new \RuntimeException(
                __('Unable to fetch spreadsheet data. Ensure the sheet is shared as "Anyone with the link can view".')
            );
        }

        $body = $response->body();
        if ($body === '') {
            throw new \RuntimeException(__('Spreadsheet tab is empty or inaccessible.'));
        }

        return $body;
    }

    private function buildExportUrl(SheetConfig $config): string
    {
        $spreadsheetId = $config->spreadsheet_id;

        if ($config->tab_gid !== null && $config->tab_gid !== '') {
            return "https://docs.google.com/spreadsheets/d/{$spreadsheetId}/export?format=csv&gid={$config->tab_gid}";
        }

        if ($config->tab_name !== null && $config->tab_name !== '') {
            $sheet = rawurlencode($config->tab_name);

            return "https://docs.google.com/spreadsheets/d/{$spreadsheetId}/gviz/tq?tqx=out:csv&sheet={$sheet}";
        }

        return "https://docs.google.com/spreadsheets/d/{$spreadsheetId}/export?format=csv";
    }
}
