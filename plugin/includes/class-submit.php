<?php

if (!defined('ABSPATH')) {
    exit;
}

final class Crawllex_Lead_Capture_Submit
{
    private const REQUIRED = array('firstName', 'email', 'phone', 'message');

    /**
     * @param array<string, string> $fields
     */
    public static function send(array $fields, string $idempotency_key): void
    {
        $options = Crawllex_Lead_Capture_Plugin::options();
        if ($options['base_url'] === '' || $options['source_key'] === '') {
            Crawllex_Lead_Capture_Logger::record(
                'ingest',
                'failed',
                'Dashboard URL or lead source key is not set.',
            );
            return;
        }

        foreach (self::REQUIRED as $field) {
            if (!isset($fields[$field]) || trim($fields[$field]) === '') {
                Crawllex_Lead_Capture_Logger::record(
                    'ingest',
                    'failed',
                    'First name, email, phone, and message are required.',
                );
                return;
            }
        }

        $payload = Crawllex_Lead_Capture_Normalizer::to_ingest_payload($fields, $idempotency_key);
        $client = new Crawllex_Lead_Capture_Client($options['base_url'], $options['source_key']);
        $result = $client->ingest($payload);
        Crawllex_Lead_Capture_Logger::record(
            'ingest',
            $result['ok'] ? 'success' : 'failed',
            $result['message'],
        );
    }
}
