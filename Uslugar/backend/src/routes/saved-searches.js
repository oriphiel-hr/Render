import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';

const r = Router();

// GET /api/saved-searches - Dohvati sve spremljene pretrage korisnika
r.get('/', auth(true), async (req, res, next) => {
  try {
    const savedSearches = await prisma.savedSearch.findMany({
      where: {
        userId: req.user.id,
        isActive: true
      },
      orderBy: {
        lastUsedAt: 'desc'
      }
    });
    res.json(savedSearches);
  } catch (e) { next(e); }
});

// POST /api/saved-searches - Kreiraj novu spremljenu pretragu
r.post('/', auth(true), async (req, res, next) => {
  try {
    const { name, searchQuery, filters } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: req.user.id,
        name,
        searchQuery: searchQuery || null,
        filters: filters || {}
      }
    });

    res.status(201).json(savedSearch);
  } catch (e) { next(e); }
});

// PUT /api/saved-searches/:id - Ažuriraj spremljenu pretragu
r.put('/:id', auth(true), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, searchQuery, filters, isActive } = req.body;

    // Provjeri ownership
    const existing = await prisma.savedSearch.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Saved search not found' });
    }

    const updated = await prisma.savedSearch.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(searchQuery !== undefined && { searchQuery }),
        ...(filters !== undefined && { filters }),
        ...(isActive !== undefined && { isActive }),
        ...(isActive === true && { lastUsedAt: new Date() })
      }
    });

    res.json(updated);
  } catch (e) { next(e); }
});

// DELETE /api/saved-searches/:id - Obriši spremljenu pretragu
r.delete('/:id', auth(true), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Provjeri ownership
    const existing = await prisma.savedSearch.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Saved search not found' });
    }

    await prisma.savedSearch.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (e) { next(e); }
});

// POST /api/saved-searches/:id/use - Označi pretragu kao korištenu
r.post('/:id/use', auth(true), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Provjeri ownership
    const existing = await prisma.savedSearch.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Saved search not found' });
    }

    const updated = await prisma.savedSearch.update({
      where: { id },
      data: {
        lastUsedAt: new Date()
      }
    });

    res.json(updated);
  } catch (e) { next(e); }
});

export default r;


