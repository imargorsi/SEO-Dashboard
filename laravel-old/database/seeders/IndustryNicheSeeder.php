<?php

namespace Database\Seeders;

use App\Models\IndustryNiche;
use Illuminate\Database\Seeder;

class IndustryNicheSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['slug' => 'it-software', 'name' => 'IT & Software', 'sort_order' => 10, 'is_other' => false],
            ['slug' => 'e-commerce', 'name' => 'E-commerce', 'sort_order' => 20, 'is_other' => false],
            ['slug' => 'healthcare-medical', 'name' => 'Healthcare & Medical', 'sort_order' => 30, 'is_other' => false],
            ['slug' => 'real-estate', 'name' => 'Real Estate', 'sort_order' => 40, 'is_other' => false],
            ['slug' => 'construction-contracting', 'name' => 'Construction & Contracting', 'sort_order' => 50, 'is_other' => false],
            ['slug' => 'education-training', 'name' => 'Education & Training', 'sort_order' => 60, 'is_other' => false],
            ['slug' => 'hospitality-tourism', 'name' => 'Hospitality & Tourism', 'sort_order' => 70, 'is_other' => false],
            ['slug' => 'retail', 'name' => 'Retail', 'sort_order' => 80, 'is_other' => false],
            ['slug' => 'logistics-transportation', 'name' => 'Logistics & Transportation', 'sort_order' => 90, 'is_other' => false],
            ['slug' => 'manufacturing', 'name' => 'Manufacturing', 'sort_order' => 100, 'is_other' => false],
            ['slug' => 'industry-other', 'name' => 'Other', 'sort_order' => 110, 'is_other' => true],
        ];

        foreach ($rows as $row) {
            IndustryNiche::query()->updateOrCreate(
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
