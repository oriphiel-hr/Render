const { prisma } = require('../lib/prisma');
const { sendMessengerAndStore } = require('./messengerSend');

const PENDING = 'PENDING';
const SENT = 'SENT';
const REJECTED = 'REJECTED';
const EXPIRED = 'EXPIRED';

const DEFAULT_TTL_HOURS = 48;

/** @type {string} */
const MESSENGER_OUTBOUND_APPROVAL_KEY = 'messenger_outbound_require_approval';

function parseBoolString(s) {
  const t = String(s || '').trim().toLowerCase();
  if (t === 'true' || t === '1' || t === 'yes') return true;
  if (t === 'false' || t === '0' || t === 'no') return false;
  return null;
}

function envMessengerOutboundApproval() {
  return parseBoolString(process.env.MESSENGER_OUTBOUND_REQUIRE_APPROVAL) === true;
}

/**
 * Ako postoji redak u AppSetting, vrijedi on; inače MESSENGER_OUTBOUND_REQUIRE_APPROVAL.
 * @param {import('@prisma/client').PrismaClient | undefined} client
 */
async function getMessengerOutboundApprovalState(client) {
  const db = client || prisma;
  let fromDb = null;
  try {
    const row = await db.appSetting.findUnique({ where: { key: MESSENGER_OUTBOUND_APPROVAL_KEY } });
    if (row) fromDb = parseBoolString(row.value);
  } catch (_) {
    /* tablica još ne postoji ili druga greška */
  }
  const envVal = envMessengerOutboundApproval();
  const effective = fromDb !== null ? fromDb : envVal;
  return { effective, fromDb, envVal };
}

async function outboundApprovalRequired(client) {
  const s = await getMessengerOutboundApprovalState(client);
  return s.effective;
}

/**
 * @param {boolean} requireApproval
 * @param {import('@prisma/client').PrismaClient | undefined} client
 */
async function setMessengerOutboundApprovalInDb(requireApproval, client) {
  const db = client || prisma;
  const val = requireApproval ? 'true' : 'false';
  await db.appSetting.upsert({
    where: { key: MESSENGER_OUTBOUND_APPROVAL_KEY },
    create: { key: MESSENGER_OUTBOUND_APPROVAL_KEY, value: val },
    update: { value: val }
  });
}

/** Briše admin postavku — ponovno vrijedi samo env. */
async function clearMessengerOutboundApprovalInDb(client) {
  const db = client || prisma;
  await db.appSetting.deleteMany({ where: { key: MESSENGER_OUTBOUND_APPROVAL_KEY } });
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
  getMessengerOutboundApprovalState,
  setMessengerOutboundApprovalInDb,
  clearMessengerOutboundApprovalInDb,
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
