<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Auth\InvitationService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Cookie;

class AuthController extends Controller
{
    public function __construct(
        private readonly InvitationService $invitationService,
    ) {}

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => strtolower($data['email']),
            'password' => $data['password'],
            'role' => UserRole::User,
        ]);

        event(new Registered($user));

        return response()->json([
            'message' => 'Registration successful. Check your email for the verification link.',
            'user' => $this->userPayload($user),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', strtolower($credentials['email']))->first();

        if ($user === null || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        if (! $user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Please verify your email before signing in. Check your inbox for the verification link.',
                'code' => 'EMAIL_NOT_VERIFIED',
                'email' => $user->email,
            ], 403);
        }

        $token = $user->createToken('ledger-demo')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->userPayload($user),
        ])->cookie($this->apiTokenCookie($token));
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::query()->where('email', strtolower($data['email']))->first();

        if ($user === null) {
            return response()->json([
                'message' => 'If that email is registered, a verification link has been sent.',
            ]);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email is already verified. You can sign in.',
            ]);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification link sent.',
        ]);
    }

    public function acceptInvite(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'size:64'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'name' => ['nullable', 'string', 'max:120'],
        ]);

        $user = $this->invitationService->accept(
            token: $data['token'],
            password: $data['password'],
            name: $data['name'] ?? null,
        );

        $token = $user->createToken('ledger-demo')->plainTextToken;

        return response()->json([
            'message' => 'Invitation accepted. Your account is ready.',
            'token' => $token,
            'user' => $this->userPayload($user),
        ], 201)->cookie($this->apiTokenCookie($token));
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->userPayload($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out.'])
            ->withoutCookie('ledger_api_token');
    }

    private function apiTokenCookie(string $token): Cookie
    {
        return cookie(
            name: 'ledger_api_token',
            value: $token,
            minutes: 60 * 24 * 7,
            path: '/',
            secure: (bool) config('session.secure'),
            httpOnly: true,
            sameSite: 'lax',
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role->value,
            'is_admin' => $user->isAdmin(),
            'email_verified' => $user->hasVerifiedEmail(),
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
        ];
    }
}
