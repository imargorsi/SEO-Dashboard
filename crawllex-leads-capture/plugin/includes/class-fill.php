<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Recover or fill core lead fields when a form omits them.
 * Extra fields stay in extras. Email cannot be invented.
 */
final class Crawllex_Lead_Capture_Fill
{
    private const CORE = array(
        'firstName',
        'lastName',
        'email',
        'phone',
        'message',
        'servicesInterestedIn',
        'leadDate',
    );

    private const FALLBACK_NAME = 'Website Visitor';
    private const FALLBACK_MESSAGE = 'Submitted from the website form.';

    /**
     * @param array<string, string> $fields
     * @return array<string, string>
     */
    public static function prepare(array $fields): array
    {
        $core = array();
        $extras = array();

        foreach ($fields as $key => $raw) {
            $value = trim((string) $raw);
            if ($value === '') {
                continue;
            }
            if (in_array($key, self::CORE, true)) {
                $core[$key] = $value;
                continue;
            }
            $extras[$key] = $value;
        }

        if (self::is_blank($core, 'email')) {
            foreach ($extras as $value) {
                if (is_email($value)) {
                    $core['email'] = $value;
                    break;
                }
            }
        }

        if (self::is_blank($core, 'phone')) {
            foreach ($extras as $value) {
                if (self::looks_like_phone($value)) {
                    $core['phone'] = $value;
                    break;
                }
            }
        }

        if (self::is_blank($core, 'firstName')) {
            foreach ($extras as $value) {
                if (self::looks_like_name($value)) {
                    $core['firstName'] = $value;
                    break;
                }
            }
            if (self::is_blank($core, 'firstName')) {
                $core['firstName'] = self::FALLBACK_NAME;
            }
        }

        if (self::is_blank($core, 'message')) {
            $lines = array();
            foreach ($extras as $key => $value) {
                $lines[] = $key . ': ' . $value;
            }
            $core['message'] = $lines !== array()
                ? implode("\n", $lines)
                : self::FALLBACK_MESSAGE;
        }

        return array_merge($core, $extras);
    }

    /**
     * @param array<string, string> $core
     */
    private static function is_blank(array $core, string $key): bool
    {
        return !isset($core[$key]) || trim($core[$key]) === '';
    }

    private static function looks_like_phone(string $value): bool
    {
        $digits = preg_replace('/\D+/', '', $value);
        return is_string($digits) && strlen($digits) >= 7;
    }

    private static function looks_like_name(string $value): bool
    {
        if (is_email($value) || self::looks_like_phone($value)) {
            return false;
        }
        if (str_contains($value, "\n") || strlen($value) > CRAWLLEX_LC_NAME_MAX) {
            return false;
        }
        return true;
    }
}
