<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskCommentRequest;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class TaskCommentController extends Controller
{
    public function store(
        StoreTaskCommentRequest $request,
        Task $task
    ): RedirectResponse {
        Gate::authorize('view', $task);

        $comment = $task->comments()->create([
            'user_id' => $request->user()->id,
            'message' => $request->validated('message'),
        ]);

        $task->recordActivity(
            'comment_added',
            $request->user(),
            [
                'comment_id' => $comment->id,
            ]
        );

        return back()->with(
            'success',
            'Komentar berhasil ditambahkan.'
        );
    }

    public function destroy(
        Task $task,
        TaskComment $comment
    ): RedirectResponse {
        if ($comment->task_id !== $task->id) {
            abort(404);
        }

        Gate::authorize('delete', $comment);

        $comment->delete();

        return back()->with(
            'success',
            'Komentar berhasil dihapus.'
        );
    }
}
