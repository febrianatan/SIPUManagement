<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskCommentTest extends TestCase
{
    use RefreshDatabase;

    public function test_task_creator_can_comment(): void
    {
        $department = Department::create([
            'name' => 'Front Office',
            'code' => 'FO',
        ]);

        $creator = User::factory()->create([
            'role' => 'staff',
            'department_id' => $department->id,
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Perbaiki PC FO',
            'status' => 'todo',
            'priority' => 'urgent',
        ]);

        $response = $this
            ->actingAs($creator)
            ->post(route('tasks.comments.store', $task), [
                'message' => 'PC dibutuhkan sebelum shift sore.',
            ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('task_comments', [
            'task_id' => $task->id,
            'user_id' => $creator->id,
            'message' => 'PC dibutuhkan sebelum shift sore.',
        ]);
    }

    public function test_assignee_can_comment(): void
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

        $task->assignees()->attach($assignee->id);

        $response = $this
            ->actingAs($assignee)
            ->post(route('tasks.comments.store', $task), [
                'message' => 'Sedang saya cek.',
            ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('task_comments', [
            'task_id' => $task->id,
            'user_id' => $assignee->id,
            'message' => 'Sedang saya cek.',
        ]);
    }

    public function test_staff_from_target_department_can_comment(): void
    {
        $frontOffice = Department::create([
            'name' => 'Front Office',
            'code' => 'FO',
        ]);

        $it = Department::create([
            'name' => 'Information Technology',
            'code' => 'IT',
        ]);

        $creator = User::factory()->create([
            'department_id' => $frontOffice->id,
            'role' => 'staff',
        ]);

        $itStaff = User::factory()->create([
            'department_id' => $it->id,
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Printer FO Error',
            'status' => 'todo',
            'priority' => 'medium',
        ]);

        $task->departments()->attach($it->id);

        $response = $this
            ->actingAs($itStaff)
            ->post(route('tasks.comments.store', $task), [
                'message' => 'Kami cek setelah briefing.',
            ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('task_comments', [
            'task_id' => $task->id,
            'user_id' => $itStaff->id,
        ]);
    }

    public function test_unrelated_staff_cannot_comment(): void
    {
        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $unrelatedUser = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Private Task',
            'status' => 'todo',
            'priority' => 'medium',
        ]);

        $response = $this
            ->actingAs($unrelatedUser)
            ->post(route('tasks.comments.store', $task), [
                'message' => 'Tidak seharusnya masuk.',
            ]);

        $response->assertForbidden();

        $this->assertDatabaseMissing('task_comments', [
            'message' => 'Tidak seharusnya masuk.',
        ]);
    }

    public function test_comment_owner_can_delete_own_comment(): void
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $user->id,
            'title' => 'Test Task',
            'status' => 'todo',
            'priority' => 'medium',
        ]);

        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'message' => 'Comment test.',
        ]);

        $response = $this
            ->actingAs($user)
            ->delete(
                route('tasks.comments.destroy', [
                    $task,
                    $comment,
                ])
            );

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('task_comments', [
            'id' => $comment->id,
        ]);
    }
}
