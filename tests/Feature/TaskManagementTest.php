<?php
namespace Tests\Feature;

use App\Models\Department;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_create_general_task_for_other_department(): void
    {
        $frontOffice = Department::create([
            'name' => 'Front Office',
            'code' => 'FO',
        ]);

        $it = Department::create([
            'name' => 'Information Technology',
            'code' => 'IT',
        ]);

        $creator = User::factory()->create([
            'role'          => 'staff',
            'department_id' => $frontOffice->id,
        ]);

        $assignee = User::factory()->create([
            'role'          => 'staff',
            'department_id' => $it->id,
        ]);

        $response = $this
            ->actingAs($creator)
            ->post(route('tasks.store'), [
                'project_id'   => null,
                'title'        => 'Perbaiki PC Front Office',
                'description'  => 'PC tidak dapat boot.',
                'status'       => 'todo',
                'priority'     => 'urgent',
                'assignee_ids' => [
                    $assignee->id,
                ],
            ]);

        $response->assertSessionHasNoErrors();

        $task = Task::where(
            'title',
            'Perbaiki PC Front Office'
        )->firstOrFail();

        $this->assertNull($task->project_id);

        $this->assertDatabaseHas('tasks', [
            'id'         => $task->id,
            'created_by' => $creator->id,
            'title'      => 'Perbaiki PC Front Office',
            'status'     => 'todo',
            'priority'   => 'urgent',
        ]);

        $this->assertDatabaseHas('task_user', [
            'task_id' => $task->id,
            'user_id' => $assignee->id,
        ]);
    }

    public function test_staff_can_create_task_inside_project(): void
    {
        $frontOffice = Department::create([
            'name' => 'Front Office',
            'code' => 'FO',
        ]);

        $engineering = Department::create([
            'name' => 'Engineering',
            'code' => 'ENG',
        ]);

        $creator = User::factory()->create([
            'role'          => 'staff',
            'department_id' => $frontOffice->id,
        ]);

        $assignee = User::factory()->create([
            'role'          => 'staff',
            'department_id' => $engineering->id,
        ]);

        $project = Project::create([
            'name'        => 'Wedding Event',
            'description' => 'Wedding preparation project.',
            'status'      => 'active',
            'created_by'  => $creator->id,
        ]);

        $project->departments()->attach([
            $frontOffice->id,
            $engineering->id,
        ]);

        $response = $this
            ->actingAs($creator)
            ->post(route('tasks.store'), [
                'project_id'   => $project->id,
                'title'        => 'Setup Lighting',
                'description'  => 'Setup lighting ballroom.',
                'status'       => 'todo',
                'priority'     => 'high',
                'assignee_ids' => [
                    $assignee->id,
                ],
            ]);

        $response->assertSessionHasNoErrors();

        $task = Task::where(
            'title',
            'Setup Lighting'
        )->firstOrFail();

        $this->assertEquals(
            $project->id,
            $task->project_id
        );

        $this->assertDatabaseHas('tasks', [
            'id'         => $task->id,
            'project_id' => $project->id,
            'created_by' => $creator->id,
            'title'      => 'Setup Lighting',
            'status'     => 'todo',
            'priority'   => 'high',
        ]);

        $this->assertDatabaseHas('task_user', [
            'task_id' => $task->id,
            'user_id' => $assignee->id,
        ]);
    }

    public function test_assignee_can_update_task_status(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title'      => 'Perbaiki PC FO',
            'status'     => 'todo',
            'priority'   => 'high',
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' => now(),
            ]
        );

        $response = $this
            ->actingAs($assignee)
            ->patch(
                route('tasks.status.update', $task),
                [
                    'status' => 'in_progress',
                ]
            );

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('tasks', [
            'id'     => $task->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_assignee_cannot_edit_task_details(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by'  => $creator->id,
            'title'       => 'Original Task',
            'description' => 'Original description',
            'status'      => 'todo',
            'priority'    => 'high',
        ]);

        $task->assignees()->attach(
            $assignee->id
        );

        $response = $this
            ->actingAs($assignee)
            ->patch(
                route('tasks.update', $task),
                [
                    'project_id'   => null,
                    'title'        => 'Changed Task',
                    'description'  => 'Changed description',
                    'priority'     => 'low',
                    'due_at'       => null,
                    'assignee_ids' => [
                        $assignee->id,
                    ],
                ]
            );

        $response->assertForbidden();

        $this->assertDatabaseHas('tasks', [
            'id'       => $task->id,
            'title'    => 'Original Task',
            'priority' => 'high',
        ]);
    }

    public function test_unrelated_staff_cannot_update_task_status(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $unrelatedUser = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title'      => 'Private Task',
            'status'     => 'todo',
            'priority'   => 'medium',
        ]);

        $response = $this
            ->actingAs($unrelatedUser)
            ->patch(
                route('tasks.status.update', $task),
                [
                    'status' => 'done',
                ]
            );

        $response->assertForbidden();

        $this->assertDatabaseHas('tasks', [
            'id'     => $task->id,
            'status' => 'todo',
        ]);
    }

    public function test_creator_can_update_task_status(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title'      => 'My Task',
            'status'     => 'todo',
            'priority'   => 'medium',
        ]);

        $response = $this
            ->actingAs($creator)
            ->patch(
                route('tasks.status.update', $task),
                [
                    'status' => 'in_progress',
                ]
            );

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('tasks', [
            'id'     => $task->id,
            'status' => 'in_progress',
        ]);
    }
}
