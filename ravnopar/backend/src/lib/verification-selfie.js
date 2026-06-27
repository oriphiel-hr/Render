import { validatePhotoDataUrl } from './photo-validation.js';
import { persistPhotos } from './storage.js';

export async function persistVerificationSelfie(profileId, dataUrl) {
  if (!dataUrl) return null;
  if (!validatePhotoDataUrl(dataUrl)) return null;
  const [stored] = await persistPhotos(profileId, [dataUrl]);
  return stored || dataUrl;
}
