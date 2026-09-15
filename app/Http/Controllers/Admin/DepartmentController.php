<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use App\Models\Department;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function index(): Response
    {
        $departments = Department::withCount('users')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/departments/index', [
            'departments' => $departments,
        ]);
    }

    public function store(StoreDepartmentRequest $request): RedirectResponse
    {
        Department::create($request->validated());

        return back()->with('success', 'Department berhasil dibuat.');
    }

    public function update(
        UpdateDepartmentRequest $request,
        Department $department
    ): RedirectResponse {
        $department->update($request->validated());

        return back()->with('success', 'Department berhasil diperbarui.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        if ($department->users()->exists()) {
            return back()->withErrors([
                'department' => 'Department masih memiliki user dan tidak dapat dihapus.',
            ]);
        }

        $department->delete();

        return back()->with('success', 'Department berhasil dihapus.');
    }
}
