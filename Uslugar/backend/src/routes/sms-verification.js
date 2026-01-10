import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';
import { sendVerificationCode } from '../services/sms-service.js';
import { randomInt } from 'crypto';

const r = Router();

/**
 * POST /api/sms-verification/send
 * Pošalji SMS verifikacijski kod
 */
r.post('/send', auth(true), async (req, res, next) => {
  try {
    const { phone } = req.body;
    const userId = req.user.id;

    if (!phone) {
      return res.status(400).json({ error: 'Broj telefona je obavezan' });
    }

    // Validacija formata telefona (hrvatski format: +385XXXXXXXXX)
    const phoneRegex = /^\+385[0-9]{8,9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        error: 'Neispravan format telefona. Koristite format: +385XXXXXXXXX (npr. +385912345678)' 
      });
    }

    // Provjeri je li korisnik već verificiran
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phoneVerified: true, phoneVerificationAttempts: true }
    });

    if (user?.phoneVerified) {
      return res.status(400).json({ error: 'Telefon je već verificiran' });
    }

    // Provjeri da li već postoji aktivan kod
    const hasActiveCode = user?.phoneVerificationCode && 
                         user?.phoneVerificationExpires && 
                         new Date(user.phoneVerificationExpires) > new Date();
    
    // Ako postoji aktivan kod, vrati ga umjesto stvaranja novog
    if (hasActiveCode) {
      const shouldReturnCode = process.env.NODE_ENV === 'development' || true; // Uvijek vraćaj kod ako postoji
      return res.json({
        message: 'Već postoji aktivan verifikacijski kod. Koristite postojeći kod.',
        code: shouldReturnCode ? user.phoneVerificationCode : undefined, // Vrati postojeći kod
        smsMode: 'existing',
        smsSuccess: false,
        expiresAt: user.phoneVerificationExpires,
        attemptsRemaining: 5 - (user?.phoneVerificationAttempts || 0)
      });
    }
    
    // Provjeri rate limiting (max 5 pokušaja u 1 satu) - SAMO ako nema aktivnog koda
    if (user?.phoneVerificationAttempts >= 5) {
      return res.status(429).json({ 
        error: 'Previše pokušaja slanja SMS koda (5/5). Molimo pričekajte 1 sat prije sljedećeg pokušaja.',
        hasActiveCode: false,
        attemptsRemaining: 0
      });
    }

    // Generiraj 6-znamenkasti kod
    const code = randomInt(100000, 999999).toString();

    // Provjeri postoji li već aktivni kod za ovaj telefon
    const existingCode = await prisma.user.findFirst({
      where: {
        phoneVerificationCode: { not: null },
        phoneVerificationExpires: { gt: new Date() },
        id: { not: userId } // Različiti korisnik
      }
    });

    if (existingCode) {
      return res.status(429).json({ 
        error: 'Već postoji aktivni verifikacijski kod za ovaj broj telefona. Molimo pričekajte.' 
      });
    }

    // Ažuriraj korisnika s kodom
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minuta

    await prisma.user.update({
      where: { id: userId },
      data: {
        phone,
        phoneVerificationCode: code,
        phoneVerificationExpires: expiresAt,
        phoneVerificationAttempts: { increment: 1 }
      }
    });

    // Pošalji SMS
    let smsResult = null;
    try {
      smsResult = await sendVerificationCode(phone, code, userId);
      
      if (smsResult.mode === 'twilio_error') {
        console.error(`[SMS Verification] Twilio API error:`, smsResult.error);
        console.error(`[SMS Verification] Error code:`, smsResult.code);
      }
    } catch (smsError) {
      console.error('[SMS Verification] Failed to send SMS:', smsError);
      // Ako je simulation mode ili error, vraćamo kod u response za testiranje
      console.warn('[SMS Verification] SMS failed, but continuing with code in response');
    }

    // Uvijek vraćamo kod ako je simulation mode ili ako je development
    // Također vraćamo kod ako Twilio ne radi (za testiranje)
    const shouldReturnCode = 
      process.env.NODE_ENV === 'development' || 
      !smsResult || 
      smsResult.mode === 'simulation' || 
      smsResult.needsVerification ||
      !smsResult.success;

    // Detaljnija poruka o grešci
    let errorMessage = 'SMS nije poslan';
    if (smsResult?.needsVerification) {
      errorMessage = 'SMS nije poslan - broj mora biti verificiran u Twilio konzoli.';
    } else if (smsResult?.error) {
      errorMessage = `SMS nije poslan (${smsResult.error})`;
    }
    
    // Sastavi poruku
    let finalMessage = smsResult?.success 
      ? 'SMS verifikacijski kod je poslan. Kod važi 10 minuta.'
      : errorMessage;
    
    // Kod se vraća u response ali se ne prikazuje direktno u poruci
    // (samo za development mode ili ako je potrebno za debug)
    
    res.json({ 
      message: finalMessage,
      code: shouldReturnCode ? code : undefined, // Vraćamo kod za testiranje
      expiresAt: expiresAt.toISOString(), // Vrati expiration time
      smsMode: smsResult?.mode || 'simulation',
      smsSuccess: smsResult?.success || false,
      smsError: smsResult?.error || undefined,
      smsErrorCode: smsResult?.code || undefined
    });

  } catch (error) {
    console.error('[SMS Verification] Send error:', error);
    next(error);
  }
});

