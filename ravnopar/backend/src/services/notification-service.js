import { sendEmail } from '../lib/mail.js';
import { prisma } from '../lib/prisma.js';

const frontendBase = () => (process.env.FRONTEND_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');

export async function sendVerificationEmail(email, code) {
  return sendEmail({
    to: email,
    subject: 'Ravnopar — verifikacijski kod',
    text: [
      'Pozdrav!',
      '',
      `Tvoj verifikacijski kod za Ravnopar je: ${code}`,
      'Kod vrijedi 15 minuta.',
      '',
      `Aplikacija: ${frontendBase()}/auth`
    ].join('\n')
  });
}

export async function notifyContactRequest(targetProfileId, requesterName) {
  const target = await prisma.userProfile.findUnique({ where: { id: targetProfileId } });
  if (!target?.email || target.notifyEmail === false) return { skipped: true };

  return sendEmail({
    to: target.email,
    subject: 'Ravnopar — novi zahtjev za kontakt',
    text: [
      `Pozdrav ${target.displayName},`,
      '',
      `${requesterName} ti je poslao/la zahtjev za kontakt na Ravnoparu.`,
      '',
      `Pogledaj u aplikaciji: ${frontendBase()}/app`
    ].join('\n')
  });
}

export async function notifyContactAccepted(requesterProfileId, accepterName) {
  const requester = await prisma.userProfile.findUnique({ where: { id: requesterProfileId } });
  if (!requester?.email || requester.notifyEmail === false) return { skipped: true };

  return sendEmail({
    to: requester.email,
    subject: 'Ravnopar — kontakt prihvaćen',
    text: [
      `Pozdrav ${requester.displayName},`,
      '',
      `${accepterName} je prihvatio/la tvoj zahtjev za kontakt.`,
      'Sada možete razgovarati u aplikaciji.',
      '',
      `Otvori chat: ${frontendBase()}/app`
    ].join('\n')
  });
}

export async function notifyNewMessage(recipientProfileId, senderName) {
  const recipient = await prisma.userProfile.findUnique({ where: { id: recipientProfileId } });
  if (!recipient?.email || recipient.notifyEmail === false) return { skipped: true };

  return sendEmail({
    to: recipient.email,
    subject: 'Ravnopar — nova poruka',
    text: [
      `Pozdrav ${recipient.displayName},`,
      '',
      `${senderName} ti je poslao/la novu poruku.`,
      '',
      `Otvori aplikaciju: ${frontendBase()}/app`
    ].join('\n')
  });
}
