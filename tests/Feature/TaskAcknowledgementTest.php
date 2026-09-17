<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskAcknowledgementTest extends TestCase
{
    use RefreshDatabase;

    public function test_assignee_can_acknowledge_task(): void
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

        $task->assignees()->attach($assignee->id);

        $response = $this
            ->actingAs($assignee)
            ->patch(route('tasks.acknowledge', $task));

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('task_user', [
            'task_id' => $task->id,
            'user_id' => $assignee->id,
        ]);

        $pivot = $task
            ->fresh()
            ->assignees()
            ->where('users.id', $assignee->id)
            ->firstOrFail()
            ->pivot;

        $this->assertNotNull(
            $pivot->acknowledged_at
        );
    }

    public function test_unassigned_user_cannot_acknowledge_task(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $unassignedUser = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Check Server',
            'status' => 'todo',
            'priority' => 'high',
        ]);

        $response = $this
            ->actingAs($unassignedUser)
            ->patch(route('tasks.acknowledge', $task));

        $response->assertForbidden();
    }

    public function test_acknowledgement_only_affects_current_assignee(): void
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

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Setup Ballroom Network',
            'status' => 'todo',
            'priority' => 'high',
        ]);

        $task->assignees()->attach([
            $assigneeA->id,
            $assigneeB->id,
        ]);

        $this
            ->actingAs($assigneeA)
            ->patch(route('tasks.acknowledge', $task))
            ->assertSessionHasNoErrors();

        $assigneeARecord = $task
            ->fresh()
            ->assignees()
            ->where('users.id', $assigneeA->id)
            ->firstOrFail();

        $assigneeBRecord = $task
            ->fresh()
            ->assignees()
            ->where('users.id', $assigneeB->id)
            ->firstOrFail();

        $this->assertNotNull(
            $assigneeARecord->pivot->acknowledged_at
        );

        $this->assertNull(
            $assigneeBRecord->pivot->acknowledged_at
        );
    }

    public function test_acknowledging_task_twice_keeps_first_acknowledgement_time(): void
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

        $task->assignees()->attach($assignee->id);

        $this
            ->actingAs($assignee)
            ->patch(route('tasks.acknowledge', $task));

        $firstAcknowledgedAt = $task
            ->fresh()
            ->assignees()
            ->where('users.id', $assignee->id)
            ->firstOrFail()
            ->pivot
            ->acknowledged_at;

        $this->travel(10)->minutes();

        $this
            ->actingAs($assignee)
            ->patch(route('tasks.acknowledge', $task));

        $secondAcknowledgedAt = $task
            ->fresh()
            ->assignees()
            ->where('users.id', $assignee->id)
            ->firstOrFail()
            ->pivot
            ->acknowledged_at;

        $this->assertEquals(
            $firstAcknowledgedAt,
            $secondAcknowledgedAt
        );
    }
}
