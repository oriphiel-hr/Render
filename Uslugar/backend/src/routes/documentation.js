import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const r = Router();

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
      category: cat.name,
      items: cat.features.map(f => ({
        name: f.name,
        implemented: f.implemented,
        deprecated: f.deprecated
      }))
    }));

    // Kreiraj featureDescriptions objekt (samo za javne features)
    const featureDescriptions = {};
    publicCategories.forEach(cat => {
      cat.features.forEach(f => {
        if (f.summary || f.details) {
          featureDescriptions[f.name] = {
            implemented: f.implemented,
            summary: f.summary || '',
            details: f.details || ''
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
      category: cat.name,
      items: cat.features.map(f => ({
        name: f.name,
        implemented: f.implemented,
        deprecated: f.deprecated
      }))
    }));

    // Transformiraj javne features
    const publicFeatures = publicCategories.map(cat => ({
      category: cat.name,
      items: cat.features.map(f => ({
        name: f.name,
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
          featureDescriptions[f.name] = {
            implemented: f.implemented,
            summary: f.summary || '',
            details: f.details || '',
            technicalDetails: f.technicalDetails || '' // Tehnički opis (frontend, backend, baza, API)
          };
        }
      });
    });

    // Javne features s technicalDetails (za admin prikaz)
    publicCategories.forEach(cat => {
      cat.features.forEach(f => {
        if (f.summary || f.details || f.technicalDetails) {
          featureDescriptions[f.name] = {
            implemented: f.implemented,
            summary: f.summary || '',
            details: f.details || '',
            technicalDetails: f.technicalDetails || '' // Tehnički opis za admin prikaz
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
      title: f.name,
      summary: f.summary || '',
      content: f.details || '',
      order: f.order
    }));

    res.json({
      guides,
      category: guidesCategory.name
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
      title: guide.name,
      summary: guide.summary || '',
      content: guide.details || '',
      technicalDetails: guide.technicalDetails || null, // Može biti null za javne vodiče
      category: guide.category.name,
      order: guide.order
    });
  } catch (e) {
    next(e);
  }
});

export default r;

