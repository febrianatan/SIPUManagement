<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssignmentNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_pending_assignment_appears_in_shared_notifications(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Perbaiki PC Front Office',
            'status' => 'todo',
            'priority' => 'urgent',
        ]);

        $task->assignees()->attach(
            $assignee->id
        );

        $response = $this
            ->actingAs($assignee)
            ->get(route('dashboard'));

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'notifications.pending_assignments_count',
                    1
                )
                ->has(
                    'notifications.pending_assignments',
                    1
                )
                ->where(
                    'notifications.pending_assignments.0.id',
                    $task->id
                )
        );
    }

    public function test_acknowledged_assignment_is_not_counted_as_new_notification(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Check Server',
            'status' => 'todo',
            'priority' => 'high',
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' => now(),
            ]
        );

        $response = $this
            ->actingAs($assignee)
            ->get(route('dashboard'));

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'notifications.pending_assignments_count',
                    0
                )
                ->has(
                    'notifications.pending_assignments',
                    0
                )
        );
    }

    public function test_notification_disappears_after_acknowledgement(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Setup Ballroom Network',
            'status' => 'todo',
            'priority' => 'high',
        ]);

        $task->assignees()->attach(
            $assignee->id
        );

        /*
         * Sebelum acknowledge = 1 notification.
         */
        $this
            ->actingAs($assignee)
            ->get(route('dashboard'))
            ->assertInertia(
                fn ($page) => $page
                    ->where(
                        'notifications.pending_assignments_count',
                        1
                    )
            );

        /*
         * User acknowledge.
         */
        $this
            ->actingAs($assignee)
            ->patch(
                route(
                    'tasks.acknowledge',
                    $task
                )
            )
            ->assertSessionHasNoErrors();

        /*
         * Setelah acknowledge = 0 notification.
         */
        $this
            ->actingAs($assignee)
            ->get(route('dashboard'))
            ->assertInertia(
                fn ($page) => $page
                    ->where(
                        'notifications.pending_assignments_count',
                        0
                    )
            );
    }

    public function test_pending_filter_only_returns_current_users_unacknowledged_assignments(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        $otherUser = User::factory()->create([
            'role' => 'staff',
        ]);

        $pendingTask = Task::create([
            'created_by' => $creator->id,
            'title' => 'Pending Task',
            'status' => 'todo',
            'priority' => 'high',
        ]);

        $acknowledgedTask = Task::create([
            'created_by' => $creator->id,
            'title' => 'Acknowledged Task',
            'status' => 'todo',
            'priority' => 'medium',
        ]);

        $otherTask = Task::create([
            'created_by' => $creator->id,
            'title' => 'Other User Task',
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

        $otherTask->assignees()->attach(
            $otherUser->id
        );

        $response = $this
            ->actingAs($user)
            ->get(
                route(
                    'tasks.index',
                    [
                        'acknowledgement' =>
                            'pending',
                    ]
                )
            );

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'tasks.total',
                    1
                )
                ->where(
                    'tasks.data.0.id',
                    $pendingTask->id
                )
                ->where(
                    'filters.acknowledgement',
                    'pending'
                )
        );
    }
}
