import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';
import { uploadDocument, getImageUrl } from '../lib/upload.js';

const r = Router();

// Get all providers (public) with filtering
r.get('/', async (req, res, next) => {
  try {
    const {
      categoryId,
      city,
      minRating,
      verified,
      hasLicenses,
      isAvailable,
      search,
      sortBy = 'rating' // 'rating', 'badges', 'recent'
    } = req.query;

    // Build where clause
    const where = {
      isAvailable: isAvailable === 'true' ? true : undefined,
      // Category filter
      ...(categoryId && {
        categories: {
          some: { id: categoryId }
        }
      }),
      // City filter (from user or serviceArea)
      ...(city && {
        OR: [
          { user: { city: { contains: city, mode: 'insensitive' } } },
          { serviceArea: { contains: city, mode: 'insensitive' } }
        ]
      }),
      // Search filter (name, bio, specialties)
      ...(search && {
        OR: [
          { user: { fullName: { contains: search, mode: 'insensitive' } } },
          { bio: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
          { specialties: { has: search } }
        ]
      })
    };

    // Remove undefined values
    Object.keys(where).forEach(key => {
      if (where[key] === undefined) {
        delete where[key];
      }
    });

    const providers = await prisma.providerProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            city: true
          }
        },
        categories: true,
        licenses: {
          where: { isVerified: true }
        }
      },
      orderBy: getOrderBy(sortBy)
    });

    // Calculate ratings and filter by minRating
    const providersWithRatings = await Promise.all(
      providers.map(async (provider) => {
        const reviews = await prisma.review.findMany({
          where: { toUserId: provider.userId }
        });

        const ratingAvg = reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : 0;
        const ratingCount = reviews.length;

        return {
          ...provider,
          ratingAvg,
          ratingCount
        };
      })
    );

    // Apply post-query filters
    let filtered = providersWithRatings;

    // Min rating filter
    if (minRating) {
      const min = parseFloat(minRating);
      filtered = filtered.filter(p => p.ratingAvg >= min);
    }

    // Verified filter
    if (verified === 'true') {
      filtered = filtered.filter(p => 
        p.kycVerified || 
        p.identityEmailVerified || 
        p.identityPhoneVerified || 
        p.identityDnsVerified
      );
    }

    // Has licenses filter
    if (hasLicenses === 'true') {
      filtered = filtered.filter(p => p.licenses && p.licenses.length > 0);
    }

    // Re-sort after filtering
    if (sortBy === 'badges') {
      filtered.sort((a, b) => {
        const badgesA = getBadgeCount(a);
        const badgesB = getBadgeCount(b);
        if (badgesB !== badgesA) return badgesB - badgesA;
        return (b.ratingAvg || 0) - (a.ratingAvg || 0);
      });
    } else if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      filtered.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
    }

    res.json(filtered);
  } catch (e) {
    next(e);
  }
});

// Helper function to get badge count
function getBadgeCount(provider) {
  let count = 0;
  if (provider.kycVerified || (provider.badgeData && provider.badgeData.BUSINESS?.verified)) count++;
  if (provider.identityEmailVerified || provider.identityPhoneVerified || provider.identityDnsVerified) count++;
  if (provider.safetyInsuranceUrl) count++;
  return count;
}

// Helper function for orderBy
function getOrderBy(sortBy) {
  switch (sortBy) {
    case 'recent':
      return { createdAt: 'desc' };
    case 'rating':
    default:
      return { ratingAvg: 'desc' };
  }
}

