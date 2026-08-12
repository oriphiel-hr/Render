import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Max upload size: 30 MB */
export const VIDEO_MAX_BYTES = 30 * 1024 * 1024;

export const VIDEO_MIME_TO_EXT = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov'
};

export function getUploadsRoot() {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) return path.resolve(configured);
  return path.resolve(__dirname, '../../data/uploads');
}

export function getVideosRoot() {
  return path.join(getUploadsRoot(), 'videos');
}

export function isHostedVideoPath(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    if (url.startsWith('/media/videos/')) return true;
    const parsed = new URL(url);
    return parsed.pathname.startsWith('/media/videos/');
  } catch (_error) {
    return false;
  }
}

export function hostedVideoPublicPath(profileId, filename) {
  return `/media/videos/${profileId}/${filename}`;
}

function absolutePathFromPublicUrl(url) {
  if (!url) return null;
  let pathname = url;
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      pathname = new URL(url).pathname;
    }
  } catch (_error) {
    return null;
  }
  if (!pathname.startsWith('/media/videos/')) return null;
  const relative = pathname.replace(/^\/media\/videos\//, '');
  const parts = relative.split('/').filter(Boolean);
  if (parts.length !== 2) return null;
  const [profileId, filename] = parts;
  if (!/^[\w-]+$/.test(profileId) || !/^[\w.-]+$/.test(filename)) return null;
  return path.join(getVideosRoot(), profileId, filename);
}

export async function ensureVideosRoot() {
  await fs.mkdir(getVideosRoot(), { recursive: true });
}

export async function persistProfileVideo(profileId, file) {
  const ext = VIDEO_MIME_TO_EXT[file.mimetype];
  if (!ext) {
    throw Object.assign(new Error('UNSUPPORTED_VIDEO_TYPE'), { code: 'UNSUPPORTED_VIDEO_TYPE' });
  }
  if (!file.buffer?.length) {
    throw Object.assign(new Error('EMPTY_VIDEO'), { code: 'EMPTY_VIDEO' });
  }
  if (file.buffer.length > VIDEO_MAX_BYTES) {
    throw Object.assign(new Error('VIDEO_TOO_LARGE'), { code: 'VIDEO_TOO_LARGE' });
  }

  const dir = path.join(getVideosRoot(), profileId);
  await fs.mkdir(dir, { recursive: true });

  const filename = `${Date.now()}.${ext}`;
  const fullPath = path.join(dir, filename);
  await fs.writeFile(fullPath, file.buffer);

  return hostedVideoPublicPath(profileId, filename);
}

export async function deleteHostedVideo(url) {
  const fullPath = absolutePathFromPublicUrl(url);
  if (!fullPath) return false;
  try {
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    // eslint-disable-next-line no-console
    console.error('[video-storage] delete failed', error?.message);
    return false;
  }
}

export async function deleteProfileVideoDir(profileId) {
  if (!profileId || !/^[\w-]+$/.test(profileId)) return;
  const dir = path.join(getVideosRoot(), profileId);
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[video-storage] dir cleanup failed', error?.message);
  }
}
