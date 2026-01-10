import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';

const r = Router();

// Get user notifications
r.get('/', auth(true), async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Last 50 notifications
    });
    res.json(notifications);
  } catch (e) {
    next(e);
  }
});

// Get unread count
r.get('/unread-count', auth(true), async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false
      }
    });
    res.json({ count });
  } catch (e) {
    next(e);
  }
});

// Mark notification as read
r.patch('/:id/read', auth(true), async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({ message: 'Notification marked as read' });
  } catch (e) {
    next(e);
  }
});

// Mark all as read
r.patch('/mark-all-read', auth(true), async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (e) {
    next(e);
  }
});

// Delete notification
r.delete('/:id', auth(true), async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({ where: { id } });
    res.json({ message: 'Notification deleted' });
  } catch (e) {
    next(e);
  }
});

export default r;
