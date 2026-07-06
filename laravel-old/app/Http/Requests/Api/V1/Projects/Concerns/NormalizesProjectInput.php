<?php

namespace App\Http\Requests\Api\V1\Projects\Concerns;

trait NormalizesProjectInput
{
    /**
     * @param  list<string>  $nullableForeignKeys
     */
    protected function normalizeNullableForeignKeys(array $nullableForeignKeys): void
    {
        $normalized = [];

        foreach ($nullableForeignKeys as $key) {
            if (! $this->exists($key)) {
                continue;
            }

            $value = $this->input($key);

            if ($value === '' || $value === 'null') {
                $normalized[$key] = null;
            }
        }

        if ($normalized !== []) {
            $this->merge($normalized);
        }
    }
}
