<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskActivityTest extends TestCase
{
    use RefreshDatabase;

    public function test_status_change_creates_activity(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Perbaiki PC FO',
            'status' => 'todo',
            'priority' => 'high',
        ]);

        $task->assignees()->attach(
            $assignee->id
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

        $activity = $task
            ->activities()
            ->where('action', 'status_changed')
            ->firstOrFail();

        $this->assertEquals(
            $assignee->id,
            $activity->actor_id
        );

        $this->assertEquals(
            'todo',
            $activity->metadata['from']
        );

        $this->assertEquals(
            'in_progress',
            $activity->metadata['to']
        );
    }

    public function test_acknowledgement_creates_activity(): void
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
            'priority' => 'medium',
        ]);

        $task->assignees()->attach(
            $assignee->id
        );

        $this
            ->actingAs($assignee)
            ->patch(route(
                'tasks.acknowledge',
                $task
            ))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas(
            'task_activities',
            [
                'task_id' => $task->id,
                'actor_id' => $assignee->id,
                'action' => 'task_acknowledged',
            ]
        );
    }

    public function test_comment_creates_activity(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Printer Error',
            'status' => 'todo',
            'priority' => 'medium',
        ]);

        $response = $this
            ->actingAs($creator)
            ->post(
                route('tasks.comments.store', $task),
                [
                    'message' => 'Printer masih error.',
                ]
            );

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas(
            'task_activities',
            [
                'task_id' => $task->id,
                'actor_id' => $creator->id,
                'action' => 'comment_added',
            ]
        );
    }

    public function test_repeated_acknowledgement_does_not_duplicate_activity(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Daily Report',
            'status' => 'todo',
            'priority' => 'medium',
        ]);

        $task->assignees()->attach(
            $assignee->id
        );

        $this
            ->actingAs($assignee)
            ->patch(route(
                'tasks.acknowledge',
                $task
            ));

        $this
            ->actingAs($assignee)
            ->patch(route(
                'tasks.acknowledge',
                $task
            ));

        $this->assertEquals(
            1,
            $task
                ->activities()
                ->where(
                    'action',
                    'task_acknowledged'
                )
                ->count()
        );
    }
}
