import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const r = Router();

// GET /api/documentation/status - Provjeri status dokumentacije (diagnostic)
r.get('/status', async (req, res, next) => {
  try {
    const status = {
      tablesExist: false,
      hasCategories: false,
      hasFeatures: false,
      categoriesCount: 0,
      featuresCount: 0,
      publicFeaturesCount: 0,
      errors: []
    };

    // Provjeri postoji li tablica DocumentationCategory
    try {
      await prisma.$queryRaw`SELECT 1 FROM "DocumentationCategory" LIMIT 1`;
      status.tablesExist = true;
      
      // Provjeri postoji li DocumentationFeature tablica
      await prisma.$queryRaw`SELECT 1 FROM "DocumentationFeature" LIMIT 1`;
      
      // Provjeri ima li kategorija
      const categoriesCount = await prisma.documentationCategory.count({
        where: { isActive: true }
      });
      status.categoriesCount = categoriesCount;
      status.hasCategories = categoriesCount > 0;

      // Provjeri ima li features
      const featuresCount = await prisma.documentationFeature.count({
        where: { deprecated: false }
      });
      status.featuresCount = featuresCount;
      status.hasFeatures = featuresCount > 0;

      // Provjeri ima li javnih features
      const publicFeaturesCount = await prisma.documentationFeature.count({
        where: {
          deprecated: false,
          isAdminOnly: false
        }
      });
      status.publicFeaturesCount = publicFeaturesCount;

    } catch (error) {
      status.errors.push({
        type: 'TABLE_NOT_EXISTS',
        message: error.message,
        hint: 'Run migrations first: npx prisma migrate deploy'
      });
    }

    // Provjeri konekciju s bazom
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      status.errors.push({
        type: 'DATABASE_CONNECTION',
        message: error.message,
        hint: 'Check DATABASE_URL and database connectivity'
      });
    }

    res.json({
      success: status.tablesExist && status.hasCategories && status.hasFeatures,
      status,
      recommendations: [
        !status.tablesExist && 'Run database migrations: npx prisma migrate deploy',
        status.tablesExist && !status.hasCategories && 'Seed documentation: npm run seed:documentation',
        status.hasCategories && status.publicFeaturesCount === 0 && 'All features are admin-only. Check isAdminOnly flags.'
      ].filter(Boolean)
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/documentation/check-encoding - Provjeri encoding baze i konekcije (diagnostic)
r.get('/check-encoding', async (req, res, next) => {
  try {
    // Provjeri encoding baze
    const dbEncoding = await prisma.$queryRaw`
      SELECT pg_encoding_to_char(encoding) as encoding, datname
      FROM pg_database 
      WHERE datname = current_database()
    `;

    // Provjeri client encoding (konekcija)
    const clientEncoding = await prisma.$queryRaw`SHOW client_encoding`;

    // Provjeri primjer podataka s problematičnim znakom
    const testData = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        encode(name::bytea, 'hex') as name_hex,
        LENGTH(name) as name_length,
        OCTET_LENGTH(name) as name_bytes
      FROM "DocumentationFeature"
      WHERE name LIKE '%ž%' OR name LIKE '%<%' OR name LIKE '%┼%'
      LIMIT 3
    `;

    res.json({
      success: true,
      database: {
        name: dbEncoding[0]?.datname || 'unknown',
        encoding: dbEncoding[0]?.encoding || 'unknown',
        isUTF8: dbEncoding[0]?.encoding === 'UTF8'
      },
      client: {
        encoding: clientEncoding[0]?.client_encoding || 'unknown',
        isUTF8: clientEncoding[0]?.client_encoding === 'UTF8'
      },
      testData: testData.map(item => ({
        id: item.id,
        name: item.name,
        nameHex: item.name_hex,
        nameLength: item.name_length,
        nameBytes: item.name_bytes
      })),
      recommendation: {
        databaseEncoding: dbEncoding[0]?.encoding !== 'UTF8' 
          ? '⚠️ Baza nije u UTF-8 encoding-u. Kreiraj novu bazu s UTF-8 encoding-om.'
          : '✅ Baza je u UTF-8 encoding-u',
        clientEncoding: clientEncoding[0]?.client_encoding !== 'UTF8'
          ? '⚠️ Client encoding nije UTF-8. Dodaj ?client_encoding=utf8 u DATABASE_URL.'
          : '✅ Client encoding je UTF-8'
      }
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/documentation - Dohvati sve kategorije i feature opise
// Query param: ?status=check - vrati status umjesto dokumentacije (fallback ako /status nije dostupan)
r.get('/', async (req, res, next) => {
  try {
    // Ako se traži status kroz query param (fallback ako /status nije dostupan)
    if (req.query.status === 'check' || req.query._status === 'true') {
      // Vrati status direktno (umjesto redirect-a)
      const status = {
        tablesExist: false,
        hasCategories: false,
        hasFeatures: false,
        categoriesCount: 0,
        featuresCount: 0,
        publicFeaturesCount: 0,
        errors: []
      };

      try {
        await prisma.$queryRaw`SELECT 1 FROM "DocumentationCategory" LIMIT 1`;
        status.tablesExist = true;
        await prisma.$queryRaw`SELECT 1 FROM "DocumentationFeature" LIMIT 1`;
        
        const categoriesCount = await prisma.documentationCategory.count({
          where: { isActive: true }
        });
        status.categoriesCount = categoriesCount;
        status.hasCategories = categoriesCount > 0;

        const featuresCount = await prisma.documentationFeature.count({
          where: { deprecated: false }
        });
        status.featuresCount = featuresCount;
        status.hasFeatures = featuresCount > 0;

        const publicFeaturesCount = await prisma.documentationFeature.count({
          where: {
            deprecated: false,
            isAdminOnly: false
          }
        });
        status.publicFeaturesCount = publicFeaturesCount;
      } catch (error) {
        status.errors.push({
          type: 'TABLE_NOT_EXISTS',
          message: error.message,
          hint: 'Run migrations first: npx prisma migrate deploy'
        });
      }

      return res.json({
        success: status.tablesExist && status.hasCategories && status.hasFeatures,
        status,
        recommendations: [
          !status.tablesExist && 'Run database migrations: npx prisma migrate deploy',
          status.tablesExist && !status.hasCategories && 'Seed documentation: npm run seed:documentation',
          status.hasCategories && status.publicFeaturesCount === 0 && 'All features are admin-only. Check isAdminOnly flags.'
        ].filter(Boolean),
        _note: 'Status check via query param. Use /api/documentation/status for direct endpoint.'
      });
    }
    
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
      // Ako tablice ne postoje (npr. migracije nisu primijenjene), vrati prazan odgovor s detaljnom porukom
      if (error.message.includes('does not exist') || 
          error.message.includes('Unknown table') ||
          error.message.includes('relation') ||
          error.code === 'P2021' || // Prisma error: Table does not exist
          error.code === '42P01') { // PostgreSQL error: relation does not exist
        console.error('❌ DocumentationCategory table does not exist:', error.message);
        console.warn('⚠️  Migrations may not be applied. Run: npx prisma migrate deploy');
        return res.status(200).json({
          features: [],
          featureDescriptions: {},
          error: {
            message: 'DocumentationCategory table does not exist. Migrations may not be applied.',
            hint: 'Run database migrations first: npx prisma migrate deploy',
            details: error.message
          }
        });
      }
      // Ako je problem s konekcijom ili pristupom bazi
      if (error.code === 'P1001' || error.code === 'P1017') {
        console.error('❌ Database connection error:', error.message);
        return res.status(503).json({
          features: [],
          featureDescriptions: {},
          error: {
            message: 'Database connection failed. Please check if backend is running and database is accessible.',
            hint: 'Verify DATABASE_URL environment variable and database connectivity',
            details: error.message
          }
        });
      }
      // Re-throw other errors
      console.error('❌ Unexpected error loading documentation:', error);
      throw error;
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

