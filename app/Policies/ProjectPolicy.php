<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function before(User $user, string $ability): bool|null
    {
        if ($user->role === 'administrator') {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Project $project): bool
    {
        if ($project->created_by === $user->id) {
            return true;
        }

        if ($user->department_id === null) {
            return false;
        }

        return $project->departments()
            ->where('departments.id', $user->department_id)
            ->exists();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Project $project): bool
    {
        return $project->created_by === $user->id;
    }

    public function delete(User $user, Project $project): bool
    {
        return $project->created_by === $user->id;
    }
}
