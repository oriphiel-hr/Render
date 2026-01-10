// Client Verification System - USLUGAR EXCLUSIVE
import { Router } from 'express';
import { auth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import { triggerAutoVerification, autoVerifyClient } from '../services/auto-verification.js';
import { uploadDocument, getImageUrl } from '../lib/upload.js';
import {
  notifyPhoneVerification,
  notifyIDVerification,
  notifyCompanyVerification,
  notifyTrustScoreChange,
  notifyManualVerification
} from '../services/verification-notifications.js';
import fs from 'fs/promises';
import path from 'path';

const r = Router();

// Dohvati status verifikacije
r.get('/status', auth(true), async (req, res, next) => {
  try {
    let verification = await prisma.clientVerification.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!verification) {
      // Kreiraj prazan verification record
      verification = await prisma.clientVerification.create({
        data: {
          userId: req.user.id,
          phoneVerified: false,
          emailVerified: req.user.isVerified || false,
          idVerified: false,
          companyVerified: false,
          trustScore: 0
        }
      });
    }
    
    res.json(verification);
  } catch (e) {
    next(e);
  }
});

// Verifikacija telefona - pošalji SMS kod
r.post('/phone/send-code', auth(true), async (req, res, next) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number required' });
    }
    
    // TODO: Integracija sa Twilio SMS servisom
    // Za sada samo simulacija
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Spremi kod u bazu (ili cache)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { phone }
    });
    
    console.log(`[VERIFICATION] SMS code for ${phone}: ${verificationCode}`);
    
    res.json({
      success: true,
      message: 'Verification code sent via SMS',
      // U development-u vrati kod (u produkciji ne!)
      ...(process.env.NODE_ENV === 'development' && { code: verificationCode })
    });
  } catch (e) {
    next(e);
  }
});

