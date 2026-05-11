/**
 * Povijesne Messenger poruke preko Graph API (Page access token + pages_messaging).
 * Ne zamjenjuje webhook — dopunjava bazu retroaktivno.
 */

const DEFAULT_VERSION = 'v21.0';

async function graphFetch(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) {
    const msg = data.error.message || JSON.stringify(data.error);
    const code = data.error.code != null ? ` (${data.error.code})` : '';
    throw new Error(`Graph API${code}: ${msg}`);
  }
  return data;
}

function psidFromParticipants(pageId, participants) {
  const arr = participants?.data || [];
  for (const p of arr) {
    if (p.id && String(p.id) !== String(pageId)) return String(p.id);
  }
  return null;
}

/** Meta „tap to like“ / default thumbs sticker product IDs (Graph / Send API). */
const KNOWN_MESSENGER_LIKE_STICKER_IDS = new Set([
  '369239263222822',
  '369239343222814',
  '369239453222866',
  '369239383222814'
]);

function clip(s, n) {
  const t = String(s || '');
  return t.length <= n ? t : `${t.slice(0, n)}…`;
}

function stickerIdFromGraphValue(sticker) {
  if (sticker == null) return null;
  if (typeof sticker === 'number' && Number.isFinite(sticker)) return String(Math.trunc(sticker));
  if (typeof sticker === 'string') {
    const m = sticker.match(/(?:sticker[_-]?id=|\/)(\d{12,})(?:\b|\.)/i);
    if (m) return m[1];
    return null;
  }
  if (typeof sticker === 'object') {
    const id = sticker.sticker_id ?? sticker.id ?? sticker.sticker_product_id;
    if (id != null) return String(id);
  }
  return null;
}

function attachmentStickerIds(att) {
  const ids = [];
  if (!att || typeof att !== 'object') return ids;
  const p = att.payload && typeof att.payload === 'object' ? att.payload : {};
  for (const k of ['sticker_id', 'sticker_product_id']) {
    if (p[k] != null) ids.push(String(p[k]));
    if (att[k] != null) ids.push(String(att[k]));
  }
  return ids;
}

/**
 * Sažetak teksta za jednu Graph poruku (konverzacija /messages).
 * Koristi se pri sinku i pri backfillu iz rawPayload.
 */
function bodyTextFromGraphMessage(m) {
  let bodyText = m.message != null ? String(m.message).trim() : '';
  bodyText = bodyText.length ? bodyText : null;

  const atts = Array.isArray(m.attachments?.data) ? m.attachments.data : [];

  for (const sid of [stickerIdFromGraphValue(m.sticker), ...atts.flatMap(attachmentStickerIds)]) {
    if (sid && KNOWN_MESSENGER_LIKE_STICKER_IDS.has(sid)) {
      return '👍 [Messenger lajk]';
    }
  }

  if (!bodyText && m.sticker != null && m.sticker !== false) {
    const sid = stickerIdFromGraphValue(m.sticker);
    bodyText = sid ? `[sticker] id=${sid}` : '[sticker]';
  }

  if (!bodyText && atts.length) {
    const types = atts
      .map((a) => {
        if (!a || typeof a !== 'object') return null;
        const t = a.type != null ? String(a.type) : '';
        const p = a.payload && typeof a.payload === 'object' ? a.payload : null;
        if (t === 'image' && p?.sticker_id != null) return `image:sticker_id=${p.sticker_id}`;
        return t || null;
      })
      .filter(Boolean);
    bodyText = types.length ? `[privitci: ${types.join(', ')}]` : `[privitci: ${atts.length}]`;
  }

  if (!bodyText && (m.story || m.shares)) {
    bodyText = '[dijeljenje / story bez teksta]';
  }

  if (!bodyText) {
    bodyText =
      '[bez teksta · Graph sync — Meta često ne šalje sticker za lajk; ako trebaš povijest, probaj webhook message_reactions]';
  }

  return clip(bodyText, 2000);
}

function rowsFromMessages(pageId, psid, messages) {
  const rows = [];
  const list = messages?.data || [];
  for (const m of list) {
    const mid = m.id != null ? String(m.id) : null;
    if (!mid) continue;

    const fromId = m.from?.id != null ? String(m.from.id) : null;
    const direction = fromId === String(pageId) ? 'outbound' : 'inbound';

    const bodyText = bodyTextFromGraphMessage(m);

    let createdAt = new Date();
    if (m.created_time) {
      const d = new Date(m.created_time);
      if (!Number.isNaN(d.getTime())) createdAt = d;
    }

    rows.push({
      channel: 'MESSENGER',
      source: 'facebook.graph.sync',
      externalThreadId: psid ? `${pageId}_${psid}` : null,
      externalMessageId: mid,
      direction,
      bodyText,
      rawPayload: m,
      createdAt
    });
  }
  return rows;
}

