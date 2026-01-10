// Chat-bot Service - Vodi korisnika kroz prvi lead
import { prisma } from '../lib/prisma.js';

// Chat-bot koraci za prvi lead
const FIRST_LEAD_STEPS = [
  {
    step: 1,
    trigger: 'LEAD_PURCHASED',
    message: '🎉 Čestitamo! Kupili ste svoj prvi lead. Sada možete kontaktirati klijenta i započeti posao.',
    action: 'SHOW_CONTACT_INFO',
    nextStep: 'CONTACT_CLIENT'
  },
  {
    step: 2,
    trigger: 'CONTACT_CLIENT',
    message: '💬 Kontaktirajte klijenta putem chat-a. Otvorite chat sobu s klijentom i pošaljite profesionalnu poruku.',
    action: 'OPEN_CHAT',
    nextStep: 'SEND_MESSAGE'
  },
  {
    step: 3,
    trigger: 'SEND_MESSAGE',
    message: '✅ Odlično! Poslali ste poruku klijentu. Sada pričekajte odgovor i pripremite profesionalnu ponudu.',
    action: 'WAIT_FOR_RESPONSE',
    nextStep: 'PREPARE_OFFER'
  },
  {
    step: 4,
    trigger: 'PREPARE_OFFER',
    message: '📋 Pripremite detaljnu ponudu za klijenta. Uključite cijenu, rok izvršenja i opis usluge.',
    action: 'CREATE_OFFER',
    nextStep: 'SEND_OFFER'
  },
  {
    step: 5,
    trigger: 'SEND_OFFER',
    message: '🚀 Poslali ste ponudu! Ako klijent prihvati, možete započeti rad na projektu.',
    action: 'WAIT_FOR_ACCEPTANCE',
    nextStep: 'COMPLETE'
  }
];

/**
 * Provjeri da li je ovo prvi lead korisnika
 */
export async function isFirstLead(providerId) {
  const leadCount = await prisma.leadPurchase.count({
    where: {
      providerId,
      status: { not: 'REFUNDED' }
    }
  });
  
  return leadCount === 1;
}

/**
 * Provjeri da li korisnik već ima aktivni chat-bot
 */
export async function hasActiveChatbot(providerId) {
  const chatbot = await prisma.chatbotSession.findFirst({
    where: {
      providerId,
      status: 'ACTIVE'
    }
  });
  
  return chatbot !== null;
}

/**
 * Kreiraj chat-bot sesiju za prvi lead
 */
export async function createFirstLeadChatbot(providerId, jobId) {
  // Provjeri da li je ovo prvi lead
  const isFirst = await isFirstLead(providerId);
  if (!isFirst) {
    return null; // Nije prvi lead, ne kreiraj chat-bot
  }
  
  // Provjeri da li već postoji aktivna sesija
  const existing = await hasActiveChatbot(providerId);
  if (existing) {
    return null; // Već postoji aktivna sesija
  }
  
  // Kreiraj chat-bot sesiju
  const chatbot = await prisma.chatbotSession.create({
    data: {
      providerId,
      jobId,
      currentStep: 1,
      status: 'ACTIVE',
      startedAt: new Date()
    }
  });
  
  // Kreiraj prvu poruku
  await sendChatbotMessage(providerId, chatbot.id, FIRST_LEAD_STEPS[0].message, FIRST_LEAD_STEPS[0].action);
  
  return chatbot;
}

/**
 * Pošalji chat-bot poruku korisniku
 */
