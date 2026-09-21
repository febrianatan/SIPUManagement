<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function before(
        User $user,
        string $ability
    ): bool|null {
        if ($user->role === 'administrator') {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(
        User $user,
        Project $project
    ): bool {
        /*
         * Creator project.
         */
        if ($project->created_by === $user->id) {
            return true;
        }

        /*
         * Department user menjadi participant
         * dalam project.
         */
        if (
            $user->department_id !== null
            && $project
                ->departments()
                ->where(
                    'departments.id',
                    $user->department_id
                )
                ->exists()
        ) {
            return true;
        }

        /*
         * User di-assign ke minimal satu Task
         * di dalam project.
         */
        return $project
            ->tasks()
            ->whereHas(
                'assignees',
                function ($query) use ($user) {
                    $query->where(
                        'users.id',
                        $user->id
                    );
                }
            )
            ->exists();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(
        User $user,
        Project $project
    ): bool {
        return $project->created_by === $user->id;
    }

    public function delete(
        User $user,
        Project $project
    ): bool {
        return $project->created_by === $user->id;
    }
}
