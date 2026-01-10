// Add this endpoint to providers.js to fix missing ProviderProfile
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';

const r = Router();

// Fix missing ProviderProfile for current user
r.post('/fix-profile', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Provjeri da li već postoji profil
    const existingProfile = await prisma.providerProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      return res.json({ 
        message: 'Provider profil već postoji',
        profile: existingProfile
      });
    }

    // Kreiraj novi profil
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        city: true,
        legalStatusId: true,
        taxId: true,
        companyName: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Korisnik nije pronađen' });
    }

    const newProfile = await prisma.providerProfile.create({
      data: {
        userId: userId,
        bio: '',
        serviceArea: user.city || '',
        legalStatusId: user.legalStatusId,
        taxId: user.taxId,
        companyName: user.companyName,
        specialties: [],
        experience: 0,
        website: '',
        isAvailable: true,
        portfolio: null
      },
      include: {
        user: true,
        categories: true
      }
    });

    res.json({
      message: 'Provider profil uspješno kreiran',
      profile: newProfile
    });
  } catch (e) {
    next(e);
  }
});

export default r;
