<?php

namespace App\Console\Commands;

use App\Integrations\Google\Services\TokenRefreshService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RefreshGoogleTokensCommand extends Command
{
    protected $signature = 'google:refresh-tokens';

    protected $description = 'Refresh expiring Google OAuth tokens for all connected integrations';

    public function __construct(
        private readonly TokenRefreshService $tokenRefreshService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Checking for expiring Google OAuth tokens...');

        $result = $this->tokenRefreshService->refreshAllExpiringTokens();

        $this->info("Total integrations checked: {$result['total']}");
        $this->info("Tokens refreshed: {$result['refreshed']}");
        
        if ($result['failed'] > 0) {
            $this->warn("Tokens failed to refresh: {$result['failed']}");
            Log::warning('Google token refresh completed with failures', $result);
        } else {
            $this->info('All tokens are up to date.');
            Log::info('Google token refresh completed successfully', $result);
        }

        return self::SUCCESS;
    }
}
