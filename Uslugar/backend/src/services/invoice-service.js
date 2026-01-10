/**
 * Invoice Service - Generiranje PDF faktura
 */

import PDFDocument from 'pdfkit';
import { prisma } from '../lib/prisma.js';
import { sendInvoiceEmail } from '../lib/email.js';
import { fiscalizeInvoice, requiresFiscalization, generateQRCodeURL } from './fiscalization-service.js';
import { uploadInvoicePDF, downloadInvoicePDF, isS3Configured } from '../lib/s3-storage.js';

/**
 * Generira jedinstveni broj fakture
 * Format: YYYY-XXXX (npr. 2025-0001, 2025-0002, itd.)
 * Broj se resetira na 1 svake godine
 */
export async function generateInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  
  // Pronađi zadnji broj fakture za ovu godinu (ignorira storno fakture za sekvenciju)
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: `${year}-`
      },
      // Ne uključi storno fakture u sekvenciju (one imaju negativne iznose)
      amount: { gte: 0 }
    },
    orderBy: {
      invoiceNumber: 'desc'
    }
  });

  let sequence = 1;
  if (lastInvoice) {
    // Izvadi sekvenciju iz broja fakture (zadnje 4 znamenke nakon godine)
    // Format: YYYY-XXXX
    const parts = lastInvoice.invoiceNumber.split('-');
    if (parts.length >= 2) {
      const lastSequence = parseInt(parts[parts.length - 1]);
      sequence = lastSequence + 1;
    }
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  return `${year}-${sequenceStr}`;
}

/**
 * Kreira novu fakturu u bazi
 */
export async function createInvoice(data) {
  const {
    userId,
    type,
    amount,
    currency = 'EUR',
    subscriptionId,
    leadPurchaseId,
    stripePaymentIntentId,
    stripeInvoiceId
  } = data;

  // Izračunaj PDV (25% za Hrvatsku)
  const taxRate = 0.25;
  const taxAmount = Math.round(amount * taxRate);
  const totalAmount = amount + taxAmount;

  // Generiraj broj fakture
  const invoiceNumber = await generateInvoiceNumber();

  // Postavi due date (14 dana od issue date)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  const invoice = await prisma.invoice.create({
    data: {
      userId,
      invoiceNumber,
      type,
      status: 'DRAFT',
      amount,
      currency,
      taxAmount,
      totalAmount,
      subscriptionId,
      leadPurchaseId,
      stripePaymentIntentId,
      stripeInvoiceId,
      issueDate: new Date(),
      dueDate
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          companyName: true,
          taxId: true,
          city: true
        }
      },
      subscription: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      },
      leadPurchase: {
        include: {
          job: {
            select: {
              title: true
            }
          }
        }
      }
    }
  });

  return invoice;
}

/**
 * Generira PDF fakturu s Uslugar brandingom
 */
