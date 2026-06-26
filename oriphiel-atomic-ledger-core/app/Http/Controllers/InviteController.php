<?php

namespace App\Http\Controllers;

use App\Models\UserInvitation;
use Illuminate\View\View;

class InviteController extends Controller
{
    public function show(string $token): View
    {
        $invitation = UserInvitation::query()->where('token', $token)->first();

        return view('auth.accept-invite', [
            'token' => $token,
            'invitation' => $invitation,
            'valid' => $invitation !== null && $invitation->isPending(),
        ]);
    }
}
