<?php

namespace App\Services;

use App\Models\TaskActivity;

class TaskActivityFormatter
{
    public function format(
        TaskActivity $activity
    ): array {
        $actor =
            $activity->actor_name
            ?? $activity->actor?->name
            ?? 'System';

        return [
            'id' =>
                $activity->id,

            'action' =>
                $activity->action,

            'actor' => [
                'id' =>
                    $activity->actor_id,

                'name' =>
                    $actor,
            ],

            'message' =>
                $this->message(
                    $activity,
                    $actor
                ),

            'metadata' =>
                $activity->metadata,

            'created_at' =>
                $activity->created_at,
        ];
    }

    private function message(
        TaskActivity $activity,
        string $actor
    ): string {
        $metadata =
            $activity->metadata ?? [];

        return match ($activity->action) {
            'task_created' =>
                "{$actor} created this task.",

            'task_acknowledged' =>
                "{$actor} acknowledged this task.",

            'status_changed' =>
                $this->statusChangedMessage(
                    $actor,
                    $metadata
                ),

            'comment_added' =>
                "{$actor} added a comment.",

            'task_updated' =>
                $this->taskUpdatedMessage(
                    $actor,
                    $metadata
                ),

            'assignees_changed' =>
                $this->assigneesChangedMessage(
                    $actor,
                    $metadata
                ),

            'attachment_added' =>
                $this->attachmentAddedMessage(
                    $actor,
                    $metadata
                ),

            'attachment_deleted' =>
                $this->attachmentDeletedMessage(
                    $actor,
                    $metadata
                ),

            default =>
                "{$actor} updated this task.",
        };
    }

    private function statusChangedMessage(
        string $actor,
        array $metadata
    ): string {
        $from = $this->statusLabel(
            $metadata['from'] ?? null
        );

        $to = $this->statusLabel(
            $metadata['to'] ?? null
        );

        return "{$actor} changed status from {$from} to {$to}.";
    }

    private function taskUpdatedMessage(
        string $actor,
        array $metadata
    ): string {
        $changes =
            $metadata['changes'] ?? [];

        if (empty($changes)) {
            return "{$actor} updated task details.";
        }

        $fields = collect(
            array_keys($changes)
        )
            ->map(
                fn (string $field) =>
                    $this->fieldLabel($field)
            )
            ->implode(', ');

        return "{$actor} updated {$fields}.";
    }

    private function assigneesChangedMessage(
        string $actor,
        array $metadata
    ): string {
        $added =
            collect(
                $metadata['added'] ?? []
            )
                ->pluck('name')
                ->filter()
                ->values();

        $removed =
            collect(
                $metadata['removed'] ?? []
            )
                ->pluck('name')
                ->filter()
                ->values();

        $parts = [];

        if ($added->isNotEmpty()) {
            $parts[] =
                'added '
                . $added->implode(', ');
        }

        if ($removed->isNotEmpty()) {
            $parts[] =
                'removed '
                . $removed->implode(', ');
        }

        if (empty($parts)) {
            return "{$actor} changed task assignees.";
        }

        return "{$actor} "
            . implode(' and ', $parts)
            . '.';
    }

    private function attachmentAddedMessage(
        string $actor,
        array $metadata
    ): string {
        $name =
            $metadata['original_name']
            ?? 'an attachment';

        return "{$actor} added attachment {$name}.";
    }

    private function attachmentDeletedMessage(
        string $actor,
        array $metadata
    ): string {
        $name =
            $metadata['original_name']
            ?? 'an attachment';

        return "{$actor} deleted attachment {$name}.";
    }

    private function statusLabel(
        ?string $status
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

            null =>
                '-',

            default =>
                $status,
        };
    }

    private function fieldLabel(
        string $field
    ): string {
        return match ($field) {
            'project_id' =>
                'project',

            'title' =>
                'title',

            'description' =>
                'description',

            'priority' =>
                'priority',

            'due_at' =>
                'due date',

            'requires_review' =>
                'review requirement',

            default =>
                str_replace(
                    '_',
                    ' ',
                    $field
                ),
        };
    }
}
