<?php

namespace App\Http\Middleware;

use App\Models\Task;
use App\Services\TaskNotificationService;
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

            'notifications' => function () use ($request) {
                $notificationService =
                    app(TaskNotificationService::class);

                $user = $request->user();

                if ($user === null) {
                    return $notificationService->empty();
                }

                return $notificationService->forUser(
                    $user
                );
            },
        ]);
    }
}
