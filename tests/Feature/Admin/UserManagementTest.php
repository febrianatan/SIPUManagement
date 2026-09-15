<?php
namespace Tests\Feature\Admin;

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_create_user(): void
    {
        $admin = User::factory()->create([
            'role' => 'administrator',
        ]);

        $department = Department::create([
            'name' => 'Information Technology',
            'code' => 'IT',
        ]);

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name'                  => 'Test Staff',
                'email'                 => 'staff@sipu.com',
                'password'              => 'password123',
                'password_confirmation' => 'password123',
                'department_id'         => $department->id,
                'role'                  => 'staff',
            ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', [
            'name'          => 'Test Staff',
            'email'         => 'staff@sipu.com',
            'department_id' => $department->id,
            'role'          => 'staff',
        ]);
    }

    public function test_staff_cannot_create_user(): void
    {
        $staff = User::factory()->create([
            'role' => 'staff',
        ]);

        $response = $this
            ->actingAs($staff)
            ->post(route('admin.users.store'), [
                'name'                  => 'Another Staff',
                'email'                 => 'another@sipu.com',
                'password'              => 'password123',
                'password_confirmation' => 'password123',
                'role'                  => 'staff',
            ]);

        $response->assertForbidden();

        $this->assertDatabaseMissing('users', [
            'email' => 'another@sipu.com',
        ]);
    }

    public function test_administrator_can_update_user(): void
    {
        $admin = User::factory()->create([
            'role' => 'administrator',
        ]);

        $department = Department::create([
            'name' => 'Accounting',
            'code' => 'ACC',
        ]);

        $staff = User::factory()->create([
            'name'  => 'Old Name',
            'email' => 'old@sipu.com',
            'role'  => 'staff',
        ]);

        $response = $this
            ->actingAs($admin)
            ->patch(route('admin.users.update', $staff), [
                'name'                  => 'Updated Staff',
                'email'                 => 'updated@sipu.com',
                'department_id'         => $department->id,
                'role'                  => 'staff',
                'password'              => '',
                'password_confirmation' => '',
            ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', [
            'id'            => $staff->id,
            'name'          => 'Updated Staff',
            'email'         => 'updated@sipu.com',
            'department_id' => $department->id,
        ]);
    }

    public function test_administrator_can_delete_user(): void
    {
        $admin = User::factory()->create([
            'role' => 'administrator',
        ]);

        $staff = User::factory()->create([
            'role' => 'staff',
        ]);

        $response = $this
            ->actingAs($admin)
            ->delete(route('admin.users.destroy', $staff));

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('users', [
            'id' => $staff->id,
        ]);
    }

    public function test_administrator_cannot_delete_own_account(): void
    {
        $admin = User::factory()->create([
            'role' => 'administrator',
        ]);

        $response = $this
            ->actingAs($admin)
            ->delete(route('admin.users.destroy', $admin));

        $response->assertSessionHasErrors('user');

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
        ]);
    }
}