// Verifikacija telefona - potvrdi SMS kod
r.post('/phone/verify-code', auth(true), async (req, res, next) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Verification code required' });
    }
    
    // TODO: Provjeri kod iz cache/baze
    // Za sada samo simulacija - prihvati svaki 6-znamenkasti kod
    if (code.length !== 6) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    // Ažuriraj verification status
    const existingVerification = await prisma.clientVerification.findUnique({
      where: { userId: req.user.id }
    });
    
    const oldTrustScore = existingVerification?.trustScore || 0;
    
    const verification = await prisma.clientVerification.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        phoneVerified: true,
        emailVerified: req.user.isVerified || false,
        trustScore: 20
      },
      update: {
        phoneVerified: true,
        trustScore: { increment: 20 }
      }
    });
    
    // Obavijesti korisnika o telefon verifikaciji
    try {
      await notifyPhoneVerification(req.user.id, true);
    } catch (notifError) {
      console.error('[Client Verification] Failed to send phone verification notification:', notifError);
    }
    
    // Obavijesti o trust score promjeni
    try {
      if (verification.trustScore !== oldTrustScore) {
        await notifyTrustScoreChange(req.user.id, oldTrustScore, verification.trustScore, 'Telefon verificiran');
      }
    } catch (notifError) {
      console.error('[Client Verification] Failed to send trust score notification:', notifError);
    }
    
    // Pokreni automatsku verifikaciju nakon telefonske verifikacije
    try {
      await triggerAutoVerification(req.user.id, { type: 'phone', value: req.user.phone });
    } catch (autoVerifyError) {
      console.error('[Client Verification] Auto-verification failed after phone verification:', autoVerifyError);
      // Ne baci grešku - samo logiraj
    }
    
    res.json({
      success: true,
      message: 'Phone verified successfully',
      verification
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/verification/id/upload
 * Upload osobne iskaznice (front i back) za verifikaciju
 * Accepts multipart/form-data with 'front' and 'back' fields
 */
r.post('/id/upload', auth(true), uploadDocument.fields([
  { name: 'front', maxCount: 1 },
  { name: 'back', maxCount: 1 }
]), async (req, res, next) => {
  try {
    const frontFile = req.files?.['front']?.[0];
    const backFile = req.files?.['back']?.[0];
    
    if (!frontFile) {
      return res.status(400).json({ 
        error: 'Front image required',
        message: 'Molimo uploadajte prednju stranu osobne iskaznice (JPG ili PNG)' 
      });
    }
    
    // Pročitaj fajlove
    const frontPath = path.join('./uploads', frontFile.filename);
    const frontBuffer = await fs.readFile(frontPath);
    
    let backBuffer = null;
    if (backFile) {
      const backPath = path.join('./uploads', backFile.filename);
      backBuffer = await fs.readFile(backPath);
    }
    
    // Kreiraj URL-e
    const frontUrl = getImageUrl(req, frontFile.filename);
    const backUrl = backFile ? getImageUrl(req, backFile.filename) : null;
    
    // Dohvati korisnika
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user) {
      await fs.unlink(frontPath);
      if (backFile) await fs.unlink(path.join('./uploads', backFile.filename));
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verificiraj dokument
    const { verifyIDDocument } = await import('../services/id-document-verification.js');
    const verificationResult = await verifyIDDocument(frontBuffer, backBuffer, user);
    
    // Ažuriraj ili kreiraj verification record
    let verification;
    let trustScoreIncrement = 0;
    let verificationNotes = '';
    
    if (verificationResult.success && verificationResult.verified) {
      // Automatski verificirano
      trustScoreIncrement = 30;
      verificationNotes = `ID verificiran automatski (OCR confidence: ${Math.round(verificationResult.confidence || 0)}%)`;
      if (verificationResult.validation.warnings.length > 0) {
        verificationNotes += `. Upozorenja: ${verificationResult.validation.warnings.join('; ')}`;
      }
    } else if (verificationResult.success) {
      // Uploadano, ali čeka ručnu provjeru
      trustScoreIncrement = 0; // Ne dodaj bodove dok admin ne verifikira
      verificationNotes = `ID uploadan, čeka ručnu provjeru (OCR confidence: ${Math.round(verificationResult.confidence || 0)}%)`;
      if (verificationResult.validation.errors.length > 0) {
        verificationNotes += `. Greške: ${verificationResult.validation.errors.join('; ')}`;
      }
      if (verificationResult.validation.warnings.length > 0) {
        verificationNotes += `. Upozorenja: ${verificationResult.validation.warnings.join('; ')}`;
      }
    } else {
      // Greška pri verifikaciji
      verificationNotes = `ID uploadan, ali verifikacija neuspješna: ${verificationResult.error || 'Nepoznata greška'}`;
    }
    
    // Provjeri postoji li već verification record
    const existingVerification = await prisma.clientVerification.findUnique({
      where: { userId: req.user.id }
    });
    
    const oldTrustScore = existingVerification?.trustScore || 0;
    const oldIdVerified = existingVerification?.idVerified || false;
    
    if (existingVerification) {
      verification = await prisma.clientVerification.update({
        where: { userId: req.user.id },
        data: {
          idVerified: verificationResult.success && verificationResult.verified ? true : existingVerification.idVerified,
          trustScore: verificationResult.success && verificationResult.verified 
            ? (existingVerification.trustScore + trustScoreIncrement)
            : existingVerification.trustScore,
          verifiedAt: verificationResult.success && verificationResult.verified ? new Date() : existingVerification.verifiedAt,
          notes: existingVerification.notes 
            ? `${existingVerification.notes}\n[${new Date().toISOString()}] ${verificationNotes}`
            : verificationNotes,
          updatedAt: new Date()
        }
      });
    } else {
      verification = await prisma.clientVerification.create({
        data: {
          userId: req.user.id,
          idVerified: verificationResult.success && verificationResult.verified ? true : false,
          emailVerified: user.isVerified || false,
          phoneVerified: user.phoneVerified || false,
          trustScore: verificationResult.success && verificationResult.verified ? trustScoreIncrement : 0,
          verifiedAt: verificationResult.success && verificationResult.verified ? new Date() : null,
          notes: verificationNotes
        }
      });
    }
    
    // Obavijesti korisnika o ID verifikaciji
    try {
      if (verificationResult.success && verificationResult.verified && !oldIdVerified) {
        // Automatski verificirano
        await notifyIDVerification(req.user.id, true, false);
      } else if (verificationResult.success && !verificationResult.verified) {
        // Čeka ručnu provjeru
        await notifyIDVerification(req.user.id, false, true);
      }
    } catch (notifError) {
      console.error('[Client Verification] Failed to send ID verification notification:', notifError);
    }
    
    // Obavijesti o trust score promjeni
    try {
      if (verification.trustScore !== oldTrustScore && verificationResult.success && verificationResult.verified) {
        await notifyTrustScoreChange(req.user.id, oldTrustScore, verification.trustScore, 'Osobna iskaznica verificirana');
      }
    } catch (notifError) {
      console.error('[Client Verification] Failed to send trust score notification:', notifError);
    }
    
    // Ako je automatski verificiran, pokreni auto-verifikaciju
    if (verificationResult.success && verificationResult.verified) {
      try {
        await triggerAutoVerification(req.user.id, { type: 'id', value: 'ID verified' });
      } catch (autoVerifyError) {
        console.error('[Client Verification] Auto-verification failed after ID verification:', autoVerifyError);
      }
      
      // Obavijesti admine o novoj ID verifikaciji
      try {
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN' }
        });
        
        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: 'SYSTEM',
              title: 'Nova ID verifikacija',
              message: `${user.fullName} (${user.email}) je verificirao osobnu iskaznicu automatski.`,
            }
          });
        }
      } catch (notifError) {
        console.error('[Client Verification] Failed to notify admins:', notifError);
      }
    } else {
      // Obavijesti admine da ručno provjere
      try {
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN' }
        });
        
        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: 'SYSTEM',
              title: 'ID verifikacija čeka odobrenje',
              message: `${user.fullName} (${user.email}) je uploadao osobnu iskaznicu. Potrebna ručna provjera.`,
            }
          });
        }
      } catch (notifError) {
        console.error('[Client Verification] Failed to notify admins:', notifError);
      }
    }
    
    res.json({
      success: true,
      message: verificationResult.success && verificationResult.verified
        ? 'ID verified successfully'
        : 'ID uploaded. Verification pending manual review.',
      verification: {
        id: verification.id,
        idVerified: verification.idVerified,
        trustScore: verification.trustScore,
        verifiedAt: verification.verifiedAt
      },
      document: {
        frontUrl: frontUrl,
        backUrl: backUrl
      },
      verificationResult: verificationResult.success ? {
        verified: verificationResult.verified,
        confidence: verificationResult.confidence,
        extractedData: verificationResult.data,
        validation: verificationResult.validation
      } : {
        error: verificationResult.error
      }
    });
  } catch (e) {
    next(e);
  }
});

    // Verifikacija firme (OIB + sudski registar)
