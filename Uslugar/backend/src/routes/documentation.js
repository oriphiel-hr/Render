import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const r = Router();

/**
 * Popravi encoding problema - pretvori pogrešno dekodirane UTF-8 znakove
 * Primjer: "┼ż" -> "ž" (C5 BE u UTF-8 je pogrešno interpretiran kao Windows-1252)
 * 
 * Problem nastaje kada se UTF-8 podaci čitaju kao Windows-1252 (latin1) encoding.
 * Ova funkcija pokušava vratiti podatke u ispravan UTF-8 oblik.
 */
function fixEncoding(text) {
  if (!text || typeof text !== 'string') return text;
  
  try {
    // Provjeri da li postoje poznati encoding problemi (mojibake)
    if (!text.includes('┼') && !text.includes('Â') && !text.includes('Ã')) {
      // Tekst već izgleda ispravno, vrati ga
      return text;
    }
    
    // Pokušaj konvertirati iz Windows-1252 natrag u UTF-8
    // Ovo radi tako što uzme string kao da je Windows-1252 i konvertira ga u UTF-8
    try {
      // Kreiramo Buffer iz stringa tretiranog kao Windows-1252 (latin1)
      // Zatim ga dekodiramo kao UTF-8
      const buffer = Buffer.from(text, 'latin1');
      const utf8Text = buffer.toString('utf8');
      
      // Provjeri da li je rezultat bolji (nema više ┼ znakova)
      if (!utf8Text.includes('┼')) {
        return utf8Text;
      }
    } catch (e) {
      // Ako konverzija ne uspije, nastavi s replace metodom
    }
    
    // Fallback: Zamijeni poznate encoding probleme
    // "┼ż" = Windows-1252 za UTF-8 "ž" (0xC5 0xBE)
    // "┼í" = Windows-1252 za UTF-8 "ć" (0xC4 0x87)
    // "┼ì" = Windows-1252 za UTF-8 "č" (0xC4 0x8D)
    // "┼í" = Windows-1252 za UTF-8 "đ" (0xC4 0x91)
    // "┼í" = Windows-1252 za UTF-8 "š" (0xC5 0xA1)
    return text
      .replace(/┼ż/g, 'ž')
      .replace(/┼í/g, 'ć')
      .replace(/┼ì/g, 'č')
      .replace(/┼░/g, 'đ')
      .replace(/┼í/g, 'š')
      .replace(/┼ü/g, 'Ž')
      .replace(/┼î/g, 'Ć')
      .replace(/┼î/g, 'Č')
      .replace(/┼î/g, 'Đ')
      .replace(/┼Ü/g, 'Š')
      // Također popravi druge česte probleme
      .replace(/Â/g, '')
      .replace(/Ã/g, '');
  } catch (error) {
    console.error('[Encoding Fix] Error fixing encoding:', error);
    return text; // Ako nešto pođe po zlu, vrati original
  }
}

/**
 * Rekurzivno popravi encoding u objektu ili nizu
 */
function fixEncodingRecursive(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return fixEncoding(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => fixEncodingRecursive(item));
  }
  
  if (typeof obj === 'object') {
    const fixed = {};
    for (const [key, value] of Object.entries(obj)) {
      fixed[key] = fixEncodingRecursive(value);
    }
    return fixed;
  }
  
  return obj;
}

