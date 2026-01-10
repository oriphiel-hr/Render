/**
 * Invoice Routes - API za fakture
 */

import { Router } from 'express';
import { auth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import {
  createInvoice,
  generateInvoicePDF,
  generateAndSendInvoice,
  markInvoiceAsPaid,
  stornoInvoice
} from '../services/invoice-service.js';
import { fiscalizeInvoice } from '../services/fiscalization-service.js';
import { downloadInvoicePDF, getInvoicePDFPresignedUrl } from '../lib/s3-storage.js';

const r = Router();

/**
 * GET /api/invoices
 * Dohvati sve fakture korisnika
 */
r.get('/', auth(true, ['PROVIDER', 'ADMIN', 'USER']), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, type } = req.query;

    const where = { userId };
    if (status) where.status = status;
    if (type) where.type = type;

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        subscription: {
          select: {
            plan: true
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
      },
      orderBy: {
        issueDate: 'desc'
      }
    });

    res.json({
      success: true,
      invoices,
      total: invoices.length
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/invoices/:invoiceId
 * Dohvati pojedinačnu fakturu
 */
r.get('/:invoiceId', auth(true, ['PROVIDER', 'ADMIN', 'USER']), async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user.id;

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
        subscription: {
          select: {
            plan: true
          }
        },
        leadPurchase: {
          include: {
            job: {
              select: {
                title: true,
                city: true
              }
            }
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Faktura nije pronađena' });
    }

    // Provjeri autorizaciju (korisnik može vidjeti samo svoje fakture, admin može sve)
    if (invoice.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Nemate pristup ovoj fakturi' });
    }

    res.json({
      success: true,
      invoice
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/invoices/:invoiceId/pdf
 * Preuzmi PDF fakture
 */
r.get('/:invoiceId/pdf', auth(true, ['PROVIDER', 'ADMIN', 'USER']), async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user.id;

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
        subscription: {
          select: {
            plan: true
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

    if (!invoice) {
      return res.status(404).json({ error: 'Faktura nije pronađena' });
    }

    // Provjeri autorizaciju
    if (invoice.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Nemate pristup ovoj fakturi' });
    }

    // Pokušaj preuzeti PDF iz S3 ako postoji
    let pdfBuffer = null;
    if (invoice.pdfUrl) {
      try {
        pdfBuffer = await downloadInvoicePDF(invoice.invoiceNumber);
      } catch (s3Error) {
        console.warn(`[INVOICE] Error downloading PDF from S3 for ${invoice.invoiceNumber}, will generate new:`, s3Error);
      }
    }

    // Ako nema PDF u S3, generiraj novi
    if (!pdfBuffer) {
      pdfBuffer = await generateInvoicePDF(invoice);
      
      // Ažuriraj fakturu da je PDF generiran
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          pdfGeneratedAt: new Date()
        }
      });
    }

    // Postavi headers za PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="faktura-${invoice.invoiceNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/invoices/:invoiceId/send
 * Pošalji fakturu emailom
 */
r.post('/:invoiceId/send', auth(true, ['PROVIDER', 'ADMIN', 'USER']), async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user.id;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Faktura nije pronađena' });
    }

    // Provjeri autorizaciju
    if (invoice.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Nemate pristup ovoj fakturi' });
    }

    // Generiraj i pošalji
    await generateAndSendInvoice(invoiceId);

    res.json({
      success: true,
      message: 'Faktura je uspješno poslana na email'
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/invoices/:invoiceId/mark-paid
 * Označi fakturu kao plaćenu (samo admin)
 */
r.post('/:invoiceId/mark-paid', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await markInvoiceAsPaid(invoiceId);

    res.json({
      success: true,
      invoice,
      message: 'Faktura je označena kao plaćena'
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/invoices/:invoiceId/fiscalize
 * Ručno pokreni fiskalizaciju fakture (admin ili vlasnik fakture)
 */
r.post('/:invoiceId/fiscalize', auth(true, ['ADMIN', 'PROVIDER', 'USER']), async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user.id;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Faktura nije pronađena' });
    }

    // Provjeri autorizaciju
    if (invoice.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Nemate pristup ovoj fakturi' });
    }

    // Pokreni fiskalizaciju
    const result = await fiscalizeInvoice(invoiceId);

    res.json({
      success: true,
      invoice: result.invoice,
      zkiCode: result.zkiCode,
      jirCode: result.jirCode,
      message: result.jirCode 
        ? 'Faktura je uspješno fiskalizirana'
        : 'Faktura ne zahtijeva fiskalizaciju'
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/invoices/bulk/upload-to-s3
 * Masovno uploadaj PDF fakture na S3 (samo admin)
 */
r.post('/bulk/upload-to-s3', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { invoiceIds } = req.body;
    
    if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return res.status(400).json({ error: 'invoiceIds mora biti array s barem jednim ID-om' });
    }

    const { isS3Configured } = await import('../lib/s3-storage.js');
    if (!isS3Configured()) {
      return res.status(503).json({ error: 'S3 nije konfiguriran' });
    }

    const { generateInvoicePDF, saveInvoicePDF } = await import('../services/invoice-service.js');
    let uploaded = 0;
    let errors = [];

    for (const invoiceId of invoiceIds) {
      try {
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
            subscription: {
              select: {
                plan: true
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

        if (!invoice) {
          errors.push({ invoiceId, error: 'Faktura nije pronađena' });
          continue;
        }

        if (invoice.pdfUrl) {
          continue; // Već je na S3
        }

        // Generiraj PDF
        const pdfBuffer = await generateInvoicePDF(invoice);
        
        // Upload na S3
        const s3Url = await saveInvoicePDF(invoice, pdfBuffer);
        
        if (s3Url) {
          uploaded++;
        } else {
          errors.push({ invoiceId, error: 'Upload neuspješan' });
        }
      } catch (error) {
        errors.push({ invoiceId, error: error.message });
      }
    }

    res.json({
      success: true,
      uploaded,
      total: invoiceIds.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/invoices/bulk/delete-from-s3
 * Masovno obriši PDF fakture s S3 (samo admin)
 */
r.post('/bulk/delete-from-s3', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { invoiceIds } = req.body;
    
    if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return res.status(400).json({ error: 'invoiceIds mora biti array s barem jednim ID-om' });
    }

    const { deleteInvoicePDF } = await import('../lib/s3-storage.js');
    let deleted = 0;
    let errors = [];

    for (const invoiceId of invoiceIds) {
      try {
        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId },
          select: {
            id: true,
            invoiceNumber: true,
            pdfUrl: true
          }
        });

        if (!invoice) {
          errors.push({ invoiceId, error: 'Faktura nije pronađena' });
          continue;
        }

        if (!invoice.pdfUrl) {
          continue; // Nije na S3
        }

        // Obriši PDF s S3
        const success = await deleteInvoicePDF(invoice.invoiceNumber);
        
        if (success) {
          // Ažuriraj fakturu - ukloni pdfUrl
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: { pdfUrl: null }
          });
          deleted++;
        } else {
          errors.push({ invoiceId, error: 'Brisanje neuspješno' });
        }
      } catch (error) {
        errors.push({ invoiceId, error: error.message });
      }
    }

    res.json({
      success: true,
      deleted,
      total: invoiceIds.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/invoices/bulk/upload-all-missing-to-s3
 * Uploadaj sve fakture koje nisu na S3 (samo admin)
 */
r.post('/bulk/upload-all-missing-to-s3', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { isS3Configured } = await import('../lib/s3-storage.js');
    if (!isS3Configured()) {
      return res.status(503).json({ error: 'S3 nije konfiguriran' });
    }

    // Pronađi sve fakture koje nemaju pdfUrl
    const invoices = await prisma.invoice.findMany({
      where: {
        pdfUrl: null
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
          select: {
            plan: true
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

    const { generateInvoicePDF, saveInvoicePDF } = await import('../services/invoice-service.js');
    let uploaded = 0;
    let errors = [];

    for (const invoice of invoices) {
      try {
        // Generiraj PDF
        const pdfBuffer = await generateInvoicePDF(invoice);
        
        // Upload na S3
        const s3Url = await saveInvoicePDF(invoice, pdfBuffer);
        
        if (s3Url) {
          uploaded++;
        } else {
          errors.push({ invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber, error: 'Upload neuspješan' });
        }
      } catch (error) {
        errors.push({ invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber, error: error.message });
      }
    }

    res.json({
      success: true,
      uploaded,
      total: invoices.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/invoices/bulk/delete-all-from-s3
 * Obriši sve fakture s S3 (samo admin)
 */
r.post('/bulk/delete-all-from-s3', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    // Pronađi sve fakture koje imaju pdfUrl
    const invoices = await prisma.invoice.findMany({
      where: {
        pdfUrl: { not: null }
      },
      select: {
        id: true,
        invoiceNumber: true,
        pdfUrl: true
      }
    });

    const { deleteInvoicePDF } = await import('../lib/s3-storage.js');
    let deleted = 0;
    let errors = [];

    for (const invoice of invoices) {
      try {
        // Obriši PDF s S3
        const success = await deleteInvoicePDF(invoice.invoiceNumber);
        
        if (success) {
          // Ažuriraj fakturu - ukloni pdfUrl
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { pdfUrl: null }
          });
          deleted++;
        } else {
          errors.push({ invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber, error: 'Brisanje neuspješno' });
        }
      } catch (error) {
        errors.push({ invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber, error: error.message });
      }
    }

    res.json({
      success: true,
      deleted,
      total: invoices.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/invoices/:invoiceId/upload-to-s3
 * Uploadaj PDF fakture na S3 (samo admin)
 */
r.post('/:invoiceId/upload-to-s3', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { invoiceId } = req.params;

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
        subscription: {
          select: {
            plan: true
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

    if (!invoice) {
      return res.status(404).json({ error: 'Faktura nije pronađena' });
    }

    if (invoice.pdfUrl) {
      return res.status(400).json({ error: 'PDF je već na S3' });
    }

    // Provjeri da li je S3 konfiguriran
    const { isS3Configured } = await import('../lib/s3-storage.js');
    if (!isS3Configured()) {
      return res.status(503).json({ error: 'S3 nije konfiguriran' });
    }

    // Generiraj PDF
    const { generateInvoicePDF } = await import('../services/invoice-service.js');
    const pdfBuffer = await generateInvoicePDF(invoice);

    // Upload na S3
    const { saveInvoicePDF } = await import('../services/invoice-service.js');
    const s3Url = await saveInvoicePDF(invoice, pdfBuffer);

    if (s3Url) {
      res.json({
        success: true,
        message: 'PDF je uspješno uploadan na S3',
        pdfUrl: s3Url
      });
    } else {
      res.status(500).json({ error: 'Greška pri uploadu PDF-a na S3' });
    }
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /api/invoices/:invoiceId/pdf-s3
 * Obriši PDF fakture s S3 (samo admin)
 */
r.delete('/:invoiceId/pdf-s3', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        invoiceNumber: true,
        pdfUrl: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Faktura nije pronađena' });
    }

    if (!invoice.pdfUrl) {
      return res.status(400).json({ error: 'Faktura nema PDF na S3' });
    }

    // Obriši PDF s S3
    const { deleteInvoicePDF } = await import('../lib/s3-storage.js');
    const deleted = await deleteInvoicePDF(invoice.invoiceNumber);

    if (deleted) {
      // Ažuriraj fakturu - ukloni pdfUrl
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          pdfUrl: null
        }
      });

      res.json({
        success: true,
        message: 'PDF je uspješno obrisan s S3'
      });
    } else {
      res.status(500).json({ error: 'Greška pri brisanju PDF-a s S3' });
    }
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/invoices/:invoiceId/storno
 * Stornira fakturu (kreira storno fakturu) - samo admin
 */
r.post('/:invoiceId/storno', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const { reason } = req.body;

    const result = await stornoInvoice(invoiceId, reason || 'Storniranje fakture');

    // Generiraj i pošalji storno fakturu emailom
    try {
      await generateAndSendInvoice(result.stornoInvoice.id);
    } catch (emailError) {
      console.error('[INVOICE] Error sending storno invoice email:', emailError);
      // Ne baci grešku - storno faktura je kreirana
    }

    res.json({
      success: true,
      originalInvoice: result.originalInvoice,
      stornoInvoice: result.stornoInvoice,
      message: `Faktura ${result.originalInvoice.invoiceNumber} je stornirana. Storno faktura: ${result.stornoInvoice.invoiceNumber}`
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/invoices/create-test
 * Kreira test fakturu (samo admin) - za testiranje PDF generiranja
 */
r.post('/create-test', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { userId, amount = 100, type = 'SUBSCRIPTION' } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Provjeri da li korisnik postoji
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Kreiraj test fakturu
    const invoice = await createInvoice({
      userId,
      type,
      amount: parseFloat(amount),
      currency: 'EUR',
      subscriptionId: null,
      leadPurchaseId: null,
      stripePaymentIntentId: 'test_pi_' + Date.now(),
      stripeInvoiceId: null
    });

    // Generiraj i spremi PDF
    await generateAndSendInvoice(invoice.id);

    // Dohvati ažurirani invoice s pdfUrl
    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      select: {
        id: true,
        invoiceNumber: true,
        amount: true,
        totalAmount: true,
        pdfUrl: true,
        status: true
      }
    });

    res.json({
      success: true,
      message: 'Test faktura kreirana i PDF generiran',
      invoice: updatedInvoice
    });
  } catch (e) {
    next(e);
  }
});

export default r;

