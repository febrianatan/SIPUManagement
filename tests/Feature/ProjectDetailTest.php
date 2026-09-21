<?php
namespace Tests\Feature;

use App\Models\Department;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectDetailTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_detail_returns_task_statistics(): void
    {
        $department = Department::create([
            'name' => 'Information Technology',
            'code' => 'IT',
        ]);

        $creator = User::factory()->create([
            'role'          => 'staff',
            'department_id' => $department->id,
        ]);

        $project = Project::create([
            'name'       => 'New Hotel System',
            'status'     => 'active',
            'created_by' => $creator->id,
        ]);

        $project
            ->departments()
            ->attach($department->id);

        Task::create([
            'project_id' => $project->id,
            'created_by' => $creator->id,
            'title'      => 'Todo Task',
            'status'     => 'todo',
            'priority'   => 'medium',
        ]);

        Task::create([
            'project_id' => $project->id,
            'created_by' => $creator->id,
            'title'      => 'Progress Task',
            'status'     => 'in_progress',
            'priority'   => 'high',
        ]);

        Task::create([
            'project_id' => $project->id,
            'created_by' => $creator->id,
            'title'      => 'Review Task',
            'status'     => 'review',
            'priority'   => 'medium',
        ]);

        Task::create([
            'project_id' => $project->id,
            'created_by' => $creator->id,
            'title'      => 'Done Task',
            'status'     => 'done',
            'priority'   => 'low',
        ]);

        $response = $this
            ->actingAs($creator)
            ->get(
                route(
                    'projects.show',
                    $project
                )
            );

        $response->assertOk();

        $response->assertInertia(
            fn($page) => $page
                ->where(
                    'stats.total_tasks',
                    4
                )
                ->where(
                    'stats.todo',
                    1
                )
                ->where(
                    'stats.in_progress',
                    1
                )
                ->where(
                    'stats.review',
                    1
                )
                ->where(
                    'stats.done',
                    1
                )
                ->where(
                    'stats.completion_percentage',
                    25
                )
                ->has(
                    'tasks',
                    4
                )
        );
    }

    public function test_general_tasks_are_not_shown_inside_project(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        $project = Project::create([
            'name'       => 'Wedding Event',
            'status'     => 'active',
            'created_by' => $user->id,
        ]);

        Task::create([
            'project_id' => $project->id,
            'created_by' => $user->id,
            'title'      => 'Project Task',
            'status'     => 'todo',
            'priority'   => 'high',
        ]);

        Task::create([
            'project_id' => null,
            'created_by' => $user->id,
            'title'      => 'General Task',
            'status'     => 'todo',
            'priority'   => 'medium',
        ]);

        $response = $this
            ->actingAs($user)
            ->get(
                route(
                    'projects.show',
                    $project
                )
            );

        $response->assertOk();

        $response->assertInertia(
            fn($page) => $page
                ->where(
                    'stats.total_tasks',
                    1
                )
                ->has(
                    'tasks',
                    1
                )
                ->where(
                    'tasks.0.title',
                    'Project Task'
                )
        );
    }

    public function test_project_member_can_see_task_summary_but_cannot_open_unrelated_task(): void
    {
        $department = Department::create([
            'name' => 'Engineering',
            'code' => 'ENG',
        ]);

        $projectCreator =
        User::factory()->create([
            'role' => 'staff',
        ]);

        $departmentStaff =
        User::factory()->create([
            'role'          => 'staff',
            'department_id' =>
            $department->id,
        ]);

        $otherAssignee =
        User::factory()->create([
            'role' => 'staff',
        ]);

        $project = Project::create([
            'name'       => 'Ballroom Renovation',
            'status'     => 'active',
            'created_by' =>
            $projectCreator->id,
        ]);

        $project
            ->departments()
            ->attach(
                $department->id
            );

        $task = Task::create([
            'project_id' =>
            $project->id,

            'created_by' =>
            $projectCreator->id,

            'title'      =>
            'Electrical Work',

            'status'     =>
            'todo',

            'priority'   =>
            'high',
        ]);

        $task
            ->assignees()
            ->attach(
                $otherAssignee->id
            );

        $response = $this
            ->actingAs($departmentStaff)
            ->get(
                route(
                    'projects.show',
                    $project
                )
            );

        $response->assertOk();

        /*
         * Staff boleh melihat task sebagai
         * bagian dari overview project.
         */
        $response->assertInertia(
            fn($page) => $page
                ->has('tasks', 1)
                ->where(
                    'tasks.0.id',
                    $task->id
                )
                ->where(
                    'tasks.0.can_open',
                    false
                )
                ->where(
                    'tasks.0.can_update_status',
                    false
                )
        );

        /*
         * Tetapi tidak boleh membuka
         * Task Detail-nya.
         */
        $this
            ->actingAs($departmentStaff)
            ->get(
                route(
                    'tasks.show',
                    $task
                )
            )
            ->assertForbidden();
    }

    public function test_assignee_can_open_task_from_project(): void
    {
        $creator =
        User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee =
        User::factory()->create([
            'role' => 'staff',
        ]);

        $project = Project::create([
            'name'       => 'Wedding Event',
            'status'     => 'active',
            'created_by' => $creator->id,
        ]);

        $task = Task::create([
            'project_id' =>
            $project->id,

            'created_by' =>
            $creator->id,

            'title'      =>
            'Setup Lighting',

            'status'     =>
            'todo',

            'priority'   =>
            'high',
        ]);

        $task
            ->assignees()
            ->attach(
                $assignee->id
            );

        /*
         * Supaya assignee juga punya akses
         * ke Project.
         *
         * Untuk test ini kita buat dia creator
         * department-less? Tidak.
         *
         * Cara paling sederhana adalah
         * project creator tetap bisa melihat,
         * lalu kita menguji permission task
         * langsung.
         */

        $this
            ->actingAs($assignee)
            ->get(
                route(
                    'tasks.show',
                    $task
                )
            )
            ->assertOk();
    }

    public function test_task_assignee_can_view_parent_project(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $project = Project::create([
            'name'       => 'Wedding Event',
            'status'     => 'active',
            'created_by' => $creator->id,
        ]);

        $task = Task::create([
            'project_id' => $project->id,
            'created_by' => $creator->id,
            'title'      => 'Setup Lighting',
            'status'     => 'todo',
            'priority'   => 'high',
        ]);

        $task->assignees()->attach(
            $assignee->id
        );

        $response = $this
            ->actingAs($assignee)
            ->get(
                route(
                    'projects.show',
                    $project
                )
            );

        $response->assertOk();

        $response->assertInertia(
            fn($page) => $page
                ->where(
                    'project.id',
                    $project->id
                )
                ->has(
                    'tasks',
                    1
                )
                ->where(
                    'tasks.0.id',
                    $task->id
                )
                ->where(
                    'tasks.0.can_open',
                    true
                )
        );
    }
}