/**
 * @param {{
 *   pageId: string,
 *   accessToken: string,
 *   maxConversations?: number,
 *   maxMessages?: number,
 *   apiVersion?: string
 * }} opts
 */
async function syncMessengerHistory(opts) {
  const pageId = String(opts.pageId).trim();
  const accessToken = String(opts.accessToken).trim();
  const maxConversations = Math.min(Math.max(Number(opts.maxConversations) || 30, 1), 200);
  const maxMessages = Math.min(Math.max(Number(opts.maxMessages) || 3000, 1), 20000);
  const apiVersion = opts.apiVersion || DEFAULT_VERSION;

  if (!pageId || !accessToken) {
    throw new Error('pageId i accessToken su obavezni');
  }

  const base = `https://graph.facebook.com/${apiVersion}`;
  /** `payload` na attachmentu nosi sticker_id za Messenger lajk/thumb kad nema teksta. */
  const msgFields =
    'id,message,from,to,created_time,sticker,attachments{id,mime_type,name,size,file_url,image_data{url},video_data{url},payload}';

  const allRows = [];
  let convUrl =
    `${base}/${encodeURIComponent(pageId)}/conversations?platform=messenger` +
    `&limit=25&fields=participants{id},messages.limit(100){${msgFields}}` +
    `&access_token=${encodeURIComponent(accessToken)}`;

  let convProcessed = 0;

  while (convUrl && convProcessed < maxConversations && allRows.length < maxMessages) {
    const page = await graphFetch(convUrl);
    const convs = page.data || [];

    for (const conv of convs) {
      if (convProcessed >= maxConversations || allRows.length >= maxMessages) break;
      convProcessed += 1;

      const psid = psidFromParticipants(pageId, conv.participants);
      let messages = conv.messages;

      if (!messages?.data?.length && conv.id) {
        let mUrl =
          `${base}/${encodeURIComponent(conv.id)}/messages?fields=${msgFields}` +
          `&limit=100&access_token=${encodeURIComponent(accessToken)}`;
        while (mUrl && allRows.length < maxMessages) {
          const mPage = await graphFetch(mUrl);
          const chunk = rowsFromMessages(pageId, psid, { data: mPage.data });
          for (const r of chunk) {
            allRows.push(r);
            if (allRows.length >= maxMessages) break;
          }
          mUrl =
            allRows.length >= maxMessages
              ? null
              : mPage.paging?.next || null;
        }
        continue;
      }

      let mUrl = null;
      if (messages) {
        const chunk = rowsFromMessages(pageId, psid, messages);
        for (const r of chunk) {
          allRows.push(r);
          if (allRows.length >= maxMessages) break;
        }
        mUrl = messages.paging?.next || null;
      }

      while (mUrl && allRows.length < maxMessages) {
        const mPage = await graphFetch(mUrl);
        const chunk = rowsFromMessages(pageId, psid, { data: mPage.data });
        for (const r of chunk) {
          allRows.push(r);
          if (allRows.length >= maxMessages) break;
        }
        mUrl = mPage.paging?.next || null;
      }
    }

    convUrl =
      convProcessed >= maxConversations || allRows.length >= maxMessages
        ? null
        : page.paging?.next || null;
  }

  return allRows;
}

/**
 * Popravi `bodyText` za stare sink redove iz `rawPayload` (Graph Message objekt).
 * @param {import('@prisma/client').PrismaClient} db
 * @param {{ batchSize?: number }} [opts]
 */
async function backfillGraphSyncBodyText(db, opts = {}) {
  const batchSize = Math.min(Math.max(Number(opts.batchSize) || 400, 50), 2000);
  let scanned = 0;
  let updated = 0;

  while (true) {
    const rows = await db.channelMessage.findMany({
      where: {
        source: 'facebook.graph.sync',
        OR: [{ bodyText: null }, { bodyText: '' }]
      },
      select: { id: true, bodyText: true, rawPayload: true },
      take: batchSize,
      orderBy: { id: 'asc' }
    });
    if (!rows.length) break;
    scanned += rows.length;
    for (const r of rows) {
      const raw = r.rawPayload;
      if (!raw || typeof raw !== 'object') continue;
      const next = bodyTextFromGraphMessage(raw);
      if (next && next !== r.bodyText) {
        await db.channelMessage.update({ where: { id: r.id }, data: { bodyText: next } });
        updated += 1;
      }
    }
    if (rows.length < batchSize) break;
  }

  return { scanned, updated };
}

module.exports = { syncMessengerHistory, bodyTextFromGraphMessage, backfillGraphSyncBodyText };
