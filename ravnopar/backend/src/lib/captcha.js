export function verifyRegisterCaptcha(body) {
  if (body?.website && String(body.website).trim().length > 0) {
    return { ok: false, code: 'INVALID_SUBMISSION' };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const token = body?.captchaToken?.trim();
  if (!secret) return { ok: true };

  if (!token) {
    return { ok: false, code: 'CAPTCHA_REQUIRED' };
  }

  return { ok: true, token, secret };
}

export async function validateTurnstile(token, secret) {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token })
  });
  const data = await response.json();
  return Boolean(data?.success);
}
