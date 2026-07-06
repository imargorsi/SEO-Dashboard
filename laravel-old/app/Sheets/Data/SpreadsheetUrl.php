<?php

namespace App\Sheets\Data;

final readonly class SpreadsheetUrl
{
    public function __construct(
        public string $spreadsheetId,
        public ?string $tabGid,
    ) {}

    public static function parse(string $url): self
    {
        $spreadsheetId = self::extractSpreadsheetId($url);
        $tabGid = self::extractTabGid($url);

        return new self($spreadsheetId, $tabGid);
    }

    private static function extractSpreadsheetId(string $url): string
    {
        if (preg_match('~/spreadsheets/d/([a-zA-Z0-9_-]+)~', $url, $matches) === 1) {
            return $matches[1];
        }

        throw new \InvalidArgumentException('Invalid Google Spreadsheet URL.');
    }

    private static function extractTabGid(string $url): ?string
    {
        if (preg_match('~[?&#]gid=(\d+)~', $url, $matches) === 1) {
            return $matches[1];
        }

        return null;
    }
}
