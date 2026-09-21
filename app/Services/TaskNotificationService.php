<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;

class TaskNotificationService
{
    public function forUser(User $user): array
    {
        /*
         * =========================================================
         * NEW ASSIGNMENTS
         * =========================================================
         *
         * Task yang:
         * - di-assign ke user login
         * - belum di-acknowledge
         * - belum selesai
         */
        $pendingAssignmentsQuery = Task::query()
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

        /*
         * =========================================================
         * WAITING FOR REVIEW
         * =========================================================
         *
         * Hanya task yang dibuat oleh user login,
         * membutuhkan review, dan sekarang berada
         * pada status review.
         */
        $waitingReviewsQuery = Task::query()
            ->where(
                'created_by',
                $user->id
            )
            ->where(
                'requires_review',
                true
            )
            ->where(
                'status',
                'review'
            );

        $pendingAssignmentsCount =
            (clone $pendingAssignmentsQuery)
                ->count();

        $waitingReviewsCount =
            (clone $waitingReviewsQuery)
                ->count();

        return [
            /*
             * Angka total untuk badge bell.
             */
            'total_count' =>
                $pendingAssignmentsCount
                + $waitingReviewsCount,

            /*
             * Assignment baru.
             */
            'pending_assignments_count' =>
                $pendingAssignmentsCount,

            'pending_assignments' =>
                (clone $pendingAssignmentsQuery)
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
                    ->orderByDesc(
                        'created_at'
                    )
                    ->limit(5)
                    ->get([
                        'id',
                        'project_id',
                        'created_by',
                        'title',
                        'status',
                        'priority',
                        'due_at',
                        'requires_review',
                        'created_at',
                    ]),

            /*
             * Task yang menunggu approval creator.
             */
            'waiting_reviews_count' =>
                $waitingReviewsCount,

            'waiting_reviews' =>
                (clone $waitingReviewsQuery)
                    ->with([
                        'project:id,name',

                        'assignees' => function ($query) {
                            $query->select(
                                'users.id',
                                'users.name',
                                'users.email'
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
                        '
                        CASE
                            WHEN due_at IS NULL
                            THEN 1
                            ELSE 0
                        END
                        '
                    )
                    ->orderBy(
                        'due_at'
                    )
                    ->orderByDesc(
                        'updated_at'
                    )
                    ->limit(5)
                    ->get([
                        'id',
                        'project_id',
                        'created_by',
                        'title',
                        'status',
                        'priority',
                        'due_at',
                        'requires_review',
                        'updated_at',
                    ]),
        ];
    }

    public function empty(): array
    {
        return [
            'total_count' => 0,

            'pending_assignments_count' => 0,
            'pending_assignments' => [],

            'waiting_reviews_count' => 0,
            'waiting_reviews' => [],
        ];
    }
}