// get current provider profile - MUST be before /:userId route
// Get current user's provider profile
// Dozvoljeno za PROVIDER, ADMIN i USER-e koji su tvrtke/obrti (imaju legalStatusId)
r.get('/me', auth(true, ['PROVIDER', 'ADMIN', 'USER']), async (req, res, next) => {
  try {
    // Provjeri da li USER ima legalStatusId (tvrtka/obrt)
    if (req.user.role === 'USER') {
      const userCheck = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { legalStatusId: true }
      });
      
      if (!userCheck || !userCheck.legalStatusId) {
        return res.status(403).json({ 
          error: 'Nemate pristup',
          message: 'Ovaj endpoint je dostupan samo za tvrtke/obrte ili pružatelje usluga.'
        });
      }
    }
    
    let provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          include: {
            legalStatus: true
          }
        },
        categories: true,
        licenses: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    // Ako profil ne postoji, kreiraj ga automatski
    if (!provider) {
      
      // Dohvati korisničke podatke za kreiranje profila
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          city: true,
          legalStatusId: true,
          taxId: true,
          companyName: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      try {
        provider = await prisma.providerProfile.create({
          data: {
            userId: req.user.id,
            bio: '',
            specialties: [],
            experience: 0,
            website: '',
            serviceArea: user?.city || '',
            legalStatusId: user?.legalStatusId,
            taxId: user?.taxId,
            companyName: user?.companyName,
            isAvailable: true,
            portfolio: null
          },
      include: {
        user: {
          include: {
            legalStatus: true
          }
        },
        categories: true
      }
        });

      } catch (createError) {
        console.error(`❌ Greška pri kreiranju ProviderProfile:`, createError);
        return res.status(500).json({ error: 'Failed to create provider profile' });
      }
    }

    // reviews summary
    const reviews = await prisma.review.findMany({
      where: { toUserId: req.user.id }
    });

    const ratingAvg = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.json({
      ...provider,
      ratingAvg,
      ratingCount: reviews.length,
      // Include identity verification status
      identityEmailVerified: provider.identityEmailVerified || false,
      identityEmailVerifiedAt: provider.identityEmailVerifiedAt || null,
      identityPhoneVerified: provider.identityPhoneVerified || false,
      identityPhoneVerifiedAt: provider.identityPhoneVerifiedAt || null,
      identityDnsVerified: provider.identityDnsVerified || false,
      identityDnsVerifiedAt: provider.identityDnsVerifiedAt || null,
      // Include reputation metrics
      avgResponseTimeMinutes: provider.avgResponseTimeMinutes || 0,
      conversionRate: provider.conversionRate || 0
    });
  } catch (e) {
    next(e);
  }
});

// get provider profile by userId
r.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { providerProfile: { include: { categories: true } } }
    });
    if (!user || user.role !== 'PROVIDER') return res.status(404).json({ error: 'Provider not found' });
    // reviews summary
    const reviews = await prisma.review.findMany({ where: { toUserId: userId } });
    res.json({ user, reviews });
  } catch (e) { next(e); }
});

// update provider profile
// Dozvoljeno za PROVIDER, ADMIN i USER-e koji su tvrtke/obrti (imaju legalStatusId)
r.put('/me', auth(true, ['PROVIDER', 'ADMIN', 'USER']), async (req, res, next) => {
  try {
    // Provjeri da li USER ima legalStatusId (tvrtka/obrt)
    if (req.user.role === 'USER') {
      const userCheck = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { legalStatusId: true }
      });
      
      if (!userCheck || !userCheck.legalStatusId) {
        return res.status(403).json({ 
          error: 'Nemate pristup',
          message: 'Ovaj endpoint je dostupan samo za tvrtke/obrte ili pružatelje usluga.'
        });
      }
    }
    
    const { 
      bio, 
      serviceArea, 
      categoryIds = [], 
      specialties = [], 
      experience, 
      website, 
      isAvailable = true,
      portfolio 
    } = req.body;
    
    // VALIDACIJA: Kategorije su obavezne za pružatelje
    if (categoryIds.length === 0) {
      return res.status(400).json({ 
        error: 'Morate odabrati minimalno 1 kategoriju usluga kojima se bavite.',
        details: 'Kategorije su obavezne za pružatelje usluga kako bi klijenti mogli pronaći vaše usluge.'
      });
    }
    
    // VALIDACIJA: Provjeri da li kategorije postoje
    const existingCategories = await prisma.category.findMany({
      where: { id: { in: categoryIds } }
    });
    
    if (existingCategories.length !== categoryIds.length) {
      return res.status(400).json({ 
        error: 'Neke od odabranih kategorija ne postoje.',
        details: 'Molimo provjerite da li su sve kategorije valjane.'
      });
    }
    
    const prof = await prisma.providerProfile.upsert({
      where: { userId: req.user.id },
      create: { 
        userId: req.user.id, 
        bio: bio || '', 
        serviceArea: serviceArea || '',
        specialties: Array.isArray(specialties) ? specialties : [],
        experience: experience ? parseInt(experience) : null,
        website: website || null,
        isAvailable: Boolean(isAvailable),
        portfolio: portfolio || null
      },
      update: {
        bio: bio || undefined,
        serviceArea: serviceArea || undefined,
        specialties: Array.isArray(specialties) ? specialties : undefined,
        experience: experience ? parseInt(experience) : undefined,
        website: website || undefined,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
        portfolio: portfolio || undefined,
        categories: { set: [], connect: categoryIds.map(id => ({ id })) }
      }
    });
    res.json(prof);
  } catch (e) { next(e); }
});

