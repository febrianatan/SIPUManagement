<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Information Technology',
                'code' => 'IT',
                'description' => 'Information Technology Department',
            ],
            [
                'name' => 'Accounting',
                'code' => 'ACC',
                'description' => 'Accounting Department',
            ],
            [
                'name' => 'Front Office',
                'code' => 'FO',
                'description' => 'Front Office Department',
            ],
            [
                'name' => 'Housekeeping',
                'code' => 'HK',
                'description' => 'Housekeeping Department',
            ],
            [
                'name' => 'Engineering',
                'code' => 'ENG',
                'description' => 'Engineering Department',
            ],
            [
                'name' => 'Human Resources',
                'code' => 'HR',
                'description' => 'Human Resources Department',
            ],
            [
                'name' => 'Food & Beverage',
                'code' => 'FNB',
                'description' => 'Food & Beverage Department',
            ],
            [
                'name' => 'Sales & Marketing',
                'code' => 'SM',
                'description' => 'Sales & Marketing Department',
            ],
            [
                'name' => 'SKA Co Ex',
                'code' => 'COEX',
                'description' => 'SKA Co Ex Department',
            ],
        ];

        foreach ($departments as $department) {
            Department::updateOrCreate(
                ['code' => $department['code']],
                $department
            );
        }
    }
}
