const crypto = require('crypto');

/**
 * Pretvara Facebook Graph webhook body u univerzalne redove za ChannelMessage.
 * Pokriva Messenger (messaging) i grube feed/comment change evente.
 */
function stableMessageId(event, pageId) {
  if (event.message?.mid) return event.message.mid;
  const payload = JSON.stringify({ pageId, t: event.timestamp, s: event.sender?.id, r: event.recipient?.id, m: event.message });
  return `fb_${crypto.createHash('sha256').update(payload).digest('hex').slice(0, 48)}`;
}

function threadKey(pageId, event) {
  const sid = event.sender?.id;
  const rid = event.recipient?.id;
  if (pageId && sid) return `${pageId}_${sid}`;
  return sid || rid || null;
}

function parseFacebookWebhook(body) {
  const rows = [];
  if (!body || !Array.isArray(body.entry)) return rows;

  for (const entry of body.entry) {
    const pageId = entry.id;

    const messaging = entry.messaging || [];
    for (const event of messaging) {
      const isEcho = Boolean(event.message?.is_echo);
      const direction = isEcho ? 'outbound' : 'inbound';
      const text = event.message?.text;
      const attachments = event.message?.attachments;
      let bodyText = text || null;
      if (!bodyText && attachments?.length) {
        bodyText = `[privitci: ${attachments.length}]`;
      }

      rows.push({
        channel: 'MESSENGER',
        source: 'facebook.graph',
        externalThreadId: threadKey(pageId, event),
        externalMessageId: stableMessageId(event, pageId),
        direction,
        bodyText,
        rawPayload: event
      });
    }

    const changes = entry.changes || [];
    for (const ch of changes) {
      const v = ch.value || {};
      const extId = v.comment_id || v.post_id || v.id || stableMessageId({ change: ch }, pageId);
      rows.push({
        channel: 'FACEBOOK_PAGE_FEED',
        source: 'facebook.graph',
        externalThreadId: pageId ? String(pageId) : null,
        externalMessageId: String(extId).slice(0, 200),
        direction: 'inbound',
        bodyText: v.message || v.text || v.item || null,
        rawPayload: ch
      });
    }
  }

  return rows;
}

module.exports = { parseFacebookWebhook };
