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
    const testData = await prisma.$queryRaw`
      SELECT 
        'User' as table_name, COUNT(*) as count 
      FROM "User" 
      WHERE email LIKE '%@%' AND email LIKE '%test%'
    `;
    
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

export default r;
