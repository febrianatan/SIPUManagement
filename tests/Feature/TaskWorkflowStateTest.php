<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskWorkflowStateTest extends TestCase
{
    use RefreshDatabase;

    public function test_unacknowledged_assignee_receives_acknowledge_action_only(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Check Network',
            'status' => 'todo',
            'priority' => 'high',
            'requires_review' => true,
        ]);

        $task->assignees()->attach(
            $assignee->id
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
                    'assignment.is_assignee',
                    true
                )
                ->where(
                    'assignment.acknowledged',
                    false
                )
                ->where(
                    'assignment.can_acknowledge',
                    true
                )
                ->has(
                    'workflow.available_statuses',
                    0
                )
        );
    }

    public function test_acknowledged_assignee_can_start_todo_task(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Setup Printer',
            'status' => 'todo',
            'priority' => 'medium',
            'requires_review' => false,
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' =>
                    now(),
            ]
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
                    'assignment.acknowledged',
                    true
                )
                ->where(
                    'assignment.can_acknowledge',
                    false
                )
                ->has(
                    'workflow.available_statuses',
                    1
                )
                ->where(
                    'workflow.available_statuses.0.value',
                    'in_progress'
                )
        );
    }

    public function test_normal_task_allows_assignee_to_complete_from_in_progress(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Fix PC',
            'status' => 'in_progress',
            'priority' => 'medium',
            'requires_review' => false,
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' =>
                    now(),
            ]
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
                    'workflow.requires_review',
                    false
                )
                ->where(
                    'workflow.current_status',
                    'in_progress'
                )
                ->where(
                    'workflow.available_statuses.0.value',
                    'done'
                )
        );
    }

    public function test_review_task_allows_assignee_to_submit_for_review(): void
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
            'status' => 'in_progress',
            'priority' => 'high',
            'requires_review' => true,
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' =>
                    now(),
            ]
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
                    'workflow.requires_review',
                    true
                )
                ->where(
                    'workflow.available_statuses.0.value',
                    'review'
                )
        );
    }

    public function test_creator_receives_approve_and_revision_actions_for_review_task(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Revenue Report',
            'status' => 'review',
            'priority' => 'high',
            'requires_review' => true,
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' =>
                    now(),
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
                    'assignment.is_assignee',
                    false
                )
                ->where(
                    'assignment.can_acknowledge',
                    false
                )
                ->has(
                    'workflow.available_statuses',
                    2
                )
                ->where(
                    'workflow.available_statuses.0.value',
                    'done'
                )
                ->where(
                    'workflow.available_statuses.1.value',
                    'in_progress'
                )
        );
    }

    public function test_assignee_has_no_status_action_while_task_is_waiting_for_creator_review(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Report Waiting Review',
            'status' => 'review',
            'priority' => 'high',
            'requires_review' => true,
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' =>
                    now(),
            ]
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
                    'workflow.current_status',
                    'review'
                )
                ->has(
                    'workflow.available_statuses',
                    0
                )
        );
    }
}
