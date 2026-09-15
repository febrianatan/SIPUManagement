<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::with('department')
            ->orderBy('name')
            ->get();

        $departments = Department::orderBy('name')->get();

        return Inertia::render('admin/users/index', [
            'users'       => $users,
            'departments' => $departments,
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        User::create([
            'name'          => $validated['name'],
            'email'         => $validated['email'],
            'password'      => Hash::make($validated['password']),
            'department_id' => $validated['department_id'] ?? null,
            'role'          => $validated['role'],
        ]);

        return back()->with('success', 'User berhasil dibuat.');
    }

    public function update(
        UpdateUserRequest $request,
        User $user
    ): RedirectResponse {
        $validated = $request->validated();

        $user->name          = $validated['name'];
        $user->email         = $validated['email'];
        $user->department_id = $validated['department_id'] ?? null;
        $user->role          = $validated['role'];

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return back()->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if (auth()->id() === $user->id) {
            return back()->withErrors([
                'user' => 'Administrator tidak dapat menghapus akun yang sedang digunakan.',
            ]);
        }

        $user->delete();

        return back()->with('success', 'User berhasil dihapus.');
    }
}
