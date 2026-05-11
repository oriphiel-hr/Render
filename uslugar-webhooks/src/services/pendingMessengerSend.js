const { prisma } = require('../lib/prisma');
const { sendMessengerAndStore } = require('./messengerSend');

const PENDING = 'PENDING';
const SENT = 'SENT';
const REJECTED = 'REJECTED';
const EXPIRED = 'EXPIRED';

const DEFAULT_TTL_HOURS = 48;

function outboundApprovalRequired() {
  const v = String(process.env.MESSENGER_OUTBOUND_REQUIRE_APPROVAL || '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

function defaultExpiresAt() {
  return new Date(Date.now() + DEFAULT_TTL_HOURS * 60 * 60 * 1000);
}

/**
 * @param {{ pageId: string, recipientId: string, text: string, meta?: object }} opts
 */
async function createPendingSend(opts) {
  const pageId = String(opts.pageId || '').trim();
  const recipientId = String(opts.recipientId || '').trim();
  const text = String(opts.text || '').trim();
  if (!pageId || !recipientId || !text) {
    throw new Error('pageId, recipientId i text su obavezni');
  }
  if (text.length > 2000) {
    throw new Error('Tekst mora biti najviše 2000 znakova (Messenger limit)');
  }
  return prisma.pendingMessengerSend.create({
    data: {
      pageId,
      recipientId,
      text,
      status: PENDING,
      expiresAt: defaultExpiresAt(),
      meta: opts.meta != null ? opts.meta : undefined
    }
  });
}

async function expireStalePending() {
  const r = await prisma.pendingMessengerSend.updateMany({
    where: { status: PENDING, expiresAt: { lt: new Date() } },
    data: { status: EXPIRED }
  });
  return r.count;
}

async function listPendingForAdmin() {
  await expireStalePending();
  return prisma.pendingMessengerSend.findMany({
    where: { status: PENDING },
    orderBy: { createdAt: 'asc' },
    take: 100
  });
}

/**
 * Odobri i pošalji (Meta + zapis u ChannelMessage).
 */
async function approvePendingSend(id, opts = {}) {
  await expireStalePending();
  const accessToken = String(opts.accessToken || '').trim();
  const apiVersion = opts.apiVersion || undefined;
  if (!accessToken) throw new Error('accessToken je obavezan za odobrenje');

  const row = await prisma.pendingMessengerSend.findUnique({
    where: { id: String(id) }
  });
  if (!row) throw new Error('Zahtjev nije pronađen');
  if (row.status !== PENDING) throw new Error(`Zahtjev nije na čekanju (status: ${row.status})`);
  if (new Date(row.expiresAt) < new Date()) {
    await prisma.pendingMessengerSend.update({
      where: { id: row.id },
      data: { status: EXPIRED }
    });
    throw new Error('Zahtjev je istekao');
  }

  const gate = await prisma.crmContact.findUnique({
    where: { pageId_userId: { pageId: row.pageId, userId: row.recipientId } },
    select: { pauseAutomation: true }
  });
  if (gate?.pauseAutomation) {
    throw new Error('Automatika je pauzirana za ovu nit (pauseAutomation)');
  }

  const result = await sendMessengerAndStore({
    pageId: row.pageId,
    recipientPsid: row.recipientId,
    text: row.text,
    pageAccessToken: accessToken,
    apiVersion,
    source: 'api.ingest.send',
    prisma
  });

  await prisma.pendingMessengerSend.update({
    where: { id: row.id },
    data: { status: SENT }
  });

  return result;
}

async function rejectPendingSend(id) {
  const row = await prisma.pendingMessengerSend.findUnique({ where: { id: String(id) } });
  if (!row) throw new Error('Zahtjev nije pronađen');
  if (row.status !== PENDING) throw new Error(`Zahtjev nije na čekanju (status: ${row.status})`);
  await prisma.pendingMessengerSend.update({
    where: { id: row.id },
    data: { status: REJECTED }
  });
  return { ok: true };
}

module.exports = {
  outboundApprovalRequired,
  createPendingSend,
  listPendingForAdmin,
  approvePendingSend,
  rejectPendingSend,
  PENDING,
  SENT,
  REJECTED,
  EXPIRED
};