// Portfolio management endpoints
// Add portfolio item
r.post('/portfolio', auth(true, ['PROVIDER', 'ADMIN']), async (req, res, next) => {
  try {
    const userId = req.user.role === 'ADMIN' ? req.body.userId || req.user.id : req.user.id;
    
    const { title, description, images = [], category, date, location, client } = req.body;
    
    if (!title || !images || images.length === 0) {
      return res.status(400).json({ 
        error: 'Naslov i barem jedna slika su obavezni' 
      });
    }

    const profile = await prisma.providerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Provider profil nije pronađen' });
    }

    const currentPortfolio = profile.portfolio || { items: [] };
    const newItem = {
      id: require('crypto').randomUUID(),
      title,
      description: description || null,
      images: Array.isArray(images) ? images : [images],
      category: category || null,
      date: date || new Date().toISOString().split('T')[0],
      location: location || null,
      client: client || null,
      createdAt: new Date().toISOString()
    };

    currentPortfolio.items = [...currentPortfolio.items, newItem];

    const updated = await prisma.providerProfile.update({
      where: { userId },
      data: { portfolio: currentPortfolio }
    });

    res.json({ 
      success: true, 
      portfolio: updated.portfolio,
      item: newItem
    });
  } catch (e) { next(e); }
});

// Update portfolio item
r.put('/portfolio/:itemId', auth(true, ['PROVIDER', 'ADMIN']), async (req, res, next) => {
  try {
    const userId = req.user.role === 'ADMIN' ? req.body.userId || req.user.id : req.user.id;
    const { itemId } = req.params;
    
    const { title, description, images, category, date, location, client } = req.body;

    const profile = await prisma.providerProfile.findUnique({
      where: { userId }
    });

    if (!profile || !profile.portfolio || !profile.portfolio.items) {
      return res.status(404).json({ error: 'Portfolio nije pronađen' });
    }

    const items = profile.portfolio.items;
    const itemIndex = items.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Portfolio item nije pronađen' });
    }

    items[itemIndex] = {
      ...items[itemIndex],
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(images && { images: Array.isArray(images) ? images : [images] }),
      ...(category !== undefined && { category }),
      ...(date && { date }),
      ...(location !== undefined && { location }),
      ...(client !== undefined && { client }),
      updatedAt: new Date().toISOString()
    };

    const updated = await prisma.providerProfile.update({
      where: { userId },
      data: { portfolio: { items } }
    });

    res.json({ 
      success: true, 
      portfolio: updated.portfolio,
      item: items[itemIndex]
    });
  } catch (e) { next(e); }
});

