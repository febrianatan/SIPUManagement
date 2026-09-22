<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'status',
        'created_by',
        'start_date',
        'due_date',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'due_date'   => 'date',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function departments(): BelongsToMany
    {
        return $this->belongsToMany(Department::class)
            ->withTimestamps();
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function scopeVisibleTo(
        Builder $query,
        User $user
    ): Builder {
        if ($user->role === 'administrator') {
            return $query;
        }

        return $query->where(function ($query) use ($user) {
            /*
         * Project yang dibuat sendiri.
         */
            $query->where(
                'created_by',
                $user->id
            );

            /*
         * Project yang melibatkan department user.
         */
            if ($user->department_id !== null) {
                $query->orWhereHas(
                    'departments',
                    function ($query) use ($user) {
                        $query->where(
                            'departments.id',
                            $user->department_id
                        );
                    }
                );
            }

            /*
         * Project yang memiliki minimal satu task
         * yang di-assign ke user.
         */
            $query->orWhereHas(
                'tasks.assignees',
                function ($query) use ($user) {
                    $query->where(
                        'users.id',
                        $user->id
                    );
                }
            );
        });
    }
}
