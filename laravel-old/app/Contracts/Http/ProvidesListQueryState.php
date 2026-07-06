<?php

namespace App\Contracts\Http;

use App\Support\Api\ListQueryState;

/**
 * Form requests that power paginated index endpoints with a shared filter contract.
 */
interface ProvidesListQueryState
{
    public function listState(): ListQueryState;
}
