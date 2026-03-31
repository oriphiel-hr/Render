export function requireAdminApiKey(req, res, next) {
  const token = req.header('x-admin-api-key');
  const expected = process.env.ADMIN_API_KEY;

  if (!expected || token !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}