export async function generateInvoicePDF(invoice) {
  return new Promise(async (resolve, reject) => {
    try {
      // Ako je storno faktura, dohvati originalnu fakturu za prikaz broja
      let originalInvoice = null;
      if (invoice.originalInvoiceId) {
        originalInvoice = await prisma.invoice.findUnique({
          where: { id: invoice.originalInvoiceId },
          select: { invoiceNumber: true }
        });
      }
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // ============================================
      // HEADER - Uslugar branding
      // ============================================
      doc
        .fillColor('#4CAF50') // Uslugar zelena
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('USLUGAR', 50, 50, { align: 'left' })
        .fillColor('#333333')
        .fontSize(10)
        .font('Helvetica')
        .text('Platforma za povezivanje korisnika i pružatelja usluga', 50, 80);

      // ============================================
      // COMPANY INFO (Desno)
      // ============================================
      const companyInfo = [
        'ORIPHIEL d.o.o.',
        'OIB: 88070789896',
        'Slavenskoga ulica 5',
        '10000 Zagreb',
        'Direktor: Tomislav Kranjec',
        'Email: <TREBA UNIJETI KAD SE PREBACI NA PRODUKCIJU>',
        'Web: <TREBA UNIJETI KAD SE PREBACI NA PRODUKCIJU>'
      ];

      let yPos = 50;
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('IZDAVATELJ:', 400, yPos, { align: 'left' });
      yPos += 15;
      doc
        .font('Helvetica')
        .fontSize(8);
      companyInfo.forEach(line => {
        doc.text(line, 400, yPos, { align: 'left' });
        yPos += 12;
      });

      // ============================================
      // INVOICE DETAILS
      // ============================================
      yPos = 180;
      const isStornoTitle = invoice.isStorno || invoice.amount < 0;
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .fillColor(isStornoTitle ? '#DC2626' : '#333333')
        .text(isStornoTitle ? 'STORNO FAKTURA' : 'FAKTURA', 50, yPos)
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#333333')
        .text(`Broj: ${invoice.invoiceNumber}`, 50, yPos + 30);
      
      if (originalInvoice && invoice.originalInvoiceId) {
        doc
          .fontSize(10)
          .fillColor('#666666')
          .text(`Storno fakture: ${originalInvoice.invoiceNumber}`, 50, yPos + 45);
        yPos += 15;
      }
      
      doc
        .fontSize(12)
        .fillColor('#333333')
        .text(`Datum izdavanja: ${formatDate(invoice.issueDate)}`, 50, yPos + 45)
        .text(`Rok plaćanja: ${formatDate(invoice.dueDate)}`, 50, yPos + 60);

      // ============================================
      // CUSTOMER INFO
      // ============================================
      yPos += 100;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('KUPAC:', 50, yPos)
        .font('Helvetica')
        .fontSize(9);

      const customerInfo = [
        invoice.user.fullName,
        invoice.user.email
      ];

      if (invoice.user.companyName) {
        customerInfo.push(`Tvrtka: ${invoice.user.companyName}`);
      }
      if (invoice.user.taxId) {
        customerInfo.push(`OIB: ${invoice.user.taxId}`);
      }
      if (invoice.user.city) {
        customerInfo.push(`Grad: ${invoice.user.city}`);
      }

      yPos += 15;
      customerInfo.forEach(line => {
        doc.text(line, 50, yPos);
        yPos += 12;
      });

      // ============================================
      // INVOICE ITEMS TABLE
      // ============================================
      yPos += 40;
      doc.fontSize(10).font('Helvetica-Bold');
      
      // Table header
      doc
        .fillColor('#4CAF50')
        .rect(50, yPos, 495, 25)
        .fill()
        .fillColor('#FFFFFF')
        .text('Opis usluge', 60, yPos + 7)
        .text('Količina', 280, yPos + 7)
        .text('Cijena', 380, yPos + 7)
        .text('Ukupno', 470, yPos + 7);

      // Table row
      yPos += 25;
      const description = getInvoiceDescription(invoice);
      const isStorno = invoice.isStorno || invoice.amount < 0;
      
      doc
        .fillColor('#333333')
        .font('Helvetica')
        .rect(50, yPos, 495, 35)
        .stroke();
      
      // Ako je storno faktura, prikaži jasno
      if (isStorno) {
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor('#DC2626') // Crvena za storno
          .text('STORNO FAKTURA', 60, yPos + 5, { width: 200 });
        
        yPos += 15;
      }
      
      // Opis usluge - podebljano i jasno
      doc
        .fillColor('#333333')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(description.title, 60, yPos + 8, { width: 200 });
      
      if (description.details) {
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#666666')
          .text(description.details, 60, yPos + 20, { width: 200 });
      }
      
      // Ako je storno, prikaži vezu na originalnu fakturu
      if (invoice.originalInvoiceId && originalInvoice) {
        doc
          .font('Helvetica')
          .fontSize(7)
          .fillColor('#666666')
          .text(`Storno fakture: ${originalInvoice.invoiceNumber}`, 60, yPos + 28, { width: 200 });
      }
      
      // Prikaži negativan iznos ako je storno
      const amount = Math.abs(invoice.amount / 100);
      const displayAmount = isStorno ? `-${formatCurrency(amount)}` : formatCurrency(amount);
      
      doc
        .fillColor(isStorno ? '#DC2626' : '#333333')
        .font('Helvetica')
        .fontSize(10)
        .text('1', 280, yPos + 10)
        .text(displayAmount, 380, yPos + 10)
        .text(displayAmount, 470, yPos + 10);

      // ============================================
      // TOTALS
      // ============================================
      yPos += 50;
      doc.fontSize(10);
      
      // isStorno is already defined above (line 276)
      const totalsX = 380;
      const baseAmount = Math.abs(invoice.amount / 100);
      const taxAmount = Math.abs(invoice.taxAmount / 100);
      const totalAmount = Math.abs(invoice.totalAmount / 100);
      
      doc
        .fillColor('#333333')
        .text('Osnovica:', totalsX, yPos, { align: 'right', width: 100 })
        .text(isStorno ? `-${formatCurrency(baseAmount)}` : formatCurrency(baseAmount), totalsX + 110, yPos, { align: 'right', width: 60 });

      yPos += 15;
      doc
        .text('PDV (25%):', totalsX, yPos, { align: 'right', width: 100 })
        .text(isStorno ? `-${formatCurrency(taxAmount)}` : formatCurrency(taxAmount), totalsX + 110, yPos, { align: 'right', width: 60 });

      yPos += 20;
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor(isStorno ? '#DC2626' : '#4CAF50')
        .text('UKUPNO:', totalsX, yPos, { align: 'right', width: 100 })
        .text(isStorno ? `-${formatCurrency(totalAmount)}` : formatCurrency(totalAmount), totalsX + 110, yPos, { align: 'right', width: 60 });

      // ============================================
      // FISCAL INFO (ZKI/JIR) - HR Fiskalizacija
      // ============================================
      let fiscalY = 720;
      if (invoice.zkiCode || invoice.jirCode) {
        doc
          .fillColor('#333333')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('FISKALIZACIJA:', 50, fiscalY)
          .font('Helvetica');
        
        fiscalY += 12;
        if (invoice.zkiCode) {
          doc.text(`ZKI: ${invoice.zkiCode}`, 50, fiscalY);
          fiscalY += 10;
        }
        if (invoice.jirCode) {
          doc.text(`JIR: ${invoice.jirCode}`, 50, fiscalY);
          fiscalY += 10;
        }
        if (invoice.qrCodeUrl) {
          doc
            .fontSize(7)
            .fillColor('#0066CC')
            .text(`Verifikacija: ${invoice.qrCodeUrl}`, 50, fiscalY, { link: invoice.qrCodeUrl });
          fiscalY += 15;
        }
        
        fiscalY += 5;
      }

      // ============================================
      // FOOTER
      // ============================================
      const footerY = fiscalY + 10;
      doc
        .fillColor('#666666')
        .fontSize(8)
        .font('Helvetica')
        .text('Hvala vam na povjerenju!', 50, footerY, { align: 'center', width: 495 })
        .text('Ova faktura je automatski generirana.', 50, footerY + 15, { align: 'center', width: 495 });

      // Payment info
      if (invoice.stripePaymentIntentId || invoice.stripeInvoiceId) {
        doc
          .text(`Stripe Payment ID: ${invoice.stripePaymentIntentId || invoice.stripeInvoiceId}`, 
            50, footerY + 35, { align: 'center', width: 495 });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Helper funkcije
 */
function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('hr-HR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function formatCurrency(amount) {
  return `${amount.toFixed(2)} €`;
}

function getInvoiceDescription(invoice) {
  if (invoice.type === 'SUBSCRIPTION' && invoice.subscription) {
    const planNames = {
      'BASIC': 'Basic Plan',
      'PREMIUM': 'Premium Plan',
      'PRO': 'Pro Plan'
    };
    const planName = planNames[invoice.subscription.plan] || invoice.subscription.plan;
    return {
      title: `Pretplata na Uslugar platformu - ${planName}`,
      details: `Mjesečna pretplata za pristup Uslugar platformi za povezivanje korisnika i pružatelja usluga. Plan: ${planName}`
    };
  } else if (invoice.type === 'LEAD_PURCHASE' && invoice.leadPurchase) {
    const jobTitle = invoice.leadPurchase.job?.title || 'Lead';
    return {
      title: `Kupovina ekskluzivnog leada: ${jobTitle}`,
      details: `Kupovina ekskluzivnog leada za posao "${jobTitle}" na Uslugar platformi. Pružatelj dobiva ekskluzivni pristup kontakt podacima klijenta.`
    };
  }
  return {
    title: 'Usluga na Uslugar platformi',
    details: 'Usluga povezivanja korisnika i pružatelja usluga'
  };
}

/**
 * Sačuvaj PDF u S3 i ažuriraj fakturu s URL-om
 * @param {Object} invoice - Invoice objekt
 * @param {Buffer} pdfBuffer - PDF buffer
 * @returns {Promise<String|null>} - S3 URL ili null ako S3 nije konfiguriran
 */
export async function saveInvoicePDF(invoice, pdfBuffer) {
  try {
    // Upload u S3 ako je konfiguriran
    if (isS3Configured()) {
      const s3Url = await uploadInvoicePDF(pdfBuffer, invoice.invoiceNumber);
      
      if (s3Url) {
        // Ažuriraj fakturu s S3 URL-om
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            pdfUrl: s3Url
          }
        });
        
        console.log(`[INVOICE] PDF saved to S3: ${s3Url}`);
        return s3Url;
      }
    } else {
      console.log('[INVOICE] S3 not configured, PDF stored in memory only');
    }
    
    // Ako S3 nije konfiguriran ili upload ne uspije, vraćamo null
    // PDF se i dalje može generirati na zahtjev
    return null;
  } catch (error) {
    console.error('[INVOICE] Error saving PDF to S3:', error);
    // Ne baci grešku - faktura može biti generirana i bez S3 storage
    return null;
  }
}

/**
 * Generiraj i pošalji fakturu emailom
 */
export async function generateAndSendInvoice(invoiceId) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          companyName: true,
          taxId: true,
          city: true
        }
      },
      subscription: true,
      leadPurchase: {
        include: {
          job: {
            select: {
              title: true
            }
          }
        }
      }
    }
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Generiraj PDF
  let pdfBuffer = await generateInvoicePDF(invoice);

  // Sačuvaj PDF u S3 (ako je konfiguriran)
  const s3Url = await saveInvoicePDF(invoice, pdfBuffer);

  // Ažuriraj status fakture
  let updated = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'SENT',
      pdfGeneratedAt: new Date(),
      emailSentAt: new Date(),
      emailSentTo: invoice.user.email,
      ...(s3Url && { pdfUrl: s3Url }) // Ažuriraj pdfUrl ako je S3 upload uspio
    }
  });

  // Pokušaj fiskalizirati fakturu (ako je potrebno)
  try {
    if (requiresFiscalization(updated)) {
      console.log(`[INVOICE] Attempting fiscalization for invoice ${updated.invoiceNumber}`);
      const fiscalResult = await fiscalizeInvoice(invoiceId);
      updated = fiscalResult.invoice;
      
      // Generiraj QR kod URL ako postoje ZKI i JIR
      if (fiscalResult.zkiCode && fiscalResult.jirCode) {
        const qrCodeURL = generateQRCodeURL(fiscalResult.zkiCode, fiscalResult.jirCode);
        if (qrCodeURL) {
          updated = await prisma.invoice.update({
            where: { id: invoiceId },
            data: { qrCodeUrl: qrCodeURL }
          });
        }
      }
    } else {
      console.log(`[INVOICE] Fiscalization not required for invoice ${updated.invoiceNumber}`);
    }
  } catch (fiscalError) {
    console.error('[INVOICE] Fiscalization error (non-critical):', fiscalError);
    // Ne baci grešku - faktura je kreirana i poslana, fiskalizacija može biti ponovljena
  }

  // Regeneriraj PDF s ZKI/JIR ako je fiskalizirana
  if (updated.zkiCode && updated.jirCode) {
    try {
      const updatedInvoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              companyName: true,
              taxId: true,
              city: true
            }
          },
          subscription: true,
          leadPurchase: {
            include: {
              job: {
                select: {
                  title: true
                }
              }
            }
          }
        }
      });
      pdfBuffer = await generateInvoicePDF(updatedInvoice);
      
      // Re-upload u S3 s ažuriranim PDF-om (s ZKI/JIR)
      if (isS3Configured()) {
        await saveInvoicePDF(updatedInvoice, pdfBuffer);
      }
    } catch (pdfError) {
      console.error('[INVOICE] Error regenerating PDF with fiscal data:', pdfError);
      // Koristi originalni PDF ako regeneriranje ne uspije
    }
  }

  // Pošalji email
  await sendInvoiceEmail(invoice.user.email, invoice.user.fullName, updated, pdfBuffer);

  return { invoice: updated, pdfBuffer };
}

