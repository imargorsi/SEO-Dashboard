<?php

namespace App\Integrations\Google\Http\Concerns;

use App\Http\Requests\Api\V1\Projects\Concerns\AuthorizesProjectAccess;

trait AuthorizesProjectForIntegration
{
    use AuthorizesProjectAccess;
}
