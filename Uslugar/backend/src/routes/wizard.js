import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';

const r = Router();

// Dostupne regije u Hrvatskoj (za wizard)
const AVAILABLE_REGIONS = [
  'Zagreb',
  'Zagrebačka županija',
  'Splitsko-dalmatinska županija',
  'Primorsko-goranska županija',
  'Istarska županija',
  'Osječko-baranjska županija',
  'Vukovarsko-srijemska županija',
  'Šibensko-kninska županija',
  'Zadarska županija',
  'Dubrovačko-neretvanska županija',
  'Ličko-senjska županija',
  'Karlovačka županija',
  'Sisačko-moslavačka županija',
  'Bjelovarsko-bilogorska županija',
  'Virovitičko-podravska županija',
  'Požeško-slavonska županija',
  'Brodsko-posavska županija',
  'Međimurska županija',
  'Varaždinska županija',
  'Krapinsko-zagorska županija',
  'Koprivničko-križevačka županija',
  'Bjelovarsko-bilogorska županija',
  'Sisačko-moslavačka županija',
  'Splitsko-dalmatinska županija',
  'Dalmacija',
  'Istra',
  'Slavonija',
  'Središnja Hrvatska',
  'Sjeverna Hrvatska'
];

// GET /api/wizard/categories - Dohvat dostupnih kategorija (za wizard)
r.get('/categories', auth(false), async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Grupiraj kategorije po roditeljima (glavne kategorije)
    const mainCategories = categories.filter(cat => !cat.parentId);
    const subcategories = categories.filter(cat => cat.parentId);

    res.json({
      mainCategories: mainCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        subcategories: subcategories
          .filter(sub => sub.parentId === cat.id)
          .map(sub => ({
            id: sub.id,
            name: sub.name,
            description: sub.description,
            icon: sub.icon
          }))
      })),
      allCategories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        parentId: cat.parentId
      }))
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/wizard/regions - Dohvat dostupnih regija (za wizard)
r.get('/regions', auth(false), async (req, res, next) => {
  try {
    res.json({
      regions: AVAILABLE_REGIONS.map((region, index) => ({
        id: `region_${index}`,
        name: region
      }))
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/wizard/status - Provjera statusa wizarda (da li je korisnik već prošao wizard)
r.get('/status', auth(true), async (req, res, next) => {
  try {
    // Samo za PROVIDER role
    if (req.user.role !== 'PROVIDER') {
      return res.status(403).json({ 
        error: 'Wizard je dostupan samo za pružatelje usluga' 
      });
    }

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        categories: {
          select: { id: true, name: true }
        }
      }
    });

    if (!providerProfile) {
      return res.json({
        completed: false,
        step: 1, // Počni s korakom 1 (osnovni podaci)
        message: 'Provider profil nije kreiran'
      });
    }

    const hasCategories = providerProfile.categories.length > 0;
    const hasServiceArea = providerProfile.serviceArea && providerProfile.serviceArea.trim() !== '';

    if (hasCategories && hasServiceArea) {
      return res.json({
        completed: true,
        step: 3, // Wizard završen
        message: 'Wizard je već završen',
        categories: providerProfile.categories,
        serviceArea: providerProfile.serviceArea
      });
    }

    // Odredi trenutni korak
    let currentStep = 1;
    if (hasCategories) {
      currentStep = 2; // Kategorije odabrane, treba odabrati regije
    } else {
      currentStep = 1; // Treba odabrati kategorije
    }

    return res.json({
      completed: false,
      step: currentStep,
      message: 'Wizard nije završen',
      categories: providerProfile.categories,
      serviceArea: providerProfile.serviceArea
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/wizard/categories - Spremanje odabira kategorija
r.post('/categories', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { categoryIds } = req.body;

    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({ 
        error: 'Morate odabrati minimalno 1 kategoriju' 
      });
    }

    // Provjeri da li kategorije postoje
    const existingCategories = await prisma.category.findMany({
      where: { 
        id: { in: categoryIds },
        isActive: true
      }
    });

    if (existingCategories.length !== categoryIds.length) {
      return res.status(400).json({ 
        error: 'Neke od odabranih kategorija ne postoje ili nisu aktivne' 
      });
    }

    // Provjeri da li provider profil postoji
    let providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!providerProfile) {
      // Kreiraj provider profil ako ne postoji
      providerProfile = await prisma.providerProfile.create({
        data: {
          userId: req.user.id,
          bio: '',
          serviceArea: '',
          categories: {
            connect: categoryIds.map(id => ({ id }))
          }
        },
        include: {
          categories: {
            select: { id: true, name: true }
          }
        }
      });
    } else {
      // Ažuriraj kategorije
      providerProfile = await prisma.providerProfile.update({
        where: { userId: req.user.id },
        data: {
          categories: {
            set: [],
            connect: categoryIds.map(id => ({ id }))
          }
        },
        include: {
          categories: {
            select: { id: true, name: true }
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Kategorije su uspješno spremljene',
      categories: providerProfile.categories,
      nextStep: 2 // Sljedeći korak je odabir regija
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/wizard/regions - Spremanje odabira regija
r.post('/regions', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { regions } = req.body;

    if (!regions || !Array.isArray(regions) || regions.length === 0) {
      return res.status(400).json({ 
        error: 'Morate odabrati minimalno 1 regiju' 
      });
    }

    // Validiraj regije (provjeri da li su u listi dostupnih regija)
    const invalidRegions = regions.filter(region => !AVAILABLE_REGIONS.includes(region));
    if (invalidRegions.length > 0) {
      return res.status(400).json({ 
        error: 'Neke od odabranih regija nisu valjane',
        invalidRegions
      });
    }

    // Provjeri da li provider profil postoji
    let providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!providerProfile) {
      return res.status(404).json({ 
        error: 'Provider profil nije pronađen. Molimo prvo odaberite kategorije.' 
      });
    }

    // Spremi regije kao serviceArea (može biti više regija odvojeno zarezom)
    const serviceArea = regions.join(', ');

    providerProfile = await prisma.providerProfile.update({
      where: { userId: req.user.id },
      data: {
        serviceArea
      },
      include: {
        categories: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Regije su uspješno spremljene',
      serviceArea: providerProfile.serviceArea,
      completed: true,
      wizardCompleted: true
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/wizard/complete - Kompletiranje wizarda (opcionalno, za tracking)
r.post('/complete', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        categories: {
          select: { id: true, name: true }
        }
      }
    });

    if (!providerProfile) {
      return res.status(404).json({ 
        error: 'Provider profil nije pronađen' 
      });
    }

    const hasCategories = providerProfile.categories.length > 0;
    const hasServiceArea = providerProfile.serviceArea && providerProfile.serviceArea.trim() !== '';

    if (!hasCategories || !hasServiceArea) {
      return res.status(400).json({ 
        error: 'Wizard nije završen',
        message: 'Morate odabrati kategorije i regije prije završetka wizarda'
      });
    }

    res.json({
      success: true,
      message: 'Wizard je uspješno završen',
      wizardCompleted: true,
      categories: providerProfile.categories,
      serviceArea: providerProfile.serviceArea
    });
  } catch (e) {
    next(e);
  }
});

export default r;

