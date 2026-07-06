<?php

namespace App\Sheets\Services;

use App\Sheets\ProjectSheetType;
use Carbon\Carbon;

final class SheetColumnMapper
{
    /** @var array<string, list<string>> */
    private const CORE_ALIASES = [
        'days' => ['days', 'day'],
        'site' => ['site', 'client', 'brand'],
        'page_link' => ['page link', 'page_link', 'url', 'link', 'page url', 'page', 'backlinks', 'back links'],
        'details' => ['details', 'detail', 'description', 'notes', 'work done'],
        'occurred_on' => [
            'change date',
            'post date',
            'publish date',
            'publication date',
            'update date',
            'date',
            'posted on',
        ],
    ];

    /** @var array<string, list<string>> */
    private const TYPE_ALIASES = [
        ProjectSheetType::BP => [
            'status' => ['status', 'post status'],
            'author' => ['author', 'writer'],
        ],
        ProjectSheetType::GP => [
            'anchor_text' => ['anchor text', 'anchor'],
        ],
        ProjectSheetType::SP => [
            'service_name' => ['service', 'service name', 'page name'],
        ],
        ProjectSheetType::KC => [],
    ];

    /**
     * @param  list<list<string>>  $rows
     * @return list<array{
     *     source_row_number: int,
     *     site: ?string,
     *     days: ?string,
     *     page_link: ?string,
     *     details: ?string,
     *     occurred_on: ?string,
     *     extra_data: array<string, mixed>
     * }>
     */
    public function mapRows(string $sheetType, array $rows): array
    {
        if ($rows === []) {
            return [];
        }

        $headers = array_map(fn (mixed $value): string => $this->normalizeHeader((string) $value), $rows[0]);
        $columnMap = $this->buildColumnMap($sheetType, $headers);
        $mapped = [];

        foreach (array_slice($rows, 1) as $index => $row) {
            $sourceRowNumber = $index + 2;
            if ($this->rowIsEmpty($row)) {
                continue;
            }

            $entry = [
                'source_row_number' => $sourceRowNumber,
                'site' => null,
                'days' => null,
                'page_link' => null,
                'details' => null,
                'occurred_on' => null,
                'extra_data' => [],
            ];

            foreach ($columnMap['core'] as $field => $columnIndex) {
                $value = $this->cellValue($row, $columnIndex);
                if ($value === null) {
                    continue;
                }

                if ($field === 'occurred_on') {
                    $entry['occurred_on'] = $this->parseDate($value);

                    continue;
                }

                $entry[$field] = $value;
            }

            foreach ($columnMap['extra'] as $field => $columnIndex) {
                $value = $this->cellValue($row, $columnIndex);
                if ($value !== null) {
                    $entry['extra_data'][$field] = $value;
                }
            }

            foreach ($headers as $columnIndex => $header) {
                if ($header === '' || isset($columnMap['used'][$columnIndex])) {
                    continue;
                }

                $value = $this->cellValue($row, $columnIndex);
                if ($value !== null) {
                    $entry['extra_data'][$header] = $value;
                }
            }

            $mapped[] = $entry;
        }

        return $mapped;
    }

    /**
     * @param  list<string>  $headers
     * @return array{core: array<string, int>, extra: array<string, int>, used: array<int, true>}
     */
    private function buildColumnMap(string $sheetType, array $headers): array
    {
        $core = [];
        $extra = [];
        $used = [];

        foreach (self::CORE_ALIASES as $field => $aliases) {
            $index = $this->findColumnIndex($headers, $aliases);
            if ($index !== null) {
                $core[$field] = $index;
                $used[$index] = true;
            }
        }

        $typeAliases = self::TYPE_ALIASES[$sheetType] ?? [];
        foreach ($typeAliases as $field => $aliases) {
            $index = $this->findColumnIndex($headers, $aliases);
            if ($index !== null) {
                $extra[$field] = $index;
                $used[$index] = true;
            }
        }

        return [
            'core' => $core,
            'extra' => $extra,
            'used' => $used,
        ];
    }

    /**
     * @param  list<string>  $headers
     * @param  list<string>  $aliases
     */
    private function findColumnIndex(array $headers, array $aliases): ?int
    {
        foreach ($headers as $index => $header) {
            if (in_array($header, $aliases, true)) {
                return $index;
            }
        }

        return null;
    }

    /**
     * @param  list<string>  $row
     */
    private function rowIsEmpty(array $row): bool
    {
        foreach ($row as $cell) {
            if (trim((string) $cell) !== '') {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  list<string>  $row
     */
    private function cellValue(array $row, int $columnIndex): ?string
    {
        $value = trim((string) ($row[$columnIndex] ?? ''));
        if ($value === '') {
            return null;
        }

        return $value;
    }

    private function normalizeHeader(string $header): string
    {
        return strtolower(trim(preg_replace('/\s+/', ' ', $header) ?? ''));
    }

    private function parseDate(string $value): ?string
    {
        try {
            return Carbon::parse($value)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }
}
