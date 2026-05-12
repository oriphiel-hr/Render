const crypto = require('crypto');
const { reactionEmojiFromReactionObject } = require('../lib/messengerReactionEmoji');

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
 *
 * Kad na stranici postoji više Messenger aplikacija (Handover), dio događaja stiže u `entry.standby`
 * umjesto u `entry.messaging` — uključujući echo iz Business Suitea. Parser obrađuje oba polja.
 *
 * Page feed (`entry.changes[]`) — komentari, objave, spominjanja itd. Pretplata u Meta konzoli (npr. `feed`,
 * `mention`) + odgovarajuće dozvole aplikacije za čitanje Page sadržaja ako Meta traži.
 */

function stableMessageId(event, pageId) {
  if (event.message?.mid) return event.message.mid;
  const payload = JSON.stringify({ pageId, t: event.timestamp, s: event.sender?.id, r: event.recipient?.id, m: event.message });
  return `fb_${crypto.createHash('sha256').update(payload).digest('hex').slice(0, 48)}`;
}

/**
 * Stabilni thread id: `pageId_psid`.
 * Za Page→korisnik (message_echo, odgovor iz Inboxa) Meta šalje sender=Page, recipient=PSID —
 * nit mora biti pageId_psid, ne pageId_pageId (što bi dalo pogrešan ključ kad je sid Page).
 */
