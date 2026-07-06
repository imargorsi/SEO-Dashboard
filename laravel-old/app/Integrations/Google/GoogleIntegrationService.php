<?php

namespace App\Integrations\Google;

final class GoogleIntegrationService
{
    public const PROVIDER = 'google';

    public const ANALYTICS = 'analytics';

    public const SEARCH_CONSOLE = 'search_console';

    public const TAG_MANAGER = 'tag_manager';

    public const ADS = 'ads';

    /** @var list<string> */
    public const ALL = [
        self::ANALYTICS,
        self::SEARCH_CONSOLE,
        self::TAG_MANAGER,
        self::ADS,
    ];

    /** @var array<string, string> */
    private const SCOPES = [
        self::ANALYTICS => 'https://www.googleapis.com/auth/analytics.readonly',
        self::SEARCH_CONSOLE => 'https://www.googleapis.com/auth/webmasters.readonly',
        self::TAG_MANAGER => 'https://www.googleapis.com/auth/tagmanager.readonly',
        self::ADS => 'https://www.googleapis.com/auth/adwords',
    ];

    /** @var array<string, string> */
    private const LABELS = [
        self::ANALYTICS => 'Google Analytics',
        self::SEARCH_CONSOLE => 'Google Search Console',
        self::TAG_MANAGER => 'Google Tag Manager',
        self::ADS => 'Google Ads',
    ];

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return self::ALL;
    }

    public static function isValid(string $service): bool
    {
        return in_array($service, self::ALL, true);
    }

    public static function label(string $service): string
    {
        return self::LABELS[$service] ?? $service;
    }

    public static function scopeFor(string $service): string
    {
        if (! isset(self::SCOPES[$service])) {
            throw new \InvalidArgumentException("Unknown Google integration service [{$service}].");
        }

        return self::SCOPES[$service];
    }

    /**
     * @param  list<string>  $services
     * @return list<string>
     */
    public static function scopesFor(array $services): array
    {
        $scopes = [];
        foreach ($services as $service) {
            if (! self::isValid($service)) {
                throw new \InvalidArgumentException("Unknown Google integration service [{$service}].");
            }
            $scopes[] = self::scopeFor($service);
        }

        return array_values(array_unique($scopes));
    }

    /**
     * @return array<string, array{service: string, label: string, scope: string}>
     */
    public static function catalog(): array
    {
        $catalog = [];
        foreach (self::ALL as $service) {
            $catalog[$service] = [
                'service' => $service,
                'label' => self::label($service),
                'scope' => self::scopeFor($service),
            ];
        }

        return $catalog;
    }
}
