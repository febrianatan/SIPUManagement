<?php

namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;

class StoreTaskAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $task = $this->route('task');

        if (!$task instanceof Task) {
            return false;
        }

        /*
         * Siapa pun yang boleh melihat Task Detail
         * boleh menambahkan attachment.
         *
         * Saat ini berarti:
         * - Administrator
         * - Creator
         * - Assignee
         */
        return $this->user()?->can(
            'view',
            $task
        ) ?? false;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',

                /*
                 * 20 MB.
                 *
                 * Laravel menghitung max file
                 * dalam KB.
                 */
                'max:20480',

                'mimes:jpg,jpeg,png,webp,pdf,doc,docx,xls,xlsx,csv,txt,ppt,pptx',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' =>
                'File attachment wajib dipilih.',

            'file.max' =>
                'Ukuran attachment maksimal 20 MB.',

            'file.mimes' =>
                'Format file tidak didukung.',
        ];
    }
}
