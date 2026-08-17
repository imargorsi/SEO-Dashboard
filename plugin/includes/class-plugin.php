<?php

if (!defined('ABSPATH')) {
    exit;
}

final class Crawllex_Lead_Capture_Plugin
{
    public static function init(): void
    {
        if (is_admin()) {
            Crawllex_Lead_Capture_Settings::init();
        }
        Crawllex_Lead_Capture_Forms::init();
    }

    /**
     * @return array{base_url: string, source_key: string, last_verified_at: string, last_status: string, ingest_count: int, failed_count: int, logs: array<int, array<string, string>>}
     */
    public static function options(): array
    {
        $stored = get_option(CRAWLLEX_LC_OPTION, array());
        if (!is_array($stored)) {
            $stored = array();
        }

        return array(
            'base_url' => isset($stored['base_url']) ? (string) $stored['base_url'] : '',
            'source_key' => isset($stored['source_key']) ? (string) $stored['source_key'] : '',
            'last_verified_at' => isset($stored['last_verified_at']) ? (string) $stored['last_verified_at'] : '',
            'last_status' => isset($stored['last_status']) ? (string) $stored['last_status'] : '',
            'ingest_count' => isset($stored['ingest_count']) ? (int) $stored['ingest_count'] : 0,
            'failed_count' => isset($stored['failed_count']) ? (int) $stored['failed_count'] : 0,
            'logs' => isset($stored['logs']) && is_array($stored['logs']) ? $stored['logs'] : array(),
        );
    }

    /**
     * @param array<string, mixed> $patch
     */
    public static function update_options(array $patch): void
    {
        $current = self::options();
        update_option(CRAWLLEX_LC_OPTION, array_merge($current, $patch), false);
    }
}
