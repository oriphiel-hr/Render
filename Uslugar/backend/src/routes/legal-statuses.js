import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const r = Router();

// Get all legal statuses
r.get('/', async (req, res, next) => {
  try {
    const legalStatuses = await prisma.legalStatus.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(legalStatuses);
  } catch (e) { next(e); }
});

// Get legal status by ID
r.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const legalStatus = await prisma.legalStatus.findUnique({
      where: { id }
    });
    if (!legalStatus) {
      return res.status(404).json({ error: 'Legal status not found' });
    }
    res.json(legalStatus);
  } catch (e) { next(e); }
});

export default r;