r.post('/company/verify', auth(true), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user.taxId || !user.companyName) {
      return res.status(400).json({
        error: 'Company tax ID and name required',
        message: 'Please update your profile with company details first'
      });
    }
    
    // TODO: API integracija sa FINA/Sudskim registrom za provjeru OIB-a
    // Za sada samo simulacija
    
    const existingVerification = await prisma.clientVerification.findUnique({
      where: { userId: req.user.id }
    });
    
    const oldTrustScore = existingVerification?.trustScore || 0;
    const oldCompanyVerified = existingVerification?.companyVerified || false;
    
    const verification = await prisma.clientVerification.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        companyVerified: true,
        trustScore: 50
      },
      update: {
        companyVerified: true,
        verifiedAt: new Date(),
        trustScore: { increment: 40 },
        notes: `Company verified: ${user.companyName} (OIB: ${user.taxId})`
      }
    });
    
    // Obavijesti korisnika o company verifikaciji
    try {
      if (!oldCompanyVerified) {
        await notifyCompanyVerification(req.user.id, true);
      }
    } catch (notifError) {
      console.error('[Client Verification] Failed to send company verification notification:', notifError);
    }
    
    // Obavijesti o trust score promjeni
    try {
      if (verification.trustScore !== oldTrustScore) {
        await notifyTrustScoreChange(req.user.id, oldTrustScore, verification.trustScore, 'Firma verificirana');
      }
    } catch (notifError) {
      console.error('[Client Verification] Failed to send trust score notification:', notifError);
    }
    
    // Pokreni automatsku verifikaciju nakon company verifikacije
    try {
      await triggerAutoVerification(req.user.id, { type: 'company', value: user.companyName });
    } catch (autoVerifyError) {
      console.error('[Client Verification] Auto-verification failed after company verification:', autoVerifyError);
    }
    
    res.json({
      success: true,
      message: 'Company verification successful',
      verification
    });
  } catch (e) {
    next(e);
  }
});

