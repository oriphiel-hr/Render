<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserInvitation;
use App\Notifications\UserInvitedNotification;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receives_verification_email(): void
    {
        Notification::fake();

        $this->postJson('/api/auth/register', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated()
            ->assertJsonPath('user.email', 'new@example.com')
            ->assertJsonPath('user.email_verified', false);

        $user = User::query()->where('email', 'new@example.com')->first();
        $this->assertNotNull($user);
        $this->assertNull($user->email_verified_at);

        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function test_unverified_user_cannot_login(): void
    {
        $user = User::factory()->unverified()->create([
            'email' => 'pending@example.com',
            'password' => 'password',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'pending@example.com',
            'password' => 'password',
        ])->assertForbidden()
            ->assertJsonPath('code', 'EMAIL_NOT_VERIFIED');
    }

    public function test_verified_user_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'verified@example.com',
            'password' => 'password',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'verified@example.com',
            'password' => 'password',
        ])->assertOk()
            ->assertJsonStructure(['token', 'user']);
    }

    public function test_email_can_be_verified_via_signed_link(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addHour(),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())],
        );

        $this->get($url)->assertOk();

        $user->refresh();
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_unverified_user_cannot_access_protected_api(): void
    {
        $user = User::factory()->unverified()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/wallets')->assertForbidden()
            ->assertJsonPath('code', 'EMAIL_NOT_VERIFIED');
    }

    public function test_admin_can_invite_user(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $this->postJson('/api/admin/invites', [
            'email' => 'invited@example.com',
            'name' => 'Invited User',
        ])->assertCreated()
            ->assertJsonPath('data.email', 'invited@example.com');

        $invitation = UserInvitation::query()->where('email', 'invited@example.com')->first();
        $this->assertNotNull($invitation);

        Notification::assertSentOnDemand(UserInvitedNotification::class);
    }

    public function test_user_can_accept_invitation_and_login(): void
    {
        $admin = User::factory()->admin()->create();
        $invitation = UserInvitation::query()->create([
            'email' => 'invite-accept@example.com',
            'name' => 'Invite Accept',
            'token' => str_repeat('a', 64),
            'invited_by' => $admin->id,
            'expires_at' => now()->addDay(),
        ]);

        $this->postJson('/api/auth/accept-invite', [
            'token' => $invitation->token,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated()
            ->assertJsonStructure(['token', 'user']);

        $user = User::query()->where('email', 'invite-accept@example.com')->first();
        $this->assertNotNull($user->email_verified_at);
        $invitation->refresh();
        $this->assertNotNull($invitation->accepted_at);
    }

    public function test_resend_verification_sends_notification(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create(['email' => 'resend@example.com']);

        $this->postJson('/api/auth/verification/resend', [
            'email' => 'resend@example.com',
        ])->assertOk();

        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }
}
