<?php
namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function before(User $user, string $ability): bool | null
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

    public function view(User $user, Task $task): bool
    {
        if ($task->created_by === $user->id) {
            return true;
        }

        if ($task->assignees()->where('users.id', $user->id)->exists()) {
            return true;
        }

        if (
            $user->department_id !== null
            && $task->departments()
            ->where('departments.id', $user->department_id)
            ->exists()
        ) {
            return true;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Task $task): bool
    {
        return $task->created_by === $user->id;
    }

    public function updateStatus(User $user, Task $task): bool
    {
        if ($task->created_by === $user->id) {
            return true;
        }

        return $task->assignees()
            ->where('users.id', $user->id)
            ->exists();
    }

    public function delete(User $user, Task $task): bool
    {
        return $task->created_by === $user->id;
    }
}
