/**
 * Pronalazi HTTPS URL slike stickera / privitka u Graph Message objektu ili webhook `message` čvoru.
 */

function pickHttpUrl(obj, depth) {
  if (depth <= 0 || !obj || typeof obj !== 'object') return null;
  const keys = ['url', 'preview_url', 'src', 'file_url', 'reusable_url'];
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && /^https?:\/\//i.test(v.trim())) return v.trim();
  }
  if (obj.image_data && typeof obj.image_data === 'object') {
    const u = pickHttpUrl(obj.image_data, depth - 1);
    if (u) return u;
  }
  if (obj.video_data && typeof obj.video_data === 'object') {
    const u = pickHttpUrl(obj.video_data, depth - 1);
    if (u) return u;
  }
  return null;
}

function messageNodeFromRaw(rawPayload) {
  if (!rawPayload || typeof rawPayload !== 'object') return null;
  if (rawPayload.message && typeof rawPayload.message === 'object') return rawPayload.message;
  if (rawPayload.id != null && (rawPayload.from != null || rawPayload.created_time != null)) return rawPayload;
  return null;
}

/**
 * @param {unknown} rawPayload — Graph Message (sink) ili cijeli webhook messaging event
 * @returns {string | null}
 */
function stickerPreviewUrlFromMessengerRaw(rawPayload) {
  const msg = messageNodeFromRaw(rawPayload);
  if (!msg || typeof msg !== 'object') return null;

  const sticker = msg.sticker;
  if (typeof sticker === 'string' && /^https?:\/\//i.test(sticker.trim())) return sticker.trim();
  if (sticker && typeof sticker === 'object') {
    const direct = pickHttpUrl(sticker, 4);
    if (direct) return direct;
    const imgs = sticker.images?.data;
    if (Array.isArray(imgs)) {
      for (const im of imgs) {
        const u = pickHttpUrl(im, 3);
        if (u) return u;
      }
    }
  }

  const atts = Array.isArray(msg.attachments?.data) ? msg.attachments.data : [];
  for (const a of atts) {
    if (!a || typeof a !== 'object') continue;
    const payload = a.payload && typeof a.payload === 'object' ? a.payload : {};
    const u =
      pickHttpUrl(payload, 4) ||
      pickHttpUrl(a, 4) ||
      (typeof payload.url === 'string' && /^https?:\/\//i.test(payload.url.trim()) ? payload.url.trim() : null);
    if (u) return u;
  }

  return null;
}

module.exports = { stickerPreviewUrlFromMessengerRaw };