/**
 * Označi fakturu kao plaćenu
 */
export async function markInvoiceAsPaid(invoiceId) {
  return await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'PAID',
      paidAt: new Date()
    }
  });
}

/**
 * Stornira fakturu (kreira storno fakturu)
 * Storno faktura ima negativan iznos i poništava originalnu fakturu
 * 
 * @param {String} invoiceId - ID fakture koja se stornira
 * @param {String} reason - Razlog storniranja
 * @returns {Object} { originalInvoice, stornoInvoice }
 */
export async function stornoInvoice(invoiceId, reason = 'Storniranje fakture') {
  // 1. Pronađi originalnu fakturu
  const originalInvoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          companyName: true,
          taxId: true,
          city: true
        }
      },
      subscription: true,
      leadPurchase: {
        include: {
          job: {
            select: {
              title: true
            }
          }
        }
      }
    }
  });

  if (!originalInvoice) {
    throw new Error('Faktura nije pronađena');
  }

  // Provjeri je li već stornirana
  if (originalInvoice.isStorno) {
    throw new Error('Ova faktura je već storno faktura');
  }

  // Provjeri postoji li već storno faktura
  const existingStorno = await prisma.invoice.findFirst({
    where: {
      originalInvoiceId: invoiceId,
      isStorno: true
    }
  });

  if (existingStorno) {
    throw new Error('Faktura je već stornirana');
  }

  // Provjeri status - samo SENT ili PAID fakture mogu biti stornirane
  if (originalInvoice.status === 'DRAFT') {
    throw new Error('Faktura u statusu DRAFT ne može biti stornirana. Možete je jednostavno obrisati.');
  }

  if (originalInvoice.status === 'CANCELLED' || originalInvoice.status === 'STORNED') {
    throw new Error('Faktura je već otkazana ili stornirana');
  }

  // 2. Kreiraj storno fakturu (negativni iznosi)
  const stornoInvoiceNumber = await generateInvoiceNumber(); // Novi broj fakture
  const stornoInvoice = await prisma.invoice.create({
    data: {
      userId: originalInvoice.userId,
      invoiceNumber: stornoInvoiceNumber,
      type: originalInvoice.type,
      status: 'SENT',
      amount: -originalInvoice.amount, // Negativan iznos
      currency: originalInvoice.currency,
      taxAmount: -originalInvoice.taxAmount, // Negativan PDV
      totalAmount: -originalInvoice.totalAmount, // Negativan ukupni iznos
      subscriptionId: originalInvoice.subscriptionId,
      leadPurchaseId: originalInvoice.leadPurchaseId,
      stripePaymentIntentId: null, // Storno faktura nema Stripe payment
      stripeInvoiceId: null,
      issueDate: new Date(),
      dueDate: originalInvoice.dueDate,
      isStorno: true,
      originalInvoiceId: invoiceId,
      notes: `Storno fakture ${originalInvoice.invoiceNumber}. Razlog: ${reason}`,
      // Fiskalizacija za storno - može se pokrenuti kasnije
      fiscalizationStatus: 'NOT_REQUIRED' // Storno fakture se ne fiskaliziraju automatski
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          companyName: true,
          taxId: true,
          city: true
        }
      },
      subscription: true,
      leadPurchase: {
        include: {
          job: {
            select: {
              title: true
            }
          }
        }
      }
    }
  });

  // 3. Ažuriraj status originalne fakture na STORNED
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'STORNED',
      notes: `${originalInvoice.notes || ''}\nStornirano: ${reason}. Storno faktura: ${stornoInvoice.invoiceNumber}`.trim()
    }
  });

  console.log(`[INVOICE] Invoice ${originalInvoice.invoiceNumber} stornirana. Storno faktura: ${stornoInvoice.invoiceNumber}`);

  return {
    originalInvoice: await prisma.invoice.findUnique({ where: { id: invoiceId } }),
    stornoInvoice
  };
}


