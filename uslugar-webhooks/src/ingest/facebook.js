const crypto = require('crypto');

/**
 * Facebook / Messenger webhook → ChannelMessage redovi.
 *
 * U Meta Developer konzoli (Page subscriptions) uključi polja koja želiš primati:
 * - messages — tekst, privitci, echo…
 * - message_reactions — reakcije na poruke
 * - messaging_postbacks — gumba, persistent menu, Get Started
 * - messaging_referrals — m.me ref, shortlink, OPEN_THREAD
 * - messaging_feedback — ocjena / povrat nakon razgovora (ovisno o šablonu)
 * - message_edits — ispravak poslane poruke (nova verzija teksta)
 * - inbox_labels — oznake konverzacije u Inboxu (ako Meta šalje za tvoju integraciju)
 * - calls — glasovni/video pozivi i povezani događaji (statistika; detalji u rawPayload)
 *
 * Ne pretplaćujemo ovdje: message_reads, message_deliveries (veliki volumen, rijetko korisno u bazi).
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

function clip(s, n) {
  const t = String(s || '');
  return t.length <= n ? t : `${t.slice(0, n)}…`;
}

/**
 * Stabilan ID za događaje bez Meta mid-a (dedup po sadržaju događaja).
 */
function syntheticId(prefix, pageId, event, extra = {}) {
  const raw = JSON.stringify({
    prefix,
    pageId,
    ts: event.timestamp,
    sender: event.sender?.id,
    extra
  });
  return clip(`${prefix}_${crypto.createHash('sha256').update(raw).digest('hex').slice(0, 36)}`, 200);
}

/**
 * Visoko-volumenski događaji koje ne spremamo u ChannelMessage.
 */
function shouldSkipHighVolumeEvent(ev) {
  if (ev.read) return true;
  if (ev.delivery) return true;
  return false;
}

/**
 * Jedan messaging događaj → jedan red (ili null ako preskačemo).
 */