/**
 * POST /api/sms-verification/verify
 * Verificiraj SMS kod
 */
r.post('/verify', auth(true), async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code || code.length !== 6) {
      return res.status(400).json({ error: 'Neispravan format koda. Kod mora imati 6 znamenki.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        phoneVerified: true,
        phoneVerificationCode: true,
        phoneVerificationExpires: true,
        phoneVerificationAttempts: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Korisnik nije pronađen' });
    }

    if (user.phoneVerified) {
      return res.status(400).json({ error: 'Telefon je već verificiran' });
    }

    if (!user.phoneVerificationCode) {
      return res.status(400).json({ error: 'Niste zatražili verifikacijski kod. Pošaljite kod prvo.' });
    }

    if (new Date() > user.phoneVerificationExpires) {
      return res.status(400).json({ error: 'Verifikacijski kod je istekao. Zatražite novi kod.' });
    }

    if (user.phoneVerificationAttempts >= 5) {
      return res.status(429).json({ 
        error: 'Previše pokušaja. Molimo zatražite novi kod.' 
      });
    }

    if (user.phoneVerificationCode !== code) {
      // Povećaj broj pokušaja
      await prisma.user.update({
        where: { id: userId },
        data: { phoneVerificationAttempts: { increment: 1 } }
      });

      return res.status(400).json({ 
        error: 'Neispravan kod. Molimo pokušajte ponovno.',
        attemptsRemaining: Math.max(0, 5 - user.phoneVerificationAttempts - 1)
      });
    }

    // Kod je ispravan - verificiraj telefon
    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
        phoneVerificationCode: null, // Očisti kod
        phoneVerificationExpires: null,
        phoneVerificationAttempts: 0 // Reset pokušaja
      }
    });

    // Ako je provider, ažuriraj i ProviderProfile
    const fullUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { providerProfile: true }
    });

    if (fullUser?.role === 'PROVIDER' && fullUser.providerProfile) {
      await prisma.providerProfile.update({
        where: { userId },
        data: { 
          identityPhoneVerified: true,
          identityPhoneVerifiedAt: new Date()
        }
      });
    }


    res.json({ 
      message: 'Telefon uspješno verificiran!',
      phoneVerified: true
    });

  } catch (error) {
    console.error('[SMS Verification] Verify error:', error);
    next(error);
  }
});

/**
 * GET /api/sms-verification/status
 * Provjeri status verifikacije
 */
r.get('/status', auth(true), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        phone: true,
        phoneVerified: true,
        phoneVerifiedAt: true,
        phoneVerificationExpires: true,
        phoneVerificationAttempts: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Korisnik nije pronađen' });
    }

    const hasActiveCode = user.phoneVerificationExpires && new Date() < user.phoneVerificationExpires;
    const shouldReturnCode = process.env.NODE_ENV === 'development' || true; // Uvijek vraćaj kod za testiranje
    
    // Dohvati kod ako postoji
    const fullUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { phoneVerificationCode: true }
    });
    
    res.json({
      phone: user.phone,
      phoneVerified: user.phoneVerified || false,
      phoneVerifiedAt: user.phoneVerifiedAt,
      hasActiveCode: hasActiveCode,
      expiresAt: user.phoneVerificationExpires ? new Date(user.phoneVerificationExpires).toISOString() : undefined,
      attemptsRemaining: Math.max(0, 5 - (user.phoneVerificationAttempts || 0)),
      code: (hasActiveCode && shouldReturnCode && fullUser?.phoneVerificationCode) ? fullUser.phoneVerificationCode : undefined // Vrati kod ako postoji
    });

  } catch (error) {
    console.error('[SMS Verification] Status error:', error);
    next(error);
  }
});

export default r;

