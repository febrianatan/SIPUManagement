<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login(): void
    {
        $response = $this->get(
            route('dashboard')
        );

        $response->assertRedirect(
            route('login')
        );
    }

    public function test_authenticated_user_can_visit_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('dashboard'));

        $response->assertOk();
    }

    public function test_dashboard_counts_assigned_tasks(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $taskA = Task::create([
            'created_by' => $creator->id,
            'title' => 'Task A',
            'status' => 'todo',
            'priority' => 'medium',
        ]);

        $taskB = Task::create([
            'created_by' => $creator->id,
            'title' => 'Task B',
            'status' => 'in_progress',
            'priority' => 'high',
        ]);

        $taskC = Task::create([
            'created_by' => $creator->id,
            'title' => 'Task C',
            'status' => 'done',
            'priority' => 'medium',
        ]);

        $taskA->assignees()->attach(
            $user->id
        );

        $taskB->assignees()->attach(
            $user->id
        );

        $taskC->assignees()->attach(
            $user->id
        );

        $response = $this
            ->actingAs($user)
            ->get(route('dashboard'));

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->component('dashboard')
                ->where(
                    'stats.my_tasks',
                    2
                )
                ->where(
                    'stats.in_progress',
                    1
                )
        );
    }

    public function test_dashboard_counts_pending_acknowledgements(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $pendingTask = Task::create([
            'created_by' => $creator->id,
            'title' => 'Pending Acknowledgement',
            'status' => 'todo',
            'priority' => 'high',
        ]);

        $acknowledgedTask = Task::create([
            'created_by' => $creator->id,
            'title' => 'Already Acknowledged',
            'status' => 'todo',
            'priority' => 'medium',
        ]);

        $pendingTask->assignees()->attach(
            $user->id
        );

        $acknowledgedTask->assignees()->attach(
            $user->id,
            [
                'acknowledged_at' => now(),
            ]
        );

        $response = $this
            ->actingAs($user)
            ->get(route('dashboard'));

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'stats.pending_acknowledgement',
                    1
                )
                ->has(
                    'pendingAcknowledgements',
                    1
                )
                ->where(
                    'pendingAcknowledgements.0.id',
                    $pendingTask->id
                )
        );
    }

    public function test_dashboard_counts_urgent_tasks(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $urgentTask = Task::create([
            'created_by' => $creator->id,
            'title' => 'Urgent Task',
            'status' => 'todo',
            'priority' => 'urgent',
        ]);

        $normalTask = Task::create([
            'created_by' => $creator->id,
            'title' => 'Normal Task',
            'status' => 'todo',
            'priority' => 'medium',
        ]);

        $urgentTask->assignees()->attach(
            $user->id
        );

        $normalTask->assignees()->attach(
            $user->id
        );

        $response = $this
            ->actingAs($user)
            ->get(route('dashboard'));

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'stats.urgent',
                    1
                )
                ->has(
                    'urgentTasks',
                    1
                )
                ->where(
                    'urgentTasks.0.id',
                    $urgentTask->id
                )
        );
    }

    public function test_dashboard_counts_overdue_tasks(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $overdueTask = Task::create([
            'created_by' => $creator->id,
            'title' => 'Overdue Task',
            'status' => 'in_progress',
            'priority' => 'high',
            'due_at' => now()->subHour(),
        ]);

        $futureTask = Task::create([
            'created_by' => $creator->id,
            'title' => 'Future Task',
            'status' => 'todo',
            'priority' => 'medium',
            'due_at' => now()->addDay(),
        ]);

        $completedOverdueTask = Task::create([
            'created_by' => $creator->id,
            'title' => 'Completed Task',
            'status' => 'done',
            'priority' => 'high',
            'due_at' => now()->subDay(),
        ]);

        $overdueTask->assignees()->attach(
            $user->id
        );

        $futureTask->assignees()->attach(
            $user->id
        );

        $completedOverdueTask->assignees()->attach(
            $user->id
        );

        $response = $this
            ->actingAs($user)
            ->get(route('dashboard'));

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'stats.overdue',
                    1
                )
                ->has(
                    'overdueTasks',
                    1
                )
                ->where(
                    'overdueTasks.0.id',
                    $overdueTask->id
                )
        );
    }

    public function test_dashboard_counts_tasks_created_by_user(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        $otherUser = User::factory()->create([
            'role' => 'staff',
        ]);

        Task::create([
            'created_by' => $user->id,
            'title' => 'Created Task',
            'status' => 'todo',
            'priority' => 'medium',
        ]);

        Task::create([
            'created_by' => $user->id,
            'title' => 'Completed Created Task',
            'status' => 'done',
            'priority' => 'medium',
        ]);

        Task::create([
            'created_by' => $otherUser->id,
            'title' => 'Other User Task',
            'status' => 'todo',
            'priority' => 'medium',
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('dashboard'));

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'stats.created_by_me',
                    1
                )
        );
    }

    public function test_dashboard_counts_active_projects(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        Project::create([
            'name' => 'Active Project',
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        Project::create([
            'name' => 'Completed Project',
            'status' => 'completed',
            'created_by' => $user->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('dashboard'));

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'stats.active_projects',
                    1
                )
        );
    }
}
