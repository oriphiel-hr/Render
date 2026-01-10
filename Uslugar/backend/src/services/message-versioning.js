/**
 * USLUGAR EXCLUSIVE - Message Versioning Service
 * 
 * Upravlja verzioniranjem chat poruka
 * Čuva povijest izmjena poruka
 */

import { prisma } from '../lib/prisma.js';

/**
 * Uredi poruku i kreira novu verziju
 * @param {String} messageId - ID poruke
 * @param {String} userId - ID korisnika koji uređuje
 * @param {String} newContent - Novi sadržaj poruke
 * @param {Array<String>} newAttachments - Novi privici (opcionalno)
 * @param {String} reason - Razlog uređivanja (opcionalno)
 * @returns {Object} - Ažurirana poruka s verzijama
 */
export async function editMessage(messageId, userId, newContent, newAttachments = null, reason = null) {
  console.log(`📝 Uređivanje poruke ${messageId} od strane korisnika ${userId}`);

  // Provjeri da li poruka postoji
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: {
      versions: {
        orderBy: { version: 'desc' },
        take: 1
      }
    }
  });

  if (!message) {
    throw new Error('Poruka ne postoji');
  }

  // Provjeri da li je korisnik autor poruke
  if (message.senderId !== userId) {
    throw new Error('Možete uređivati samo svoje poruke');
  }

  // Provjeri da li je sadržaj stvarno promijenjen
  const finalContent = newContent !== undefined ? newContent.trim() : message.content;
  const finalAttachments = newAttachments !== null ? newAttachments : message.attachments;
  
  const contentChanged = finalContent !== message.content;
  const attachmentsChanged = JSON.stringify(finalAttachments) !== JSON.stringify(message.attachments);

  if (!contentChanged && !attachmentsChanged) {
    throw new Error('Poruka nije promijenjena');
  }

  // Odredi novi broj verzije
  const nextVersion = message.versions.length > 0 
    ? message.versions[0].version + 1 
    : 1;

  // Kreiraj novu verziju sa starim sadržajem
  await prisma.messageVersion.create({
    data: {
      messageId,
      content: message.content,
      attachments: message.attachments,
      version: nextVersion,
      editedById: userId,
      reason: reason || null
    }
  });

  // Ažuriraj poruku s novim sadržajem
  const updatedMessage = await prisma.chatMessage.update({
    where: { id: messageId },
    data: {
      content: finalContent,
      attachments: finalAttachments,
      isEdited: true,
      editedAt: new Date(),
      updatedAt: new Date()
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      versions: {
        orderBy: { version: 'desc' },
        include: {
          editedBy: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      }
    }
  });

  console.log(`   ✅ Poruka ažurirana, kreirana verzija ${nextVersion}`);

  // Audit log se logira u route handleru gdje imamo pristup IP adresi i user agentu
  // Ovdje samo vraćamo ažuriranu poruku

  return updatedMessage;
}

/**
 * Dohvati sve verzije poruke
 * @param {String} messageId - ID poruke
 * @param {String} userId - ID korisnika (za provjeru pristupa)
 * @returns {Array} - Lista verzija poruke
 */
export async function getMessageVersions(messageId, userId) {
  // Provjeri da li korisnik ima pristup poruci
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: {
      room: {
        include: {
          participants: {
            select: { id: true }
          }
        }
      }
    }
  });

  if (!message) {
    throw new Error('Poruka ne postoji');
  }

  // Provjeri da li je korisnik sudionik chat rooma
  const isParticipant = message.room.participants.some(p => p.id === userId);
  if (!isParticipant) {
    throw new Error('Nemate pristup ovim verzijama poruke');
  }

  // Dohvati poruku s sender informacijama
  const messageWithSender = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  // Dohvati sve verzije
  const versions = await prisma.messageVersion.findMany({
    where: { messageId },
    include: {
      editedBy: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    },
    orderBy: { version: 'desc' }
  });

  // Dodaj trenutnu verziju (originalna poruka) kao verziju 0
  const currentVersion = {
    id: messageWithSender.id,
    messageId: messageWithSender.id,
    content: messageWithSender.content,
    attachments: messageWithSender.attachments,
    version: 0,
    editedBy: messageWithSender.sender,
    editedById: messageWithSender.senderId,
    editedAt: messageWithSender.createdAt,
    reason: null,
    isCurrent: true
  };

  return [currentVersion, ...versions];
}

/**
 * Dohvati specifičnu verziju poruke
 * @param {String} messageId - ID poruke
 * @param {Number} version - Broj verzije (0 = trenutna)
 * @param {String} userId - ID korisnika (za provjeru pristupa)
 * @returns {Object} - Verzija poruke
 */
export async function getMessageVersion(messageId, version, userId) {
  // Provjeri da li korisnik ima pristup poruci
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: {
      room: {
        include: {
          participants: {
            select: { id: true }
          }
        }
      },
      sender: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  if (!message) {
    throw new Error('Poruka ne postoji');
  }

  // Provjeri da li je korisnik sudionik chat rooma
  const isParticipant = message.room.participants.some(p => p.id === userId);
  if (!isParticipant) {
    throw new Error('Nemate pristup ovoj verziji poruke');
  }

  // Ako je verzija 0, vrati trenutnu verziju
  if (version === 0) {
    return {
      id: message.id,
      messageId: message.id,
      content: message.content,
      attachments: message.attachments,
      version: 0,
      editedBy: {
        id: message.sender.id,
        fullName: message.sender.fullName,
        email: message.sender.email
      },
      editedById: message.senderId,
      editedAt: message.createdAt,
      reason: null,
      isCurrent: true
    };
  }

  // Dohvati specifičnu verziju
  const messageVersion = await prisma.messageVersion.findFirst({
    where: {
      messageId,
      version
    },
    include: {
      editedBy: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  if (!messageVersion) {
    throw new Error('Verzija poruke ne postoji');
  }

  return {
    ...messageVersion,
    isCurrent: false
  };
}

