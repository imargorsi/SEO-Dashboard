<?php

namespace App\Sheets\Http\Concerns;

use App\Http\Requests\Api\V1\Projects\Concerns\AuthorizesProjectAccess;

trait AuthorizesProjectForSheet
{
    use AuthorizesProjectAccess;
}
