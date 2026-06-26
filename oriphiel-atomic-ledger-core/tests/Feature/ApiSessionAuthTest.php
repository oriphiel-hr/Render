<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiSessionAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_bearer_token_can_access_wallets_after_login(): void
    {
        User::factory()->create([
            'email' => 'session@demo.local',
            'password' => 'password',
        ]);

        $origin = config('app.url');

        $login = $this->withHeader('Origin', $origin)
            ->postJson('/api/auth/login', [
                'email' => 'session@demo.local',
                'password' => 'password',
            ])
            ->assertOk()
            ->assertJsonStructure(['token', 'user']);

        $token = $login->json('token');

        $this->withHeader('Origin', $origin)
            ->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/wallets')
            ->assertOk()
            ->assertJsonStructure(['data', '_source']);
    }

    public function test_api_token_cookie_allows_browser_wallets_request(): void
    {
        User::factory()->create([
            'email' => 'browser@demo.local',
            'password' => 'password',
        ]);

        $login = $this->postJson('/api/auth/login', [
            'email' => 'browser@demo.local',
            'password' => 'password',
        ])->assertOk();

        $token = $login->json('token');

        $this->withCredentials()
            ->withUnencryptedCookie('ledger_api_token', $token)
            ->getJson('/api/wallets')
            ->assertOk()
            ->assertJsonStructure(['data', '_source']);
    }
}
