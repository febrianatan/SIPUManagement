<?php

namespace App\Policies;

use App\Models\TaskComment;
use App\Models\User;

class TaskCommentPolicy
{
    public function before(User $user, string $ability): bool|null
    {
        if ($user->role === 'administrator') {
            return true;
        }

        return null;
    }

    public function delete(User $user, TaskComment $comment): bool
    {
        return $comment->user_id === $user->id;
    }
}
