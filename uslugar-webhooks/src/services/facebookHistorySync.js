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

function rowsFromMessages(pageId, psid, messages) {
  const rows = [];
  const list = messages?.data || [];
  for (const m of list) {
    const mid = m.id != null ? String(m.id) : null;
    if (!mid) continue;

    const fromId = m.from?.id != null ? String(m.from.id) : null;
    const direction = fromId === String(pageId) ? 'outbound' : 'inbound';

    let bodyText = m.message != null ? String(m.message) : null;
    if (!bodyText && m.sticker) bodyText = '[sticker]';
    if (!bodyText && m.attachments?.data?.length) {
      bodyText = `[attachments: ${m.attachments.data.length}]`;
    }

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
  /** Eksplicitni podfieldovi attachmenta — inače Graph često ne vraća URL u listi poruka. */
  const msgFields =
    'id,message,from,to,created_time,sticker,attachments{id,mime_type,name,size,file_url,image_data{url},video_data{url}}';

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

module.exports = { syncMessengerHistory };
