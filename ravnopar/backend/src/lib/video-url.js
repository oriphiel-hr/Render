const ALLOWED_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'm.youtube.com',
  'vimeo.com',
  'www.vimeo.com',
  'instagram.com',
  'www.instagram.com',
  'tiktok.com',
  'www.tiktok.com'
];

export function isHostedVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const value = url.trim();
  if (value.startsWith('/media/videos/')) return true;
  try {
    const parsed = new URL(value);
    return parsed.pathname.startsWith('/media/videos/');
  } catch (_error) {
    return false;
  }
}

export function normalizeVideoUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) return null;

  if (value.startsWith('/media/videos/')) {
    const parts = value.slice('/media/videos/'.length).split('/').filter(Boolean);
    if (parts.length !== 2) return null;
    const [profileId, filename] = parts;
    if (!/^[\w-]+$/.test(profileId) || !/^[\w.-]+$/.test(filename)) return null;
    return `/media/videos/${profileId}/${filename}`;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (url.pathname.startsWith('/media/videos/')) {
      return normalizeVideoUrl(url.pathname);
    }
    if (!ALLOWED_HOSTS.includes(url.hostname)) return null;
    return url.toString().slice(0, 500);
  } catch (_error) {
    return null;
  }
}

export function videoEmbedKind(url) {
  if (!url) return null;
  if (isHostedVideoUrl(url)) return 'hosted';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu')) return 'youtube';
    if (parsed.hostname.includes('vimeo')) return 'vimeo';
    return 'link';
  } catch (_error) {
    return null;
  }
}

export function youtubeEmbedId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1);
    return parsed.searchParams.get('v');
  } catch (_error) {
    return null;
  }
}

export function vimeoEmbedId(url) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch (_error) {
    return null;
  }
}