function threadKey(pageId, event) {
  const p = pageId != null ? String(pageId) : '';
  const sid = event.sender?.id != null ? String(event.sender.id) : '';
  const rid = event.recipient?.id != null ? String(event.recipient.id) : '';
  if (!p) return sid || rid || null;

  const msg = event.message && typeof event.message === 'object' ? event.message : null;
  if (msg && sid === p && rid && rid !== p) {
    return `${p}_${rid}`;
  }

  if (sid && sid !== p) {
    return `${p}_${sid}`;
  }
  if (sid === p && rid === p) {
    return `${p}_${p}`;
  }
  if (rid && rid !== p) {
    return `${p}_${rid}`;
  }
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

  // --- Reakcije (message_reactions) — tip je u r.reaction ("like"), emoji često prazan ---
  if (event.reaction && typeof event.reaction === 'object') {
    const r = event.reaction;
    const mid = r.mid ? String(r.mid) : 'unknown';
    const action = r.action ? String(r.action) : 'react';
    const typeKey = r.reaction != null && typeof r.reaction === 'string' ? String(r.reaction).toLowerCase().trim() : '';
    const lead = reactionEmojiFromReactionObject(r);
    const extId = syntheticId('fb_rx', pageId, event, { mid, action, emoji: lead || typeKey });
    const bodyText = clip(
      lead
        ? `${lead} [reakcija] ${action}${typeKey ? ` (${typeKey})` : ''} · mid ${mid}`
        : `[reakcija] ${action}${typeKey ? ` ${typeKey}` : ''} · mid ${mid}`,
      2000
    );
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
    const pStr = pageId != null ? String(pageId) : '';
    const sidStr = event.sender?.id != null ? String(event.sender.id) : '';
    const ridStr = event.recipient?.id != null ? String(event.recipient.id) : '';
    const isEcho = Boolean(event.message.is_echo);
    const pageToUser = Boolean(sidStr === pStr && ridStr && ridStr !== pStr);
    const direction = isEcho || pageToUser ? 'outbound' : 'inbound';

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

    const msg = event.message;
    let bodyText = msg.text != null ? String(msg.text).trim() : '';
    bodyText = bodyText.length ? bodyText : null;

    const attachments = msg.attachments;
    if (!bodyText && attachments?.length) {
      const types = attachments
        .map((a) => {
          if (!a || typeof a !== 'object') return null;
          const t = a.type != null ? String(a.type) : '';
          const payload = a.payload && typeof a.payload === 'object' ? a.payload : null;
          if (t === 'fallback' && payload?.title) return `fallback:${clip(String(payload.title), 48)}`;
          return t || null;
        })
        .filter(Boolean);
      bodyText = types.length
        ? `[privitci: ${types.join(', ')}]`
        : `[privitci: ${attachments.length}]`;
    }

    // Graph/inbox sync koristi sticker polje; webhook ponekad šalje samo sticker_id.
    if (!bodyText && msg.sticker_id != null) {
      bodyText = `[sticker] id=${String(msg.sticker_id)}`;
    }

    /** Tap/lajk često dolazi kao prazna poruka; message_reactions daje 👍 u zasebnom događaju. */
    if (!bodyText) {
      bodyText = '👍 [bez teksta]';
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
      bodyText: clip(bodyText, 2000),
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

/**
 * Page feed / Page changes webhook (komentari, reakcije na objavu, mention, …).
 * https://developers.facebook.com/docs/graph-api/webhooks/reference/page/#fields
 */
function feedChangeToRow(pageId, ch) {
  const page = pageId != null ? String(pageId) : '';
  const fieldRaw = ch.field != null ? String(ch.field) : 'unknown';
  const fieldKey = fieldRaw.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 64) || 'unknown';
  const v = ch.value && typeof ch.value === 'object' ? ch.value : {};
  const verb = v.verb != null ? String(v.verb) : '';
  const postId = v.post_id != null ? String(v.post_id) : v.post?.id != null ? String(v.post.id) : '';
  const commentId = v.comment_id != null ? String(v.comment_id) : '';
  const fromId = v.from?.id != null ? String(v.from.id) : '';

  const sourceByField = {
    feed: 'facebook.graph.feed',
    mention: 'facebook.graph.feed.mention'
  };
  const source =
    sourceByField[fieldRaw] ||
    (fieldRaw === 'comments' || fieldRaw.startsWith('comment')
      ? 'facebook.graph.feed.comment'
      : `facebook.graph.feed.${fieldKey}`);

  const timePart = ch.time != null ? String(ch.time) : '';
  let externalMessageId;
  if (commentId) {
    externalMessageId = clip(`feed_c_${commentId}_${verb || 'u'}_${timePart}`, 200);
  } else if (postId) {
    externalMessageId = clip(`feed_p_${postId}_${fieldKey}_${timePart}`, 200);
  } else {
    externalMessageId = syntheticId('fb_feed', page, ch, { field: fieldRaw });
  }

  const textBits = [
    v.message,
    v.text,
    v.item,
    v.comment_text,
    v.post?.message,
    v.post_message
  ].filter((x) => x != null && String(x).trim() !== '');
  const textContent = textBits.length ? String(textBits[0]) : '';

  let bodyText = `[feed:${fieldRaw}]`;
  if (verb) bodyText += ` · ${verb}`;
  if (postId) bodyText += ` · post=${postId}`;
  if (commentId) bodyText += ` · comment=${commentId}`;
  if (fromId) bodyText += ` · from=${fromId}`;
  if (textContent) bodyText += ` · ${clip(textContent, 600)}`;

  const externalThreadId =
    postId && page ? `${page}_${postId}` : page ? String(page) : postId ? `post_${postId}` : null;

  return {
    channel: 'FACEBOOK_PAGE_FEED',
    source,
    externalThreadId,
    externalMessageId,
    direction: 'inbound',
    bodyText: clip(bodyText, 2000),
    rawPayload: ch
  };
}

function tagStandbySource(row) {
  if (!row || row.source !== 'facebook.graph') return row;
  return { ...row, source: 'facebook.graph.standby' };
}

function parseFacebookWebhook(body) {
  const rows = [];
  if (!body || !Array.isArray(body.entry)) return rows;

  for (const entry of body.entry) {
    const pageId = entry.id;

    const messaging = Array.isArray(entry.messaging) ? entry.messaging : [];
    for (const event of messaging) {
      const row = messagingEventToRow(pageId, event);
      if (row) rows.push(row);
    }

    const standby = Array.isArray(entry.standby) ? entry.standby : [];
    for (const event of standby) {
      const row = messagingEventToRow(pageId, event);
      if (row) rows.push(tagStandbySource(row));
    }

    const changes = entry.changes || [];
    for (const ch of changes) {
      rows.push(feedChangeToRow(pageId, ch));
    }
  }

  return rows;
}

module.exports = { parseFacebookWebhook };
