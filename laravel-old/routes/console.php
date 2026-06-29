<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Refresh Google OAuth tokens every 30 minutes
Schedule::command('google:refresh-tokens')
    ->everyThirtyMinutes()
    ->withoutOverlapping()
    ->runInBackground()
    ->description('Refresh expiring Google OAuth tokens');
