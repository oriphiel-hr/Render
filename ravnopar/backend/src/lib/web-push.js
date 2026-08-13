import webpush from 'web-push';
import { prisma } from './prisma.js';

let configured = false;

function ensurePushConfig() {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || 'mailto:ravnopar@oriph.io';
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export async function sendWebPushToProfile(profileId, payload) {
  if (!profileId || !ensurePushConfig()) return { sent: 0 };
  const subs = await prisma.pushSubscription.findMany({ where: { profileId } });
  if (!subs.length) return { sent: 0 };

  const body = JSON.stringify({
    title: payload.title || 'Ravnopar',
    body: payload.body || '',
    url: payload.url || payload.linkPath || '/app'
  });

  let sent = 0;
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          },
          body
        );
        sent += 1;
      } catch (error) {
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    })
  );
  return { sent };
}
