<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TaskStatusService
{
    /**
     * Mengembalikan status berikutnya yang boleh
     * dipilih oleh user untuk task tertentu.
     */
    public function availableTransitions(
        Task $task,
        User $user
    ): array {
        $isAdministrator =
            $user->role === 'administrator';

        $isCreator =
            $task->created_by === $user->id;

        $assignee = $task
            ->assignees()
            ->where('users.id', $user->id)
            ->first();

        $isAssignee =
            $assignee !== null;

        /*
         * User yang tidak berkaitan dengan task
         * tidak punya transition.
         */
        if (
            !$isAdministrator
            && !$isCreator
            && !$isAssignee
        ) {
            return [];
        }

        /*
         * Assignee wajib acknowledge dulu.
         *
         * Creator dan Administrator tidak perlu.
         */
        if (
            !$isAdministrator
            && !$isCreator
            && $isAssignee
            && $assignee->pivot->acknowledged_at === null
        ) {
            return [];
        }

        $canApprove =
            $isAdministrator
            || $isCreator;

        $transitions = $this->transitionMap(
            $task,
            $canApprove
        );

        return $transitions[$task->status]
            ?? [];
    }

    /**
     * Update status task.
     */
    public function update(
        Task $task,
        User $user,
        string $newStatus
    ): bool {
        $oldStatus = $task->status;

        if ($oldStatus === $newStatus) {
            return false;
        }

        $isAdministrator =
            $user->role === 'administrator';

        $isCreator =
            $task->created_by === $user->id;

        $assignee = $task
            ->assignees()
            ->where('users.id', $user->id)
            ->first();

        $isAssignee =
            $assignee !== null;

        /*
         * Safety guard.
         *
         * Normalnya sudah dijaga TaskPolicy,
         * tetapi service tetap melindungi dirinya.
         */
        if (
            !$isAdministrator
            && !$isCreator
            && !$isAssignee
        ) {
            throw new AuthorizationException();
        }

        /*
         * Assignee belum acknowledge.
         */
        if (
            !$isAdministrator
            && !$isCreator
            && $isAssignee
            && $assignee->pivot->acknowledged_at === null
        ) {
            throw ValidationException::withMessages([
                'status' =>
                    'Task harus di-acknowledge terlebih dahulu sebelum status dapat diubah.',
            ]);
        }

        $allowedStatuses =
            $this->availableTransitions(
                $task,
                $user
            );

        if (
            !in_array(
                $newStatus,
                $allowedStatuses,
                true
            )
        ) {
            throw ValidationException::withMessages([
                'status' =>
                    'Perubahan status dari '
                    . $this->statusLabel($oldStatus)
                    . ' ke '
                    . $this->statusLabel($newStatus)
                    . ' tidak diizinkan.',
            ]);
        }

        DB::transaction(function () use (
            $task,
            $user,
            $oldStatus,
            $newStatus
        ) {
            $task->update([
                'status' => $newStatus,
            ]);

            $task->recordActivity(
                'status_changed',
                $user,
                [
                    'from' => $oldStatus,
                    'to' => $newStatus,
                ]
            );
        });

        return true;
    }

    /**
     * Definisi workflow task.
     */
    private function transitionMap(
        Task $task,
        bool $canApprove
    ): array {
        /*
         * Task biasa:
         *
         * To Do
         *   ↓
         * In Progress
         *   ↓
         * Done
         */
        if (!$task->requires_review) {
            if ($canApprove) {
                return [
                    'todo' => [
                        'in_progress',
                    ],

                    'in_progress' => [
                        'done',
                    ],

                    'review' => [
                        'in_progress',
                        'done',
                    ],

                    'done' => [
                        'in_progress',
                    ],
                ];
            }

            return [
                'todo' => [
                    'in_progress',
                ],

                'in_progress' => [
                    'done',
                ],

                'review' => [],

                'done' => [],
            ];
        }

        /*
         * Task dengan approval:
         *
         * Assignee:
         *
         * To Do
         *   ↓
         * In Progress
         *   ↓
         * Review
         *
         *
         * Creator/Admin:
         *
         * Review
         *  ├── Done
         *  └── In Progress
         */
        if ($canApprove) {
            return [
                'todo' => [
                    'in_progress',
                ],

                'in_progress' => [
                    'review',
                ],

                'review' => [
                    'done',
                    'in_progress',
                ],

                'done' => [
                    'in_progress',
                ],
            ];
        }

        return [
            'todo' => [
                'in_progress',
            ],

            'in_progress' => [
                'review',
            ],

            'review' => [],

            'done' => [],
        ];
    }

    public function statusLabel(
        string $status
    ): string {
        return match ($status) {
            'todo' =>
                'To Do',

            'in_progress' =>
                'In Progress',

            'review' =>
                'Review',

            'done' =>
                'Done',

            default =>
                $status,
        };
    }
}
