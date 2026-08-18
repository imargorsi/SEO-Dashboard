<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Elementor Pro Forms → Crawllex ingest. Does not block the visitor form.
 */
final class Crawllex_Lead_Capture_Elementor
{
    private const SKIP_TYPES = array(
        'recaptcha',
        'recaptcha_v3',
        'honeypot',
        'html',
        'upload',
        'step',
        'password',
    );

    private static bool $handled = false;

    public static function init(): void
    {
        add_action('elementor_pro/forms/new_record', array(self::class, 'handle'), 10, 2);
    }

    /**
     * @param mixed $record
     * @param mixed $handler
     */
    public static function handle($record, $handler): void
    {
        if (self::$handled) {
            return;
        }
        if (!is_object($record) || !method_exists($record, 'get')) {
            return;
        }

        $raw = $record->get('fields');
        if (!is_array($raw) || $raw === array()) {
            return;
        }

        $posted = self::posted_from_record($raw);
        if ($posted === array()) {
            return;
        }

        self::$handled = true;

        $fields = Crawllex_Lead_Capture_Field_Map::from_posted($posted);
        Crawllex_Lead_Capture_Submit::send(
            $fields,
            self::idempotency_key(self::form_id($record), $posted),
        );
    }

    /**
     * @param array<string|int, mixed> $raw
     * @return array<string, mixed>
     */
    private static function posted_from_record(array $raw): array
    {
        $posted = array();
        $email_from_type = '';
        $phone_from_type = '';
        $message_from_type = '';

        foreach ($raw as $id => $field) {
            if (!is_array($field)) {
                continue;
            }

            $type = isset($field['type']) ? strtolower((string) $field['type']) : '';
            if (in_array($type, self::SKIP_TYPES, true)) {
                continue;
            }

            $value = $field['value'] ?? ($field['raw_value'] ?? '');
            if ($value === '' || $value === null) {
                continue;
            }

            $key = is_string($id) && $id !== '' ? $id : (isset($field['id']) ? (string) $field['id'] : '');
            if ($key !== '') {
                $posted[$key] = $value;
            }

            $title = isset($field['title']) ? trim((string) $field['title']) : '';
            if ($title !== '' && strtolower($title) !== strtolower($key)) {
                $posted[$title] = $value;
            }

            if ($type === 'email' && $email_from_type === '' && is_scalar($value)) {
                $email_from_type = (string) $value;
            }
            if ($type === 'tel' && $phone_from_type === '' && is_scalar($value)) {
                $phone_from_type = (string) $value;
            }
            if ($type === 'textarea' && $message_from_type === '' && is_scalar($value)) {
                $message_from_type = (string) $value;
            }
        }

        if ($email_from_type !== '' && !isset($posted['email'])) {
            $posted['email'] = $email_from_type;
        }
        if ($phone_from_type !== '' && !isset($posted['phone'])) {
            $posted['phone'] = $phone_from_type;
        }
        if ($message_from_type !== '' && !isset($posted['message'])) {
            $posted['message'] = $message_from_type;
        }

        return $posted;
    }

    /**
     * @param mixed $record
     */
    private static function form_id($record): string
    {
        if (!is_object($record) || !method_exists($record, 'get_form_settings')) {
            return '0';
        }
        foreach (array('id', 'form_id', 'form_name') as $setting) {
            $value = (string) $record->get_form_settings($setting);
            $safe = preg_replace('/[^A-Za-z0-9._:-]/', '', $value);
            if (is_string($safe) && $safe !== '') {
                return substr($safe, 0, 40);
            }
        }
        return '0';
    }

    /**
     * @param array<string, mixed> $posted
     */
    private static function idempotency_key(string $form_id, array $posted): string
    {
        $encoded = wp_json_encode($posted);
        $suffix = hash('sha256', $form_id . '|' . (is_string($encoded) ? $encoded : ''));
        return 'el-' . $form_id . '-' . substr($suffix, 0, 40);
    }
}
