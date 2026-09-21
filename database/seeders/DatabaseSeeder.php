<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DepartmentSeeder::class,
        ]);

        \App\Models\User::factory()->create([
            'name' => 'Admin SIPU',
            'email' => 'admin@example.com',
            'role' => 'administrator',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);

        \App\Models\User::factory()->create([
            'name' => 'Staff Biasa',
            'email' => 'staff@example.com',
            'role' => 'staff',
            'department_id' => 1,
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);
    }
}
