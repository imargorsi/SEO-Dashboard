<?php

use App\Http\Controllers\Api\V1\Admin\CompanyController as AdminCompanyController;
use App\Http\Controllers\Api\V1\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\PermissionController as AdminPermissionController;
use App\Http\Controllers\Api\V1\Admin\RoleController as AdminRoleController;
use App\Http\Controllers\Api\V1\Auth\CurrentUserController;
use App\Http\Controllers\Api\V1\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Api\V1\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\RegisterCompanyController;
use App\Http\Controllers\Api\V1\Auth\LogoutController;
use App\Http\Controllers\Api\V1\Auth\ResetPasswordController;
use App\Http\Controllers\Api\V1\Company\CompanyMemberController;
use App\Http\Controllers\Api\V1\Company\DashboardController as CompanyDashboardController;
use App\Integrations\Google\Http\Controllers\IntegrationController as GoogleIntegrationController;
use App\Integrations\Google\Http\Controllers\OAuthCallbackController as GoogleOAuthCallbackController;
use App\Sheets\Http\Controllers\AdminSheetController;
use App\Sheets\Http\Controllers\ProjectSheetController;
use App\Http\Controllers\Api\V1\Lookup\IndustryNicheListController;
use App\Http\Controllers\Api\V1\Lookup\SeoGoalListController;
use App\Http\Controllers\Api\V1\Me\PasswordController;
use App\Http\Controllers\Api\V1\Me\ProfileController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\System\HealthController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', [HealthController::class, 'ping']);

Route::post('/auth/login', LoginController::class);
Route::post('/auth/register-company', RegisterCompanyController::class)->middleware('throttle:6,1');
Route::post('/auth/forgot-password', ForgotPasswordController::class)->middleware('throttle:6,1');
Route::post('/auth/reset-password', ResetPasswordController::class)->middleware('throttle:6,1');

Route::get('/integrations/google/callback', GoogleOAuthCallbackController::class);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/auth/user', CurrentUserController::class);
    Route::post('/auth/logout', LogoutController::class);

    Route::post('/auth/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1');

    Route::get('/me/profile', [ProfileController::class, 'show']);
    Route::post('/me/profile', [ProfileController::class, 'update']);
    Route::put('/me/password', [PasswordController::class, 'update']);
    Route::delete('/me/profile', [ProfileController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'verified', 'role:super_admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', AdminDashboardController::class);
    Route::get('/companies', [AdminCompanyController::class, 'index']);
    Route::post('/companies', [AdminCompanyController::class, 'store']);
    Route::post('/companies/{company}/approve', [AdminCompanyController::class, 'approve']);
    Route::get('/companies/{company}', [AdminCompanyController::class, 'show']);
    Route::match(['put', 'patch'], '/companies/{company}', [AdminCompanyController::class, 'update']);
    Route::delete('/companies/{company}', [AdminCompanyController::class, 'destroy']);

    Route::get('/roles', [AdminRoleController::class, 'index']);
    Route::post('/roles', [AdminRoleController::class, 'store']);
    Route::get('/roles/{role}', [AdminRoleController::class, 'show'])
        ->where('role', '[0-9]+|[a-z][a-z0-9_]*');
    Route::match(['put', 'patch'], '/roles/{role}', [AdminRoleController::class, 'update'])
        ->where('role', '[0-9]+|[a-z][a-z0-9_]*');
    Route::delete('/roles/{role}', [AdminRoleController::class, 'destroy'])
        ->where('role', '[0-9]+|[a-z][a-z0-9_]*');

    Route::get('/permissions', [AdminPermissionController::class, 'index']);
    Route::post('/permissions', [AdminPermissionController::class, 'store']);
    Route::get('/permissions/{permission}', [AdminPermissionController::class, 'show'])
        ->where('permission', '[a-z0-9._]+');
    Route::match(['put', 'patch'], '/permissions/{permission}', [AdminPermissionController::class, 'update'])
        ->where('permission', '[a-z0-9._]+');
    Route::delete('/permissions/{permission}', [AdminPermissionController::class, 'destroy'])
        ->where('permission', '[a-z0-9._]+');

    Route::get('/sheets', [AdminSheetController::class, 'index']);
    Route::put('/sheets/{type}', [AdminSheetController::class, 'upsert'])
        ->where('type', 'bp|gp|sp|kc');
    Route::delete('/sheets/{type}', [AdminSheetController::class, 'destroy'])
        ->where('type', 'bp|gp|sp|kc');
    Route::post('/sheets/{type}/sync', [AdminSheetController::class, 'sync'])
        ->where('type', 'bp|gp|sp|kc')
        ->middleware('throttle:10,1');
    Route::get('/sheets/{type}/entries', [AdminSheetController::class, 'entries'])
        ->where('type', 'bp|gp|sp|kc');
    Route::get('/sheets/{type}/entries/{entry}', [AdminSheetController::class, 'show'])
        ->where('type', 'bp|gp|sp|kc');
});

Route::middleware(['auth:sanctum', 'verified', 'role:company_admin', 'company.account'])->prefix('company')->group(function () {
    Route::get('/dashboard', CompanyDashboardController::class);
    Route::get('/members', [CompanyMemberController::class, 'index']);
    Route::post('/members', [CompanyMemberController::class, 'store']);
    Route::get('/members/{user}', [CompanyMemberController::class, 'show']);
    Route::match(['put', 'patch'], '/members/{user}', [CompanyMemberController::class, 'update']);
    Route::delete('/members/{user}', [CompanyMemberController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'verified', 'role:super_admin|company_admin'])->group(function () {
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{project}', [ProjectController::class, 'show']);
    Route::match(['put', 'patch'], '/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

    Route::get('/projects/{project}/integrations', [GoogleIntegrationController::class, 'index']);
    Route::post('/projects/{project}/integrations/google/connect', [GoogleIntegrationController::class, 'connect'])
        ->middleware('throttle:10,1');
    Route::delete('/projects/{project}/integrations/google/{service}', [GoogleIntegrationController::class, 'disconnect']);

    Route::get('/projects/{project}/sheets/{type}/entries', [ProjectSheetController::class, 'entries'])
        ->where('type', 'bp|gp|sp|kc');
    Route::get('/projects/{project}/sheets/{type}/entries/{entry}', [ProjectSheetController::class, 'show'])
        ->where('type', 'bp|gp|sp|kc');

    Route::prefix('lookups')->group(function () {
        Route::get('/industry-niches', IndustryNicheListController::class);
        Route::get('/seo-goals', SeoGoalListController::class);
    });
});
