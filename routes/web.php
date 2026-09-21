<?php

use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskAcknowledgementController;
use App\Http\Controllers\TaskAttachmentController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get(
        '/dashboard',
        [DashboardController::class, 'index']
    )
        ->middleware(['auth', 'verified'])
        ->name('dashboard');

    // PROJECT MANAGEMENT
    Route::get('/projects', [ProjectController::class, 'index'])
        ->name('projects.index');

    Route::get('/projects/{project}', [ProjectController::class, 'show'])
        ->name('projects.show');

    Route::post('/projects', [ProjectController::class, 'store'])
        ->name('projects.store');

    Route::patch('/projects/{project}', [ProjectController::class, 'update'])
        ->name('projects.update');

    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])
        ->name('projects.destroy');

    // TASK MANAGEMENT
    Route::get(
        '/tasks/create',
        [TaskController::class, 'create']
    )->name('tasks.create');

    Route::get(
        '/tasks/{task}/edit',
        [TaskController::class, 'edit']
    )->name('tasks.edit');

    Route::get('/tasks', [TaskController::class, 'index'])
        ->name('tasks.index');

    Route::get('/tasks/{task}', [TaskController::class, 'show'])
        ->name('tasks.show');

    Route::post('/tasks', [TaskController::class, 'store'])
        ->name('tasks.store');

    Route::patch('/tasks/{task}', [TaskController::class, 'update'])
        ->name('tasks.update');

    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])
        ->name('tasks.destroy');

    Route::post(
        '/tasks/{task}/attachments',
        [
            TaskAttachmentController::class,
            'store',
        ]
    )->name(
        'tasks.attachments.store'
    );

    Route::get(
        '/tasks/{task}/attachments/{attachment}/download',
        [
            TaskAttachmentController::class,
            'download',
        ]
    )->name(
        'tasks.attachments.download'
    );

    Route::delete(
        '/tasks/{task}/attachments/{attachment}',
        [
            TaskAttachmentController::class,
            'destroy',
        ]
    )->name(
        'tasks.attachments.destroy'
    );

    // TASK COMMENT MANAGEMENT
    Route::post(
        '/tasks/{task}/comments',
        [TaskCommentController::class, 'store']
    )->name('tasks.comments.store');

    Route::delete(
        '/tasks/{task}/comments/{comment}',
        [TaskCommentController::class, 'destroy']
    )->name('tasks.comments.destroy');

    Route::patch(
        '/tasks/{task}/status',
        [TaskController::class, 'updateStatus']
    )->name('tasks.status.update');

    Route::patch(
        '/tasks/{task}/acknowledge',
        [TaskAcknowledgementController::class, 'acknowledge']
    )->name('tasks.acknowledge');
});

// Untuk test ke admin
Route::middleware(['auth', 'admin'])->get('/admin-test', function () {
    return 'Admin access berhasil!';
});

Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        // USER MANAGEMENT
        Route::get('/users', [UserController::class, 'index'])
            ->name('users.index');

        Route::post('/users', [UserController::class, 'store'])
            ->name('users.store');

        Route::patch('/users/{user}', [UserController::class, 'update'])
            ->name('users.update');

        Route::delete('/users/{user}', [UserController::class, 'destroy'])
            ->name('users.destroy');

        // DEPARTMENT MANAGEMENT
        Route::get('/departments', [DepartmentController::class, 'index'])
            ->name('departments.index');

        Route::post('/departments', [DepartmentController::class, 'store'])
            ->name('departments.store');

        Route::patch('/departments/{department}', [DepartmentController::class, 'update'])
            ->name('departments.update');

        Route::delete('/departments/{department}', [DepartmentController::class, 'destroy'])
            ->name('departments.destroy');

        // PROJECT MANAGEMENT
        Route::get('/projects', [ProjectController::class, 'index'])
            ->name('projects.index');

        Route::get('/projects/{project}', [ProjectController::class, 'show'])
            ->name('projects.show');

        Route::post('/projects', [ProjectController::class, 'store'])
            ->name('projects.store');

        Route::patch('/projects/{project}', [ProjectController::class, 'update'])
            ->name('projects.update');

        Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])
            ->name('projects.destroy');
    });

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
