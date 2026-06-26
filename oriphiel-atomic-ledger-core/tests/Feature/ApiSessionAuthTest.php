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
}
