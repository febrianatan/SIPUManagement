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
            'title'      => 'Check Server',
            'status'     => 'todo',
            'priority'   => 'medium',
        ]);

        $task->assignees()->attach(
            $assignee->id
        );

        $this
            ->actingAs($assignee)
            ->patch(
                route('tasks.acknowledge', $task)
            )
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas(
            'task_activities',
            [
                'task_id'  => $task->id,
                'actor_id' => $assignee->id,
                'action'   => 'task_acknowledged',
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
            'title'      => 'Printer Error',
            'status'     => 'todo',
            'priority'   => 'medium',
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
                'task_id'  => $task->id,
                'actor_id' => $creator->id,
                'action'   => 'comment_added',
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
            'title'      => 'Daily Report',
            'status'     => 'todo',
            'priority'   => 'medium',
        ]);

        $task->assignees()->attach(
            $assignee->id
        );

        $this
            ->actingAs($assignee)
            ->patch(
                route('tasks.acknowledge', $task)
            );

        $this
            ->actingAs($assignee)
            ->patch(
                route('tasks.acknowledge', $task)
            );

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

    public function test_editing_task_details_creates_activity(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by'  => $creator->id,
            'title'       => 'Perbaiki PC FO',
            'description' => 'PC bermasalah.',
            'status'      => 'todo',
            'priority'    => 'medium',
        ]);

        $task->assignees()->attach(
            $assignee->id
        );

        $response = $this
            ->actingAs($creator)
            ->patch(
                route('tasks.update', $task),
                [
                    'project_id'   => null,
                    'title'        => 'Perbaiki PC Front Office',
                    'description'  => 'PC tidak dapat boot.',
                    'priority'     => 'urgent',
                    'due_at'       => null,
                    'assignee_ids' => [
                        $assignee->id,
                    ],
                ]
            );

        $response->assertSessionHasNoErrors();

        $activity = $task
            ->activities()
            ->where('action', 'task_updated')
            ->firstOrFail();

        $this->assertEquals(
            'medium',
            $activity->metadata['changes']['priority']['from']
        );

        $this->assertEquals(
            'urgent',
            $activity->metadata['changes']['priority']['to']
        );

        $this->assertEquals(
            'Perbaiki PC FO',
            $activity->metadata['changes']['title']['from']
        );

        $this->assertEquals(
            'Perbaiki PC Front Office',
            $activity->metadata['changes']['title']['to']
        );
    }

    public function test_changing_assignees_creates_activity(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $oldAssignee = User::factory()->create([
            'name' => 'Albert',
            'role' => 'staff',
        ]);

        $newAssignee = User::factory()->create([
            'name' => 'Febriana',
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title'      => 'Setup Network',
            'status'     => 'todo',
            'priority'   => 'high',
        ]);

        $task->assignees()->attach(
            $oldAssignee->id
        );

        $response = $this
            ->actingAs($creator)
            ->patch(
                route('tasks.update', $task),
                [
                    'project_id'   => null,
                    'title'        => 'Setup Network',
                    'description'  => null,
                    'priority'     => 'high',
                    'due_at'       => null,
                    'assignee_ids' => [
                        $newAssignee->id,
                    ],
                ]
            );

        $response->assertSessionHasNoErrors();

        $activity = $task
            ->activities()
            ->where(
                'action',
                'assignees_changed'
            )
            ->firstOrFail();

        $this->assertEquals(
            $newAssignee->id,
            $activity->metadata['added'][0]['id']
        );

        $this->assertEquals(
            'Febriana',
            $activity->metadata['added'][0]['name']
        );

        $this->assertEquals(
            $oldAssignee->id,
            $activity->metadata['removed'][0]['id']
        );

        $this->assertEquals(
            'Albert',
            $activity->metadata['removed'][0]['name']
        );
    }

    public function test_existing_assignee_keeps_acknowledgement_when_task_is_edited(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title'      => 'Daily Report',
            'status'     => 'todo',
            'priority'   => 'medium',
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' => now(),
            ]
        );

        $before = $task
            ->assignees()
            ->where('users.id', $assignee->id)
            ->firstOrFail()
            ->pivot
            ->acknowledged_at;

        $response = $this
            ->actingAs($creator)
            ->patch(
                route('tasks.update', $task),
                [
                    'project_id'   => null,
                    'title'        => 'Daily Report Updated',
                    'description'  => null,
                    'priority'     => 'high',
                    'due_at'       => null,
                    'assignee_ids' => [
                        $assignee->id,
                    ],
                ]
            );

        $response->assertSessionHasNoErrors();

        $after = $task
            ->fresh()
            ->assignees()
            ->where('users.id', $assignee->id)
            ->firstOrFail()
            ->pivot
            ->acknowledged_at;

        $this->assertNotNull($after);

        $this->assertEquals(
            $before,
            $after
        );
    }

    public function test_new_assignee_starts_without_acknowledgement(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $oldAssignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $newAssignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title'      => 'Check Network',
            'status'     => 'todo',
            'priority'   => 'medium',
        ]);

        $task->assignees()->attach(
            $oldAssignee->id
        );

        $response = $this
            ->actingAs($creator)
            ->patch(
                route('tasks.update', $task),
                [
                    'project_id'   => null,
                    'title'        => 'Check Network',
                    'description'  => null,
                    'priority'     => 'medium',
                    'due_at'       => null,
                    'assignee_ids' => [
                        $oldAssignee->id,
                        $newAssignee->id,
                    ],
                ]
            );

        $response->assertSessionHasNoErrors();

        $newAssigneeRecord = $task
            ->fresh()
            ->assignees()
            ->where('users.id', $newAssignee->id)
            ->firstOrFail();

        $this->assertNull(
            $newAssigneeRecord
                ->pivot
                ->acknowledged_at
        );
    }
}
