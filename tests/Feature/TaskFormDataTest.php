<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskFormDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_staff_can_access_create_task_form_data(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $project = Project::create([
            'name' => 'Hotel Project',
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->get(
                route('tasks.create')
            );

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->has('formData.projects', 1)
                ->where(
                    'formData.projects.0.id',
                    $project->id
                )
                ->has(
                    'formData.assignees',
                    2
                )
                ->where(
                    'formData.options.initial_status',
                    'todo'
                )
        );
    }

    public function test_task_form_only_contains_projects_visible_to_user(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        $otherUser = User::factory()->create([
            'role' => 'staff',
        ]);

        $visibleProject = Project::create([
            'name' => 'My Project',
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        Project::create([
            'name' => 'Secret Project',
            'status' => 'active',
            'created_by' => $otherUser->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->get(
                route('tasks.create')
            );

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->has(
                    'formData.projects',
                    1
                )
                ->where(
                    'formData.projects.0.id',
                    $visibleProject->id
                )
        );
    }

    public function test_department_project_is_available_in_task_form(): void
    {
        $department = Department::create([
            'name' => 'Engineering',
            'code' => 'ENG',
        ]);

        $user = User::factory()->create([
            'role' => 'staff',
            'department_id' => $department->id,
        ]);

        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $project = Project::create([
            'name' => 'Ballroom Renovation',
            'status' => 'active',
            'created_by' => $creator->id,
        ]);

        $project
            ->departments()
            ->attach(
                $department->id
            );

        $response = $this
            ->actingAs($user)
            ->get(
                route('tasks.create')
            );

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->has(
                    'formData.projects',
                    1
                )
                ->where(
                    'formData.projects.0.id',
                    $project->id
                )
        );
    }

    public function test_staff_cannot_create_task_inside_inaccessible_project(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $attacker = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $privateProject = Project::create([
            'name' => 'Private Project',
            'status' => 'active',
            'created_by' => $creator->id,
        ]);

        $response = $this
            ->actingAs($attacker)
            ->post(
                route('tasks.store'),
                [
                    'project_id' =>
                        $privateProject->id,

                    'title' =>
                        'Injected Task',

                    'description' =>
                        'Should not be created',

                    'priority' =>
                        'high',

                    'assignee_ids' => [
                        $assignee->id,
                    ],
                ]
            );

        $response->assertForbidden();

        $this->assertDatabaseMissing(
            'tasks',
            [
                'title' =>
                    'Injected Task',
            ]
        );
    }

    public function test_new_task_always_starts_as_todo(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $response = $this
            ->actingAs($creator)
            ->post(
                route('tasks.store'),
                [
                    'title' =>
                        'New Assignment',

                    'priority' =>
                        'high',

                    'assignee_ids' => [
                        $assignee->id,
                    ],
                ]
            );

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas(
            'tasks',
            [
                'title' =>
                    'New Assignment',

                'status' =>
                    'todo',
            ]
        );
    }

    public function test_creator_cannot_move_task_into_inaccessible_project(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        $otherUser = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $user->id,
            'title' => 'Existing Task',
            'status' => 'todo',
            'priority' => 'medium',
        ]);

        $task
            ->assignees()
            ->attach(
                $assignee->id
            );

        $privateProject = Project::create([
            'name' => 'Other Project',
            'status' => 'active',
            'created_by' => $otherUser->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->patch(
                route(
                    'tasks.update',
                    $task
                ),
                [
                    'project_id' =>
                        $privateProject->id,

                    'title' =>
                        $task->title,

                    'description' =>
                        null,

                    'priority' =>
                        $task->priority,

                    'requires_review' =>
                        false,

                    'assignee_ids' => [
                        $assignee->id,
                    ],
                ]
            );

        $response->assertForbidden();

        $task->refresh();

        $this->assertNull(
            $task->project_id
        );
    }
}
