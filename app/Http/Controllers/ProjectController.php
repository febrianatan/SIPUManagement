<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Project::query()
            ->visibleTo($user)
            ->with([
                'creator:id,name,email,department_id',
                'departments:id,name,code',
            ])
            ->withCount('tasks')
            ->orderByDesc('created_at');

        return Inertia::render('projects/index', [
            'projects' => $query->get(),
        ]);
    }

    public function show(
        Request $request,
        Project $project
    ): Response {
        Gate::authorize('view', $project);

        $user = $request->user();

        /*
         * Data utama project.
         */
        $project->load([
            'creator:id,name,email,department_id',
            'departments:id,name,code',
        ]);

        /*
         * Semua task dalam project boleh terlihat
         * sebagai overview bagi user yang memang
         * memiliki akses ke project.
         *
         * Tetapi akses Task Detail tetap mengikuti
         * TaskPolicy melalui properti can_open.
         */
        $tasks = $project
            ->tasks()
            ->with([
                'creator:id,name,email',

                'assignees' => function ($query) {
                    $query
                        ->select(
                            'users.id',
                            'users.name',
                            'users.email',
                            'users.department_id'
                        )
                        ->withPivot(
                            'acknowledged_at'
                        );
                },
            ])
            ->orderByRaw(
                "
                CASE priority
                    WHEN 'urgent' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                    ELSE 5
                END
                "
            )
            ->orderByRaw(
                'CASE WHEN due_at IS NULL THEN 1 ELSE 0 END'
            )
            ->orderBy('due_at')
            ->orderByDesc('created_at')
            ->get();

        /*
         * Statistik project.
         */
        $totalTasks = $tasks->count();

        $todoTasks = $tasks
            ->where('status', 'todo')
            ->count();

        $inProgressTasks = $tasks
            ->where('status', 'in_progress')
            ->count();

        $reviewTasks = $tasks
            ->where('status', 'review')
            ->count();

        $doneTasks = $tasks
            ->where('status', 'done')
            ->count();

        /*
         * Kalau belum ada task:
         * progress = 0%
         */
        $completionPercentage = $totalTasks > 0
            ? (int) round(
                ($doneTasks / $totalTasks) * 100
            )
            : 0;

        /*
         * Bentuk data task khusus Project Detail.
         *
         * Kita tidak mengirim comments/activity di sini
         * karena itu milik halaman Task Detail.
         */
        $taskSummaries = $tasks
            ->map(function (Task $task) use ($user) {
                $assigneeCount =
                    $task->assignees->count();

                $acknowledgedCount =
                    $task->assignees
                    ->filter(function ($assignee) {
                        return $assignee
                            ->pivot
                            ->acknowledged_at !== null;
                    })
                    ->count();

                return [
                    'id'                 => $task->id,

                    'title'              => $task->title,

                    'description'        =>
                    $task->description,

                    'status'             =>
                    $task->status,

                    'priority'           =>
                    $task->priority,

                    'due_at'             =>
                    $task->due_at,

                    'created_at'         =>
                    $task->created_at,

                    'creator'            =>
                    $task->creator,

                    'assignees'          =>
                    $task->assignees,

                    'assignee_count'     =>
                    $assigneeCount,

                    'acknowledged_count' =>
                    $acknowledgedCount,

                    /*
                     * Apakah user boleh membuka
                     * Task Detail.
                     */
                    'can_open'           =>
                    $user->can(
                        'view',
                        $task
                    ),

                    /*
                     * Berguna untuk drag/drop Kanban.
                     */
                    'can_update_status'  =>
                    $user->can(
                        'updateStatus',
                        $task
                    ),
                ];
            })
            ->values();

        return Inertia::render(
            'projects/show',
            [
                'project' => $project,

                'stats'   => [
                    'total_tasks'           =>
                    $totalTasks,

                    'todo'                  =>
                    $todoTasks,

                    'in_progress'           =>
                    $inProgressTasks,

                    'review'                =>
                    $reviewTasks,

                    'done'                  =>
                    $doneTasks,

                    'completion_percentage' =>
                    $completionPercentage,
                ],

                'tasks'   =>
                $taskSummaries,

                /*
                 * Permission Project untuk frontend.
                 */
                'can'     => [
                    'update' =>
                    $user->can(
                        'update',
                        $project
                    ),

                    'delete' =>
                    $user->can(
                        'delete',
                        $project
                    ),
                ],
            ]
        );
    }

    public function store(
        StoreProjectRequest $request
    ): RedirectResponse {
        $validated = $request->validated();
        $user      = $request->user();

        DB::transaction(function () use (
            $validated,
            $user
        ) {
            $project = Project::create([
                'name'        =>
                $validated['name'],

                'description' =>
                $validated['description'] ?? null,

                'status'      =>
                $validated['status'],

                'created_by'  =>
                $user->id,

                'start_date'  =>
                $validated['start_date'] ?? null,

                'due_date'    =>
                $validated['due_date'] ?? null,
            ]);

            /*
             * Department yang dipilih user.
             */
            $departmentIds =
                $validated['department_ids'];

            /*
             * Department creator otomatis
             * menjadi bagian project.
             */
            if ($user->department_id !== null) {
                $departmentIds[] =
                    $user->department_id;
            }

            $project
                ->departments()
                ->sync(
                    array_unique(
                        $departmentIds
                    )
                );
        });

        return back()->with(
            'success',
            'Project berhasil dibuat.'
        );
    }

    public function update(
        UpdateProjectRequest $request,
        Project $project
    ): RedirectResponse {
        Gate::authorize(
            'update',
            $project
        );

        $validated =
            $request->validated();

        DB::transaction(function () use (
            $validated,
            $project
        ) {
            $project->update([
                'name'        =>
                $validated['name'],

                'description' =>
                $validated['description'] ?? null,

                'status'      =>
                $validated['status'],

                'start_date'  =>
                $validated['start_date'] ?? null,

                'due_date'    =>
                $validated['due_date'] ?? null,
            ]);

            $departmentIds =
                $validated['department_ids'];

            /*
             * Penting:
             *
             * Yang dipertahankan adalah department
             * milik CREATOR PROJECT,
             * bukan department user yang sedang
             * melakukan update.
             *
             * Ini penting ketika Admin mengedit project.
             */
            $creatorDepartmentId =
                $project
                ->creator()
                ->value(
                    'department_id'
                );

            if ($creatorDepartmentId !== null) {
                $departmentIds[] =
                    $creatorDepartmentId;
            }

            $project
                ->departments()
                ->sync(
                    array_unique(
                        $departmentIds
                    )
                );
        });

        return back()->with(
            'success',
            'Project berhasil diperbarui.'
        );
    }

    public function destroy(
        Project $project
    ): RedirectResponse {
        Gate::authorize(
            'delete',
            $project
        );

        $project->delete();

        return back()->with(
            'success',
            'Project berhasil dihapus.'
        );
    }
}
