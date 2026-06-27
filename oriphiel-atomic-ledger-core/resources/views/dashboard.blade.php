<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $appName }} — Exchange Ledger Demo</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root { --bg:#070b14; --surface:#0f1624; --surface2:#151e30; --border:#1e2a42; --text:#f2f6fc; --muted:#a8b8d4; --accent:#5b9aff; --success:#34d399; --warning:#fbbf24; --danger:#f87171; --exchange:#f0b90b; }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'DM Sans',system-ui,sans-serif; background:var(--bg); color:var(--text); min-height:100vh; }
        .wrap { max-width:1280px; margin:0 auto; padding:1.5rem 1rem 3rem; }
        .card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:1.25rem; margin-bottom:1rem; }
        .card h2 { font-size:.78rem; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin-bottom:1rem; }
        .grid { display:grid; gap:1rem; }
        @media(min-width:960px){ .grid-2{grid-template-columns:1fr 1fr;} .grid-3{grid-template-columns:2fr 1fr;} }
        .badge { font-size:.72rem; font-weight:600; padding:.3rem .65rem; border-radius:999px; border:1px solid var(--border); display:inline-block; }
        .badge.ok { border-color:var(--success); color:var(--success); }
        .badge.warn { border-color:var(--warning); color:var(--warning); }
        .badge.exchange { border-color:var(--exchange); color:var(--exchange); }
        .badge.local { border-color:var(--accent); color:var(--accent); }
        label { display:block; font-size:.78rem; color:var(--muted); margin-bottom:.3rem; }
        input, select, textarea { width:100%; padding:.6rem .8rem; border-radius:8px; border:1px solid var(--border); background:var(--surface2); color:var(--text); margin-bottom:.7rem; font:inherit; }
        .btn { padding:.65rem 1rem; border:none; border-radius:8px; font-weight:600; cursor:pointer; font:inherit; }
        .btn-primary { background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; width:100%; }
        .btn-secondary { background:var(--surface2); color:var(--text); border:1px solid var(--border); }
        .btn-sm { padding:.4rem .7rem; font-size:.8rem; width:auto; }
        .hidden { display:none !important; }
        table { width:100%; border-collapse:collapse; font-size:.82rem; }
        th, td { padding:.55rem .4rem; border-bottom:1px solid var(--border); text-align:left; }
        th { color:var(--muted); font-weight:500; }
        .mono { font-family:'JetBrains Mono',monospace; }
        .tabs { display:flex; gap:.5rem; flex-wrap:wrap; margin-bottom:1rem; }
        .tab { padding:.5rem .9rem; border-radius:8px; border:1px solid var(--border); background:var(--surface2); cursor:pointer; font-size:.88rem; font-weight:500; color:var(--text); transition:color .15s,border-color .15s,background .15s; }
        .tab:hover { color:#fff; border-color:#3d5070; background:#1a2438; }
        .tab.active { border-color:var(--accent); color:#fff; background:rgba(91,154,255,.16); font-weight:600; }
        .alert { padding:.7rem .9rem; border-radius:8px; font-size:.85rem; margin-top:.6rem; display:none; }
        .alert.show { display:block; }
        .alert.ok { background:rgba(16,185,129,.12); border:1px solid var(--success); color:#6ee7b7; }
        .alert.err { background:rgba(239,68,68,.12); border:1px solid var(--danger); color:#fca5a5; }
        .wallet-row { display:grid; grid-template-columns:repeat(4,1fr); gap:.5rem; padding:.7rem; background:var(--surface2); border-radius:8px; margin-bottom:.5rem; font-size:.82rem; }
        .login-box { max-width:420px; margin:4rem auto; }
        .demo-creds { font-size:.78rem; color:var(--muted); line-height:1.6; margin-top:1rem; padding:.8rem; background:var(--surface2); border-radius:8px; }
        header { display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-bottom:1.25rem; flex-wrap:wrap; }
        .diff-bad { color:var(--danger); font-weight:600; }
        .diff-ok { color:var(--success); }
        .api-source { font-size:.75rem; color:var(--muted); margin-bottom:.85rem; padding:.55rem .7rem; background:var(--surface2); border-radius:8px; border:1px solid var(--border); display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; }
        .api-source code { font-family:'JetBrains Mono',monospace; font-size:.72rem; color:var(--accent); }
        .api-json { background:#0a0f1a; border:1px solid var(--border); border-radius:8px; padding:.75rem; font-family:'JetBrains Mono',monospace; font-size:.72rem; max-height:280px; overflow:auto; white-space:pre-wrap; word-break:break-all; margin-top:.5rem; display:none; }
        .api-json.show { display:block; }
        .api-log-row { padding:.55rem 0; border-bottom:1px solid var(--border); font-size:.8rem; }
        .api-log-row:last-child { border-bottom:none; }
        .api-endpoint-list { list-style:none; font-size:.85rem; }
        .api-endpoint-list li { padding:.45rem 0; border-bottom:1px solid var(--border); display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; }
    </style>
</head>
<body>
<div class="wrap">
    <div id="login-screen" class="login-box card">
        <h1 style="font-size:1.35rem;margin-bottom:.35rem">{{ $appName }}</h1>
        <p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">Crypto exchange ledger demo — login required</p>
        <p style="font-size:.8rem;color:var(--muted);margin-bottom:1rem">Verify API without login: <a href="/api/status" target="_blank" rel="noopener" style="color:var(--accent)">GET /api/status</a></p>
        <div class="tabs" style="margin-bottom:1rem">
            <button type="button" class="auth-tab tab active" id="auth-tab-login">Sign in</button>
            <button type="button" class="auth-tab tab" id="auth-tab-register">Register</button>
        </div>
        <form id="login-form">
            <label>Email</label>
            <input type="email" id="login-email" value="alice@demo.local" required>
            <label>Password</label>
            <input type="password" id="login-password" value="password" required>
            <button class="btn btn-primary" type="submit">Sign in</button>
        </form>
        <form id="register-form" class="hidden">
            <label>Name</label>
            <input type="text" id="register-name" required>
            <label>Email</label>
            <input type="email" id="register-email" required>
            <label>Password</label>
            <input type="password" id="register-password" minlength="8" required>
            <label>Confirm password</label>
            <input type="password" id="register-password-confirm" minlength="8" required>
            <button class="btn btn-primary" type="submit">Create account</button>
        </form>
        <div class="demo-creds">
            <strong>Demo accounts</strong> (password: <code>password</code>)<br>
            alice@demo.local · admin@demo.local<br>
            New users must verify email before login.
        </div>
        <div class="alert" id="login-alert"></div>
        <button type="button" class="btn btn-secondary btn-sm hidden" id="resend-verify-btn" style="margin-top:.75rem;width:100%">Resend verification email</button>
    </div>

    <div id="app-screen" class="hidden">
        <header>
            <div>
                <h1 style="font-size:1.3rem">{{ $appName }}</h1>
                <p style="color:var(--muted);font-size:.85rem">Atomic ledger · available / locked / pending · reconciliation</p>
            </div>
            <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
                <span class="badge ok" id="user-badge">—</span>
                <button class="btn btn-secondary btn-sm" id="logout-btn">Logout</button>
            </div>
        </header>

        <div class="tabs" id="main-tabs">
            <button class="tab active" data-tab="wallets">Wallets</button>
            <button class="tab" data-tab="deposit">Deposit</button>
            <button class="tab" data-tab="withdraw">Withdraw</button>
            <button class="tab" data-tab="trade">Trade</button>
            <button class="tab" data-tab="transfer">Transfer</button>
            <button class="tab" data-tab="history">History</button>
            <button class="tab" data-tab="exchange">Binance</button>
            <button class="tab" data-tab="api-verify">Verify API</button>
            <button class="tab hidden" data-tab="admin" id="admin-tab">Admin</button>
        </div>

        <div class="tab-panel" data-panel="wallets">
            <div class="card">
                <div class="api-source" id="wallets-api-source">Loading API source…</div>
                <h2>My wallets</h2>
                <div id="wallets-list">Loading…</div>
                <pre class="api-json" id="wallets-api-json"></pre>
            </div>
        </div>

        <div class="tab-panel hidden" data-panel="deposit">
            <div class="card">
                <h2>Simulate deposit</h2>
                <form id="deposit-form">
                    <label>Asset</label><select id="deposit-asset"><option>USDT</option><option>BTC</option><option>ETH</option></select>
                    <label>Amount</label><input id="deposit-amount" placeholder="100.00000000" required>
                    <button class="btn btn-primary" type="submit">Deposit (pending → confirm)</button>
                </form>
                <div class="alert" id="deposit-alert"></div>
            </div>
        </div>

        <div class="tab-panel hidden" data-panel="withdraw">
            <div class="card">
                <h2>Simulate withdrawal</h2>
                <form id="withdraw-form">
                    <label>Asset</label><select id="withdraw-asset"><option>USDT</option><option>BTC</option><option>ETH</option></select>
                    <label>Amount</label><input id="withdraw-amount" placeholder="10.00000000" required>
                    <button class="btn btn-primary" type="submit">Withdraw (lock → complete)</button>
                </form>
                <div class="alert" id="withdraw-alert"></div>
            </div>
        </div>

        <div class="tab-panel hidden" data-panel="trade">
            <div class="card">
                <h2>Simulate trade</h2>
                <form id="trade-form">
                    <label>From</label><select id="trade-from"><option>USDT</option><option>BTC</option><option>ETH</option></select>
                    <label>To</label><select id="trade-to"><option>BTC</option><option>ETH</option><option>USDT</option></select>
                    <label>Amount (from asset)</label><input id="trade-amount" placeholder="50.00000000" required>
                    <button class="btn btn-primary" type="submit">Execute trade</button>
                </form>
                <div class="alert" id="trade-alert"></div>
            </div>
        </div>

        <div class="tab-panel hidden" data-panel="transfer">
            <div class="card">
                <h2>Transfer to user</h2>
                <form id="transfer-form">
                    <label>To user</label><select id="transfer-receiver" required></select>
                    <label>Asset</label><select id="transfer-asset"><option>USDT</option><option>BTC</option><option>ETH</option></select>
                    <label>Amount</label><input id="transfer-amount" placeholder="10.00000000" required>
                    <button class="btn btn-primary" type="submit">Send</button>
                </form>
                <div class="alert" id="transfer-alert"></div>
            </div>
        </div>

        <div class="tab-panel hidden" data-panel="history">
            <div class="grid grid-2">
                <div class="card">
                    <div class="api-source" id="ledger-api-source">—</div>
                    <h2>Ledger entries</h2>
                    <div style="overflow-x:auto"><table><thead><tr><th>Type</th><th>Asset</th><th>Δ avail</th><th>Δ lock</th><th>Δ pend</th></tr></thead><tbody id="ledger-body"></tbody></table></div>
                    <pre class="api-json" id="ledger-api-json"></pre>
                </div>
                <div class="card">
                    <div class="api-source" id="tx-api-source">—</div>
                    <h2>Transfers</h2>
                    <div style="overflow-x:auto"><table><thead><tr><th>ID</th><th>Flow</th><th>Amount</th></tr></thead><tbody id="tx-body"></tbody></table></div>
                    <pre class="api-json" id="tx-api-json"></pre>
                </div>
            </div>
        </div>

        <div class="tab-panel hidden" data-panel="exchange">
            <div class="card" style="border-color:rgba(240,185,11,.35)">
                <div class="api-source" id="exchange-api-source">—</div>
                <h2>Binance Spot bridge @if($exchangeIsTestnet)<span class="badge warn">testnet</span>@endif</h2>
                <p style="font-size:.82rem;color:var(--muted);margin-bottom:.75rem;line-height:1.5">
                    <strong>Your ledger</strong> (Wallets tab) is per user in PostgreSQL.
                    <strong>Binance below</strong> uses the server API keys — one shared testnet account for all demo users.
                </p>
                <div class="card" style="background:var(--surface2);margin-bottom:1rem;padding:1rem">
                    <h2 style="margin-bottom:.6rem">My Binance check (on request)</h2>
                    <p style="font-size:.8rem;color:var(--muted);margin-bottom:.75rem">Fetches live from Binance now — includes your ledger balances, shared Binance balances, and SHA-256 of the raw upstream response.</p>
                    <button type="button" class="btn btn-secondary btn-sm" id="my-binance-btn">Fetch my Binance status</button>
                    <div class="alert" id="my-binance-alert"></div>
                    <div id="my-binance-result" style="margin-top:.75rem;font-size:.82rem"></div>
                    <pre class="api-json" id="my-binance-json"></pre>
                </div>
                <div class="alert hidden" id="exchange-origin-banner"></div>
                <p id="exchange-upstream" style="font-size:.82rem;color:var(--muted);margin-bottom:.5rem">—</p>
                <p id="exchange-message" style="color:var(--muted);font-size:.85rem">—</p>
                <div id="exchange-accounts" style="margin-top:.8rem"></div>
                <pre class="api-json" id="exchange-api-json"></pre>
            </div>
        </div>

        <div class="tab-panel hidden" data-panel="api-verify">
            <div class="card">
                <h2>Verify data comes from API</h2>
                <p style="color:var(--muted);font-size:.88rem;margin-bottom:1rem;line-height:1.55">
                    UI loads data via REST calls. When signed in, use <strong>Open</strong> on an endpoint — your auth cookie authenticates the request in the browser.
                    Each JSON body includes <code>_source</code> (this API call) and <code>data_source</code> (where balances really come from: PostgreSQL ledger vs Binance).
                </p>
                <h3 style="font-size:.78rem;text-transform:uppercase;color:var(--muted);margin-bottom:.6rem">Public — no login</h3>
                <ul class="api-endpoint-list" id="api-public-list"></ul>
                <h3 style="font-size:.78rem;text-transform:uppercase;color:var(--muted);margin:1rem 0 .6rem">Authenticated — Bearer token</h3>
                <ul class="api-endpoint-list" id="api-auth-list"></ul>
                <p style="margin-top:1rem;font-size:.8rem;color:var(--muted)">Your token (for curl):</p>
                <pre class="api-json show" id="api-curl-token" style="max-height:4rem">—</pre>
            </div>
            <div class="card">
                <h2>Live API call log (this session)</h2>
                <div id="api-call-log"><p style="color:var(--muted)">No calls yet.</p></div>
            </div>
        </div>

        <div class="tab-panel hidden" data-panel="admin">
            <div class="card">
                <h2>Balance reconciliation</h2>
                <p id="recon-summary" style="margin-bottom:.8rem;font-size:.9rem">—</p>
                <div style="overflow-x:auto">
                    <table>
                        <thead><tr><th>User</th><th>Asset</th><th>Stored</th><th>Calculated</th><th>Diff</th><th>Status</th></tr></thead>
                        <tbody id="recon-body"></tbody>
                    </table>
                </div>
            </div>
            <div class="card" style="border-color:rgba(240,185,11,.35)">
                <h2>Pooled exchange reconciliation</h2>
                <p style="font-size:.8rem;color:var(--muted);margin-bottom:.6rem">Sum of all user ledger liabilities vs shared Binance custody (omnibus model).</p>
                <p id="pool-recon-summary" style="margin-bottom:.8rem;font-size:.9rem">—</p>
                <div style="overflow-x:auto">
                    <table>
                        <thead><tr><th>Asset</th><th>Ledger total</th><th>Binance custody</th><th>Diff</th><th>Status</th></tr></thead>
                        <tbody id="pool-recon-body"></tbody>
                    </table>
                </div>
                <pre class="api-json" id="pool-recon-json"></pre>
            </div>
            <div class="card">
                <h2>Manual adjustment</h2>
                <form id="adjust-form">
                    <label>User ID</label><input id="adjust-user" type="number" required>
                    <label>Asset</label><input id="adjust-asset" value="USDT" required>
                    <label>Available delta (+/-)</label><input id="adjust-delta" placeholder="10.00000000" required>
                    <label>Reason</label><textarea id="adjust-reason" rows="2" required>Reconciliation fix</textarea>
                    <button class="btn btn-primary" type="submit">Apply adjustment</button>
                </form>
                <div class="alert" id="adjust-alert"></div>
            </div>
            <div class="card">
                <h2>Invite user</h2>
                <form id="invite-form">
                    <label>Name</label><input id="invite-name" required>
                    <label>Email</label><input type="email" id="invite-email" required>
                    <button class="btn btn-primary" type="submit">Send invitation</button>
                </form>
                <div class="alert" id="invite-alert"></div>
                <div style="margin-top:1rem;overflow-x:auto">
                    <table>
                        <thead><tr><th>Email</th><th>Name</th><th>Status</th><th>Expires</th></tr></thead>
                        <tbody id="invites-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
const APP_URL = @json($appUrl);
let token = localStorage.getItem('ledger_token') || '';
let currentUser = null;
const apiCallLog = [];

const PUBLIC_ENDPOINTS = [
    { method: 'GET', path: '/api/status', label: 'Service status + exchange info' },
    { method: 'GET', path: '/api/exchange/status', label: 'Binance bridge status' },
    { method: 'GET', path: '/api/exchange/accounts', label: 'Binance accounts (or demo fallback)' },
    { method: 'GET', path: '/api/exchange/my-binance', label: 'My live Binance check (login required)' },
];
const AUTH_ENDPOINTS = [
    { method: 'GET', path: '/api/wallets', label: 'My wallet balances' },
    { method: 'GET', path: '/api/ledger', label: 'Ledger entries' },
    { method: 'GET', path: '/api/my/transactions', label: 'My transfers' },
    { method: 'GET', path: '/api/users', label: 'Users list' },
    { method: 'GET', path: '/api/admin/reconciliation', label: 'Reconciliation (admin)' },
];

const api = async (path, opts = {}) => {
    const method = (opts.method || 'GET').toUpperCase();
    const started = performance.now();
    const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch('/api' + path, { ...opts, credentials: 'same-origin', headers });
    const data = await res.json().catch(() => ({}));
    const entry = {
        method, path: '/api' + path, status: res.status, ok: res.ok,
        ms: Math.round(performance.now() - started),
        at: new Date().toISOString(), data,
    };
    apiCallLog.unshift(entry);
    if (apiCallLog.length > 40) apiCallLog.pop();
    renderApiCallLog();
    return { ok: res.ok, status: res.status, data };
};

const esc = s => { const d = document.createElement('div'); d.textContent = s ?? ''; return d.innerHTML; };
const showAlert = (id, ok, msg) => { const el = document.getElementById(id); el.className = 'alert show ' + (ok ? 'ok' : 'err'); el.textContent = msg; };

function dataSourceBadge(dataSrc) {
    if (!dataSrc) return '';
    if (dataSrc.provider === 'local_ledger') {
        return '<span class="badge local">LOCAL LEDGER</span>';
    }
    if (dataSrc.provider === 'binance' && dataSrc.upstream_called !== false) {
        return '<span class="badge exchange">BINANCE LIVE</span>';
    }
    if (dataSrc.provider === 'binance') {
        return '<span class="badge warn">BINANCE (fallback)</span>';
    }
    if (dataSrc.provider === 'ledger_api') {
        return '<span class="badge warn">APP ONLY</span>';
    }
    return '';
}

function renderDataSourceLine(dataSrc) {
    if (!dataSrc) return '';
    const label = dataSrc.origin_label ? `<strong>${esc(dataSrc.origin_label)}</strong> · ` : '';
    if (dataSrc.provider === 'local_ledger') {
        const bridge = dataSrc.exchange_bridge || {};
        let line = `${label}table <code>${esc(dataSrc.table)}</code> — not Binance balances`;
        if (bridge.enabled) {
            line += ` · Binance testnet: <a href="${esc(bridge.live_balances_endpoint)}" target="_blank" rel="noopener">/api/exchange/accounts</a>`;
        }
        return line;
    }
    if (dataSrc.provider === 'binance') {
        const called = dataSrc.upstream_called === false ? ' · demo fallback, Binance not called' : ' · fetched just now from upstream';
        return `${label}${esc(dataSrc.method || 'GET')} <code>${esc(dataSrc.url)}</code>${called}`;
    }
    if (dataSrc.provider) {
        return `${label}${esc(dataSrc.method || 'GET')} <code>${esc(dataSrc.url)}</code>`;
    }
    return '';
}

function renderApiSourceBar(elId, jsonId, method, path, result) {
    const bar = document.getElementById(elId);
    const pre = jsonId ? document.getElementById(jsonId) : null;
    if (!bar) return;
    const payload = result?.data || {};
    const src = payload._source;
    const dataSrc = payload.data_source;
    const url = src?.url || (APP_URL + path);
    const fetched = src?.fetched_at ? ` · ${src.fetched_at}` : '';
    const origin = renderDataSourceLine(dataSrc);
    const badge = dataSourceBadge(dataSrc);
    bar.innerHTML = `${badge}<span class="badge ok">API</span> <strong>${esc(method)}</strong> <code>${esc(path)}</code>
        <button type="button" class="btn btn-secondary btn-sm" data-toggle-json="${jsonId || ''}">View JSON</button>
        <a class="btn btn-secondary btn-sm" href="${esc(path)}" target="_blank" rel="noopener">Open</a>
        <span style="color:var(--muted)">${esc(url)}${esc(fetched)}</span>
        ${origin ? `<div style="width:100%;margin-top:.35rem;font-size:.78rem">${origin}</div>` : ''}`;
    if (pre) {
        pre.textContent = JSON.stringify(payload, null, 2);
        pre.classList.remove('show');
    }
}

function renderApiCallLog() {
    const el = document.getElementById('api-call-log');
    if (!el) return;
    if (!apiCallLog.length) { el.innerHTML = '<p style="color:var(--muted)">No calls yet.</p>'; return; }
    el.innerHTML = apiCallLog.map((e, i) => `
        <div class="api-log-row">
            <span class="badge ${e.ok ? 'ok' : 'err'}">${e.status}</span>
            <strong>${esc(e.method)}</strong> <code>${esc(e.path)}</code>
            <span style="color:var(--muted)">${e.ms}ms · ${esc(e.at)}</span>
            <button type="button" class="btn btn-secondary btn-sm" data-log-json="${i}">JSON</button>
        </div>
        <pre class="api-json" id="log-json-${i}"></pre>`).join('');
}

function renderApiVerifyTab() {
    const pub = document.getElementById('api-public-list');
    const auth = document.getElementById('api-auth-list');
    const tok = document.getElementById('api-curl-token');
    if (pub) pub.innerHTML = PUBLIC_ENDPOINTS.map(e => `
        <li><span class="badge ok">${e.method}</span><code>${esc(e.path)}</code><span>${esc(e.label)}</span>
        <a href="${esc(e.path)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">Open</a></li>`).join('');
    if (auth) auth.innerHTML = AUTH_ENDPOINTS.map(e => `
        <li><span class="badge warn">${e.method}</span><code>${esc(e.path)}</code><span>${esc(e.label)}</span>
        <button type="button" class="btn btn-secondary btn-sm" data-fetch-auth="${esc(e.path)}">Fetch now</button></li>`).join('');
    if (tok) tok.textContent = token
        ? `Logged in — open /api/wallets in a new tab (auth cookie) or:\ncurl -H "Authorization: Bearer ${token}" -H "Accept: application/json" ${APP_URL}/api/wallets`
        : 'Sign in — then Open works in a new browser tab.';
}

document.addEventListener('click', e => {
    const toggle = e.target.closest('[data-toggle-json]');
    if (toggle) {
        const pre = document.getElementById(toggle.dataset.toggleJson);
        if (pre) pre.classList.toggle('show');
        return;
    }
    const logBtn = e.target.closest('[data-log-json]');
    if (logBtn) {
        const i = +logBtn.dataset.logJson;
        const pre = document.getElementById('log-json-' + i);
        if (pre) {
            pre.textContent = JSON.stringify(apiCallLog[i]?.data, null, 2);
            pre.classList.toggle('show');
        }
        return;
    }
    const fetchBtn = e.target.closest('[data-fetch-auth]');
    if (fetchBtn) {
        api(fetchBtn.dataset.fetchAuth.replace('/api', '')).then(r => alert(JSON.stringify(r.data, null, 2)));
    }
});

renderApiVerifyTab();

document.querySelectorAll('#main-tabs .tab').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('#main-tabs .tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    btn.classList.add('active');
    document.querySelector(`[data-panel="${btn.dataset.tab}"]`).classList.remove('hidden');
    if (btn.dataset.tab === 'admin') { loadReconciliation(); loadInvitations(); }
    if (btn.dataset.tab === 'exchange') loadExchange();
    if (btn.dataset.tab === 'api-verify') renderApiVerifyTab();
}));

let pendingVerifyEmail = '';

document.getElementById('auth-tab-login').addEventListener('click', () => {
    document.getElementById('auth-tab-login').classList.add('active');
    document.getElementById('auth-tab-register').classList.remove('active');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('resend-verify-btn').classList.add('hidden');
});
document.getElementById('auth-tab-register').addEventListener('click', () => {
    document.getElementById('auth-tab-register').classList.add('active');
    document.getElementById('auth-tab-login').classList.remove('active');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('resend-verify-btn').classList.add('hidden');
});

async function login(email, password) {
    const { ok, status, data } = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (!ok) {
        if (status === 403 && data.code === 'EMAIL_NOT_VERIFIED') {
            pendingVerifyEmail = data.email || email;
            document.getElementById('resend-verify-btn').classList.remove('hidden');
        }
        const msg = data.message || data.errors?.email?.[0]
            || (status >= 500 ? `Server error (${status}). Try again in a moment.` : 'Login failed');
        showAlert('login-alert', false, msg);
        return;
    }
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('ledger_token', token);
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    document.getElementById('user-badge').textContent = currentUser.name + ' (' + currentUser.role + ')';
    if (currentUser.is_admin) document.getElementById('admin-tab').classList.remove('hidden');
    renderApiVerifyTab();
    await refreshAll();
}

document.getElementById('register-form').addEventListener('submit', async e => {
    e.preventDefault();
    const { ok, data } = await api('/auth/register', { method: 'POST', body: JSON.stringify({
        name: document.getElementById('register-name').value,
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value,
        password_confirmation: document.getElementById('register-password-confirm').value,
    })});
    if (ok) {
        pendingVerifyEmail = document.getElementById('register-email').value;
        document.getElementById('auth-tab-login').click();
        showAlert('login-alert', true, data.message || 'Check your email to verify your account.');
        document.getElementById('resend-verify-btn').classList.remove('hidden');
    } else {
        showAlert('login-alert', false, data.message || JSON.stringify(data.errors || data));
    }
});

document.getElementById('resend-verify-btn').addEventListener('click', async () => {
    const email = pendingVerifyEmail || document.getElementById('login-email').value;
    const { ok, data } = await api('/auth/verification/resend', { method: 'POST', body: JSON.stringify({ email }) });
    showAlert('login-alert', ok, data.message || (ok ? 'Verification sent.' : 'Failed to resend.'));
});

document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    login(document.getElementById('login-email').value, document.getElementById('login-password').value);
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    await api('/auth/logout', { method: 'POST' });
    token = ''; currentUser = null; localStorage.removeItem('ledger_token');
    location.reload();
});

async function loadWallets() {
    const result = await api('/wallets');
    const { data } = result;
    renderApiSourceBar('wallets-api-source', 'wallets-api-json', 'GET', '/api/wallets', result);
    const list = document.getElementById('wallets-list');
    if (!data.data?.length) { list.innerHTML = '<p style="color:var(--muted)">No wallets</p>'; return; }
    list.innerHTML = data.data.map(w => `
        <div class="wallet-row">
            <div><strong>${esc(w.asset)}</strong></div>
            <div class="mono">avail ${esc(w.available)}</div>
            <div class="mono">lock ${esc(w.locked)}</div>
            <div class="mono">pend ${esc(w.pending)}</div>
        </div>`).join('');
}

async function loadUsers() {
    const { data } = await api('/users');
    const sel = document.getElementById('transfer-receiver');
    sel.innerHTML = (data.data || []).filter(u => u.id !== currentUser.id).map(u =>
        `<option value="${u.id}">${esc(u.name)} (#${u.id})</option>`).join('');
}

async function loadLedger() {
    const [ledgerResult, txResult] = await Promise.all([api('/ledger'), api('/my/transactions')]);
    const ledger = ledgerResult.data;
    const tx = txResult.data;
    renderApiSourceBar('ledger-api-source', 'ledger-api-json', 'GET', '/api/ledger', ledgerResult);
    renderApiSourceBar('tx-api-source', 'tx-api-json', 'GET', '/api/my/transactions', txResult);
    document.getElementById('ledger-body').innerHTML = (ledger.data || []).map(e => `<tr>
        <td>${esc(e.entry_type)}</td><td>${esc(e.asset)}</td>
        <td class="mono">${esc(e.available_delta)}</td><td class="mono">${esc(e.locked_delta)}</td><td class="mono">${esc(e.pending_delta)}</td></tr>`).join('') || '<tr><td colspan="5">No entries</td></tr>';
    document.getElementById('tx-body').innerHTML = (tx.data || []).map(t => `<tr>
        <td>#${t.id}</td><td>${esc(t.sender?.name)} → ${esc(t.receiver?.name)}</td>
        <td class="mono">${esc(t.amount)} ${esc(t.asset)}</td></tr>`).join('') || '<tr><td colspan="3">No transfers</td></tr>';
}

async function loadExchange() {
    const [statusResult, accountsResult] = await Promise.all([api('/exchange/status'), api('/exchange/accounts')]);
    const status = statusResult.data;
    const accounts = accountsResult.data;
    renderApiSourceBar('exchange-api-source', 'exchange-api-json', 'GET', '/api/exchange/accounts', accountsResult);
    const upstreamLine = renderDataSourceLine(accounts.data_source || status.data_source);
    document.getElementById('exchange-upstream').innerHTML = upstreamLine || 'Upstream source not available.';
    document.getElementById('exchange-message').textContent = (status.message || status.connection || '—') + (status.mode_label ? ` · ${status.mode_label}` : '');
    const ds = accounts.data_source || status.data_source;
    const banner = document.getElementById('exchange-origin-banner');
    if (banner) {
        if (ds?.provider === 'binance' && ds.upstream_called !== false) {
            banner.className = 'alert show ok';
            banner.textContent = `Balances below are from Binance (${status.mode_label || 'testnet'}) — upstream ${ds.url}`;
        } else if (accounts.mode === 'demo') {
            banner.className = 'alert show err';
            banner.textContent = 'Demo fallback — not live Binance data. Check /api/exchange/status.';
        } else {
            banner.className = 'alert hidden';
            banner.textContent = '';
        }
    }
    document.getElementById('exchange-accounts').innerHTML = (accounts.data || []).map(a =>
        `<div class="wallet-row"><span>${esc(a.name||a.currency)}</span><span class="mono">${esc(a.balance)} ${esc(a.currency||'')}</span></div>`).join('');
}

async function loadMyBinance() {
    const btn = document.getElementById('my-binance-btn');
    const resultEl = document.getElementById('my-binance-result');
    const pre = document.getElementById('my-binance-json');
    if (!btn || !resultEl) return;
    btn.disabled = true;
    btn.textContent = 'Fetching from Binance…';
    const result = await api('/exchange/my-binance');
    btn.disabled = false;
    btn.textContent = 'Fetch my Binance status';
    const data = result.data || {};
    if (!result.ok) {
        showAlert('my-binance-alert', false, data.message || 'Request failed');
        return;
    }
    showAlert('my-binance-alert', data.available, data.message || (data.available ? 'Live Binance data fetched.' : 'Binance not available.'));
    const v = data.verification || {};
    const ledger = (data.ledger_balances || []).map(w =>
        `<div class="wallet-row"><span><strong>${esc(w.asset)}</strong> (ledger)</span><span class="mono">${esc(w.available)} avail</span></div>`
    ).join('') || '<p style="color:var(--muted)">No ledger wallets</p>';
    const binance = (data.binance?.balances || []).map(b =>
        `<div class="wallet-row"><span><strong>${esc(b.currency)}</strong> (Binance)</span><span class="mono">${esc(b.balance)}</span></div>`
    ).join('') || '<p style="color:var(--muted)">No non-zero Binance balances</p>';
    resultEl.innerHTML = `
        <p style="color:var(--muted);margin-bottom:.5rem">${esc(data.scope_note || '')}</p>
        <p style="margin-bottom:.5rem"><span class="badge local">YOUR LEDGER</span> ${esc(data.requested_by?.email || '')}</p>
        ${ledger}
        <p style="margin:.75rem 0 .5rem"><span class="badge exchange">BINANCE LIVE</span> UID ${esc(data.binance?.account_uid ?? '—')} · ${esc(data.binance?.mode_label || '')}</p>
        ${binance}
        ${v.response_sha256 ? `<p style="margin-top:.75rem;color:var(--muted);font-size:.75rem">SHA-256: <code class="mono">${esc(v.response_sha256)}</code> · ${v.latency_ms ?? '—'}ms · <a href="${esc(v.portal_url || 'https://testnet.binance.vision')}" target="_blank" rel="noopener">verify on Binance</a></p>` : ''}`;
    if (pre) {
        pre.textContent = JSON.stringify(data, null, 2);
        pre.classList.add('show');
    }
}

document.getElementById('my-binance-btn')?.addEventListener('click', loadMyBinance);

async function loadReconciliation() {
    const { data } = await api('/admin/reconciliation');
    const s = data.summary || {};
    const combined = data.summary_combined || {};
    document.getElementById('recon-summary').innerHTML = `Internal: <strong>${s.total_wallets}</strong> wallets · out of sync <strong class="${s.out_of_sync ? 'diff-bad' : 'diff-ok'}">${s.out_of_sync}</strong>`
        + (combined.overall_healthy !== undefined ? ` · overall <strong class="${combined.overall_healthy ? 'diff-ok' : 'diff-bad'}">${combined.overall_healthy ? 'OK' : 'ALARM'}</strong>` : '');
    document.getElementById('recon-body').innerHTML = (data.data || []).map(r => `<tr>
        <td>#${r.user_id}</td><td>${esc(r.asset)}</td>
        <td class="mono">${esc(r.stored.available)}/${esc(r.stored.locked)}/${esc(r.stored.pending)}</td>
        <td class="mono">${esc(r.calculated.available)}/${esc(r.calculated.locked)}/${esc(r.calculated.pending)}</td>
        <td class="mono">${esc(r.diff.available)}/${esc(r.diff.locked)}/${esc(r.diff.pending)}</td>
        <td class="${r.in_sync ? 'diff-ok' : 'diff-bad'}">${r.in_sync ? 'OK' : 'DIFF'}</td></tr>`).join('');

    const pool = data.exchange_pool || {};
    const poolSummary = document.getElementById('pool-recon-summary');
    const poolBody = document.getElementById('pool-recon-body');
    const poolJson = document.getElementById('pool-recon-json');
    if (poolSummary) {
        const healthy = pool.healthy === true ? 'diff-ok' : (pool.healthy === false ? 'diff-bad' : '');
        poolSummary.innerHTML = `<span class="badge exchange">POOLED</span> ${esc(pool.message || pool.status || '—')}`
            + (pool.healthy !== null && pool.healthy !== undefined ? ` · <strong class="${healthy}">${pool.healthy ? 'CUSTODY OK' : 'DEFICIT'}</strong>` : '');
    }
    if (poolBody) {
        poolBody.innerHTML = (pool.assets || []).map(a => `<tr>
            <td><strong>${esc(a.asset)}</strong></td>
            <td class="mono">${esc(a.ledger?.total_liabilities ?? '—')}</td>
            <td class="mono">${esc(a.binance?.total_custody ?? '—')}</td>
            <td class="mono">${esc(a.diff ?? '—')}</td>
            <td class="${a.alarm ? 'diff-bad' : 'diff-ok'}">${esc(a.status)}</td></tr>`).join('') || '<tr><td colspan="5">No assets</td></tr>';
    }
    if (poolJson) poolJson.textContent = JSON.stringify(pool, null, 2);
}

async function loadInvitations() {
    const { data } = await api('/admin/invites');
    document.getElementById('invites-body').innerHTML = (data.data || []).map(i => `<tr>
        <td>${esc(i.email)}</td><td>${esc(i.name)}</td><td>${esc(i.status)}</td>
        <td class="mono">${esc(i.expires_at?.slice(0, 10) || '—')}</td></tr>`).join('') || '<tr><td colspan="4">No invitations</td></tr>';
}

async function refreshAll() {
    await Promise.all([loadWallets(), loadUsers(), loadLedger()]);
}

document.getElementById('deposit-form').addEventListener('submit', async e => {
    e.preventDefault();
    const { ok, data } = await api('/deposits', { method:'POST', body: JSON.stringify({
        asset: document.getElementById('deposit-asset').value,
        amount: document.getElementById('deposit-amount').value,
        auto_confirm: true,
    })});
    showAlert('deposit-alert', ok, ok ? `Deposit #${data.data.id} confirmed` : (data.message || JSON.stringify(data)));
    if (ok) await refreshAll();
});

document.getElementById('withdraw-form').addEventListener('submit', async e => {
    e.preventDefault();
    const body = { asset: document.getElementById('withdraw-asset').value, amount: document.getElementById('withdraw-amount').value, auto_complete: true };
    const { ok, data } = await api('/withdrawals', { method:'POST', body: JSON.stringify(body) });
    showAlert('withdraw-alert', ok, ok ? `Withdrawal #${data.data.id} completed` : (data.message || JSON.stringify(data)));
    if (ok) await refreshAll();
});

document.getElementById('trade-form').addEventListener('submit', async e => {
    e.preventDefault();
    const { ok, data } = await api('/trades', { method:'POST', body: JSON.stringify({
        from_asset: document.getElementById('trade-from').value,
        to_asset: document.getElementById('trade-to').value,
        amount: document.getElementById('trade-amount').value,
    })});
    showAlert('trade-alert', ok, ok ? `Trade #${data.data.id} settled` : (data.message || JSON.stringify(data)));
    if (ok) await refreshAll();
});

document.getElementById('transfer-form').addEventListener('submit', async e => {
    e.preventDefault();
    const { ok, data } = await api('/transfers', { method:'POST', body: JSON.stringify({
        sender_id: currentUser.id,
        receiver_id: +document.getElementById('transfer-receiver').value,
        asset: document.getElementById('transfer-asset').value,
        amount: document.getElementById('transfer-amount').value,
        idempotency_key: 'ui-' + Date.now(),
    })});
    showAlert('transfer-alert', ok, ok ? `Transfer #${data.data.id} OK` : (data.message || data.error || JSON.stringify(data)));
    if (ok) await refreshAll();
});

document.getElementById('adjust-form').addEventListener('submit', async e => {
    e.preventDefault();
    const { ok, data } = await api('/admin/adjustments', { method:'POST', body: JSON.stringify({
        user_id: +document.getElementById('adjust-user').value,
        asset: document.getElementById('adjust-asset').value,
        available_delta: document.getElementById('adjust-delta').value,
        reason: document.getElementById('adjust-reason').value,
    })});
    showAlert('adjust-alert', ok, ok ? 'Adjustment applied' : (data.message || JSON.stringify(data)));
    if (ok) { await refreshAll(); await loadReconciliation(); }
});

document.getElementById('invite-form').addEventListener('submit', async e => {
    e.preventDefault();
    const { ok, data } = await api('/admin/invites', { method:'POST', body: JSON.stringify({
        name: document.getElementById('invite-name').value,
        email: document.getElementById('invite-email').value,
    })});
    showAlert('invite-alert', ok, ok ? (data.message || 'Invitation sent.') : (data.message || JSON.stringify(data.errors || data)));
    if (ok) {
        document.getElementById('invite-form').reset();
        await loadInvitations();
    }
});

(async () => {
    if (!token) return;
    const { ok, data } = await api('/auth/me');
    if (!ok) { token = ''; localStorage.removeItem('ledger_token'); return; }
    currentUser = data.data;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    document.getElementById('user-badge').textContent = currentUser.name + ' (' + currentUser.role + ')';
    if (currentUser.is_admin) document.getElementById('admin-tab').classList.remove('hidden');
    renderApiVerifyTab();
    await refreshAll();
})();
</script>
</body>
</html>
