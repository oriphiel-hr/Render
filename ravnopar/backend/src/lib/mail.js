export async function sendEmail({ to, subject, text, html }) {
  if (!to) {
    return { sent: false, reason: 'no-recipient' };
  }

  const from = process.env.MAIL_FROM || 'Ravnopar <noreply@ravnopar.app>';
  const smtpHost = process.env.SMTP_HOST?.trim();

  if (!smtpHost) {
    // eslint-disable-next-line no-console
    console.log('[ravnopar-mail:log-only]', { to, subject, text });
    return { sent: false, reason: 'smtp-not-configured', logged: true };
  }

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS || ''
          }
        : undefined
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br>')
    });

    return { sent: true };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ravnopar-mail:error]', error?.message || error);
    return { sent: false, reason: 'send-failed' };
  }
}