function messagingEventToRow(pageId, event) {
  if (shouldSkipHighVolumeEvent(event)) return null;

  const baseThread = threadKey(pageId, event);

  // --- Reakcije ---
  if (event.reaction && typeof event.reaction === 'object') {
    const r = event.reaction;
    const mid = r.mid ? String(r.mid) : 'unknown';
    const action = r.action ? String(r.action) : 'react';
    const emoji = r.emoji != null ? String(r.emoji) : r.reaction != null ? String(r.reaction) : '';
    const extId = syntheticId('fb_rx', pageId, event, { mid, action, emoji });
    const bodyText = `[reakcija] ${action}${emoji ? ` ${emoji}` : ''} · mid ${mid}`;
    return {
      channel: 'MESSENGER',
      source: 'facebook.graph.reaction',
      externalThreadId: baseThread,
      externalMessageId: extId,
      direction: 'inbound',
      bodyText,
      rawPayload: event
    };
  }

  // --- Ispravak poruke (message_edit) ---
  const editPayload = event.message_edit || event.message?.message_edit;
  if (editPayload && typeof editPayload === 'object') {
    const mid = editPayload.mid != null ? String(editPayload.mid) : '';
    const numEdit = editPayload.num_edit != null ? Number(editPayload.num_edit) : 0;
    const txt = editPayload.text != null ? String(editPayload.text) : '';
    const extId = clip(`fb_edit_${mid}_${numEdit}_${event.timestamp}`, 200);
    return {
      channel: 'MESSENGER',
      source: 'facebook.graph.message_edit',
      externalThreadId: baseThread,
      externalMessageId: extId,
      direction: 'inbound',
      bodyText: clip(`[ispravak poruke${numEdit ? ` #${numEdit}` : ''}] ${txt}`, 2000),
      rawPayload: event
    };
  }

  // --- Postback (gumbi, izbornik, Get Started) ---
  if (event.postback && typeof event.postback === 'object') {
    const p = event.postback;
    const title = p.title != null ? String(p.title) : '';
    const payload = p.payload != null ? String(p.payload) : '';
    const extId = syntheticId('fb_pb', pageId, event, { payload: clip(payload, 80) });
    let bodyText = `[postback] ${title ? `${title} · ` : ''}payload=${clip(payload, 400)}`;
    if (p.referral) bodyText += ` · referral=${clip(JSON.stringify(p.referral), 200)}`;
    return {
      channel: 'MESSENGER',
      source: 'facebook.graph.postback',
      externalThreadId: baseThread,
      externalMessageId: extId,
      direction: 'inbound',
      bodyText: clip(bodyText, 2000),
      rawPayload: event
    };
  }

  // --- Povrat / ocjena (feedback) ---
  if (event.feedback && typeof event.feedback === 'object') {
    const extId = syntheticId('fb_fd', pageId, event, {});
    return {
      channel: 'MESSENGER',
      source: 'facebook.graph.feedback',
      externalThreadId: baseThread,
      externalMessageId: extId,
      direction: 'inbound',
      bodyText: clip(`[feedback] ${JSON.stringify(event.feedback)}`, 2000),
      rawPayload: event
    };
  }

  // --- Pozivi (glas/video, dopuštenja, postavke — uglavnom za statistiku / analitiku) ---
  const callPayload =
    event.call != null
      ? event.call
      : event.calls != null
        ? event.calls
        : event.call_permission_reply != null
          ? event.call_permission_reply
          : event.call_settings_update != null
            ? event.call_settings_update
            : null;
  if (callPayload != null) {
    const extId = syntheticId('fb_call', pageId, event, {});
    const bodyText =
      typeof callPayload === 'string' || typeof callPayload === 'number'
        ? `[poziv] ${callPayload}`
        : `[poziv] ${clip(JSON.stringify(callPayload), 1800)}`;
    return {
      channel: 'MESSENGER',
      source: 'facebook.graph.call',
      externalThreadId: baseThread,
      externalMessageId: extId,
      direction: 'inbound',
      bodyText: clip(bodyText, 2000),
      rawPayload: event
    };
  }

  // --- Inbox oznake ---
  const labelPayload = event.label ?? event.labels ?? event.inbox_labels;
  if (labelPayload != null) {
    const extId = syntheticId('fb_lbl', pageId, event, {});
    const bodyText =
      typeof labelPayload === 'string' || typeof labelPayload === 'number'
        ? `[inbox label] ${labelPayload}`
        : `[inbox label] ${clip(JSON.stringify(labelPayload), 1800)}`;
    return {
      channel: 'MESSENGER',
      source: 'facebook.graph.inbox_labels',
      externalThreadId: baseThread,
      externalMessageId: extId,
      direction: 'inbound',
      bodyText,
      rawPayload: event
    };
  }

  // --- Samo referral (npr. otvaranje niti bez teksta u istom paketu) ---
  if (!event.message && event.referral && typeof event.referral === 'object') {
    const ref = event.referral;
    const extId = syntheticId('fb_rf', pageId, event, { ref: ref.ref });
    const bodyText = `[referral] ref=${ref.ref != null ? String(ref.ref) : ''} · source=${ref.source != null ? String(ref.source) : ''} · type=${ref.type != null ? String(ref.type) : ''}`;
    return {
      channel: 'MESSENGER',
      source: 'facebook.graph.referral',
      externalThreadId: baseThread,
      externalMessageId: extId,
      direction: 'inbound',
      bodyText: clip(bodyText, 2000),
      rawPayload: event
    };
  }

  // --- Klasična poruka (tekst / privitci / echo) ---
  if (event.message && typeof event.message === 'object') {
    const isEcho = Boolean(event.message.is_echo);
    const direction = isEcho ? 'outbound' : 'inbound';

    if (event.message.is_edit && event.message.mid) {
      const m = event.message;
      const extId = clip(`fb_edit_${m.mid}_${event.timestamp}`, 200);
      return {
        channel: 'MESSENGER',
        source: 'facebook.graph.message_edit',
        externalThreadId: baseThread,
        externalMessageId: extId,
        direction,
        bodyText: clip(`[ispravak poruke] ${m.text != null ? String(m.text) : ''}`, 2000),
        rawPayload: event
      };
    }

    let bodyText = event.message.text != null ? String(event.message.text) : null;
    const attachments = event.message.attachments;
    if (!bodyText && attachments?.length) {
      bodyText = `[privitci: ${attachments.length}]`;
    }

    if (event.referral && typeof event.referral === 'object') {
      const ref = event.referral;
      const refBit = `[referral ref=${ref.ref != null ? String(ref.ref) : ''} src=${ref.source != null ? String(ref.source) : ''}]`;
      bodyText = bodyText ? `${bodyText} ${refBit}` : refBit;
    }

    return {
      channel: 'MESSENGER',
      source: 'facebook.graph',
      externalThreadId: baseThread,
      externalMessageId: stableMessageId(event, pageId),
      direction,
      bodyText,
      rawPayload: event
    };
  }

  // Nepoznat oblik — spremi kao generički događaj (lakše debugiranje)
  const keys = Object.keys(event).filter((k) => !['sender', 'recipient', 'timestamp'].includes(k));
  if (!keys.length) return null;

  return {
    channel: 'MESSENGER',
    source: 'facebook.graph.unknown',
    externalThreadId: baseThread,
    externalMessageId: syntheticId('fb_uk', pageId, event, { keys }),
    direction: 'inbound',
    bodyText: clip(`[messenger događaj] ${keys.join(', ')}`, 500),
    rawPayload: event
  };
}

function parseFacebookWebhook(body) {
  const rows = [];
  if (!body || !Array.isArray(body.entry)) return rows;

  for (const entry of body.entry) {
    const pageId = entry.id;

    const messaging = entry.messaging || [];
    for (const event of messaging) {
      const row = messagingEventToRow(pageId, event);
      if (row) rows.push(row);
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
