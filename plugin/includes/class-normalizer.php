<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Maps form fields onto the Crawllex ingest contract.
 * Known keys become core lead columns; leftover string fields go in extras.
 */
final class Crawllex_Lead_Capture_Normalizer
{
    private const CORE_FIELDS = array(
        'firstName',
        'lastName',
        'email',
        'phone',
        'message',
        'servicesInterestedIn',
        'leadDate',
    );

    /**
     * @param array<string, string> $fields
     * @return array<string, mixed>
     */
    public static function to_ingest_payload(array $fields, string $idempotency_key): array
    {
        $payload = array(
            'idempotencyKey' => $idempotency_key,
        );
        $extras = array();

        foreach ($fields as $key => $raw) {
            $value = trim((string) $raw);
            if ($value === '') {
                continue;
            }
            if (in_array($key, self::CORE_FIELDS, true)) {
                $payload[$key] = $value;
                continue;
            }
            if (count($extras) >= CRAWLLEX_LC_EXTRAS_MAX_KEYS) {
                continue;
            }
            $extra_key = substr(trim((string) $key), 0, CRAWLLEX_LC_EXTRAS_KEY_MAX);
            if ($extra_key === '' || isset($extras[$extra_key])) {
                continue;
            }
            $extras[$extra_key] = substr($value, 0, CRAWLLEX_LC_EXTRAS_VALUE_MAX);
        }

        if ($extras !== array()) {
            $payload['extras'] = $extras;
        }

        return $payload;
    }
}
