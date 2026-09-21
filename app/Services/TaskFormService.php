<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Collection;

class TaskFormService
{
    public function projectsFor(User $user): Collection
    {
        return Project::query()
            ->visibleTo($user)
            ->where('status', 'active')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'status',
                'due_date',
            ]);
    }

    public function assignees(): Collection
    {
        /*
         * Semua user staff maupun administrator
         * boleh menjadi assignee.
         *
         * Department hanya metadata untuk frontend.
         */
        return User::query()
            ->with([
                'department:id,name,code',
            ])
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'email',
                'role',
                'department_id',
            ]);
    }

    public function options(): array
    {
        return [
            'priorities' => [
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

            /*
             * Task baru selalu mulai dari To Do.
             *
             * Frontend tidak perlu memberikan
             * pilihan status saat create.
             */
            'initial_status' => 'todo',

            'review' => [
                [
                    'value' => false,
                    'label' => 'No Review Required',
                ],
                [
                    'value' => true,
                    'label' => 'Require Review',
                ],
            ],
        ];
    }

    public function forUser(User $user): array
    {
        return [
            'projects' =>
                $this->projectsFor($user),

            'assignees' =>
                $this->assignees(),

            'options' =>
                $this->options(),
        ];
    }
}