// Delete portfolio item
r.delete('/portfolio/:itemId', auth(true, ['PROVIDER', 'ADMIN']), async (req, res, next) => {
  try {
    const userId = req.user.role === 'ADMIN' ? req.body.userId || req.user.id : req.user.id;
    const { itemId } = req.params;

    const profile = await prisma.providerProfile.findUnique({
      where: { userId }
    });

    if (!profile || !profile.portfolio || !profile.portfolio.items) {
      return res.status(404).json({ error: 'Portfolio nije pronađen' });
    }

    const items = profile.portfolio.items.filter(item => item.id !== itemId);

    const updated = await prisma.providerProfile.update({
      where: { userId },
      data: { portfolio: { items } }
    });

    res.json({ 
      success: true, 
      portfolio: updated.portfolio
    });
  } catch (e) { next(e); }
});

// Get portfolio (public)
r.get('/portfolio/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { portfolio: true }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Provider profil nije pronađen' });
    }

    res.json({ portfolio: profile.portfolio || { items: [] } });
  } catch (e) { next(e); }
});

// License management endpoints
// Get all licenses for current provider
r.get('/licenses', auth(true, ['PROVIDER', 'ADMIN']), async (req, res, next) => {
  try {
    const userId = req.user.role === 'ADMIN' ? req.query.userId || req.user.id : req.user.id;
    
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { licenses: true }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Provider profil nije pronađen' });
    }

    res.json({ licenses: profile.licenses || [] });
  } catch (e) { next(e); }
});

// Add license
r.post('/licenses', auth(true, ['PROVIDER', 'ADMIN']), async (req, res, next) => {
  try {
    const userId = req.user.role === 'ADMIN' ? req.body.userId || req.user.id : req.user.id;
    
    const { licenseType, licenseNumber, issuingAuthority, issuedAt, expiresAt, documentUrl, notes } = req.body;
    
    if (!licenseType || !licenseNumber || !issuingAuthority || !issuedAt) {
      return res.status(400).json({ 
        error: 'Tip licence, broj licence, tijelo koje izdaje i datum izdavanja su obavezni' 
      });
    }

    const profile = await prisma.providerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Provider profil nije pronađen' });
    }

    const license = await prisma.providerLicense.create({
      data: {
        providerId: profile.id,
        licenseType,
        licenseNumber,
        issuingAuthority,
        issuedAt: new Date(issuedAt),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        documentUrl: documentUrl || null,
        notes: notes || null,
        isVerified: false // Nove licence čekaju verifikaciju
      }
    });

    res.json({ 
      success: true, 
      license
    });
  } catch (e) { next(e); }
});

// Update license
r.put('/licenses/:licenseId', auth(true, ['PROVIDER', 'ADMIN']), async (req, res, next) => {
  try {
    const userId = req.user.role === 'ADMIN' ? req.body.userId || req.user.id : req.user.id;
    const { licenseId } = req.params;
    
    const { licenseType, licenseNumber, issuingAuthority, issuedAt, expiresAt, documentUrl, notes } = req.body;

    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      include: { licenses: true }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Provider profil nije pronađen' });
    }

    const license = profile.licenses.find(l => l.id === licenseId);
    if (!license) {
      return res.status(404).json({ error: 'Licenca nije pronađena' });
    }

    // Ako je licenca verificirana, samo admin može je mijenjati
    if (license.isVerified && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Verificirane licence mogu mijenjati samo administratori' 
      });
    }

    const updated = await prisma.providerLicense.update({
      where: { id: licenseId },
      data: {
        ...(licenseType && { licenseType }),
        ...(licenseNumber && { licenseNumber }),
        ...(issuingAuthority && { issuingAuthority }),
        ...(issuedAt && { issuedAt: new Date(issuedAt) }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(documentUrl !== undefined && { documentUrl }),
        ...(notes !== undefined && { notes }),
        // Reset verification status ako se mijenjaju osnovni podaci
        ...((licenseType || licenseNumber || issuingAuthority || issuedAt) && {
          isVerified: false,
          verifiedAt: null,
          verifiedBy: null
        })
      }
    });

    res.json({ 
      success: true, 
      license: updated
    });
  } catch (e) { next(e); }
});

