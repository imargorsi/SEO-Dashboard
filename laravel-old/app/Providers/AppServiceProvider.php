<?php

namespace App\Providers;

use App\Models\Project;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $root = config('app.url');
        if (is_string($root) && $root !== '') {
            URL::forceRootUrl($root);
        }
        if (is_string($root) && str_starts_with($root, 'https://')) {
            URL::forceScheme('https');
        }

        ResetPassword::createUrlUsing(function (object $notifiable, string $token): string {
            $base = rtrim((string) config('app.frontend_url', config('app.url')), '/');

            return $base.'/reset-password?'.http_build_query([
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);
        });

        Route::bind('project', function (string $value): Project {
            $project = Project::query()->find($value);
            if ($project === null) {
                abort(404);
            }

            $user = request()->user();
            if ($user?->hasRole('company_admin') && ! $user->hasRole('super_admin')) {
                if ((int) $project->company_id !== (int) $user->company_id) {
                    abort(404);
                }
            }

            return $project;
        });
    }
}
