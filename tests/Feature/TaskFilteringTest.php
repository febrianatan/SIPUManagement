<?php
namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskFilteringTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_only_sees_created_or_assigned_tasks(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        $otherUser = User::factory()->create([
            'role' => 'staff',
        ]);

        /*
     * Task dibuat oleh user login.
     * Harus terlihat.
     */
        Task::create([
            'created_by' => $user->id,
            'title'      => 'Created By Me',
            'status'     => 'todo',
            'priority'   => 'medium',
        ]);

        /*
     * Task dibuat user lain,
     * tetapi user login menjadi assignee.
     * Harus terlihat.
     */
        $assignedTask = Task::create([
            'created_by' => $otherUser->id,
            'title'      => 'Assigned To Me',
            'status'     => 'todo',
            'priority'   => 'high',
        ]);

        $assignedTask
            ->assignees()
            ->attach($user->id);

        /*
     * Task user lain dan user login
     * tidak menjadi assignee.
     * Tidak boleh terlihat.
     */
        Task::create([
            'created_by' => $otherUser->id,
            'title'      => 'Unrelated Task',
            'status'     => 'todo',
            'priority'   => 'medium',
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('tasks.index'));

        $response->assertOk();

        $response->assertInertia(
            fn($page) => $page
                ->where('tasks.total', 2)
                ->has('tasks.data', 2)
        );
    }

    public function test_tasks_can_be_searched_by_title(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        Task::create([
            'created_by' => $user->id,
            'title'      => 'Perbaiki Printer Front Office',
            'status'     => 'todo',
            'priority'   => 'high',
        ]);

        Task::create([
            'created_by' => $user->id,
            'title'      => 'Check Network Ballroom',
            'status'     => 'todo',
            'priority'   => 'medium',
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('tasks.index', [
                'search' => 'printer',
            ]));

        $response->assertOk();

        $response->assertInertia(
            fn($page) => $page
                ->where('tasks.total', 1)
                ->where(
                    'tasks.data.0.title',
                    'Perbaiki Printer Front Office'
                )
                ->where(
                    'filters.search',
                    'printer'
                )
        );
    }

    public function test_tasks_can_be_filtered_by_status_and_priority(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        Task::create([
            'created_by' => $user->id,
            'title'      => 'Urgent Progress',
            'status'     => 'in_progress',
            'priority'   => 'urgent',
        ]);

        Task::create([
            'created_by' => $user->id,
            'title'      => 'Urgent Todo',
            'status'     => 'todo',
            'priority'   => 'urgent',
        ]);

        Task::create([
            'created_by' => $user->id,
            'title'      => 'Normal Progress',
            'status'     => 'in_progress',
            'priority'   => 'medium',
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('tasks.index', [
                'status'   => 'in_progress',
                'priority' => 'urgent',
            ]));

        $response->assertOk();

        $response->assertInertia(
            fn($page) => $page
                ->where('tasks.total', 1)
                ->where(
                    'tasks.data.0.title',
                    'Urgent Progress'
                )
                ->where(
                    'filters.status',
                    'in_progress'
                )
                ->where(
                    'filters.priority',
                    'urgent'
                )
        );
    }

    public function test_tasks_can_be_filtered_by_project(): void
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
            'title'      => 'Wedding Task',
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
            ->get(route('tasks.index', [
                'project_id' => $project->id,
            ]));

        $response->assertOk();

        $response->assertInertia(
            fn($page) => $page
                ->where('tasks.total', 1)
                ->where(
                    'tasks.data.0.title',
                    'Wedding Task'
                )
        );
    }

    public function test_creator_can_filter_tasks_by_assignee(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assigneeA = User::factory()->create([
            'role' => 'staff',
        ]);

        $assigneeB = User::factory()->create([
            'role' => 'staff',
        ]);

        $taskA = Task::create([
            'created_by' => $creator->id,
            'title'      => 'Task Albert',
            'status'     => 'todo',
            'priority'   => 'medium',
        ]);

        $taskB = Task::create([
            'created_by' => $creator->id,
            'title'      => 'Task Budi',
            'status'     => 'todo',
            'priority'   => 'medium',
        ]);

        $taskA->assignees()->attach(
            $assigneeA->id
        );

        $taskB->assignees()->attach(
            $assigneeB->id
        );

        $response = $this
            ->actingAs($creator)
            ->get(route('tasks.index', [
                'assignee_id' => $assigneeA->id,
            ]));

        $response->assertOk();

        $response->assertInertia(
            fn($page) => $page
                ->where('tasks.total', 1)
                ->where(
                    'tasks.data.0.id',
                    $taskA->id
                )
        );
    }

    public function test_tasks_can_be_filtered_by_overdue(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        $overdue = Task::create([
            'created_by' => $user->id,
            'title'      => 'Overdue Task',
            'status'     => 'in_progress',
            'priority'   => 'high',
            'due_at'     => now()->subHour(),
        ]);

        Task::create([
            'created_by' => $user->id,
            'title'      => 'Future Task',
            'status'     => 'todo',
            'priority'   => 'medium',
            'due_at'     => now()->addDay(),
        ]);

        Task::create([
            'created_by' => $user->id,
            'title'      => 'Finished Overdue Task',
            'status'     => 'done',
            'priority'   => 'medium',
            'due_at'     => now()->subDay(),
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('tasks.index', [
                'due' => 'overdue',
            ]));

        $response->assertOk();

        $response->assertInertia(
            fn($page) => $page
                ->where('tasks.total', 1)
                ->where(
                    'tasks.data.0.id',
                    $overdue->id
                )
        );
    }

    public function test_task_index_is_paginated(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        for ($i = 1; $i <= 25; $i++) {
            Task::create([
                'created_by' => $user->id,
                'title'      => 'Task ' . $i,
                'status'     => 'todo',
                'priority'   => 'medium',
            ]);
        }

        $response = $this
            ->actingAs($user)
            ->get(route('tasks.index'));

        $response->assertOk();

        $response->assertInertia(
            fn($page) => $page
                ->where('tasks.total', 25)
                ->where('tasks.per_page', 20)
                ->has('tasks.data', 20)
        );
    }

    public function test_status_counts_are_returned_for_kanban(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        Task::create([
            'created_by' => $user->id,
            'title'      => 'Todo A',
            'status'     => 'todo',
            'priority'   => 'medium',
        ]);

        Task::create([
            'created_by' => $user->id,
            'title'      => 'Todo B',
            'status'     => 'todo',
            'priority'   => 'medium',
        ]);

        Task::create([
            'created_by' => $user->id,
            'title'      => 'Progress',
            'status'     => 'in_progress',
            'priority'   => 'high',
        ]);

        Task::create([
            'created_by' => $user->id,
            'title'      => 'Review',
            'status'     => 'review',
            'priority'   => 'medium',
        ]);

        Task::create([
            'created_by' => $user->id,
            'title'      => 'Done',
            'status'     => 'done',
            'priority'   => 'low',
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('tasks.index'));

        $response->assertOk();

        $response->assertInertia(
            fn($page) => $page
                ->where(
                    'statusCounts.todo',
                    2
                )
                ->where(
                    'statusCounts.in_progress',
                    1
                )
                ->where(
                    'statusCounts.review',
                    1
                )
                ->where(
                    'statusCounts.done',
                    1
                )
        );
    }
}
