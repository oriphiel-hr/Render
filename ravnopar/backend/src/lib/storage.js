import { validatePhotoDataUrl } from './photo-validation.js';

export async function persistPhotos(profileId, photos) {
  const normalized = photos.filter(validatePhotoDataUrl).slice(0, 3);

  const bucket = process.env.S3_BUCKET?.trim();
  const endpoint = process.env.S3_ENDPOINT?.trim();
  const accessKey = process.env.S3_ACCESS_KEY?.trim();
  const secretKey = process.env.S3_SECRET_KEY?.trim();
  const publicBase = process.env.S3_PUBLIC_BASE_URL?.trim();

  if (!bucket || !endpoint || !accessKey || !secretKey || !publicBase) {
    return normalized;
  }

  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: true
    });

    const urls = [];
    for (let i = 0; i < normalized.length; i += 1) {
      const dataUrl = normalized[i];
      if (!dataUrl.startsWith('data:image/')) {
        urls.push(dataUrl);
        continue;
      }
      const [, meta, base64] = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/) || [];
      if (!meta || !base64) continue;
      const ext = meta.includes('png') ? 'png' : 'jpg';
      const key = `profiles/${profileId}/${Date.now()}-${i}.${ext}`;
      const body = Buffer.from(base64, 'base64');
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: meta
        })
      );
      urls.push(`${publicBase.replace(/\/$/, '')}/${key}`);
    }
    return urls.length > 0 ? urls : normalized;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[storage] S3 upload failed, using inline photos', error?.message);
    return normalized;
  }
}