// Admin - ručna verifikacija
r.post('/admin/verify/:userId', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { phoneVerified, emailVerified, idVerified, companyVerified, trustScore, notes } = req.body;
    
    // Dohvati postojeću verifikaciju da provjerimo promjene
    const existingVerification = await prisma.clientVerification.findUnique({
      where: { userId }
    });
    
    const oldVerification = existingVerification || {
      phoneVerified: false,
      emailVerified: false,
      idVerified: false,
      companyVerified: false,
      trustScore: 0
    };
    
    const verification = await prisma.clientVerification.upsert({
      where: { userId },
      create: {
        userId,
        phoneVerified: phoneVerified || false,
        emailVerified: emailVerified || false,
        idVerified: idVerified || false,
        companyVerified: companyVerified || false,
        trustScore: trustScore || 0,
        notes,
        verifiedAt: new Date()
      },
      update: {
        phoneVerified,
        emailVerified,
        idVerified,
        companyVerified,
        trustScore,
        notes,
        verifiedAt: new Date()
      }
    });
    
    // Obavijesti korisnika o promjenama
    try {
      // Email verifikacija
      if (verification.emailVerified !== oldVerification.emailVerified) {
        await notifyManualVerification(userId, 'email', verification.emailVerified, notes);
      }
      
      // Telefon verifikacija
      if (verification.phoneVerified !== oldVerification.phoneVerified) {
        await notifyManualVerification(userId, 'phone', verification.phoneVerified, notes);
      }
      
      // ID verifikacija
      if (verification.idVerified !== oldVerification.idVerified) {
        await notifyManualVerification(userId, 'id', verification.idVerified, notes);
      }
      
      // Company verifikacija
      if (verification.companyVerified !== oldVerification.companyVerified) {
        await notifyManualVerification(userId, 'company', verification.companyVerified, notes);
      }
      
      // Trust score promjena
      if (verification.trustScore !== oldVerification.trustScore) {
        await notifyTrustScoreChange(userId, oldVerification.trustScore, verification.trustScore, 'Admin ažurirao verifikaciju');
      }
    } catch (notifError) {
      console.error('[Client Verification] Failed to send admin verification notifications:', notifError);
    }
    
    res.json({
      success: true,
      message: 'Client verification updated by admin',
      verification
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/verification/auto-verify
 * Ručno pokretanje automatske verifikacije za trenutnog korisnika
 */
r.post('/auto-verify', auth(true), async (req, res, next) => {
  try {
    const result = await autoVerifyClient(req.user.id);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Auto-verification completed',
        verifications: result.verifications,
        trustScore: result.trustScore,
        verification: result.verification
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Auto-verification failed'
      });
    }
  } catch (e) {
    next(e);
  }
});

// Dohvati listu neverificiranih klijenata (za admin)
r.get('/admin/pending', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const unverified = await prisma.clientVerification.findMany({
      where: {
        OR: [
          { phoneVerified: false },
          { emailVerified: false },
          { idVerified: false },
          { trustScore: { lt: 50 } }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            companyName: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      total: unverified.length,
      verifications: unverified
    });
  } catch (e) {
    next(e);
  }
});

export default r;

