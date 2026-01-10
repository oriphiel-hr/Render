// Chat-bot Routes - Vodi korisnika kroz prvi lead
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';
import {
  getChatbotSession,
  advanceChatbotStep,
  completeChatbotSession
} from '../services/chatbot-service.js';

const r = Router();

// GET /api/chatbot/session - Dohvati trenutnu chat-bot sesiju
r.get('/session', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const session = await getChatbotSession(req.user.id);
    
    if (!session) {
      return res.json({
        active: false,
        message: 'Nema aktivne chat-bot sesije'
      });
    }
    
    res.json({
      active: true,
      session
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/chatbot/advance - Napredak na sljedeći korak
r.post('/advance', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { trigger } = req.body;
    
    if (!trigger) {
      return res.status(400).json({ error: 'Trigger is required' });
    }
    
    const updated = await advanceChatbotStep(req.user.id, trigger);
    
    if (!updated) {
      return res.json({
        success: true,
        completed: true,
        message: 'Chat-bot sesija je završena'
      });
    }
    
    res.json({
      success: true,
      completed: false,
      session: updated
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/chatbot/complete - Završi chat-bot sesiju
r.post('/complete', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const session = await completeChatbotSession(req.user.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Nema aktivne chat-bot sesije' });
    }
    
    res.json({
      success: true,
      message: 'Chat-bot sesija je završena'
    });
  } catch (e) {
    next(e);
  }
});

export default r;

