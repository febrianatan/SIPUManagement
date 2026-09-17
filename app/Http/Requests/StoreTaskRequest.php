<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => [
                'nullable',
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

            'status' => [
                'required',
                Rule::in([
                    'todo',
                    'in_progress',
                    'review',
                    'done',
                ]),
            ],

            'priority' => [
                'required',
                Rule::in([
                    'low',
                    'medium',
                    'high',
                    'urgent',
                ]),
            ],

            'due_at' => [
                'nullable',
                'date',
            ],

            'department_ids' => [
                'required',
                'array',
                'min:1',
            ],

            'department_ids.*' => [
                'integer',
                'distinct',
                'exists:departments,id',
            ],

            'assignee_ids' => [
                'nullable',
                'array',
            ],

            'assignee_ids.*' => [
                'integer',
                'distinct',
                'exists:users,id',
            ],
        ];
    }
}
