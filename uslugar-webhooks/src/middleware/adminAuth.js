/**
 * Zaštita admin panela: Bearer token (ADMIN_PANEL_TOKEN).
 * Ako token nije postavljen u envu, admin API je onemogućen.
 */
function requireAdminToken(req, res, next) {
  const expected = process.env.ADMIN_PANEL_TOKEN || '';
  if (!expected) {
    return res.status(503).json({ error: 'Admin panel is disabled (set ADMIN_PANEL_TOKEN)' });
  }
  const auth = req.get('authorization') || '';
  const m = /^Bearer\s+(.+)$/i.exec(auth);
  const token = m ? m[1].trim() : '';
  if (token !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function adminCors(req, res, next) {
  const origin = process.env.ADMIN_PANEL_ORIGIN || '';
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
}

module.exports = { requireAdminToken, adminCors };
