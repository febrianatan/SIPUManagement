<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_creator_receives_waiting_review_notification(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' =>
                $creator->id,

            'title' =>
                'Daily Revenue Report',

            'status' =>
                'review',

            'priority' =>
                'high',

            'requires_review' =>
                true,
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' => now(),
            ]
        );

        $response = $this
            ->actingAs($creator)
            ->get(
                route('dashboard')
            );

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'notifications.waiting_reviews_count',
                    1
                )
                ->has(
                    'notifications.waiting_reviews',
                    1
                )
                ->where(
                    'notifications.waiting_reviews.0.id',
                    $task->id
                )
        );
    }

    public function test_assignee_does_not_receive_creator_review_notification(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' =>
                $creator->id,

            'title' =>
                'Monthly Report',

            'status' =>
                'review',

            'priority' =>
                'medium',

            'requires_review' =>
                true,
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' => now(),
            ]
        );

        $response = $this
            ->actingAs($assignee)
            ->get(
                route('dashboard')
            );

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'notifications.waiting_reviews_count',
                    0
                )
                ->has(
                    'notifications.waiting_reviews',
                    0
                )
        );
    }

    public function test_task_not_requiring_review_is_not_added_to_review_notifications(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        Task::create([
            'created_by' =>
                $creator->id,

            'title' =>
                'Legacy Review Task',

            'status' =>
                'review',

            'priority' =>
                'medium',

            'requires_review' =>
                false,
        ]);

        $response = $this
            ->actingAs($creator)
            ->get(
                route('dashboard')
            );

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'notifications.waiting_reviews_count',
                    0
                )
        );
    }

    public function test_review_notification_disappears_after_creator_approves_task(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' =>
                $creator->id,

            'title' =>
                'Revenue Report',

            'status' =>
                'review',

            'priority' =>
                'high',

            'requires_review' =>
                true,
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' => now(),
            ]
        );

        /*
         * Sebelum approve.
         */
        $this
            ->actingAs($creator)
            ->get(
                route('dashboard')
            )
            ->assertInertia(
                fn ($page) => $page
                    ->where(
                        'notifications.waiting_reviews_count',
                        1
                    )
            );

        /*
         * Creator approve.
         */
        $this
            ->actingAs($creator)
            ->patch(
                route(
                    'tasks.status.update',
                    $task
                ),
                [
                    'status' => 'done',
                ]
            )
            ->assertSessionHasNoErrors();

        /*
         * Notification harus hilang.
         */
        $this
            ->actingAs($creator)
            ->get(
                route('dashboard')
            )
            ->assertInertia(
                fn ($page) => $page
                    ->where(
                        'notifications.waiting_reviews_count',
                        0
                    )
            );
    }

    public function test_review_notification_disappears_after_task_is_returned_for_revision(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' =>
                $creator->id,

            'title' =>
                'Financial Report',

            'status' =>
                'review',

            'priority' =>
                'high',

            'requires_review' =>
                true,
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' => now(),
            ]
        );

        $this
            ->actingAs($creator)
            ->patch(
                route(
                    'tasks.status.update',
                    $task
                ),
                [
                    'status' =>
                        'in_progress',
                ]
            )
            ->assertSessionHasNoErrors();

        $this
            ->actingAs($creator)
            ->get(
                route('dashboard')
            )
            ->assertInertia(
                fn ($page) => $page
                    ->where(
                        'notifications.waiting_reviews_count',
                        0
                    )
            );
    }

    public function test_total_notification_count_combines_assignments_and_reviews(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        $otherUser =
            User::factory()->create([
                'role' => 'staff',
            ]);

        /*
         * Notification #1:
         * assignment baru untuk user.
         */
        $assignedTask = Task::create([
            'created_by' =>
                $otherUser->id,

            'title' =>
                'Fix Front Office PC',

            'status' =>
                'todo',

            'priority' =>
                'urgent',

            'requires_review' =>
                false,
        ]);

        $assignedTask
            ->assignees()
            ->attach(
                $user->id
            );

        /*
         * Notification #2:
         * task milik user sedang menunggu review.
         */
        $reviewTask = Task::create([
            'created_by' =>
                $user->id,

            'title' =>
                'Check Daily Report',

            'status' =>
                'review',

            'priority' =>
                'high',

            'requires_review' =>
                true,
        ]);

        $reviewTask
            ->assignees()
            ->attach(
                $otherUser->id,
                [
                    'acknowledged_at' => now(),
                ]
            );

        $response = $this
            ->actingAs($user)
            ->get(
                route('dashboard')
            );

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'notifications.pending_assignments_count',
                    1
                )
                ->where(
                    'notifications.waiting_reviews_count',
                    1
                )
                ->where(
                    'notifications.total_count',
                    2
                )
        );
    }
}
