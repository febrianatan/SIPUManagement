<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Requests\UpdateTaskStatusRequest;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Task::query()
            ->with([
                'project:id,name',
                'creator:id,name,email',
                'assignees:id,name,email,department_id',
                'departments:id,name,code',
            ])
            ->orderByDesc('created_at');

        if ($user->role !== 'administrator') {
            $query->where(function ($query) use ($user) {
                $query->where('created_by', $user->id)
                    ->orWhereHas('assignees', function ($query) use ($user) {
                        $query->where('users.id', $user->id);
                    });

                if ($user->department_id !== null) {
                    $query->orWhereHas('departments', function ($query) use ($user) {
                        $query->where(
                            'departments.id',
                            $user->department_id
                        );
                    });
                }
            });
        }

        return Inertia::render('tasks/index', [
            'tasks' => $query->get(),
        ]);
    }

    public function show(Task $task): Response
    {
        Gate::authorize('view', $task);

        $task->load([
            'project:id,name',
            'creator:id,name,email',
            'assignees:id,name,email,department_id',
            'departments:id,name,code',
            'comments.user:id,name,email',
        ]);

        return Inertia::render('tasks/show', [
            'task' => $task,
        ]);
    }

    public function store(StoreTaskRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            $task = Task::create([
                'project_id'  => $validated['project_id'] ?? null,
                'created_by'  => $request->user()->id,
                'title'       => $validated['title'],
                'description' => $validated['description'] ?? null,
                'status'      => $validated['status'],
                'priority'    => $validated['priority'],
                'due_at'      => $validated['due_at'] ?? null,
            ]);

            $task->departments()
                ->sync($validated['department_ids']);

            $task->assignees()
                ->sync($validated['assignee_ids'] ?? []);
        });

        return back()->with(
            'success',
            'Task berhasil dibuat.'
        );
    }

    public function update(
        UpdateTaskRequest $request,
        Task $task
    ): RedirectResponse {
        Gate::authorize('update', $task);

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $task) {
            $task->update([
                'project_id'  => $validated['project_id'] ?? null,
                'title'       => $validated['title'],
                'description' => $validated['description'] ?? null,
                'status'      => $validated['status'],
                'priority'    => $validated['priority'],
                'due_at'      => $validated['due_at'] ?? null,
            ]);

            $task->departments()
                ->sync($validated['department_ids']);

            $task->assignees()
                ->sync($validated['assignee_ids'] ?? []);
        });

        return back()->with(
            'success',
            'Task berhasil diperbarui.'
        );
    }

    public function updateStatus(
        UpdateTaskStatusRequest $request,
        Task $task
    ): RedirectResponse {
        Gate::authorize('updateStatus', $task);

        $task->update([
            'status' => $request->validated('status'),
        ]);

        return back()->with(
            'success',
            'Status task berhasil diperbarui.'
        );
    }

    public function destroy(Task $task): RedirectResponse
    {
        Gate::authorize('delete', $task);

        $task->delete();

        return back()->with(
            'success',
            'Task berhasil dihapus.'
        );
    }
}
