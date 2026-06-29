<?php

namespace Database\Seeders;

use App\Models\SeoGoal;
use Illuminate\Database\Seeder;

class SeoGoalSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['slug' => 'organic-traffic', 'name' => 'Increase organic traffic', 'sort_order' => 10, 'is_other' => false],
            ['slug' => 'leads', 'name' => 'Increase leads', 'sort_order' => 20, 'is_other' => false],
            ['slug' => 'sales', 'name' => 'Increase sales', 'sort_order' => 30, 'is_other' => false],
            ['slug' => 'keyword-rankings', 'name' => 'Improve keyword rankings', 'sort_order' => 40, 'is_other' => false],
            ['slug' => 'local-seo', 'name' => 'Local SEO visibility', 'sort_order' => 50, 'is_other' => false],
            ['slug' => 'brand-awareness', 'name' => 'Brand awareness', 'sort_order' => 60, 'is_other' => false],
            ['slug' => 'seo-goal-other', 'name' => 'Other', 'sort_order' => 70, 'is_other' => true],
        ];

        foreach ($rows as $row) {
            SeoGoal::query()->updateOrCreate(
                ['slug' => $row['slug']],
                [
                    'name' => $row['name'],
                    'sort_order' => $row['sort_order'],
                    'is_other' => $row['is_other'],
                ]
            );
        }
    }
}
