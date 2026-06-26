<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\View\View;

class EmailVerificationController extends Controller
{
    public function notice(): View
    {
        return view('auth.verify-notice');
    }

    public function verify(Request $request, int $id, string $hash): View
    {
        $user = User::query()->findOrFail($id);

        if (! hash_equals($hash, sha1((string) $user->getEmailForVerification()))) {
            return view('auth.verify-result', [
                'success' => false,
                'message' => 'Invalid verification link.',
            ]);
        }

        if ($user->hasVerifiedEmail()) {
            return view('auth.verify-result', [
                'success' => true,
                'message' => 'Email already verified. You can sign in.',
            ]);
        }

        $user->markEmailAsVerified();

        return view('auth.verify-result', [
            'success' => true,
            'message' => 'Email verified successfully. You can now sign in.',
        ]);
    }
}
