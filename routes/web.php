<?php

use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

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
    });

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
