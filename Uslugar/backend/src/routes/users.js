import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';

const r = Router();

// list users (public - for displaying in dropdowns, limited info)
r.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '1000', 10), 1000);
    const users = await prisma.user.findMany({
      take: limit,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        city: true
      },
      orderBy: { fullName: 'asc' }
    });
    res.json(users);
  } catch (e) { next(e); }
});

// get current user info (requires auth) - MORA biti prije /:id rute!
r.get('/me', auth(true), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { providerProfile: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) { next(e); }
});

// update current user info (requires auth) - MORA biti prije /:id rute!
r.put('/me', auth(true), async (req, res, next) => {
  try {
    const { fullName, phone, city } = req.body;
    
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (city !== undefined) updateData.city = city;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      include: { providerProfile: true }
    });
    
    res.json(user);
  } catch (e) { next(e); }
});

// get single user (basic info)
r.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        city: true,
        createdAt: true
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) { next(e); }
});

export default r;

