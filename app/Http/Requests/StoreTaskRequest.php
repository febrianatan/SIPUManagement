<?php

namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Task::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'project_id' => [
                'nullable',
                'integer',
                'exists:projects,id',
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'priority' => [
                'required',
                'in:low,medium,high,urgent',
            ],

            'due_at' => [
                'nullable',
                'date',
            ],

            'requires_review' => [
                'sometimes',
                'boolean',
            ],

            'assignee_ids' => [
                'required',
                'array',
                'min:1',
            ],

            'assignee_ids.*' => [
                'integer',
                'distinct',
                'exists:users,id',
            ],
        ];
    }
}
