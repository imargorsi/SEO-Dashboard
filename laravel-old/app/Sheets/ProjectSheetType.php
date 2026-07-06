<?php

namespace App\Sheets;

final class ProjectSheetType
{
    public const BP = 'bp';

    public const GP = 'gp';

    public const SP = 'sp';

    public const KC = 'kc';

    /** @var list<string> */
    public const ALL = [
        self::BP,
        self::GP,
        self::SP,
        self::KC,
    ];

    /** @var array<string, string> */
    private const LABELS = [
        self::BP => 'Blog Posting',
        self::GP => 'Guest Posting',
        self::SP => 'Service Page',
        self::KC => 'Key Change',
    ];

    /** @var array<string, string> */
    private const DEFAULT_TAB_NAMES = [
        self::BP => 'Blog',
        self::GP => 'GP',
        self::SP => 'Service',
        self::KC => 'KC',
    ];

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return self::ALL;
    }

    public static function isValid(string $type): bool
    {
        return in_array($type, self::ALL, true);
    }

    public static function label(string $type): string
    {
        return self::LABELS[$type] ?? $type;
    }

    public static function defaultTabName(string $type): string
    {
        if (! self::isValid($type)) {
            throw new \InvalidArgumentException("Unknown project sheet type [{$type}].");
        }

        return self::DEFAULT_TAB_NAMES[$type];
    }

    /**
     * @return array<string, array{type: string, label: string, default_tab_name: string}>
     */
    public static function catalog(): array
    {
        $catalog = [];
        foreach (self::ALL as $type) {
            $catalog[$type] = [
                'type' => $type,
                'label' => self::label($type),
                'default_tab_name' => self::defaultTabName($type),
            ];
        }

        return $catalog;
    }
}
