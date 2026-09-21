<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TaskIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'search'          => [
                'nullable',
                'string',
                'max:255',
            ],

            'status'          => [
                'nullable',
                Rule::in([
                    'todo',
                    'in_progress',
                    'review',
                    'done',
                ]),
            ],

            'priority'        => [
                'nullable',
                Rule::in([
                    'low',
                    'medium',
                    'high',
                    'urgent',
                ]),
            ],

            'project_id'      => [
                'nullable',
                'integer',
                'exists:projects,id',
            ],

            'assignee_id'     => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'acknowledgement' => [
                'nullable',
                Rule::in([
                    'pending',
                    'acknowledged',
                ]),
            ],

            'created_by'      => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'due'             => [
                'nullable',
                Rule::in([
                    'overdue',
                    'today',
                    'upcoming',
                    'no_due',
                ]),
            ],

            'per_page'        => [
                'nullable',
                'integer',
                Rule::in([
                    10,
                    20,
                    50,
                ]),
            ],
        ];
    }
}
