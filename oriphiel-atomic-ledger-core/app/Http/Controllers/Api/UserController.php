<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->when(! $request->user()?->isAdmin(), fn ($q) => $q->where('role', 'user'))
            ->orderBy('id')
            ->get(['id', 'name', 'email', 'role']);

        return response()->json([
            'data' => $users->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->isAdmin() ? null : $user->email,
                'role' => $user->role->value,
                'balance' => $user->balance,
            ]),
        ]);
    }
}
