<?php

namespace App\Services\Auth;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\UserInvitation;
use App\Notifications\UserInvitedNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class InvitationService
{
    public function invite(string $email, string $name, User $inviter): UserInvitation
    {
        $email = strtolower(trim($email));

        if (User::query()->where('email', $email)->exists()) {
            throw ValidationException::withMessages([
                'email' => ['A user with this email already exists.'],
            ]);
        }

        $pending = UserInvitation::query()
            ->where('email', $email)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->first();

        if ($pending !== null) {
            throw ValidationException::withMessages([
                'email' => ['An active invitation already exists for this email.'],
            ]);
        }

        $invitation = UserInvitation::query()->create([
            'email' => $email,
            'name' => $name,
            'token' => Str::random(64),
            'invited_by' => $inviter->id,
            'expires_at' => now()->addDays(7),
        ]);

        Notification::route('mail', $email)
            ->notify(new UserInvitedNotification($invitation));

        return $invitation;
    }

    public function accept(string $token, string $password, ?string $name = null): User
    {
        $invitation = UserInvitation::query()->where('token', $token)->first();

        if ($invitation === null) {
            throw ValidationException::withMessages([
                'token' => ['Invalid invitation token.'],
            ]);
        }

        if ($invitation->isAccepted()) {
            throw ValidationException::withMessages([
                'token' => ['This invitation has already been accepted.'],
            ]);
        }

        if ($invitation->isExpired()) {
            throw ValidationException::withMessages([
                'token' => ['This invitation has expired.'],
            ]);
        }

        if (User::query()->where('email', $invitation->email)->exists()) {
            throw ValidationException::withMessages([
                'email' => ['A user with this email already exists.'],
            ]);
        }

        $user = User::query()->create([
            'name' => $name ?? $invitation->name,
            'email' => $invitation->email,
            'password' => $password,
            'role' => UserRole::User,
            'email_verified_at' => now(),
        ]);

        $invitation->update(['accepted_at' => now()]);

        return $user;
    }
}
