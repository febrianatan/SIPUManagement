<?php

namespace Tests\Feature\Admin;

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepartmentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_create_department(): void
    {
        $admin = User::factory()->create([
            'role' => 'administrator',
        ]);

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.departments.store'), [
                'name' => 'Engineering',
                'code' => 'ENG',
                'description' => 'Engineering Department',
            ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('departments', [
            'name' => 'Engineering',
            'code' => 'ENG',
        ]);
    }

    public function test_administrator_can_update_department(): void
    {
        $admin = User::factory()->create([
            'role' => 'administrator',
        ]);

        $department = Department::create([
            'name' => 'Engineering',
            'code' => 'ENG',
        ]);

        $response = $this
            ->actingAs($admin)
            ->patch(route('admin.departments.update', $department), [
                'name' => 'Engineering & Maintenance',
                'code' => 'ENG',
                'description' => 'Engineering and Maintenance Department',
            ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('departments', [
            'id' => $department->id,
            'name' => 'Engineering & Maintenance',
        ]);
    }

    public function test_administrator_can_delete_empty_department(): void
    {
        $admin = User::factory()->create([
            'role' => 'administrator',
        ]);

        $department = Department::create([
            'name' => 'Temporary Department',
            'code' => 'TEMP',
        ]);

        $response = $this
            ->actingAs($admin)
            ->delete(route('admin.departments.destroy', $department));

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('departments', [
            'id' => $department->id,
        ]);
    }

    public function test_department_with_users_cannot_be_deleted(): void
    {
        $admin = User::factory()->create([
            'role' => 'administrator',
        ]);

        $department = Department::create([
            'name' => 'Accounting',
            'code' => 'ACC',
        ]);

        User::factory()->create([
            'department_id' => $department->id,
            'role' => 'staff',
        ]);

        $response = $this
            ->actingAs($admin)
            ->delete(route('admin.departments.destroy', $department));

        $response->assertSessionHasErrors('department');

        $this->assertDatabaseHas('departments', [
            'id' => $department->id,
        ]);
    }

    public function test_staff_cannot_manage_departments(): void
    {
        $staff = User::factory()->create([
            'role' => 'staff',
        ]);

        $response = $this
            ->actingAs($staff)
            ->post(route('admin.departments.store'), [
                'name' => 'Secret Department',
                'code' => 'SECRET',
            ]);

        $response->assertForbidden();

        $this->assertDatabaseMissing('departments', [
            'code' => 'SECRET',
        ]);
    }
}
