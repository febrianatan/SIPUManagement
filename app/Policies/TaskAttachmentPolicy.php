<?php

namespace App\Policies;

use App\Models\TaskAttachment;
use App\Models\User;

class TaskAttachmentPolicy
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

    public function delete(
        User $user,
        TaskAttachment $attachment
    ): bool {
        /*
         * Uploader boleh menghapus file sendiri.
         */
        if (
            $attachment->uploaded_by
            === $user->id
        ) {
            return true;
        }

        /*
         * Creator Task boleh menghapus attachment
         * pada Task miliknya.
         */
        return $attachment
            ->task
            ->created_by === $user->id;
    }
}