// Delete license
r.delete('/licenses/:licenseId', auth(true, ['PROVIDER', 'ADMIN']), async (req, res, next) => {
  try {
    const userId = req.user.role === 'ADMIN' ? req.body.userId || req.user.id : req.user.id;
    const { licenseId } = req.params;

    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      include: { licenses: true }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Provider profil nije pronađen' });
    }

    const license = profile.licenses.find(l => l.id === licenseId);
    if (!license) {
      return res.status(404).json({ error: 'Licenca nije pronađena' });
    }

    // Ako je licenca verificirana, samo admin može je obrisati
    if (license.isVerified && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Verificirane licence mogu brisati samo administratori' 
      });
    }

    await prisma.providerLicense.delete({
      where: { id: licenseId }
    });

    res.json({ 
      success: true,
      message: 'Licenca uspješno obrisana'
    });
  } catch (e) { next(e); }
});

// Get public licenses for a provider
r.get('/licenses/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { 
        licenses: {
          where: { isVerified: true }, // Samo verificirane licence javno
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Provider profil nije pronađen' });
    }

    res.json({ licenses: profile.licenses || [] });
  } catch (e) { next(e); }
});

// Fix missing ProviderProfile for current user
// Dozvoljeno za PROVIDER, ADMIN i USER-e koji su tvrtke/obrti (imaju legalStatusId)
r.post('/fix-profile', auth(true, ['PROVIDER', 'ADMIN', 'USER']), async (req, res, next) => {
  try {
    // Admin može kreirati profil za bilo kojeg korisnika
    const userId = req.user.role === 'ADMIN' && req.body.userId ? req.body.userId : req.user.id;
    
    // Za USER-e, provjeri da li imaju legalStatusId (tvrtka/obrt)
    if (req.user.role === 'USER') {
      const userCheck = await prisma.user.findUnique({
        where: { id: userId },
        select: { legalStatusId: true }
      });
      
      if (!userCheck || !userCheck.legalStatusId) {
        return res.status(403).json({ 
          error: 'Nemate pristup',
          message: 'Ovaj endpoint je dostupan samo za tvrtke/obrte ili pružatelje usluga.'
        });
      }
    }
    
    // Provjeri da li već postoji profil
    const existingProfile = await prisma.providerProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        categories: true
      }
    });

    if (existingProfile) {
      // Include identity verification status and reputation metrics
      const profileWithExtras = {
        ...existingProfile,
        identityEmailVerified: existingProfile.identityEmailVerified || false,
        identityEmailVerifiedAt: existingProfile.identityEmailVerifiedAt || null,
        identityPhoneVerified: existingProfile.identityPhoneVerified || false,
        identityPhoneVerifiedAt: existingProfile.identityPhoneVerifiedAt || null,
        identityDnsVerified: existingProfile.identityDnsVerified || false,
        identityDnsVerifiedAt: existingProfile.identityDnsVerifiedAt || null,
        avgResponseTimeMinutes: existingProfile.avgResponseTimeMinutes || 0,
        conversionRate: existingProfile.conversionRate || 0
      };
      
      return res.json({ 
        message: 'Provider profil već postoji',
        profile: profileWithExtras
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

// Fix all missing provider profiles (admin endpoint)
r.post('/fix-all-profiles', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    
    // Pronađi sve PROVIDER korisnike koji nemaju ProviderProfile
    const providersWithoutProfile = await prisma.user.findMany({
      where: {
        role: 'PROVIDER',
        providerProfile: null
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        city: true,
        legalStatusId: true,
        taxId: true,
        companyName: true
      }
    });


    if (providersWithoutProfile.length === 0) {
      return res.json({ 
        message: 'Svi PROVIDER korisnici već imaju profile!',
        created: 0,
        users: []
      });
    }

    const createdProfiles = [];
    const errors = [];

    // Kreiraj ProviderProfile za svakog korisnika
    for (const user of providersWithoutProfile) {
      try {
        
        const providerProfile = await prisma.providerProfile.create({
          data: {
            userId: user.id,
            bio: '',
            specialties: [],
            experience: 0,
            website: '',
            serviceArea: user.city || '',
            legalStatusId: user.legalStatusId,
            taxId: user.taxId,
            companyName: user.companyName,
            isAvailable: true,
            portfolio: null
          }
        });

        createdProfiles.push({
          userId: user.id,
          email: user.email,
          fullName: user.fullName
        });

      } catch (error) {
        console.error(`❌ Greška pri kreiranju profila za ${user.email}:`, error.message);
        errors.push({
          userId: user.id,
          email: user.email,
          error: error.message
        });
      }
    }


    res.json({
      message: `Kreirano ${createdProfiles.length} ProviderProfile-a`,
      created: createdProfiles.length,
      errors: errors.length,
      users: createdProfiles,
      errorDetails: errors
    });

  } catch (e) {
    next(e);
  }
});

// Upload license document
r.post('/upload-license', auth(true, ['PROVIDER']), uploadDocument.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { categoryId, docType } = req.body;

    if (!categoryId) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    // Verify category exists and requires license
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (!category.requiresLicense) {
      return res.status(400).json({ error: 'This category does not require a license' });
    }

    // Get provider profile
    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: true }
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    // Scan license document with OCR
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join('./uploads', req.file.filename);
    const fileBuffer = await fs.readFile(filePath);
    
    const { scanLicenseDocument, validateExtractedData } = await import('../services/license-scanner.js');
    const scanResult = await scanLicenseDocument(fileBuffer, req.file.originalname);
    
    // Create or update license
    const documentUrl = getImageUrl(req, req.file.filename);
    
    // Koristi ekstrahirane podatke iz skenera, ili fallback na category podatke
    const extractedData = scanResult.success ? scanResult.data : null;
    const validation = extractedData ? validateExtractedData(extractedData) : null;
    
    const licenseData = {
      providerId: provider.id,
      licenseType: extractedData?.licenseType || category.licenseType || docType || 'Licenca',
      licenseNumber: extractedData?.licenseNumber || '',
      issuingAuthority: extractedData?.issuingAuthority || category.licenseAuthority || 'N/A',
      issuedAt: extractedData?.issuedAt || new Date(),
      expiresAt: extractedData?.expiresAt || null,
      documentUrl: documentUrl,
      isVerified: false,
      notes: scanResult.success 
        ? `OCR confidence: ${Math.round(scanResult.confidence || 0)}%. ${validation?.warnings?.join('; ') || ''}` 
        : `OCR nije uspješan: ${scanResult.message || 'Nepoznata greška'}. Molimo unesite podatke ručno.`
    };

    const license = await prisma.providerLicense.create({
      data: licenseData
    });

    // Update approval status to WAITING_FOR_APPROVAL
    await prisma.providerProfile.update({
      where: { userId: req.user.id },
      data: { 
        approvalStatus: 'WAITING_FOR_APPROVAL'
      }
    });

    // Notify admins that a new provider is waiting for approval
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          title: 'Novi pružatelj čeka odobrenje',
          message: `${provider.user.fullName} (${provider.user.email}) je registrirao lice za kategoriju ${category.name}`,
          type: 'SYSTEM',
          userId: admin.id,
          jobId: null,
          offerId: null
        }
      });
    }

    res.json({
      message: scanResult.success 
        ? 'License document uploaded and scanned successfully. Please review the extracted data.'
        : 'License document uploaded successfully. Please enter the license details manually.',
      url: documentUrl,
      scanResult: scanResult.success ? {
        success: true,
        confidence: scanResult.confidence,
        extractedData: extractedData ? {
          licenseType: extractedData.licenseType,
          licenseNumber: extractedData.licenseNumber,
          issuingAuthority: extractedData.issuingAuthority,
          issuedAt: extractedData.issuedAt?.toISOString().split('T')[0],
          expiresAt: extractedData.expiresAt?.toISOString().split('T')[0]
        } : null,
        validation: validation
      } : {
        success: false,
        message: scanResult.message,
        requiresManual: scanResult.requiresManual || false
      },
      license: {
        id: license.id,
        documentUrl: documentUrl,
        licenseType: license.licenseType,
        licenseNumber: license.licenseNumber,
        issuingAuthority: license.issuingAuthority,
        issuedAt: license.issuedAt,
        expiresAt: license.expiresAt,
        isVerified: license.isVerified,
        notes: license.notes
      }
    });
  } catch (e) {
    next(e);
  }
});

