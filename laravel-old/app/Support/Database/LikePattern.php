<?php

namespace App\Support\Database;

/**
 * Escape user input for use inside SQL LIKE patterns (avoids % / _ / \ injection).
 */
final class LikePattern
{
    public static function escape(string $value): string
    {
        return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value);
    }

    public static function wrap(string $escapedValue): string
    {
        return '%'.$escapedValue.'%';
    }
}
