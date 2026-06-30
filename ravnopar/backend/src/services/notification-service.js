import { sendEmail } from '../lib/mail.js';
import { buildEmail } from '../lib/email-i18n.js';
import { prisma } from '../lib/prisma.js';
import { canSendMessageEmail, markMessageEmailSent } from '../lib/message-email-throttle.js';
import { createInAppNotification } from '../lib/in-app-notifications.js';

const frontendBase = () => (process.env.FRONTEND_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');

export async function sendVerificationEmail(email, code, locale = 'hr') {
  const { subject, text } = buildEmail('verification', locale, {
    code,
    appUrl: `${frontendBase()}/auth`
  });
  return sendEmail({ to: email, subject, text });
}

export async function notifyContactRequest(targetProfileId, requesterName) {
  const target = await prisma.userProfile.findUnique({ where: { id: targetProfileId } });
  if (!target) return { skipped: true };

  await createInAppNotification({
    profileId: targetProfileId,
    type: 'CONTACT_REQUEST',
    title: 'Novi zahtjev za kontakt',
    body: `${requesterName} želi kontakt s tobom.`,
    linkPath: '/app'
  });

  if (!target.email || target.notifyEmail === false) return { skipped: true };

  const { subject, text } = buildEmail('contactRequest', target.locale, {
    name: target.displayName,
    requester: requesterName,
    appUrl: `${frontendBase()}/app`
  });
  return sendEmail({ to: target.email, subject, text });
}

export async function notifyContactAccepted(requesterProfileId, accepterName) {
  const requester = await prisma.userProfile.findUnique({ where: { id: requesterProfileId } });
  if (!requester) return { skipped: true };

  await createInAppNotification({
    profileId: requesterProfileId,
    type: 'CONTACT_ACCEPTED',
    title: 'Kontakt prihvaćen',
    body: `${accepterName} je prihvatio/la tvoj zahtjev — možeš otvoriti chat.`,
    linkPath: '/app'
  });

  if (!requester.email || requester.notifyEmail === false) return { skipped: true };

  const { subject, text } = buildEmail('contactAccepted', requester.locale, {
    name: requester.displayName,
    accepter: accepterName,
    appUrl: `${frontendBase()}/app`
  });
  return sendEmail({ to: requester.email, subject, text });
}

export async function sendPasswordResetEmail(email, code) {
  const profile = await prisma.userProfile.findUnique({ where: { email } });
  const locale = profile?.locale || 'hr';
  const { subject, text } = buildEmail('passwordReset', locale, {
    code,
    resetUrl: `${frontendBase()}/auth?reset=1`
  });
  return sendEmail({ to: email, subject, text });
}

export async function notifyAdminReport(reportId, reportedName, reason) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  if (!adminEmail) return { skipped: true };

  return sendEmail({
    to: adminEmail,
    subject: 'Ravnopar Admin — nova prijava',
    text: [
      'Nova prijava u moderaciji.',
      '',
      `ID: ${reportId}`,
      `Prijavljen profil: ${reportedName}`,
      `Razlog: ${reason}`,
      '',
      `Admin: ${frontendBase()}/admin`
    ].join('\n')
  });
}

export async function notifyNewMessage(recipientProfileId, senderName, pairId) {
  const recipient = await prisma.userProfile.findUnique({ where: { id: recipientProfileId } });
  if (!recipient?.email || recipient.notifyEmail === false) return { skipped: true };

  if (pairId) {
    const allowed = await canSendMessageEmail(pairId, recipientProfileId);
    if (!allowed) return { skipped: true, reason: 'throttled' };
  }

  const { subject, text } = buildEmail('newMessage', recipient.locale, {
    name: recipient.displayName,
    sender: senderName,
    appUrl: `${frontendBase()}/app`
  });

  const result = await sendEmail({ to: recipient.email, subject, text });

  if (pairId && result?.sent === true) {
    await markMessageEmailSent(pairId, recipientProfileId);
  }

  return result;
}

export async function sendDonationThankYouEmail(email, amountEur, locale = 'hr') {
  const { subject, text } = buildEmail('donationThanks', locale, {
    amountEur,
    appUrl: `${frontendBase()}/app`
  });
  return sendEmail({ to: email, subject, text });
}

export async function notifyPairInactivityWarning(profileId, warnHours) {
  const profile = await prisma.userProfile.findUnique({ where: { id: profileId } });
  if (!profile?.email || profile.notifyEmail === false) return { skipped: true };

  const { subject, text } = buildEmail('pairInactivityWarning', profile.locale, {
    name: profile.displayName,
    hours: warnHours,
    appUrl: `${frontendBase()}/app`
  });
  return sendEmail({ to: profile.email, subject, text });
}

export async function notifyPairAutoClosed(profileId, closeHours) {
  const profile = await prisma.userProfile.findUnique({ where: { id: profileId } });
  if (!profile?.email || profile.notifyEmail === false) return { skipped: true };

  const { subject, text } = buildEmail('pairAutoClosed', profile.locale, {
    name: profile.displayName,
    hours: closeHours,
    appUrl: `${frontendBase()}/app`
  });
  return sendEmail({ to: profile.email, subject, text });
}

export async function notifyPendingContactExpired(profileId) {
  const profile = await prisma.userProfile.findUnique({ where: { id: profileId } });
  if (!profile?.email || profile.notifyEmail === false) return { skipped: true };

  const { subject, text } = buildEmail('contactExpired', profile.locale, {
    name: profile.displayName,
    appUrl: `${frontendBase()}/app`
  });
  return sendEmail({ to: profile.email, subject, text });
}
