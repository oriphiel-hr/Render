/**
 * Testing API Routes
 * Omogućuje upravljanje checkpoint-ima i test podacima
 */

import { Router } from 'express';
import { testCheckpointService } from '../services/testCheckpointService.js';
import { prisma } from '../lib/prisma.js';

const r = Router();

/**
 * POST /api/testing/checkpoint/create
 * Kreiraj novi checkpoint
 * 
 * Body:
 *   {
 *     "name": "before_registration",
 *     "tables": ["User", "ProviderProfile", "Job"] // null = sve tablice
 *   }
 */
r.post('/checkpoint/create', async (req, res, next) => {
  try {
    const { name, tables } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nedostaje "name"' });
    }

    const checkpointId = await testCheckpointService.create(name, tables);
    
    res.json({
      success: true,
      checkpointId,
      message: `Checkpoint '${name}' kreiran`
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/testing/checkpoint/rollback
 * Vrati bazu na checkpoint
 * 
 * Body:
 *   {
 *     "checkpointId": "before_registration_1706354399999_abc123"
 *   }
 */
r.post('/checkpoint/rollback', async (req, res, next) => {
  try {
    const { checkpointId } = req.body;
    
    if (!checkpointId) {
      return res.status(400).json({ error: 'Nedostaje "checkpointId"' });
    }

    await testCheckpointService.rollback(checkpointId);
    
    res.json({
      success: true,
      message: `Rollback na checkpoint '${checkpointId}' uspješan`
    });
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /api/testing/checkpoint/:id
 * Obriši checkpoint
 */
r.delete('/checkpoint/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await testCheckpointService.delete(id);
    
    res.json({
      success: true,
      message: `Checkpoint '${id}' obrisan`
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/testing/checkpoints
 * Prikazi sve checkpoint-e
 */
r.get('/checkpoints', async (req, res, next) => {
  try {
    const checkpoints = testCheckpointService.listCheckpoints();
    res.json({ checkpoints });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/testing/test-data
 * Preuzmi test podatke
 */
r.get('/test-data', async (req, res, next) => {
  try {
    // Dohvati test podatke iz baze ili vrati default strukturu
    // Za sada vrati default strukturu
    const testData = {
      email: {
        testService: {
          type: 'mailtrap',
          apiKey: '',
          inboxId: '0',
          baseUrl: 'https://mailtrap.io'
        }
      },
      users: {
        client: {
          email: 'test.client@uslugar.hr',
          password: 'Test123456!',
          fullName: 'Test Klijent',
          phone: '+385991111111',
          city: 'Zagreb',
          role: 'USER',
          mailtrap: { email: '', inboxId: '' }
        },
        provider: {
          email: 'test.provider@uslugar.hr',
          password: 'Test123456!',
          fullName: 'Test Provider Freelancer',
          phone: '+385991111112',
          city: 'Split',
          role: 'PROVIDER',
          legalStatus: 'FREELANCER',
          oib: '12345678901',
          mailtrap: { email: '', inboxId: '' }
        },
        director: {
          email: 'test.director@uslugar.hr',
          password: 'Test123456!',
          fullName: 'Test Director',
          phone: '+385991111113',
          city: 'Rijeka',
          role: 'PROVIDER',
          legalStatus: 'DOO',
          oib: '12345678902',
          companyName: 'Test Company DOO',
          mailtrap: { email: '', inboxId: '' }
        },
        teamMember: {
          email: 'test.team@uslugar.hr',
          password: 'Test123456!',
          fullName: 'Test Team Member',
          phone: '+385991111114',
          city: 'Zadar',
          role: 'PROVIDER',
          legalStatus: 'FREELANCER',
          oib: '12345678903',
          mailtrap: { email: '', inboxId: '' }
        },
        admin: {
          email: 'admin@uslugar.hr',
          password: 'Admin123456!',
          fullName: 'Test Admin',
          role: 'ADMIN',
          mailtrap: { email: '', inboxId: '' }
        }
      }
    };
    
    res.json({ testData });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/testing/test-data
 * Spremi test podatke (za Mailtrap konfiguraciju i sl.)
 */
r.post('/test-data', async (req, res, next) => {
  try {
    const { email, users } = req.body;
    
    // Spremi u memory ili datoteku
    // (primjer - trebalo bi biti fleksibilnije)
    console.log('📝 Test podaci primljeni:', { email, users });
    
    res.json({
      success: true,
      message: 'Test podaci spremljeni'
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/testing/plans
 * Preuzmi sve test planove
 */
r.get('/plans', async (req, res, next) => {
  try {
    // Za sada vrati praznu listu
    // U budućnosti možeš učitati iz baze ili datoteke
    const plans = [];
    res.json({ plans });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/testing/plans
 * Kreiraj novi test plan
 */
r.post('/plans', async (req, res, next) => {
  try {
    const { name, description, category, items } = req.body;
    
    // Za sada samo spremi u memory
    // U budućnosti spremi u bazu ili datoteku
    console.log('📝 Test plan kreiran:', { name, category });
    
    res.json({
      success: true,
      plan: {
        id: `plan_${Date.now()}`,
        name,
        category,
        description,
        items: items || []
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/testing/runs
 * Preuzmi sve test run-ove
 */
r.get('/runs', async (req, res, next) => {
  try {
    // Za sada vrati praznu listu
    // U budućnosti učitaj iz baze ili datoteke
    const runs = [];
    res.json({ 
      runs,
      count: runs.length,
      activeCount: 0
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/testing/runs
 * Kreiraj novi test run
 */
r.post('/runs', async (req, res, next) => {
  try {
    const { planId, status = 'pending' } = req.body;
    
    if (!planId) {
      return res.status(400).json({ error: 'planId je obavezan' });
    }
    
    // Za sada kreiraj u memory
    // U budućnosti spremi u bazu
    const run = {
      id: `run_${Date.now()}`,
      planId,
      status,
      createdAt: new Date().toISOString(),
      results: []
    };
    
    console.log('🚀 Test run kreiran:', run.id);
    
    res.json({
      success: true,
      run
    });
  } catch (e) {
    next(e);
  }
});

export default r;
