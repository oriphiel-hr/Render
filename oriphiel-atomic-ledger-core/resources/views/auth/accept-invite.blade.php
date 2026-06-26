<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Accept invitation — {{ config('app.name') }}</title>
    <style>
        body { font-family: system-ui, sans-serif; background:#070b14; color:#e8edf7; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; }
        .box { width:100%; max-width:420px; padding:2rem; background:#0f1624; border:1px solid #1e2a42; border-radius:14px; }
        label { display:block; font-size:.85rem; color:#8b9bb8; margin-bottom:.35rem; }
        input { width:100%; padding:.65rem .8rem; margin-bottom:.85rem; border-radius:8px; border:1px solid #1e2a42; background:#151e30; color:#e8edf7; }
        button { width:100%; padding:.75rem; border:none; border-radius:8px; background:#3b82f6; color:#fff; font-weight:600; cursor:pointer; }
        .alert { margin-top:1rem; padding:.75rem; border-radius:8px; display:none; }
        .alert.show { display:block; }
        .alert.ok { background:rgba(16,185,129,.15); color:#6ee7b7; }
        .alert.err { background:rgba(239,68,68,.15); color:#fca5a5; }
        .err-text { color:#ef4444; }
    </style>
</head>
<body>
<div class="box">
    <h1 style="margin-bottom:.5rem">Accept invitation</h1>
    @if(!$valid)
        <p class="err-text">This invitation is invalid or has expired.</p>
        <p style="margin-top:1rem"><a href="/" style="color:#3b82f6">← Dashboard</a></p>
    @else
        <p style="color:#8b9bb8;margin-bottom:1rem">Set a password for <strong>{{ $invitation->email }}</strong></p>
        <form id="invite-form">
            <input type="hidden" id="token" value="{{ $token }}">
            <label>Name</label>
            <input type="text" id="name" value="{{ $invitation->name }}" required>
            <label>Password</label>
            <input type="password" id="password" required minlength="8">
            <label>Confirm password</label>
            <input type="password" id="password_confirmation" required minlength="8">
            <button type="submit">Create account</button>
        </form>
        <div class="alert" id="invite-alert"></div>
    @endif
</div>
@if($valid)
<script>
document.getElementById('invite-form').addEventListener('submit', async e => {
    e.preventDefault();
    const alert = document.getElementById('invite-alert');
    const res = await fetch('/api/auth/accept-invite', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token: document.getElementById('token').value,
            name: document.getElementById('name').value,
            password: document.getElementById('password').value,
            password_confirmation: document.getElementById('password_confirmation').value,
        }),
    });
    const data = await res.json();
    if (res.ok) {
        localStorage.setItem('ledger_token', data.token);
        alert.className = 'alert show ok';
        alert.textContent = 'Account created! Redirecting…';
        setTimeout(() => location.href = '/', 1200);
    } else {
        alert.className = 'alert show err';
        alert.textContent = data.message || JSON.stringify(data.errors || data);
    }
});
</script>
@endif
</body>
</html>
