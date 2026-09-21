<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        /*
         * Semua task yang di-assign ke user login.
         */
        $assignedTasksQuery = Task::query()
            ->whereHas('assignees', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            });

        /*
         * Assignment yang belum di-acknowledge user.
         */
        $pendingAcknowledgementQuery = Task::query()
            ->whereHas('assignees', function ($query) use ($user) {
                $query
                    ->where('users.id', $user->id)
                    ->whereNull('task_user.acknowledged_at');
            });

        /*
         * Task urgent yang di-assign ke user
         * dan belum selesai.
         */
        $urgentTasksQuery = Task::query()
            ->whereHas('assignees', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->where('priority', 'urgent')
            ->where('status', '!=', 'done');

        /*
         * Task overdue:
         * - punya due_at
         * - waktunya sudah lewat
         * - belum selesai
         * - di-assign ke user login
         */
        $overdueTasksQuery = Task::query()
            ->whereHas('assignees', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->whereNotNull('due_at')
            ->where('due_at', '<', now())
            ->where('status', '!=', 'done');

        /*
         * Project aktif yang boleh dianggap relevan
         * untuk user.
         */
        $activeProjectsQuery = Project::query()
            ->where('status', 'active');

        if ($user->role !== 'administrator') {
            $activeProjectsQuery->where(function ($query) use ($user) {
                $query->where(
                    'created_by',
                    $user->id
                );

                if ($user->department_id !== null) {
                    $query->orWhereHas(
                        'departments',
                        function ($query) use ($user) {
                            $query->where(
                                'departments.id',
                                $user->department_id
                            );
                        }
                    );
                }
            });
        }

        /*
         * Statistik utama dashboard.
         */
        $stats = [
            'my_tasks' => (clone $assignedTasksQuery)
                ->where('status', '!=', 'done')
                ->count(),

            'pending_acknowledgement' =>
                (clone $pendingAcknowledgementQuery)
                    ->where('status', '!=', 'done')
                    ->count(),

            'in_progress' => (clone $assignedTasksQuery)
                ->where('status', 'in_progress')
                ->count(),

            'urgent' => (clone $urgentTasksQuery)
                ->count(),

            'overdue' => (clone $overdueTasksQuery)
                ->count(),

            'created_by_me' => Task::query()
                ->where('created_by', $user->id)
                ->where('status', '!=', 'done')
                ->count(),

            'active_projects' => (clone $activeProjectsQuery)
                ->count(),
        ];

        /*
         * Assignment terbaru yang perlu
         * di-acknowledge.
         */
        $pendingAcknowledgements =
            (clone $pendingAcknowledgementQuery)
                ->with([
                    'project:id,name',
                    'creator:id,name,email',
                ])
                ->where('status', '!=', 'done')
                ->orderByDesc('created_at')
                ->limit(5)
                ->get([
                    'id',
                    'project_id',
                    'created_by',
                    'title',
                    'priority',
                    'status',
                    'due_at',
                    'created_at',
                ]);

        /*
         * Task urgent user.
         */
        $urgentTasks = (clone $urgentTasksQuery)
            ->with([
                'project:id,name',
                'creator:id,name,email',
            ])
            ->orderByRaw(
                'CASE WHEN due_at IS NULL THEN 1 ELSE 0 END'
            )
            ->orderBy('due_at')
            ->limit(5)
            ->get([
                'id',
                'project_id',
                'created_by',
                'title',
                'priority',
                'status',
                'due_at',
                'created_at',
            ]);

        /*
         * Task user yang sudah melewati deadline.
         */
        $overdueTasks = (clone $overdueTasksQuery)
            ->with([
                'project:id,name',
                'creator:id,name,email',
            ])
            ->orderBy('due_at')
            ->limit(5)
            ->get([
                'id',
                'project_id',
                'created_by',
                'title',
                'priority',
                'status',
                'due_at',
                'created_at',
            ]);

        return Inertia::render('dashboard', [
            'stats' => $stats,

            'pendingAcknowledgements' =>
                $pendingAcknowledgements,

            'urgentTasks' => $urgentTasks,

            'overdueTasks' => $overdueTasks,
        ]);
    }
}