// GET /api/documentation - Dohvati sve kategorije i feature opise
r.get('/', async (req, res, next) => {
  try {
    // Provjeri da li tablice postoje - ako ne, vrati prazan array
    let categories;
    try {
      categories = await prisma.documentationCategory.findMany({
        where: {
          isActive: true
        },
        include: {
          features: {
            where: {
              deprecated: false,
              isAdminOnly: false // Samo javne funkcionalnosti (ne admin-only)
            },
            orderBy: {
              order: 'asc'
            }
          }
        },
        orderBy: {
          order: 'asc'
        }
      });
    } catch (error) {
      // Ako tablice ne postoje (npr. migracije nisu primijenjene), vrati prazan odgovor
      if (error.message.includes('does not exist') || error.message.includes('Unknown table')) {
        console.warn('⚠️  DocumentationCategory table does not exist - migrations may not be applied');
        return res.json({
          features: [],
          featureDescriptions: {}
        });
      }
      throw error; // Re-throw other errors
    }

    // Filtriraj kategorije koje imaju javne features (ne samo admin-only)
    // Također ukloni "Statistike Implementacije" kategoriju
    const publicCategories = categories.filter(cat => 
      cat.features.length > 0 && cat.name !== 'Statistike Implementacije'
    );

    // Transformiraj podatke u format koji komponenta očekuje
    const features = publicCategories.map(cat => ({
      category: fixEncoding(cat.name),
      items: cat.features.map(f => ({
        name: fixEncoding(f.name),
        implemented: f.implemented,
        deprecated: f.deprecated
      }))
    }));

    // Kreiraj featureDescriptions objekt (samo za javne features)
    const featureDescriptions = {};
    publicCategories.forEach(cat => {
      cat.features.forEach(f => {
        if (f.summary || f.details) {
          featureDescriptions[fixEncoding(f.name)] = {
            implemented: f.implemented,
            summary: fixEncoding(f.summary || ''),
            details: fixEncoding(f.details || '')
          };
        }
      });
    });

    res.json({
      features,
      featureDescriptions
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/documentation/stats - Statistike implementacije
r.get('/stats', async (req, res, next) => {
  try {
    const categories = await prisma.documentationCategory.findMany({
      where: {
        isActive: true
      },
      include: {
        features: {
          where: {
            deprecated: false,
            isAdminOnly: false // Samo javne funkcionalnosti
          }
        }
      }
    });

    // Filtriraj kategorije koje imaju javne features
    // Također ukloni "Statistike Implementacije" kategoriju
    const publicCategories = categories.filter(cat => 
      cat.features.length > 0 && cat.name !== 'Statistike Implementacije'
    );

    let totalItems = 0;
    let implementedItems = 0;

    publicCategories.forEach(cat => {
      cat.features.forEach(f => {
        totalItems++;
        if (f.implemented) {
          implementedItems++;
        }
      });
    });

    const percentage = totalItems > 0 ? Math.round((implementedItems / totalItems) * 100) : 0;

    res.json({
      totalItems,
      implementedItems,
      percentage
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/documentation/migrate - Migriraj hardkodirane podatke u bazu (admin only)
// Koristi se jednom za migraciju postojećih podataka
r.post('/migrate', async (req, res, next) => {
  try {
    const { features, featureDescriptions } = req.body;

    if (!features || !Array.isArray(features)) {
      return res.status(400).json({ error: 'Features array is required' });
    }

    let categoriesCreated = 0;
    let featuresCreated = 0;
    let featuresUpdated = 0;

    for (let catIndex = 0; catIndex < features.length; catIndex++) {
      const categoryData = features[catIndex];
      
      // Kreiraj ili ažuriraj kategoriju
      const category = await prisma.documentationCategory.upsert({
        where: { name: categoryData.category },
        update: {
          order: catIndex,
          isActive: true
        },
        create: {
          name: categoryData.category,
          order: catIndex,
          isActive: true
        }
      });

      if (category) categoriesCreated++;

      // Kreiraj ili ažuriraj feature opise
      if (categoryData.items && Array.isArray(categoryData.items)) {
        for (let itemIndex = 0; itemIndex < categoryData.items.length; itemIndex++) {
          const item = categoryData.items[itemIndex];
          const description = featureDescriptions?.[item.name];

          const featureData = {
            categoryId: category.id,
            name: item.name,
            implemented: item.implemented !== undefined ? item.implemented : true,
            deprecated: item.deprecated || false,
            order: itemIndex,
            summary: description?.summary || null,
            details: description?.details || null
          };

          const existing = await prisma.documentationFeature.findFirst({
            where: {
              categoryId: category.id,
              name: item.name
            }
          });

          if (existing) {
            await prisma.documentationFeature.update({
              where: { id: existing.id },
              data: featureData
            });
            featuresUpdated++;
          } else {
            await prisma.documentationFeature.create({
              data: featureData
            });
            featuresCreated++;
          }
        }
      }
    }

    res.json({
      message: 'Migration completed successfully',
      categoriesCreated,
      featuresCreated,
      featuresUpdated
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/documentation/admin - Dohvati admin-only dokumentaciju
r.get('/admin', async (req, res, next) => {
  try {
    // Provjeri da li tablice postoje - ako ne, vrati prazan array
    let allCategories;
    try {
      allCategories = await prisma.documentationCategory.findMany({
        where: {
          isActive: true
        },
        include: {
          features: {
            where: {
              deprecated: false
            },
            orderBy: {
              order: 'asc'
            }
          }
        },
        orderBy: {
          order: 'asc'
        }
      });
    } catch (error) {
      // Ako tablice ne postoje (npr. migracije nisu primijenjene), vrati prazan odgovor
      if (error.message.includes('does not exist') || error.message.includes('Unknown table')) {
        console.warn('⚠️  DocumentationCategory table does not exist - migrations may not be applied');
        return res.json({
          adminFeatures: [],
          publicFeatures: [],
          featureDescriptions: {}
        });
      }
      throw error; // Re-throw other errors
    }

    // Razdvoji admin-only i javne kategorije
    const adminCategories = allCategories
      .map(cat => ({
        ...cat,
        features: cat.features.filter(f => f.isAdminOnly === true)
      }))
      .filter(cat => cat.features.length > 0 && cat.name !== 'Statistike Implementacije');

    const publicCategories = allCategories
      .map(cat => ({
        ...cat,
        features: cat.features.filter(f => f.isAdminOnly === false)
      }))
      .filter(cat => cat.features.length > 0 && cat.name !== 'Statistike Implementacije');

    // Transformiraj admin features
    const adminFeatures = adminCategories.map(cat => ({
      category: fixEncoding(cat.name),
      items: cat.features.map(f => ({
        name: fixEncoding(f.name),
        implemented: f.implemented,
        deprecated: f.deprecated
      }))
    }));

    // Transformiraj javne features
    const publicFeatures = publicCategories.map(cat => ({
      category: fixEncoding(cat.name),
      items: cat.features.map(f => ({
        name: fixEncoding(f.name),
        implemented: f.implemented,
        deprecated: f.deprecated
      }))
    }));

    // Kreiraj featureDescriptions objekt za SVE funkcionalnosti (admin + javne, s technicalDetails)
    const featureDescriptions = {};
    
    // Admin features s technicalDetails
    adminCategories.forEach(cat => {
      cat.features.forEach(f => {
        if (f.summary || f.details || f.technicalDetails) {
          featureDescriptions[fixEncoding(f.name)] = {
            implemented: f.implemented,
            summary: fixEncoding(f.summary || ''),
            details: fixEncoding(f.details || ''),
            technicalDetails: fixEncoding(f.technicalDetails || '') // Tehnički opis (frontend, backend, baza, API)
          };
        }
      });
    });

    // Javne features s technicalDetails (za admin prikaz)
    publicCategories.forEach(cat => {
      cat.features.forEach(f => {
        if (f.summary || f.details || f.technicalDetails) {
          featureDescriptions[fixEncoding(f.name)] = {
            implemented: f.implemented,
            summary: fixEncoding(f.summary || ''),
            details: fixEncoding(f.details || ''),
            technicalDetails: fixEncoding(f.technicalDetails || '') // Tehnički opis za admin prikaz
          };
        }
      });
    });

    res.json({
      adminFeatures,
      publicFeatures,
      featureDescriptions
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/documentation/guides - Dohvati edukacijske materijale i vodiče
r.get('/guides', async (req, res, next) => {
  try {
    // Pronađi kategoriju "Edukacijski materijali i vodiči"
    const guidesCategory = await prisma.documentationCategory.findFirst({
      where: {
        name: 'Edukacijski materijali i vodiči',
        isActive: true
      },
      include: {
        features: {
          where: {
            deprecated: false,
            isAdminOnly: false
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!guidesCategory || guidesCategory.features.length === 0) {
      return res.json({
        guides: [],
        message: 'Edukacijski materijali još nisu dodani'
      });
    }

    // Transformiraj u format za frontend
    const guides = guidesCategory.features.map(f => ({
      id: f.id,
      title: fixEncoding(f.name),
      summary: fixEncoding(f.summary || ''),
      content: fixEncoding(f.details || ''),
      order: f.order
    }));

    res.json({
      guides,
      category: fixEncoding(guidesCategory.name)
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/documentation/guides/:id - Dohvati pojedinačni vodič
r.get('/guides/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const guide = await prisma.documentationFeature.findFirst({
      where: {
        id,
        deprecated: false,
        isAdminOnly: false,
        category: {
          name: 'Edukacijski materijali i vodiči',
          isActive: true
        }
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    });

    if (!guide) {
      return res.status(404).json({ error: 'Vodič nije pronađen' });
    }

    res.json({
      id: guide.id,
      title: fixEncoding(guide.name),
      summary: fixEncoding(guide.summary || ''),
      content: fixEncoding(guide.details || ''),
      technicalDetails: fixEncoding(guide.technicalDetails || null), // Može biti null za javne vodiče
      category: fixEncoding(guide.category.name),
      order: guide.order
    });
  } catch (e) {
    next(e);
  }
});

export default r;

