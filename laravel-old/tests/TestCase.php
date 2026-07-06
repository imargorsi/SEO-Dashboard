<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        Role::findOrCreate('super_admin', 'web');
        Role::findOrCreate('company_admin', 'web');
    }

    protected function tearDown(): void
    {
        Auth::forgetGuards();

        parent::tearDown();
    }
}
