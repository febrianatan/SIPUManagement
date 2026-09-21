<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\TaskIndexRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Requests\UpdateTaskStatusRequest;
use App\Models\Project;
use App\Models\Task;
use App\Services\TaskActivityFormatter;
use App\Services\TaskFormService;
use App\Services\TaskStatusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(
        TaskIndexRequest $request
    ): Response {
        $user      = $request->user();
        $validated = $request->validated();

        /*
     * Query dasar.
     *
     * Status sengaja belum dimasukkan,
     * karena base query juga dipakai
     * untuk menghitung jumlah tiap kolom Kanban.
     */
        $baseQuery = Task::query()
            ->visibleTo($user)
            ->search(
                $validated['search'] ?? null
            )
            ->priority(
                $validated['priority'] ?? null
            )
            ->project(
                $validated['project_id'] ?? null
            )
            ->assignee(
                $validated['assignee_id'] ?? null
            )
            ->acknowledgement(
                $user,
                $validated['acknowledgement'] ?? null
            )
            ->createdBy(
                $validated['created_by'] ?? null
            )
            ->due(
                $validated['due'] ?? null
            );

        /*
     * Count untuk Kanban.
     */
        $statusCounts = [
            'todo'        => (clone $baseQuery)
                ->where('status', 'todo')
                ->count(),

            'in_progress' => (clone $baseQuery)
                ->where('status', 'in_progress')
                ->count(),

            'review'      => (clone $baseQuery)
                ->where('status', 'review')
                ->count(),

            'done'        => (clone $baseQuery)
                ->where('status', 'done')
                ->count(),
        ];

        /*
     * Filter status baru diterapkan
     * ke daftar task.
     */
        $query = (clone $baseQuery)
            ->status(
                $validated['status'] ?? null
            );

        $perPage =
            $validated['per_page'] ?? 20;

        $tasks = $query
            ->with([
                'project:id,name',
                'creator:id,name,email',

                'assignees' => function ($query) {
                    $query->select(
                        'users.id',
                        'users.name',
                        'users.email',
                        'users.department_id'
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
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('tasks/index', [
            'tasks'         => $tasks,

            /*
         * Filter aktif.
         *
         * Ini dikirim kembali ke frontend
         * supaya UI tahu filter apa yang
         * sedang aktif.
         */
            'filters'       => [
                'search'          =>
                $validated['search'] ?? null,

                'status'          =>
                $validated['status'] ?? null,

                'priority'        =>
                $validated['priority'] ?? null,

                'project_id'      =>
                $validated['project_id'] ?? null,

                'assignee_id'     =>
                $validated['assignee_id'] ?? null,

                /*
             * INI YANG TADI KETINGGALAN.
             */
                'acknowledgement' =>
                $validated['acknowledgement'] ?? null,

                'created_by'      =>
                $validated['created_by'] ?? null,

                'due'             =>
                $validated['due'] ?? null,

                'per_page'        =>
                $perPage,
            ],

            /*
         * Count tiap status untuk Kanban.
         */
            'statusCounts'  =>
            $statusCounts,

            /*
         * Option untuk filter frontend.
         */
            'filterOptions' => [
                'statuses'         => [
                    [
                        'value' => 'todo',
                        'label' => 'To Do',
                    ],
                    [
                        'value' => 'in_progress',
                        'label' => 'In Progress',
                    ],
                    [
                        'value' => 'review',
                        'label' => 'Review',
                    ],
                    [
                        'value' => 'done',
                        'label' => 'Done',
                    ],
                ],

                'priorities'       => [
                    [
                        'value' => 'low',
                        'label' => 'Low',
                    ],
                    [
                        'value' => 'medium',
                        'label' => 'Medium',
                    ],
                    [
                        'value' => 'high',
                        'label' => 'High',
                    ],
                    [
                        'value' => 'urgent',
                        'label' => 'Urgent',
                    ],
                ],

                'acknowledgements' => [
                    [
                        'value' => 'pending',
                        'label' => 'Need Acknowledgement',
                    ],
                    [
                        'value' => 'acknowledged',
                        'label' => 'Acknowledged',
                    ],
                ],

                'due'              => [
                    [
                        'value' => 'overdue',
                        'label' => 'Overdue',
                    ],
                    [
                        'value' => 'today',
                        'label' => 'Due Today',
                    ],
                    [
                        'value' => 'upcoming',
                        'label' => 'Upcoming',
                    ],
                    [
                        'value' => 'no_due',
                        'label' => 'No Due Date',
                    ],
                ],
            ],
        ]);
    }

    public function show(
        Task $task,
        TaskStatusService $taskStatusService,
        TaskActivityFormatter $activityFormatter
    ): Response {
        Gate::authorize(
            'view',
            $task
        );

        $user = request()->user();

        $task->load([
            'project:id,name',

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

            'comments.user:id,name,email',

            'activities.actor:id,name,email',

            'attachments.uploader:id,name,email',
        ]);

        /*
     * =========================================================
     * ASSIGNMENT STATE
     * =========================================================
     */

        $currentAssignment =
            $task->assignees->firstWhere(
                'id',
                $user->id
            );

        $isAssignee =
            $currentAssignment !== null;

        $hasAcknowledged =
            $isAssignee
            && $currentAssignment
            ->pivot
            ->acknowledged_at !== null;

        /*
     * =========================================================
     * WORKFLOW
     * =========================================================
     */

        $availableStatuses =
            $taskStatusService
            ->availableTransitions(
                $task,
                $user
            );

        $availableStatusOptions =
            collect($availableStatuses)
            ->map(function (
                string $status
            ) use ($taskStatusService) {
                return [
                    'value' =>
                    $status,

                    'label' =>
                    $taskStatusService
                        ->statusLabel(
                            $status
                        ),
                ];
            })
            ->values();

        /*
     * =========================================================
     * COMMENTS
     * =========================================================
     */

        $comments = $task
            ->comments
            ->sortBy('created_at')
            ->values()
            ->map(function ($comment) use ($user) {
                return [
                    'id' =>
                    $comment->id,

                    'message' =>
                    $comment->message,

                    'created_at' =>
                    $comment->created_at,

                    'user' =>
                    $comment->user,

                    'can_delete' =>
                    $user->can(
                        'delete',
                        $comment
                    ),
                ];
            });

        /*
     * =========================================================
     * ATTACHMENTS
     * =========================================================
     */

        $attachments = $task
            ->attachments
            ->sortByDesc('created_at')
            ->values()
            ->map(function ($attachment) use ($user) {
                return [
                    'id' =>
                    $attachment->id,

                    'original_name' =>
                    $attachment->original_name,

                    'mime_type' =>
                    $attachment->mime_type,

                    'size' =>
                    $attachment->size,

                    'created_at' =>
                    $attachment->created_at,

                    'uploader' =>
                    $attachment->uploader,

                    'can_delete' =>
                    $user->can(
                        'delete',
                        $attachment
                    ),
                ];
            });

        /*
     * =========================================================
     * ACTIVITY TIMELINE
     * =========================================================
     */

        $activities = $task
            ->activities
            ->map(
                fn($activity) =>
                $activityFormatter->format(
                    $activity
                )
            )
            ->values();

        /*
     * =========================================================
     * RESPONSE
     * =========================================================
     */

        return Inertia::render(
            'tasks/show',
            [
                /*
             * Core Task Data.
             */
                'task' => [
                    'id' =>
                    $task->id,

                    'title' =>
                    $task->title,

                    'description' =>
                    $task->description,

                    'status' =>
                    $task->status,

                    'priority' =>
                    $task->priority,

                    'due_at' =>
                    $task->due_at,

                    'requires_review' =>
                    (bool)
                    $task->requires_review,

                    'created_at' =>
                    $task->created_at,

                    'updated_at' =>
                    $task->updated_at,

                    'project' =>
                    $task->project,

                    'creator' =>
                    $task->creator,

                    'assignees' =>
                    $task->assignees,
                ],

                /*
             * Permission user terhadap Task.
             */
                'can' => [
                    'edit' =>
                    $user->can(
                        'update',
                        $task
                    ),

                    'delete' =>
                    $user->can(
                        'delete',
                        $task
                    ),

                    'update_status' =>
                    $user->can(
                        'updateStatus',
                        $task
                    ),

                    'comment' =>
                    $user->can(
                        'view',
                        $task
                    ),

                    'upload_attachment' =>
                    $user->can(
                        'view',
                        $task
                    ),
                ],

                /*
             * Assignment user login.
             */
                'assignment' => [
                    'is_assignee' =>
                    $isAssignee,

                    'acknowledged' =>
                    $hasAcknowledged,

                    'acknowledged_at' =>
                    $currentAssignment
                        ?->pivot
                        ?->acknowledged_at,

                    'can_acknowledge' =>
                    $isAssignee
                        && !$hasAcknowledged,
                ],

                /*
             * Workflow.
             */
                'workflow' => [
                    'requires_review' =>
                    (bool)
                    $task->requires_review,

                    'current_status' =>
                    $task->status,

                    'available_statuses' =>
                    $availableStatusOptions,
                ],

                /*
             * Task communication/history.
             */
                'comments' =>
                $comments,

                'attachments' =>
                $attachments,

                'activities' =>
                $activities,
            ]
        );
    }

    public function create(
        TaskFormService $taskFormService
    ): Response {
        $user = request()->user();

        return Inertia::render(
            'tasks/create',
            [
                'formData' =>
                $taskFormService->forUser(
                    $user
                ),
            ]
        );
    }

    public function edit(
        Task $task,
        TaskFormService $taskFormService
    ): Response {
        Gate::authorize(
            'update',
            $task
        );

        $user = request()->user();

        $task->load([
            'project:id,name',
            'assignees:id,name,email,department_id',
        ]);

        return Inertia::render(
            'tasks/edit',
            [
                'task' => $task,

                'formData' =>
                $taskFormService->forUser(
                    $user
                ),
            ]
        );
    }

    public function store(
        StoreTaskRequest $request
    ): RedirectResponse {
        $validated = $request->validated();
        $this->authorizeProject(
            $validated['project_id'] ?? null
        );

        DB::transaction(function () use (
            $validated,
            $request
        ) {
            $task = Task::create([
                'project_id'      =>
                $validated['project_id'] ?? null,

                'created_by'      =>
                $request->user()->id,

                'title'           =>
                $validated['title'],

                'description'     =>
                $validated['description'] ?? null,

                'status'          => 'todo',

                'priority'        =>
                $validated['priority'],

                'due_at'          =>
                $validated['due_at'] ?? null,

                'requires_review' =>
                $validated['requires_review'] ?? false,
            ]);

            $task->assignees()->sync(
                $validated['assignee_ids']
            );

            $task->recordActivity(
                'task_created',
                $request->user(),
                [
                    'assignee_ids' =>
                    $validated['assignee_ids'],
                ]
            );
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
        $this->authorizeProject(
            $validated['project_id'] ?? null
        );

        DB::transaction(function () use (
            $validated,
            $task,
            $request
        ) {
            $before = [
                'project_id'      =>
                $task->project_id,

                'title'           =>
                $task->title,

                'description'     =>
                $task->description,

                'priority'        =>
                $task->priority,

                'due_at'          =>
                $task->due_at?->toDateTimeString(),

                'requires_review' =>
                (bool) $task->requires_review,
            ];

            $oldAssignees = $task
                ->assignees()
                ->get([
                    'users.id',
                    'users.name',
                ])
                ->keyBy('id');

            $task->update([
                'project_id'      =>
                $validated['project_id'] ?? null,

                'title'           =>
                $validated['title'],

                'description'     =>
                $validated['description'] ?? null,

                'priority'        =>
                $validated['priority'],

                'due_at'          =>
                $validated['due_at'] ?? null,

                'requires_review' =>
                $validated['requires_review'] ?? $task->requires_review,
            ]);

            $task->assignees()->sync(
                $validated['assignee_ids']
            );

            $task->refresh();

            $after = [
                'project_id'      =>
                $task->project_id,

                'title'           =>
                $task->title,

                'description'     =>
                $task->description,

                'priority'        =>
                $task->priority,

                'due_at'          =>
                $task->due_at?->toDateTimeString(),

                'requires_review' =>
                (bool) $task->requires_review,
            ];

            $changes = [];

            foreach ($before as $field => $oldValue) {
                $newValue = $after[$field];

                if ($oldValue !== $newValue) {
                    $changes[$field] = [
                        'from' => $oldValue,
                        'to'   => $newValue,
                    ];
                }
            }

            if (! empty($changes)) {
                $task->recordActivity(
                    'task_updated',
                    $request->user(),
                    [
                        'changes' => $changes,
                    ]
                );
            }

            $newAssignees = $task
                ->assignees()
                ->get([
                    'users.id',
                    'users.name',
                ])
                ->keyBy('id');

            $addedAssignees = $newAssignees
                ->diffKeys($oldAssignees)
                ->values()
                ->map(function ($user) {
                    return [
                        'id'   => $user->id,
                        'name' => $user->name,
                    ];
                })
                ->all();

            $removedAssignees = $oldAssignees
                ->diffKeys($newAssignees)
                ->values()
                ->map(function ($user) {
                    return [
                        'id'   => $user->id,
                        'name' => $user->name,
                    ];
                })
                ->all();

            if (
                ! empty($addedAssignees)
                || ! empty($removedAssignees)
            ) {
                $task->recordActivity(
                    'assignees_changed',
                    $request->user(),
                    [
                        'added'   => $addedAssignees,
                        'removed' => $removedAssignees,
                    ]
                );
            }
        });

        return back()->with(
            'success',
            'Task berhasil diperbarui.'
        );
    }

    public function updateStatus(
        UpdateTaskStatusRequest $request,
        Task $task,
        TaskStatusService $taskStatusService
    ): RedirectResponse {
        Gate::authorize(
            'updateStatus',
            $task
        );

        $changed = $taskStatusService->update(
            $task,
            $request->user(),
            $request->validated('status')
        );

        if (! $changed) {
            return back();
        }

        return back()->with(
            'success',
            'Status task berhasil diperbarui.'
        );
    }

    public function destroy(
        Task $task
    ): RedirectResponse {
        Gate::authorize('delete', $task);

        $task->delete();

        return back()->with(
            'success',
            'Task berhasil dihapus.'
        );
    }

    private function authorizeProject(
        ?int $projectId
    ): void {
        if ($projectId === null) {
            return;
        }

        $project = Project::findOrFail(
            $projectId
        );

        Gate::authorize(
            'view',
            $project
        );
    }
}
