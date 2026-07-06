<?php

use App\Http\Controllers\Web\SignedEmailVerificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web routes — SPA shell only (React). All application JSON is under /api.
|--------------------------------------------------------------------------
*/

Route::middleware(['signed', 'throttle:6,1'])->group(function () {
    Route::get('/email/verify/{id}/{hash}', SignedEmailVerificationController::class)
        ->name('verification.verify');
});

Route::view('/', 'app')->name('spa.home');

Route::view('/{any}', 'app')
    ->where('any', '^(?!api\/)(?!docs(\/|$))(?!web-once-setup\.php$)(?!server-setup\.php$)(?!regenerate-swagger\.php$)(?!sync-super-admin-permissions\.php$).*$')
    ->name('spa');
