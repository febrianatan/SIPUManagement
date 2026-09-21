<?php
namespace App\Http\Middleware;

use App\Models\Task;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $user               = $request->user();

        $pendingAssignmentQuery = null;

        if ($user !== null) {
            $pendingAssignmentQuery = Task::query()
                ->whereHas(
                    'assignees',
                    function ($query) use ($user) {
                        $query
                            ->where(
                                'users.id',
                                $user->id
                            )
                            ->whereNull(
                                'task_user.acknowledged_at'
                            );
                    }
                )
                ->where(
                    'status',
                    '!=',
                    'done'
                );
        }

        return array_merge(parent::share($request), [
             ...parent::share($request),
            'name'          => config('app.name'),
            'quote'         => ['message' => trim($message), 'author' => trim($author)],

            'auth'          => [
                'user' => $request->user(),
            ],

            'notifications' => function () use (
                $pendingAssignmentQuery
            ) {
                if ($pendingAssignmentQuery === null) {
                    return [
                        'pending_assignments_count' => 0,
                        'pending_assignments'       => [],
                    ];
                }

                return [
                    'pending_assignments_count' =>
                    (clone $pendingAssignmentQuery)
                        ->count(),

                    'pending_assignments'       =>
                    (clone $pendingAssignmentQuery)
                        ->with([
                            'creator:id,name,email',
                            'project:id,name',
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
                        ->orderByDesc('created_at')
                        ->limit(5)
                        ->get([
                            'id',
                            'project_id',
                            'created_by',
                            'title',
                            'status',
                            'priority',
                            'due_at',
                            'created_at',
                        ]),
                ];
            },
        ]);
    }
}
