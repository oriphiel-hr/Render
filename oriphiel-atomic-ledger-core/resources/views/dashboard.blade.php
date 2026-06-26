<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $appName }} — Atomic Ledger</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #070b14;
            --surface: #0f1624;
            --surface-2: #151e30;
            --border: #1e2a42;
            --text: #e8edf7;
            --muted: #8b9bb8;
            --accent: #3b82f6;
            --accent-glow: rgba(59, 130, 246, 0.25);
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --coinbase: #0052ff;
            --radius: 14px;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'DM Sans', system-ui, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            background-image:
                radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.15), transparent),
                radial-gradient(ellipse 60% 40% at 100% 0%, rgba(0, 82, 255, 0.08), transparent);
        }
        .wrap { max-width: 1200px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
        header {
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
            gap: 1rem; margin-bottom: 2rem;
        }
        .brand h1 { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; }
        .brand p { color: var(--muted); font-size: 0.9rem; margin-top: 0.25rem; }
        .badges { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .badge {
            font-size: 0.75rem; font-weight: 600; padding: 0.35rem 0.75rem;
            border-radius: 999px; border: 1px solid var(--border); background: var(--surface);
        }
        .badge.live { border-color: var(--success); color: var(--success); }
        .badge.production { border-color: var(--warning); color: var(--warning); background: rgba(245,158,11,0.1); }
        .cutover-box {
            margin-top: 1rem; padding: 0.75rem; border-radius: 8px; font-size: 0.78rem; line-height: 1.5;
            background: rgba(245,158,11,0.08); border: 1px dashed rgba(245,158,11,0.4); color: #fcd34d;
        }
        .cutover-box code { font-family: 'JetBrains Mono', monospace; background: var(--surface-2); padding: 0.1rem 0.35rem; border-radius: 4px; }
        .grid { display: grid; gap: 1.25rem; }
        @media (min-width: 900px) {
            .grid-main { grid-template-columns: 1fr 380px; }
            .grid-2 { grid-template-columns: 1fr 1fr; }
        }
        .card {
            background: var(--surface); border: 1px solid var(--border);
            border-radius: var(--radius); padding: 1.25rem;
        }
        .card h2 {
            font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em;
            color: var(--muted); margin-bottom: 1rem; font-weight: 600;
        }
        .users-grid { display: grid; gap: 0.75rem; }
        .user-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 0.85rem 1rem; background: var(--surface-2); border-radius: 10px;
            border: 1px solid var(--border);
        }
        .user-row .name { font-weight: 600; }
        .user-row .id { font-size: 0.75rem; color: var(--muted); font-family: 'JetBrains Mono', monospace; }
        .balance { font-family: 'JetBrains Mono', monospace; font-weight: 500; color: var(--success); }
        label { display: block; font-size: 0.8rem; color: var(--muted); margin-bottom: 0.35rem; }
        select, input {
            width: 100%; padding: 0.65rem 0.85rem; border-radius: 8px;
            border: 1px solid var(--border); background: var(--surface-2); color: var(--text);
            font-family: inherit; font-size: 0.95rem; margin-bottom: 0.85rem;
        }
        select:focus, input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
        .btn {
            width: 100%; padding: 0.75rem 1rem; border: none; border-radius: 8px;
            font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: transform 0.15s, opacity 0.15s;
        }
        .btn-primary { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
        .btn-primary:hover { transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .alert {
            padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; margin-top: 0.75rem; display: none;
        }
        .alert.show { display: block; }
        .alert.ok { background: rgba(16,185,129,0.15); border: 1px solid var(--success); color: #6ee7b7; }
        .alert.err { background: rgba(239,68,68,0.15); border: 1px solid var(--danger); color: #fca5a5; }
        table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        th { text-align: left; color: var(--muted); font-weight: 500; padding: 0.5rem 0.35rem; border-bottom: 1px solid var(--border); }
        td { padding: 0.65rem 0.35rem; border-bottom: 1px solid var(--border); }
        .status-pill {
            font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 4px;
            text-transform: uppercase;
        }
        .status-completed { background: rgba(16,185,129,0.2); color: var(--success); }
        .status-failed { background: rgba(239,68,68,0.2); color: var(--danger); }
        .cdp-panel { border-color: rgba(0,82,255,0.35); background: linear-gradient(160deg, var(--surface), rgba(0,82,255,0.06)); }
        .cdp-logo { font-weight: 700; color: #6ea8ff; font-size: 1rem; margin-bottom: 0.5rem; }
        .cdp-msg { font-size: 0.85rem; color: var(--muted); line-height: 1.5; margin: 0.75rem 0; }
        .cdp-accounts { display: grid; gap: 0.5rem; margin-top: 1rem; }
        .cdp-acc {
            display: flex; justify-content: space-between; padding: 0.6rem 0.75rem;
            background: rgba(0,82,255,0.08); border-radius: 8px; font-size: 0.8rem;
        }
        .link { color: var(--accent); text-decoration: none; font-size: 0.8rem; }
        .link:hover { text-decoration: underline; }
        .arch { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
        .arch span {
            font-size: 0.7rem; padding: 0.25rem 0.5rem; background: var(--surface-2);
            border-radius: 4px; color: var(--muted); font-family: 'JetBrains Mono', monospace;
        }
        footer { text-align: center; margin-top: 2rem; color: var(--muted); font-size: 0.8rem; }
        .loading { opacity: 0.5; pointer-events: none; }
    </style>
</head>
<body>
<div class="wrap">
    <header>
        <div class="brand">
            <h1>{{ $appName }}</h1>
            <p>Atomic ledger · Redis lock · PostgreSQL FOR UPDATE · BCMath</p>
        </div>
        <div class="badges">
            <span class="badge live" id="health-badge">● Live</span>
            @if($coinbaseIsSandbox)
                <span class="badge sandbox">CDP Sandbox</span>
            @else
                <span class="badge production">CDP Production</span>
            @endif
            <span class="badge">Laravel 11</span>
        </div>
    </header>

    <div class="grid grid-main">
        <div class="grid" style="gap:1.25rem">
            <div class="card">
                <h2>Wallets &amp; balances</h2>
                <div class="users-grid" id="users-list">
                    <p style="color:var(--muted)">Loading…</p>
                </div>
            </div>

            <div class="card">
                <h2>Transfer funds</h2>
                <form id="transfer-form">
                    <label for="sender_id">From</label>
                    <select id="sender_id" name="sender_id" required></select>
                    <label for="receiver_id">To</label>
                    <select id="receiver_id" name="receiver_id" required></select>
                    <label for="amount">Amount (max 8 decimals)</label>
                    <input type="text" id="amount" name="amount" placeholder="10.50000000" pattern="^\d+(\.\d{1,8})?$" required>
                    <button type="submit" class="btn btn-primary" id="transfer-btn">Execute transfer</button>
                </form>
                <div class="alert" id="transfer-alert"></div>
            </div>

            <div class="card">
                <h2>Recent transactions</h2>
                <div style="overflow-x:auto">
                    <table>
                        <thead>
                            <tr><th>ID</th><th>From → To</th><th>Amount</th><th>Status</th><th>CDP ref</th></tr>
                        </thead>
                        <tbody id="tx-body"><tr><td colspan="5" style="color:var(--muted)">Loading…</td></tr></tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="grid" style="gap:1.25rem">
            <div class="card cdp-panel">
                <div class="cdp-logo">⬡ Coinbase Developer Platform</div>
                <div class="badges">
                    <span class="badge {{ $coinbaseIsSandbox ? 'sandbox' : 'production' }}" id="cdp-mode">{{ $coinbaseModeLabel }}</span>
                    <span class="badge" id="cdp-connection">…</span>
                </div>
                <p class="cdp-msg" id="cdp-message">Connecting to CDP status…</p>
                <div class="cutover-box" id="cdp-cutover" style="{{ $coinbaseIsSandbox ? '' : 'display:none' }}">
                    <strong>Production cutover:</strong> na Renderu postavi
                    <code>COINBASE_MODE=production</code>,
                    zamijeni CDP ključeve s production portalom i redeployaj.
                </div>
                <div class="cdp-accounts" id="cdp-accounts"></div>
                <p style="margin-top:1rem">
                    <a class="link" href="https://portal.cdp.coinbase.com/v2/sandbox" target="_blank" rel="noopener">CDP Sandbox Portal →</a>
                    &nbsp;·&nbsp;
                    <a class="link" href="https://docs.cdp.coinbase.com/get-started/sandbox/quickstart" target="_blank" rel="noopener">Docs</a>
                </p>
            </div>

            <div class="card">
                <h2>Architecture</h2>
                <div class="arch">
                    <span>Cache::lock</span>
                    <span>lockForUpdate</span>
                    <span>BCMath</span>
                    <span>DECIMAL(24,8)</span>
                    <span>Audit log</span>
                    <span>Idempotency</span>
                </div>
                <p class="cdp-msg" style="margin-top:1rem">
                    Dvoslojna zaštita od race conditiona: Redis distribuirani lock + PostgreSQL row-level lock.
                    Svaki transfer je ACID transakcija s punim audit trailom.
                </p>
            </div>

            <div class="card">
                <h2>API</h2>
                <p class="cdp-msg" style="font-family:'JetBrains Mono',monospace;font-size:0.75rem">
                    GET /api/users<br>
                    GET /api/transactions<br>
                    POST /api/transfers<br>
                    GET /api/coinbase/status
                </p>
                <p style="margin-top:0.75rem">
                    <a class="link" href="https://github.com/oriphiel-hr/Render/tree/main/oriphiel-atomic-ledger-core" target="_blank" rel="noopener">GitHub →</a>
                </p>
            </div>
        </div>
    </div>

    <footer>Oriphiel · Fintech portfolio demo · Render + Docker + PostgreSQL</footer>
</div>

<script>
const api = (path, opts = {}) => fetch('/api' + path, {
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
}).then(r => r.json().then(d => ({ ok: r.ok, status: r.status, data: d })));

let users = [];

async function loadUsers() {
    const { ok, data } = await api('/users');
    if (!ok) return;
    users = data.data || [];
    const list = document.getElementById('users-list');
    const sender = document.getElementById('sender_id');
    const receiver = document.getElementById('receiver_id');
    list.innerHTML = users.map(u => `
        <div class="user-row">
            <div><div class="name">${esc(u.name)}</div><div class="id">#${u.id}</div></div>
            <div class="balance">${esc(u.balance)}</div>
        </div>`).join('');
    const opts = users.map(u => `<option value="${u.id}">${esc(u.name)} (#${u.id}) — ${esc(u.balance)}</option>`).join('');
    sender.innerHTML = opts;
    receiver.innerHTML = users.map(u => `<option value="${u.id}" ${u.id===2?'selected':''}>${esc(u.name)} (#${u.id})</option>`).join('');
}

async function loadTransactions() {
    const { ok, data } = await api('/transactions');
    const body = document.getElementById('tx-body');
    if (!ok || !data.data?.length) {
        body.innerHTML = '<tr><td colspan="5" style="color:var(--muted)">No transactions yet</td></tr>';
        return;
    }
    body.innerHTML = data.data.map(tx => `
        <tr>
            <td>#${tx.id}</td>
            <td>${esc(tx.sender?.name)} → ${esc(tx.receiver?.name)}</td>
            <td style="font-family:JetBrains Mono,monospace">${esc(tx.amount)}</td>
            <td><span class="status-pill status-${tx.status}">${tx.status}</span></td>
            <td style="font-size:0.75rem;color:var(--muted)">${esc(tx.external_reference || '—')}</td>
        </tr>`).join('');
}

async function loadCdp() {
    const [{ data: status }, { data: accounts }] = await Promise.all([
        api('/coinbase/status'),
        api('/coinbase/accounts'),
    ]);
    document.getElementById('cdp-mode').textContent = status.mode_label || status.mode || 'sandbox';
    document.getElementById('cdp-mode').className = 'badge ' + (status.sandbox ? 'sandbox' : 'production');
    document.getElementById('cdp-connection').textContent = status.connection || status.connection_state || '—';
    document.getElementById('cdp-message').textContent = status.message || 'CDP ready.';
    const cutover = document.getElementById('cdp-cutover');
    if (cutover && status.sandbox) {
        cutover.style.display = '';
        if (status.cutover?.steps) cutover.innerHTML = '<strong>Production cutover:</strong> ' + esc(status.cutover.steps) + ' — flag: <code>COINBASE_MODE=production</code>';
    } else if (cutover) {
        cutover.style.display = 'none';
    }
    const acc = accounts.data || [];
    document.getElementById('cdp-accounts').innerHTML = acc.map(a => `
        <div class="cdp-acc">
            <span>${esc(a.name || a.currency)}</span>
            <span style="font-family:JetBrains Mono,monospace">${esc(a.balance)} ${esc(a.currency || '')}</span>
        </div>`).join('') || '<p style="color:var(--muted);font-size:0.8rem">No accounts</p>';
}

function esc(s) {
    if (s == null) return '';
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
}

document.getElementById('transfer-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('transfer-btn');
    const alert = document.getElementById('transfer-alert');
    const sender_id = +document.getElementById('sender_id').value;
    const receiver_id = +document.getElementById('receiver_id').value;
    const amount = document.getElementById('amount').value;
    if (sender_id === receiver_id) {
        alert.className = 'alert show err';
        alert.textContent = 'Sender and receiver must differ.';
        return;
    }
    btn.disabled = true;
    alert.className = 'alert';
    const { ok, data } = await api('/transfers', {
        method: 'POST',
        body: JSON.stringify({ sender_id, receiver_id, amount, idempotency_key: 'ui-' + Date.now() }),
    });
    if (ok) {
        alert.className = 'alert show ok';
        alert.textContent = `Transfer #${data.data.id} completed — ${data.data.amount} (ref: ${data.data.external_reference || 'local'})`;
        document.getElementById('amount').value = '';
        await Promise.all([loadUsers(), loadTransactions(), loadCdp()]);
    } else {
        alert.className = 'alert show err';
        alert.textContent = data.message || data.error || JSON.stringify(data);
    }
    btn.disabled = false;
});

async function init() {
    try {
        await api('/status');
        await Promise.all([loadUsers(), loadTransactions(), loadCdp()]);
    } catch (e) {
        document.getElementById('health-badge').textContent = '● Offline';
        document.getElementById('health-badge').className = 'badge';
    }
}
init();
setInterval(() => { loadUsers(); loadTransactions(); }, 30000);
</script>
</body>
</html>