export async function sendChatbotMessage(providerId, chatbotId, message, action = null) {
  // Pronađi ili kreiraj bot korisnika
  let botUser = await prisma.user.findFirst({
    where: { 
      email: 'bot@uslugar.hr',
      role: 'ADMIN'
    }
  });
  
  if (!botUser) {
    // Kreiraj bot korisnika
    botUser = await prisma.user.create({
      data: {
        email: 'bot@uslugar.hr',
        passwordHash: '$2a$10$dummy', // Ne koristi se za login
        fullName: 'Uslugar Chat-bot',
        role: 'ADMIN' // Bot ima admin role za posebne privilegije
      }
    });
  }
  
  // Kreiraj posebnu chat sobu za chat-bot (ako ne postoji)
  let chatbotRoom = await prisma.chatRoom.findFirst({
    where: {
      participants: {
        some: { id: providerId }
      },
      isBotRoom: true
    },
    include: {
      participants: true
    }
  });
  
  if (!chatbotRoom) {
    // Kreiraj chat sobu
    chatbotRoom = await prisma.chatRoom.create({
      data: {
        participants: {
          connect: [
            { id: providerId },
            { id: botUser.id }
          ]
        },
        isBotRoom: true
      }
    });
  } else {
    // Provjeri da li bot korisnik već postoji u sobi
    const botInRoom = chatbotRoom.participants.some(p => p.id === botUser.id);
    if (!botInRoom) {
      await prisma.chatRoom.update({
        where: { id: chatbotRoom.id },
        data: {
          participants: {
            connect: { id: botUser.id }
          }
        }
      });
    }
  }
  
  // Kreiraj poruku
  const chatMessage = await prisma.chatMessage.create({
    data: {
      content: message,
      senderId: botUser.id,
      roomId: chatbotRoom.id,
      isBotMessage: true,
      botAction: action
    }
  });
  
  return chatMessage;
}

/**
 * Ažuriraj chat-bot sesiju na sljedeći korak
 */
export async function advanceChatbotStep(providerId, trigger) {
  const chatbot = await prisma.chatbotSession.findFirst({
    where: {
      providerId,
      status: 'ACTIVE'
    }
  });
  
  if (!chatbot) {
    return null; // Nema aktivne sesije
  }
  
  // Pronađi sljedeći korak na temelju triggera
  const currentStepData = FIRST_LEAD_STEPS.find(s => s.step === chatbot.currentStep);
  if (!currentStepData || currentStepData.trigger !== trigger) {
    return chatbot; // Trigger ne odgovara trenutnom koraku
  }
  
  // Ažuriraj na sljedeći korak
  const nextStep = chatbot.currentStep + 1;
  const nextStepData = FIRST_LEAD_STEPS.find(s => s.step === nextStep);
  
  if (!nextStepData) {
    // Završi chat-bot sesiju
    await prisma.chatbotSession.update({
      where: { id: chatbot.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
    
    // Pošalji završnu poruku
    await sendChatbotMessage(providerId, chatbot.id, '🎊 Čestitamo! Završili ste prvi lead. Nastavite s radom i zarađujte više!', 'COMPLETE');
    
    return null;
  }
  
  // Ažuriraj sesiju
  const updated = await prisma.chatbotSession.update({
    where: { id: chatbot.id },
      data: {
        currentStep: nextStep,
        lastTrigger: trigger,
        lastTriggeredAt: new Date()
      }
  });
  
  // Pošalji poruku za sljedeći korak
  await sendChatbotMessage(providerId, chatbot.id, nextStepData.message, nextStepData.action);
  
  return updated;
}

/**
 * Dohvati trenutnu chat-bot sesiju
 */
export async function getChatbotSession(providerId) {
  const chatbot = await prisma.chatbotSession.findFirst({
    where: {
      providerId,
      status: 'ACTIVE'
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          description: true
        }
      }
    }
  });
  
  if (!chatbot) {
    return null;
  }
  
  const currentStepData = FIRST_LEAD_STEPS.find(s => s.step === chatbot.currentStep);
  
  return {
    ...chatbot,
    currentStepData
  };
}

/**
 * Završi chat-bot sesiju
 */
export async function completeChatbotSession(providerId) {
  const chatbot = await prisma.chatbotSession.findFirst({
    where: {
      providerId,
      status: 'ACTIVE'
    }
  });
  
  if (!chatbot) {
    return null;
  }
  
  await prisma.chatbotSession.update({
    where: { id: chatbot.id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date()
    }
  });
  
  return chatbot;
}

