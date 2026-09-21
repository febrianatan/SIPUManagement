<?php
namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        $task = $this->route('task');

        if (! $task instanceof Task) {
            return false;
        }

        return $this->user()?->can('update', $task) ?? false;
    }

    public function rules(): array
    {
        return [
            'project_id'      => [
                'nullable',
                'exists:projects,id',
            ],

            'title'           => [
                'required',
                'string',
                'max:255',
            ],

            'description'     => [
                'nullable',
                'string',
            ],

            'priority'        => [
                'required',
                Rule::in([
                    'low',
                    'medium',
                    'high',
                    'urgent',
                ]),
            ],

            'due_at'          => [
                'nullable',
                'date',
            ],

            'assignee_ids'    => [
                'required',
                'array',
                'min:1',
            ],

            'assignee_ids.*'  => [
                'integer',
                'distinct',
                'exists:users,id',
            ],

            'requires_review' => [
                'sometimes',
                'boolean',
            ],
        ];
    }
}
