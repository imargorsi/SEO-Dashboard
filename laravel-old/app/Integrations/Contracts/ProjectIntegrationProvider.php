<?php

namespace App\Integrations\Contracts;

/**
 * Marker for third-party integration providers (Google today; Meta, Microsoft, etc. later).
 */
interface ProjectIntegrationProvider
{
    public function providerKey(): string;
}
