// Support Tickets - VIP podrška 24/7
import { Router } from 'express';
import { auth } from '../lib/auth.js';
import { requirePlan } from '../lib/subscription-auth.js';
import { prisma } from '../lib/prisma.js';
import { 
  createSupportTicket, 
  getMySupportTickets, 
  getSupportTicket, 
  resolveTicket,
  addTicketNote,
  getOrCreateSupportChatRoom,
  checkSupportAvailability,
  assignTicketToAgent
} from '../services/support-service.js';

const r = Router();

// Kreiraj support ticket
r.post('/tickets', auth(true, ['PROVIDER', 'USER']), async (req, res, next) => {
  try {
    const { subject, message, category } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message required' });
    }
    
    const ticket = await createSupportTicket(
      req.user.id,
      subject,
      message,
      'NORMAL', // Automatski povišava na HIGH/URGENT za PREMIUM/PRO
      category || 'OTHER'
    );

    // Automatski dodijeli VIP ticket agentu
    if (ticket.priority === 'URGENT') {
      try {
        await assignTicketToAgent(ticket.id);
      } catch (error) {
        console.error('Error assigning ticket to agent:', error);
      }
    }
    
    res.status(201).json({
      success: true,
      ticket,
      message: ticket.priority === 'URGENT' 
        ? 'VIP ticket kreiran. Odgovorit ćemo u roku od 1 sata.' 
        : 'Support ticket kreiran. Odgovorit ćemo u roku od 24 sata.'
    });
  } catch (e) {
    next(e);
  }
});

// Dohvati moje ticket-e
r.get('/tickets', auth(true, ['PROVIDER', 'USER']), async (req, res, next) => {
  try {
    const tickets = await getMySupportTickets(req.user.id);
    
    res.json({
      total: tickets.length,
      tickets
    });
  } catch (e) {
    next(e);
  }
});

// Dohvati specific ticket
r.get('/tickets/:id', auth(true, ['PROVIDER', 'USER']), async (req, res, next) => {
  try {
    const ticket = await getSupportTicket(req.params.id, req.user.id);
    
    res.json(ticket);
  } catch (e) {
    next(e);
  }
});

// Označi kao resolved
r.post('/tickets/:id/resolve', auth(true, ['PROVIDER', 'USER']), async (req, res, next) => {
  try {
    const ticket = await resolveTicket(req.params.id, req.user.id);
    
    res.json({
      success: true,
      ticket,
      message: 'Ticket označen kao resolved'
    });
  } catch (e) {
    next(e);
  }
});

// Admin: Dodaj napomenu
r.post('/tickets/:id/note', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { notes } = req.body;
    
    const ticket = await addTicketNote(req.params.id, notes);
    
    res.json({
      success: true,
      ticket
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/support/availability - Provjeri dostupnost 24/7 support tima
r.get('/availability', async (req, res, next) => {
  try {
    const availability = await checkSupportAvailability();
    res.json(availability);
  } catch (e) {
    next(e);
  }
});

// POST /api/support/chat/start - Pokreni live chat (samo PRO korisnici)
r.post('/chat/start', auth(true, ['PROVIDER', 'USER']), async (req, res, next) => {
  try {
    const room = await getOrCreateSupportChatRoom(req.user.id);
    
    res.json({
      success: true,
      room,
      message: 'Live chat pokrenut. Support agent će vam uskoro odgovoriti.'
    });
  } catch (e) {
    if (e.message.includes('dostupna samo za PRO')) {
      return res.status(403).json({
        error: 'Live chat podrška dostupna samo za PRO korisnike',
        message: 'Nadogradite na PRO plan za pristup 24/7 live chat podršci'
      });
    }
    next(e);
  }
});

// GET /api/support/chat/room - Dohvati support chat sobu
r.get('/chat/room', auth(true, ['PROVIDER', 'USER']), async (req, res, next) => {
  try {
    const room = await prisma.chatRoom.findFirst({
      where: {
        participants: {
          some: { id: req.user.id }
        },
        isSupportRoom: true,
        isLocked: false
      },
      include: {
        participants: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!room) {
      return res.status(404).json({
        error: 'Support chat soba nije pronađena',
        message: 'Pokrenite live chat putem POST /api/support/chat/start'
      });
    }

    res.json(room);
  } catch (e) {
    next(e);
  }
});

export default r;

