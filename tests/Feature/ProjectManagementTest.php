<?php
namespace Tests\Feature;

use App\Models\Department;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_create_project(): void
    {
        $admin = User::factory()->create([
            'role' => 'administrator',
        ]);

        $engineering = Department::create([
            'name' => 'Engineering',
            'code' => 'ENG',
        ]);

        $housekeeping = Department::create([
            'name' => 'Housekeeping',
            'code' => 'HK',
        ]);

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.projects.store'), [
                'name'           => 'Wedding Preparation',
                'description'    => 'Prepare hotel wedding event',
                'status'         => 'active',
                'start_date'     => '2026-09-20',
                'due_date'       => '2026-09-25',
                'department_ids' => [
                    $engineering->id,
                    $housekeeping->id,
                ],
            ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('projects', [
            'name'       => 'Wedding Preparation',
            'status'     => 'active',
            'created_by' => $admin->id,
        ]);

        $project = Project::where(
            'name',
            'Wedding Preparation'
        )->firstOrFail();

        $this->assertDatabaseHas('department_project', [
            'project_id'    => $project->id,
            'department_id' => $engineering->id,
        ]);

        $this->assertDatabaseHas('department_project', [
            'project_id'    => $project->id,
            'department_id' => $housekeeping->id,
        ]);
    }

    public function test_staff_can_create_project_for_other_department(): void
    {
        $frontOffice = Department::create([
            'name' => 'Front Office',
            'code' => 'FO',
        ]);

        $engineering = Department::create([
            'name' => 'Engineering',
            'code' => 'ENG',
        ]);

        $staff = User::factory()->create([
            'role'          => 'staff',
            'department_id' => $frontOffice->id,
        ]);

        $response = $this
            ->actingAs($staff)
            ->post(route('projects.store'), [
                'name'           => 'AC Room 502 Problem',
                'description'    => 'AC room tidak dingin.',
                'status'         => 'active',
                'department_ids' => [
                    $engineering->id,
                ],
            ]);

        $response->assertSessionHasNoErrors();

        $project = Project::where(
            'name',
            'AC Room 502 Problem'
        )->firstOrFail();

        $this->assertEquals(
            $staff->id,
            $project->created_by
        );

        $this->assertDatabaseHas('department_project', [
            'project_id'    => $project->id,
            'department_id' => $frontOffice->id,
        ]);

        $this->assertDatabaseHas('department_project', [
            'project_id'    => $project->id,
            'department_id' => $engineering->id,
        ]);
    }

    public function test_staff_can_view_project_for_own_department(): void
    {
        $department = Department::create([
            'name' => 'Engineering',
            'code' => 'ENG',
        ]);

        $staff = User::factory()->create([
            'role'          => 'staff',
            'department_id' => $department->id,
        ]);

        $project = Project::create([
            'name'   => 'Maintenance Project',
            'status' => 'active',
        ]);

        $project->departments()->attach(
            $department->id
        );

        $response = $this
            ->actingAs($staff)
            ->get(route('projects.show', $project));

        $response->assertOk();
    }

    public function test_staff_cannot_view_project_from_other_department(): void
    {
        $engineering = Department::create([
            'name' => 'Engineering',
            'code' => 'ENG',
        ]);

        $accounting = Department::create([
            'name' => 'Accounting',
            'code' => 'ACC',
        ]);

        $staff = User::factory()->create([
            'role'          => 'staff',
            'department_id' => $accounting->id,
        ]);

        $project = Project::create([
            'name'   => 'Engineering Project',
            'status' => 'active',
        ]);

        $project->departments()->attach(
            $engineering->id
        );

        $response = $this
            ->actingAs($staff)
            ->get(route('projects.show', $project));

        $response->assertForbidden();
    }

    public function test_staff_cannot_update_project_created_by_other_staff(): void
    {
        $department = Department::create([
            'name' => 'Engineering',
            'code' => 'ENG',
        ]);

        $creator = User::factory()->create([
            'role'          => 'staff',
            'department_id' => $department->id,
        ]);

        $otherStaff = User::factory()->create([
            'role'          => 'staff',
            'department_id' => $department->id,
        ]);

        $project = Project::create([
            'name'       => 'Original Project',
            'status'     => 'active',
            'created_by' => $creator->id,
        ]);

        $project->departments()->attach(
            $department->id
        );

        $response = $this
            ->actingAs($otherStaff)
            ->patch(route('projects.update', $project), [
                'name'           => 'Hacked Project',
                'status'         => 'active',
                'department_ids' => [
                    $department->id,
                ],
            ]);

        $response->assertForbidden();

        $this->assertDatabaseHas('projects', [
            'id'   => $project->id,
            'name' => 'Original Project',
        ]);
    }
}
