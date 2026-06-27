const MAX_PHOTO_CHARS = 600_000;

export function validatePhotoDataUrl(value) {
  if (typeof value !== 'string') return false;
  if (!value.startsWith('data:image/')) return false;
  if (value.length > MAX_PHOTO_CHARS) return false;
  return true;
}

export function validatePhotosArray(photos) {
  if (!Array.isArray(photos)) return false;
  if (photos.length > 3) return false;
  return photos.every(validatePhotoDataUrl);
}
