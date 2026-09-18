<?php
namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TaskAcknowledgementController extends Controller
{
    public function acknowledge(
        Request $request,
        Task $task
    ): RedirectResponse {
        $user = $request->user();

        $assignee = $task->assignees()
            ->where('users.id', $user->id)
            ->first();

        abort_unless($assignee, 403);

        if ($assignee->pivot->acknowledged_at === null) {
            $task->assignees()->updateExistingPivot(
                $user->id,
                [
                    'acknowledged_at' => now(),
                ]
            );

            $task->recordActivity(
                'task_acknowledged',
                $user
            );
        }

        return back()->with(
            'success',
            'Task berhasil di-acknowledge.'
        );
    }
}
