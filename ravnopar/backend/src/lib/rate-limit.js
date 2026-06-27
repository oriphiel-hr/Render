const buckets = new Map();

export function rateLimit({ windowMs = 60_000, max = 60, keyPrefix = '' }) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const entry = buckets.get(key) || { count: 0, resetAt: now + windowMs };
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }
    entry.count += 1;
    buckets.set(key, entry);
    if (entry.count > max) {
      return res.status(429).json({ success: false, error: 'Previše zahtjeva. Pokušaj ponovo uskoro.' });
    }
    return next();
  };
}
