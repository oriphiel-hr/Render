import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';

const r = Router();

// GET /api/job-alerts - Dohvati sve job alertove korisnika
r.get('/', auth(true), async (req, res, next) => {
  try {
    const jobAlerts = await prisma.jobAlert.findMany({
      where: {
        userId: req.user.id,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(jobAlerts);
  } catch (e) { next(e); }
});

// POST /api/job-alerts - Kreiraj novi job alert
r.post('/', auth(true), async (req, res, next) => {
  try {
    const { name, searchQuery, filters, frequency } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const validFrequencies = ['DAILY', 'WEEKLY', 'INSTANT'];
    const alertFrequency = validFrequencies.includes(frequency) ? frequency : 'DAILY';

    const jobAlert = await prisma.jobAlert.create({
      data: {
        userId: req.user.id,
        name,
        searchQuery: searchQuery || null,
        filters: filters || {},
        frequency: alertFrequency
      }
    });

    res.status(201).json(jobAlert);
  } catch (e) { next(e); }
});

// PUT /api/job-alerts/:id - Ažuriraj job alert
r.put('/:id', auth(true), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, searchQuery, filters, frequency, isActive } = req.body;

    // Provjeri ownership
    const existing = await prisma.jobAlert.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Job alert not found' });
    }

    const validFrequencies = ['DAILY', 'WEEKLY', 'INSTANT'];
    const alertFrequency = frequency && validFrequencies.includes(frequency) ? frequency : existing.frequency;

    const updated = await prisma.jobAlert.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(searchQuery !== undefined && { searchQuery }),
        ...(filters !== undefined && { filters }),
        ...(frequency !== undefined && { frequency: alertFrequency }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json(updated);
  } catch (e) { next(e); }
});

// DELETE /api/job-alerts/:id - Obriši job alert
r.delete('/:id', auth(true), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Provjeri ownership
    const existing = await prisma.jobAlert.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Job alert not found' });
    }

    await prisma.jobAlert.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (e) { next(e); }
});

export default r;


