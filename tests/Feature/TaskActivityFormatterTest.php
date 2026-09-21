<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskActivityFormatterTest extends TestCase
{
    use RefreshDatabase;

    public function test_status_change_activity_has_human_readable_message(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
            'name' => 'Febriana',
        ]);

        $task = Task::create([
            'created_by' =>
                $creator->id,

            'title' =>
                'Daily Report',

            'status' =>
                'review',

            'priority' =>
                'high',
        ]);

        $task->recordActivity(
            'status_changed',
            $creator,
            [
                'from' =>
                    'in_progress',

                'to' =>
                    'review',
            ]
        );

        $response = $this
            ->actingAs($creator)
            ->get(
                route(
                    'tasks.show',
                    $task
                )
            );

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'activities.0.action',
                    'status_changed'
                )
                ->where(
                    'activities.0.message',
                    'Febriana changed status from In Progress to Review.'
                )
        );
    }

    public function test_acknowledgement_activity_has_human_readable_message(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
            'name' => 'Albert',
        ]);

        $task = Task::create([
            'created_by' =>
                $creator->id,

            'title' =>
                'Check Server',

            'status' =>
                'todo',

            'priority' =>
                'medium',
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' =>
                    now(),
            ]
        );

        $task->recordActivity(
            'task_acknowledged',
            $assignee
        );

        $response = $this
            ->actingAs($assignee)
            ->get(
                route(
                    'tasks.show',
                    $task
                )
            );

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'activities.0.message',
                    'Albert acknowledged this task.'
                )
        );
    }

    public function test_attachment_activity_includes_filename(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
            'name' => 'Febriana',
        ]);

        $task = Task::create([
            'created_by' =>
                $creator->id,

            'title' =>
                'Fix Printer',

            'status' =>
                'todo',

            'priority' =>
                'high',
        ]);

        $task->recordActivity(
            'attachment_added',
            $creator,
            [
                'attachment_id' => 1,

                'original_name' =>
                    'printer-error.png',
            ]
        );

        $response = $this
            ->actingAs($creator)
            ->get(
                route(
                    'tasks.show',
                    $task
                )
            );

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'activities.0.message',
                    'Febriana added attachment printer-error.png.'
                )
        );
    }

    public function test_task_update_activity_lists_changed_fields(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
            'name' => 'Febriana',
        ]);

        $task = Task::create([
            'created_by' =>
                $creator->id,

            'title' =>
                'Old Task',

            'status' =>
                'todo',

            'priority' =>
                'medium',
        ]);

        $task->recordActivity(
            'task_updated',
            $creator,
            [
                'changes' => [
                    'title' => [
                        'from' =>
                            'Old Task',

                        'to' =>
                            'New Task',
                    ],

                    'priority' => [
                        'from' =>
                            'medium',

                        'to' =>
                            'high',
                    ],
                ],
            ]
        );

        $response = $this
            ->actingAs($creator)
            ->get(
                route(
                    'tasks.show',
                    $task
                )
            );

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->where(
                    'activities.0.message',
                    'Febriana updated title, priority.'
                )
        );
    }

    public function test_task_detail_returns_comments_attachments_and_activity_collections(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' =>
                $creator->id,

            'title' =>
                'Task Detail',

            'status' =>
                'todo',

            'priority' =>
                'medium',
        ]);

        $response = $this
            ->actingAs($creator)
            ->get(
                route(
                    'tasks.show',
                    $task
                )
            );

        $response->assertOk();

        $response->assertInertia(
            fn ($page) => $page
                ->has('task')
                ->has('can')
                ->has('assignment')
                ->has('workflow')
                ->has('comments', 0)
                ->has('attachments', 0)
                ->has('activities', 0)
        );
    }
}
