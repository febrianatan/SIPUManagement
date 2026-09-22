<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'created_by',
        'title',
        'description',
        'status',
        'priority',
        'due_at',
        'requires_review',
    ];

    protected function casts(): array
    {
        return [
            'due_at' => 'datetime',
            'requires_review' => 'boolean',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('acknowledged_at')
            ->withTimestamps();
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(TaskActivity::class)
            ->latest();
    }

    /*
    |--------------------------------------------------------------------------
    | Activity Helper
    |--------------------------------------------------------------------------
    */

    public function recordActivity(
        string $action,
        ?User $actor = null,
        array $metadata = []
    ): TaskActivity {
        return $this->activities()->create([
            'actor_id'   => $actor?->id,
            'actor_name' => $actor?->name,
            'action'     => $action,

            'metadata'   => empty($metadata)
                ? null
                : $metadata,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Administrator melihat semua task.
     *
     * Staff hanya melihat:
     * - task yang dibuat sendiri
     * - task yang di-assign kepadanya
     */
    public function scopeVisibleTo(
        Builder $query,
        User $user
    ): Builder {
        if ($user->role === 'administrator') {
            return $query;
        }

        return $query->where(function ($query) use ($user) {
            $query
                ->where('created_by', $user->id)
                ->orWhereHas(
                    'assignees',
                    function ($query) use ($user) {
                        $query->where(
                            'users.id',
                            $user->id
                        );
                    }
                );
        });
    }

    /**
     * Search pada title dan description.
     *
     * LOWER() dipakai agar pencarian tetap
     * case-insensitive di PostgreSQL dan SQLite.
     */
    public function scopeSearch(
        Builder $query,
        ?string $search
    ): Builder {
        $search = trim($search ?? '');

        if ($search === '') {
            return $query;
        }

        $keyword = '%' . strtolower($search) . '%';

        return $query->where(function ($query) use ($keyword) {
            $query
                ->whereRaw(
                    'LOWER(title) LIKE ?',
                    [$keyword]
                )
                ->orWhereRaw(
                    'LOWER(description) LIKE ?',
                    [$keyword]
                );
        });
    }

    public function scopeStatus(
        Builder $query,
        ?string $status
    ): Builder {
        if (! $status) {
            return $query;
        }

        return $query->where(
            'status',
            $status
        );
    }

    public function scopePriority(
        Builder $query,
        ?string $priority
    ): Builder {
        if (! $priority) {
            return $query;
        }

        return $query->where(
            'priority',
            $priority
        );
    }

    public function scopeProject(
        Builder $query,
        mixed $projectId
    ): Builder {
        if (! $projectId) {
            return $query;
        }

        return $query->where(
            'project_id',
            $projectId
        );
    }

    public function scopeAssignee(
        Builder $query,
        mixed $assigneeId
    ): Builder {
        if (! $assigneeId) {
            return $query;
        }

        return $query->whereHas(
            'assignees',
            function ($query) use ($assigneeId) {
                $query->where(
                    'users.id',
                    $assigneeId
                );
            }
        );
    }

    public function scopeCreatedBy(
        Builder $query,
        mixed $creatorId
    ): Builder {
        if (! $creatorId) {
            return $query;
        }

        return $query->where(
            'created_by',
            $creatorId
        );
    }

    public function scopeDue(
        Builder $query,
        ?string $due
    ): Builder {
        if (! $due) {
            return $query;
        }

        return match ($due) {
            'overdue'  => $query
                ->whereNotNull('due_at')
                ->where('due_at', '<', now())
                ->where('status', '!=', 'done'),

            'today'    => $query
                ->whereBetween(
                    'due_at',
                    [
                        now()->startOfDay(),
                        now()->endOfDay(),
                    ]
                ),

            'upcoming' => $query
                ->whereNotNull('due_at')
                ->where('due_at', '>', now()),

            'no_due'   => $query
                ->whereNull('due_at'),

            default    => $query,
        };
    }

    public function scopeAcknowledgement(
        Builder $query,
        User $user,
        ?string $acknowledgement
    ): Builder {
        if (! $acknowledgement) {
            return $query;
        }

        return $query->whereHas(
            'assignees',
            function ($query) use (
                $user,
                $acknowledgement
            ) {
                /*
             * Acknowledgement yang kita cari
             * hanya milik user login.
             */
                $query->where(
                    'users.id',
                    $user->id
                );

                if ($acknowledgement === 'pending') {
                    $query->whereNull(
                        'task_user.acknowledged_at'
                    );
                }

                if ($acknowledgement === 'acknowledged') {
                    $query->whereNotNull(
                        'task_user.acknowledged_at'
                    );
                }
            }
        );
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(
            TaskAttachment::class
        );
    }
}
