/**
 * S3 Storage Service - Upload i download datoteka u AWS S3
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined // Ako nema credentials, koristi IAM role (za ECS)
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const INVOICES_PREFIX = 'invoices/'; // Prefix za fakture u S3 bucketu

/**
 * Upload PDF fakture u S3
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {String} invoiceNumber - Broj fakture (npr. "2025-0001")
 * @returns {Promise<String>} - S3 URL fakture
 */
export async function uploadInvoicePDF(pdfBuffer, invoiceNumber) {
  try {
    if (!BUCKET_NAME) {
      console.warn('[S3] AWS_S3_BUCKET_NAME not configured, skipping S3 upload');
      return null;
    }

    const key = `${INVOICES_PREFIX}${invoiceNumber}.pdf`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      ContentDisposition: `attachment; filename="faktura-${invoiceNumber}.pdf"`,
      // Storage Class: Standard (default) - za česte pristupe
      // Za optimizaciju troškova, možete koristiti Intelligent-Tiering ili lifecycle policies
      // StorageClass: 'INTELLIGENT_TIERING', // Automatski optimizira storage class ovisno o pristupu
      // Metadata za pretraživanje
      Metadata: {
        'invoice-number': invoiceNumber,
        'uploaded-at': new Date().toISOString()
      }
    });

    await s3Client.send(command);

    // Generiraj public URL (ili presigned URL ako je bucket private)
    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${key}`;
    
    console.log(`[S3] Invoice PDF uploaded: ${s3Url}`);
    
    return s3Url;
  } catch (error) {
    console.error('[S3] Error uploading invoice PDF to S3:', error);
    // Ne baci grešku - faktura može biti generirana i bez S3 storage
    return null;
  }
}

/**
 * Generira presigned URL za preuzimanje PDF fakture (za private bucket)
 * @param {String} invoiceNumber - Broj fakture
 * @param {Number} expiresIn - Vrijeme trajanja URL-a u sekundama (default: 1 sat)
 * @returns {Promise<String|null>} - Presigned URL ili null ako ne postoji
 */
export async function getInvoicePDFPresignedUrl(invoiceNumber, expiresIn = 3600) {
  try {
    if (!BUCKET_NAME) {
      return null;
    }

    const key = `${INVOICES_PREFIX}${invoiceNumber}.pdf`;

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    
    return presignedUrl;
  } catch (error) {
    console.error('[S3] Error generating presigned URL:', error);
    return null;
  }
}

/**
 * Download PDF fakture iz S3
 * @param {String} invoiceNumber - Broj fakture
 * @returns {Promise<Buffer|null>} - PDF buffer ili null ako ne postoji
 */
export async function downloadInvoicePDF(invoiceNumber) {
  try {
    if (!BUCKET_NAME) {
      return null;
    }

    const key = `${INVOICES_PREFIX}${invoiceNumber}.pdf`;

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    const response = await s3Client.send(command);
    
    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    return buffer;
  } catch (error) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      console.log(`[S3] Invoice PDF not found in S3: ${invoiceNumber}`);
      return null;
    }
    console.error('[S3] Error downloading invoice PDF from S3:', error);
    return null;
  }
}

/**
 * Obriši PDF fakturu iz S3
 * @param {String} invoiceNumber - Broj fakture
 * @returns {Promise<Boolean>} - true ako je uspješno obrisano
 */
export async function deleteInvoicePDF(invoiceNumber) {
  try {
    if (!BUCKET_NAME) {
      return false;
    }

    const key = `${INVOICES_PREFIX}${invoiceNumber}.pdf`;

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    await s3Client.send(command);
    
    console.log(`[S3] Invoice PDF deleted: ${key}`);
    
    return true;
  } catch (error) {
    console.error('[S3] Error deleting invoice PDF from S3:', error);
    return false;
  }
}

/**
 * Provjeri da li je S3 konfiguriran
 * @returns {Boolean} - true ako je S3 konfiguriran
 */
export function isS3Configured() {
  const configured = !!BUCKET_NAME && BUCKET_NAME !== 'uslugar-invoices' || (!!BUCKET_NAME && BUCKET_NAME === 'uslugar-invoices' && !!process.env.AWS_REGION);
  if (!configured) {
    console.log('[S3] S3 not configured - BUCKET_NAME:', BUCKET_NAME, 'AWS_REGION:', process.env.AWS_REGION, 'process.env.AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME);
  } else {
    console.log('[S3] S3 configured - BUCKET_NAME:', BUCKET_NAME, 'AWS_REGION:', process.env.AWS_REGION);
  }
  return configured;
}

