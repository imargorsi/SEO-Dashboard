<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Project;
use App\Models\SeoGoal;
use Illuminate\Database\Seeder;

class SheetSpreadsheetProjectsSeeder extends Seeder
{
    public function run(): void
    {
        $goalIds = SeoGoal::query()
            ->whereIn('slug', ['organic-traffic', 'keyword-rankings'])
            ->pluck('id')
            ->all();

        $clients = [
            [
                'site_code' => 'MTC',
                'company_name' => 'Multitech',
                'company_slug' => 'multitech',
                'business_name' => 'Multitech',
                'website_url' => 'https://multitech.sa',
                'poc_email' => 'poc@multitech.sa',
            ],
            [
                'site_code' => 'Pecto',
                'company_name' => 'Petco Pakistan',
                'company_slug' => 'petco-pk',
                'business_name' => 'Petco',
                'website_url' => 'https://petco.pk',
                'poc_email' => 'poc@petco.pk',
            ],
            [
                'site_code' => 'Pets',
                'company_name' => 'Pets Emporium',
                'company_slug' => 'pets-emporium',
                'business_name' => 'Pets Emporium',
                'website_url' => 'https://petsemporium.pk',
                'poc_email' => 'poc@petsemporium.pk',
            ],
            [
                'site_code' => 'Reachware',
                'company_name' => 'Reachware',
                'company_slug' => 'reachware',
                'business_name' => 'Reachware',
                'website_url' => 'https://reachware.com',
                'poc_email' => 'poc@reachware.com',
            ],
        ];

        foreach ($clients as $client) {
            $company = Company::query()->updateOrCreate(
                ['slug' => $client['company_slug']],
                [
                    'name' => $client['company_name'],
                    'website_url' => $client['website_url'],
                    'poc_name' => 'POC',
                    'poc_email' => $client['poc_email'],
                    'is_active' => true,
                    'status' => Company::STATUS_APPROVED,
                ]
            );

            $project = Project::query()->updateOrCreate(
                [
                    'company_id' => $company->id,
                    'site_code' => $client['site_code'],
                ],
                [
                    'business_name' => $client['business_name'],
                    'website_url' => $client['website_url'],
                    'target_locations' => ['Global'],
                    'is_b2b' => true,
                    'is_b2c' => true,
                    'cms_login_page_url' => $client['website_url'].'/wp-login.php',
                    'cms_username' => 'admin',
                    'cms_password' => 'changeme',
                ]
            );

            if ($goalIds !== []) {
                $project->seoGoals()->sync($goalIds);
            }
        }
    }
}
