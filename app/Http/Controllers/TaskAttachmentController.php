<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskAttachmentRequest;
use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class TaskAttachmentController extends Controller
{
    public function store(
        StoreTaskAttachmentRequest $request,
        Task $task
    ): RedirectResponse {
        /*
         * Request sebenarnya sudah melakukan
         * authorization.
         *
         * Gate ini tetap dipertahankan sebagai
         * safety guard.
         */
        Gate::authorize(
            'view',
            $task
        );

        $file = $request->file('file');

        $extension =
            $file->guessExtension()
            ?: $file->getClientOriginalExtension()
            ?: 'bin';

        /*
         * Nama fisik file TIDAK memakai nama
         * yang dikirim user.
         */
        $storedName =
            Str::uuid()->toString()
            . '.'
            . strtolower($extension);

        $directory =
            'task-attachments/'
            . $task->id;

        $path = Storage::disk('local')
            ->putFileAs(
                $directory,
                $file,
                $storedName
            );

        if ($path === false) {
            return back()->withErrors([
                'file' =>
                    'Attachment gagal disimpan.',
            ]);
        }

        try {
            DB::transaction(function () use (
                $task,
                $request,
                $file,
                $path
            ) {
                $attachment =
                    $task->attachments()->create([
                        'uploaded_by' =>
                            $request->user()->id,

                        'original_name' =>
                            $file
                                ->getClientOriginalName(),

                        'path' =>
                            $path,

                        'mime_type' =>
                            $file->getMimeType(),

                        'size' =>
                            $file->getSize(),
                    ]);

                $task->recordActivity(
                    'attachment_added',
                    $request->user(),
                    [
                        'attachment_id' =>
                            $attachment->id,

                        'original_name' =>
                            $attachment
                                ->original_name,

                        'mime_type' =>
                            $attachment
                                ->mime_type,

                        'size' =>
                            $attachment
                                ->size,
                    ]
                );
            });
        } catch (Throwable $exception) {
            /*
             * Kalau database gagal,
             * file yang sudah terlanjur tersimpan
             * dibersihkan lagi.
             */
            Storage::disk('local')
                ->delete($path);

            throw $exception;
        }

        return back()->with(
            'success',
            'Attachment berhasil ditambahkan.'
        );
    }

    public function download(
        Task $task,
        TaskAttachment $attachment
    ): StreamedResponse {
        $this->ensureBelongsToTask(
            $task,
            $attachment
        );

        Gate::authorize(
            'view',
            $task
        );

        abort_unless(
            Storage::disk('local')
                ->exists($attachment->path),
            404
        );

        return Storage::disk('local')
            ->download(
                $attachment->path,
                $attachment->original_name
            );
    }

    public function destroy(
        Task $task,
        TaskAttachment $attachment
    ): RedirectResponse {
        $this->ensureBelongsToTask(
            $task,
            $attachment
        );

        Gate::authorize(
            'delete',
            $attachment
        );

        $path =
            $attachment->path;

        $attachmentId =
            $attachment->id;

        $originalName =
            $attachment->original_name;

        DB::transaction(function () use (
            $task,
            $attachment,
            $attachmentId,
            $originalName
        ) {
            $attachment->delete();

            $task->recordActivity(
                'attachment_deleted',
                request()->user(),
                [
                    'attachment_id' =>
                        $attachmentId,

                    'original_name' =>
                        $originalName,
                ]
            );

            /*
             * File fisik dihapus hanya setelah
             * transaksi database berhasil.
             */
            DB::afterCommit(function () use (
                $attachment
            ) {
                Storage::disk('local')
                    ->delete(
                        $attachment->path
                    );
            });
        });

        return back()->with(
            'success',
            'Attachment berhasil dihapus.'
        );
    }

    private function ensureBelongsToTask(
        Task $task,
        TaskAttachment $attachment
    ): void {
        abort_unless(
            $attachment->task_id
            === $task->id,
            404
        );
    }
}
