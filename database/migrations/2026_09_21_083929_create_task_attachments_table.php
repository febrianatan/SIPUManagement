<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_attachments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('task_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('uploaded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('original_name');

            /*
             * Lokasi file private di storage.
             */
            $table->string('path');

            $table->string('mime_type')
                ->nullable();

            /*
             * Ukuran file dalam byte.
             */
            $table->unsignedBigInteger('size')
                ->default(0);

            $table->timestamps();

            $table->index([
                'task_id',
                'created_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'task_attachments'
        );
    }
};
