import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { sendContactConfirmationToUser, sendContactNotificationToAdmin } from '../lib/email.js';

const router = Router();

const SUBJECT_LABELS = {
  general: 'Općenito pitanje',
  technical: 'Tehnička podrška',
  business: 'Poslovni upit',
  partnership: 'Partnerstvo',
  complaint: 'Žalba'
};

/**
 * POST /api/contact
 * Prima podatke s kontakt forme (bez autentifikacije)
 * Body: { name, email, phone?, subject, message }
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Ime i prezime su obavezni.' });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email je obavezan.' });
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return res.status(400).json({ error: 'Predmet je obavezan.' });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Poruka je obavezna.' });
    }

    const validSubjects = ['general', 'technical', 'business', 'partnership', 'complaint'];
    if (!validSubjects.includes(subject)) {
      return res.status(400).json({ error: 'Nevažeći predmet.' });
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone ? String(phone).trim() : null,
        subject: subject.trim(),
        message: message.trim()
      }
    });

    // Email korisniku (potvrda)
    sendContactConfirmationToUser(email.trim(), name.trim()).catch((err) =>
      console.error('[CONTACT] Failed to send user confirmation:', err)
    );

    // Email adminu
    sendContactNotificationToAdmin({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      subject: inquiry.subject,
      subjectLabel: SUBJECT_LABELS[inquiry.subject] || inquiry.subject,
      message: inquiry.message
    }).catch((err) =>
      console.error('[CONTACT] Failed to send admin notification:', err)
    );

    return res.status(201).json({
      success: true,
      message: 'Hvala na poruci! Javit ćemo vam se u roku od 24 sata.'
    });
  } catch (error) {
    console.error('[CONTACT] Error:', error);
    return res.status(500).json({ error: 'Došlo je do greške. Pokušajte ponovno kasnije.' });
  }
});

export default router;