// ============================================================
// GEO-DYNAMIC TEAM LOCATIONS
// ============================================================

// Get all team locations for current provider
r.get('/me/team-locations', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id },
      select: { id: true }
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    const locations = await prisma.providerTeamLocation.findMany({
      where: { providerId: provider.id },
      orderBy: [{ isPrimary: 'desc' }, { isActive: 'desc' }, { createdAt: 'desc' }]
    });

    res.json(locations);
  } catch (e) { next(e); }
});

// Create new team location
r.post('/me/team-locations', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id },
      select: { id: true }
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    const { name, city, latitude, longitude, address, postalCode, radiusKm = 50, isActive = true, isPrimary = false, notes } = req.body;

    // Ako je nova lokacija primary, makni primary s ostalih
    if (isPrimary) {
      await prisma.providerTeamLocation.updateMany({
        where: { providerId: provider.id, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    const location = await prisma.providerTeamLocation.create({
      data: {
        providerId: provider.id,
        name,
        city,
        latitude,
        longitude,
        address,
        postalCode,
        radiusKm: parseInt(radiusKm) || 50,
        isActive,
        isPrimary,
        notes,
        lastActiveAt: isActive ? new Date() : null
      }
    });

    res.status(201).json(location);
  } catch (e) { next(e); }
});

// Update team location
r.put('/me/team-locations/:locationId', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { locationId } = req.params;
    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id },
      select: { id: true }
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    // Provjeri vlasništvo
    const location = await prisma.providerTeamLocation.findUnique({
      where: { id: locationId }
    });

    if (!location || location.providerId !== provider.id) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const { name, city, latitude, longitude, address, postalCode, radiusKm, isActive, isPrimary, notes } = req.body;

    // Ako je nova lokacija primary, makni primary s ostalih
    if (isPrimary && !location.isPrimary) {
      await prisma.providerTeamLocation.updateMany({
        where: { providerId: provider.id, isPrimary: true, id: { not: locationId } },
        data: { isPrimary: false }
      });
    }

    const updated = await prisma.providerTeamLocation.update({
      where: { id: locationId },
      data: {
        name,
        city,
        latitude,
        longitude,
        address,
        postalCode,
        radiusKm: radiusKm ? parseInt(radiusKm) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        isPrimary: isPrimary !== undefined ? isPrimary : undefined,
        notes,
        lastActiveAt: isActive ? new Date() : location.lastActiveAt
      }
    });

    res.json(updated);
  } catch (e) { next(e); }
});

// Delete team location
r.delete('/me/team-locations/:locationId', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { locationId } = req.params;
    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id },
      select: { id: true }
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    const location = await prisma.providerTeamLocation.findUnique({
      where: { id: locationId }
    });

    if (!location || location.providerId !== provider.id) {
      return res.status(404).json({ error: 'Location not found' });
    }

    await prisma.providerTeamLocation.delete({
      where: { id: locationId }
    });

    res.json({ success: true });
  } catch (e) { next(e); }
});

// Quick update: Set location as active/inactive (toggle)
r.patch('/me/team-locations/:locationId/toggle-active', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { locationId } = req.params;
    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id },
      select: { id: true }
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    const location = await prisma.providerTeamLocation.findUnique({
      where: { id: locationId }
    });

    if (!location || location.providerId !== provider.id) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const updated = await prisma.providerTeamLocation.update({
      where: { id: locationId },
      data: {
        isActive: !location.isActive,
        lastActiveAt: !location.isActive ? new Date() : location.lastActiveAt
      }
    });

    res.json(updated);
  } catch (e) { next(e); }
});

export default r;