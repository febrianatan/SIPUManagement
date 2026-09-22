<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TaskAttachmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_task_creator_can_upload_attachment(): void
    {
        Storage::fake('local');

        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Fix Printer',
            'status' => 'todo',
            'priority' => 'high',
        ]);

        $file = UploadedFile::fake()->image(
            'printer-error.png'
        );

        $response = $this
            ->actingAs($creator)
            ->post(
                route(
                    'tasks.attachments.store',
                    $task
                ),
                [
                    'file' => $file,
                ]
            );

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseCount(
            'task_attachments',
            1
        );

        $attachment =
            $task
                ->attachments()
                ->first();

        $this->assertNotNull(
            $attachment
        );

        $this->assertSame(
            'printer-error.png',
            $attachment->original_name
        );

        Storage::disk('local')
            ->assertExists(
                $attachment->path
            );
    }

    public function test_assignee_can_upload_attachment(): void
    {
        Storage::fake('local');

        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Check Network',
            'status' => 'in_progress',
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
            ->post(
                route(
                    'tasks.attachments.store',
                    $task
                ),
                [
                    'file' =>
                        UploadedFile::fake()
                            ->create(
                                'report.pdf',
                                200,
                                'application/pdf'
                            ),
                ]
            );

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas(
            'task_attachments',
            [
                'task_id' => $task->id,
                'uploaded_by' => $assignee->id,
                'original_name' => 'report.pdf',
            ]
        );
    }

    public function test_unrelated_staff_cannot_upload_attachment(): void
    {
        Storage::fake('local');

        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $unrelated = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Private Task',
            'status' => 'todo',
            'priority' => 'medium',
        ]);

        $response = $this
            ->actingAs($unrelated)
            ->post(
                route(
                    'tasks.attachments.store',
                    $task
                ),
                [
                    'file' =>
                        UploadedFile::fake()
                            ->image('photo.png'),
                ]
            );

        $response->assertForbidden();

        $this->assertDatabaseCount(
            'task_attachments',
            0
        );
    }

    public function test_attachment_uploader_can_delete_attachment(): void
    {
        Storage::fake('local');

        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $assignee = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Task',
            'status' => 'in_progress',
            'priority' => 'medium',
        ]);

        $task->assignees()->attach(
            $assignee->id,
            [
                'acknowledged_at' => now(),
            ]
        );

        $path =
            'task-attachments/'
            . $task->id
            . '/example.pdf';

        Storage::disk('local')->put(
            $path,
            'fake-content'
        );

        $attachment =
            $task->attachments()->create([
                'uploaded_by' =>
                    $assignee->id,

                'original_name' =>
                    'example.pdf',

                'path' =>
                    $path,

                'mime_type' =>
                    'application/pdf',

                'size' =>
                    12,
            ]);

        $response = $this
            ->actingAs($assignee)
            ->delete(
                route(
                    'tasks.attachments.destroy',
                    [
                        'task' => $task,
                        'attachment' =>
                            $attachment,
                    ]
                )
            );

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseMissing(
            'task_attachments',
            [
                'id' => $attachment->id,
            ]
        );

        Storage::disk('local')
            ->assertMissing(
                $path
            );
    }

    public function test_other_assignee_cannot_delete_someone_elses_attachment(): void
    {
        Storage::fake('local');

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
            'title' => 'Task',
            'status' => 'in_progress',
            'priority' => 'medium',
        ]);

        $task->assignees()->attach([
            $assigneeA->id => [
                'acknowledged_at' => now(),
            ],

            $assigneeB->id => [
                'acknowledged_at' => now(),
            ],
        ]);

        $attachment =
            $task->attachments()->create([
                'uploaded_by' =>
                    $assigneeA->id,

                'original_name' =>
                    'proof.png',

                'path' =>
                    'task-attachments/test/proof.png',

                'mime_type' =>
                    'image/png',

                'size' =>
                    100,
            ]);

        $response = $this
            ->actingAs($assigneeB)
            ->delete(
                route(
                    'tasks.attachments.destroy',
                    [
                        'task' => $task,
                        'attachment' =>
                            $attachment,
                    ]
                )
            );

        $response->assertForbidden();

        $this->assertDatabaseHas(
            'task_attachments',
            [
                'id' => $attachment->id,
            ]
        );
    }

    public function test_authorized_user_can_download_attachment(): void
    {
        Storage::fake('local');

        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Task',
            'status' => 'todo',
            'priority' => 'medium',
        ]);

        $path =
            'task-attachments/'
            . $task->id
            . '/report.pdf';

        Storage::disk('local')->put(
            $path,
            'PDF CONTENT'
        );

        $attachment =
            $task->attachments()->create([
                'uploaded_by' =>
                    $creator->id,

                'original_name' =>
                    'report.pdf',

                'path' =>
                    $path,

                'mime_type' =>
                    'application/pdf',

                'size' =>
                    11,
            ]);

        $response = $this
            ->actingAs($creator)
            ->get(
                route(
                    'tasks.attachments.download',
                    [
                        'task' => $task,
                        'attachment' =>
                            $attachment,
                    ]
                )
            );

        $response->assertOk();

        $response->assertDownload(
            'report.pdf'
        );
    }

    public function test_upload_creates_attachment_activity(): void
    {
        Storage::fake('local');

        $creator = User::factory()->create([
            'role' => 'staff',
        ]);

        $task = Task::create([
            'created_by' => $creator->id,
            'title' => 'Task',
            'status' => 'todo',
            'priority' => 'medium',
        ]);

        $this
            ->actingAs($creator)
            ->post(
                route(
                    'tasks.attachments.store',
                    $task
                ),
                [
                    'file' =>
                        UploadedFile::fake()
                            ->image(
                                'evidence.png'
                            ),
                ]
            )
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas(
            'task_activities',
            [
                'task_id' =>
                    $task->id,

                'actor_id' =>
                    $creator->id,

                'action' =>
                    'attachment_added',
            ]
        );
    }
}
