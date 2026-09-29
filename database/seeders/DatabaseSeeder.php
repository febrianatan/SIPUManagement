<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DepartmentSeeder::class,
        ]);

        User::factory()->create([
            'name' => 'Admin SIPU',
            'email' => 'admin@example.com',
            'role' => 'administrator',
            'password' => Hash::make('password'),
        ]);

        User::factory()->create([
            'name' => 'Staff Biasa',
            'email' => 'staff@example.com',
            'role' => 'staff',
            'department_id' => 1,
            'password' => Hash::make('password'),
        ]);
    }
}
