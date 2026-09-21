<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskReviewWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_assignee_must_acknowledge_before_starting_task(): void
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
            $assignee->id
        );

        $response = $this
            ->actingAs($assignee)
            ->patch(
                route(
                    'tasks.status.update',
                    $task
                ),
                [
                    'status' =>
                        'in_progress',
                ]
            );

        $response->assertSessionHasErrors(
            'status'
        );

        $this->assertDatabaseHas(
            'tasks',
            [
                'id' => $task->id,
                'status' => 'todo',
            ]
        );
    }

    public function test_normal_task_can_be_completed_by_assignee_without_review(): void
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
            'priority' => 'medium',
            'requires_review' => false,
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' => now(),
            ]
        );

        $this
            ->actingAs($assignee)
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
            ->actingAs($assignee)
            ->patch(
                route(
                    'tasks.status.update',
                    $task
                ),
                [
                    'status' =>
                        'done',
                ]
            )
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas(
            'tasks',
            [
                'id' => $task->id,
                'status' => 'done',
            ]
        );
    }

    public function test_review_task_cannot_be_completed_directly_by_assignee(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Daily Revenue Report',
            'status' => 'in_progress',
            'priority' => 'high',
            'requires_review' => true,
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
                route(
                    'tasks.status.update',
                    $task
                ),
                [
                    'status' => 'done',
                ]
            );

        $response->assertSessionHasErrors(
            'status'
        );

        $this->assertDatabaseHas(
            'tasks',
            [
                'id' => $task->id,
                'status' => 'in_progress',
            ]
        );
    }

    public function test_assignee_can_submit_task_for_review(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Monthly Report',
            'status' => 'in_progress',
            'priority' => 'high',
            'requires_review' => true,
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
                route(
                    'tasks.status.update',
                    $task
                ),
                [
                    'status' => 'review',
                ]
            );

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas(
            'tasks',
            [
                'id' => $task->id,
                'status' => 'review',
            ]
        );
    }

    public function test_creator_can_approve_review_and_mark_task_done(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Financial Report',
            'status' => 'review',
            'priority' => 'high',
            'requires_review' => true,
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' => now(),
            ]
        );

        $response = $this
            ->actingAs($creator)
            ->patch(
                route(
                    'tasks.status.update',
                    $task
                ),
                [
                    'status' => 'done',
                ]
            );

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas(
            'tasks',
            [
                'id' => $task->id,
                'status' => 'done',
            ]
        );
    }

    public function test_creator_can_return_review_task_for_revision(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Financial Report',
            'status' => 'review',
            'priority' => 'high',
            'requires_review' => true,
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' => now(),
            ]
        );

        $response = $this
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
            );

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas(
            'tasks',
            [
                'id' => $task->id,
                'status' => 'in_progress',
            ]
        );
    }
}
