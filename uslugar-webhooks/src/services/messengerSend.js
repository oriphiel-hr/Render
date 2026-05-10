const { prisma } = require('../lib/prisma');
const { storeMessages } = require('./messageStore');

const DEFAULT_VERSION = process.env.MESSENGER_GRAPH_VERSION || 'v21.0';

/**
 * Šalje tekstualnu poruku korisniku putem Messenger Send API (Page access token).
 * @see https://developers.facebook.com/docs/messenger-platform/send-messages
 */
async function sendMessengerText(opts = {}) {
  const apiVersion = opts.apiVersion || DEFAULT_VERSION;
  const pageAccessToken = String(opts.pageAccessToken || '').trim();
  const recipientPsid = String(opts.recipientPsid || '').trim();
  const text = String(opts.text || '').trim();

  if (!pageAccessToken || !recipientPsid || !text) {
    throw new Error('pageAccessToken, recipientPsid i text su obavezni');
  }
  if (text.length > 2000) {
    throw new Error('Tekst mora biti najviše 2000 znakova (Messenger limit)');
  }

  const url = `https://graph.facebook.com/${apiVersion}/me/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${pageAccessToken}`
    },
    body: JSON.stringify({
      recipient: { id: recipientPsid },
      messaging_type: 'RESPONSE',
      message: { text }
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const msg = data.error?.message || JSON.stringify(data);
    throw new Error(msg);
  }

  const messageId = data.message_id != null ? String(data.message_id) : null;
  return {
    messageId,
    recipientId: data.recipient_id != null ? String(data.recipient_id) : recipientPsid,
    raw: data
  };
}

/**
 * Pošalji poruku i zabilježi je kao outbound u ChannelMessage (ista nit pageId_psid).
 */
async function sendMessengerAndStore(opts = {}) {
  const pageId = String(opts.pageId || '').trim();
  const recipientPsid = String(opts.recipientPsid || '').trim();
  const text = String(opts.text || '').trim();

  if (!pageId) throw new Error('pageId je obavezan za zapis u bazu (nit pageId_psid)');
  if (!recipientPsid) throw new Error('recipientPsid je obavezan');

  const sendResult = await sendMessengerText(opts);
  const extMsgId =
    sendResult.messageId || `sent_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;

  const db = opts.prisma || prisma;
  await storeMessages(
    [
      {
        channel: 'MESSENGER',
        source: String(opts.source || 'facebook.graph.send'),
        externalThreadId: `${pageId}_${recipientPsid}`,
        externalMessageId: extMsgId,
        direction: 'outbound',
        bodyText: text,
        rawPayload: {
          messengerSend: true,
          graphResponse: sendResult.raw,
          pageId,
          recipientPsid
        }
      }
    ],
    { prisma: db }
  );

  return sendResult;
}

module.exports = { sendMessengerText, sendMessengerAndStore };
