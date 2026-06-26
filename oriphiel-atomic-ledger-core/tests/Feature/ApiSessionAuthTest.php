<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiSessionAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_logged_in_session_can_open_wallets_in_browser(): void
    {
        $user = User::factory()->create([
            'email' => 'session@demo.local',
            'password' => 'password',
        ]);

        $origin = config('app.url');

        $this->withHeader('Origin', $origin)
            ->postJson('/api/auth/login', [
                'email' => 'session@demo.local',
                'password' => 'password',
            ])
            ->assertOk()
            ->assertJsonStructure(['token', 'user']);

        $this->withHeader('Origin', $origin)
            ->getJson('/api/wallets')
            ->assertOk()
            ->assertJsonStructure(['data', '_source']);
    }
}
