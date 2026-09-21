<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Project::query()
            ->with([
                'creator:id,name,email',
                'departments:id,name,code',
            ])
            ->orderByDesc('created_at');

        if ($user->role !== 'administrator') {
            $query->where(function ($query) use ($user) {
                $query->where('created_by', $user->id);

                if ($user->department_id !== null) {
                    $query->orWhereHas('departments', function ($query) use ($user) {
                        $query->where(
                            'departments.id',
                            $user->department_id
                        );
                    });
                }
            });
        }

        return Inertia::render('projects/index', [
            'projects' => $query->get(),
            'departments' => \App\Models\Department::all(),
        ]);
    }

    public function show(
        Request $request,
        Project $project
    ): Response {
        Gate::authorize('view', $project);

        $project->load([
            'creator:id,name,email',
            'departments:id,name,code',
        ]);

        return Inertia::render('projects/show', [
            'project' => $project,
        ]);
    }

    public function store(
        StoreProjectRequest $request
    ): RedirectResponse {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            $user = $request->user();

            $project = Project::create([
                'name'        => $validated['name'],
                'description' => $validated['description'] ?? null,
                'status'      => $validated['status'],
                'created_by'  => $user->id,
                'start_date'  => $validated['start_date'] ?? null,
                'due_date'    => $validated['due_date'] ?? null,
            ]);

            $departmentIds = $validated['department_ids'];

            if ($user->department_id !== null) {
                $departmentIds[] = $user->department_id;
            }

            $project->departments()->sync(
                array_unique($departmentIds)
            );
        });

        return back()->with(
            'success',
            'Project berhasil dibuat.'
        );
    }

    public function update(
        UpdateProjectRequest $request,
        Project $project
    ): RedirectResponse {
        Gate::authorize('update', $project);

        $validated = $request->validated();

        DB::transaction(function () use (
            $validated,
            $project,
            $request
        ) {
            $project->update([
                'name'        => $validated['name'],
                'description' => $validated['description'] ?? null,
                'status'      => $validated['status'],
                'start_date'  => $validated['start_date'] ?? null,
                'due_date'    => $validated['due_date'] ?? null,
            ]);

            $departmentIds = $validated['department_ids'];

            if ($request->user()->department_id !== null) {
                $departmentIds[] = $request->user()->department_id;
            }

            $project->departments()->sync(
                array_unique($departmentIds)
            );
        });

        return back()->with(
            'success',
            'Project berhasil diperbarui.'
        );
    }

    public function destroy(
        Project $project
    ): RedirectResponse {
        Gate::authorize('delete', $project);

        $project->delete();

        return back()->with(
            'success',
            'Project berhasil dihapus.'
        );
    }
}
