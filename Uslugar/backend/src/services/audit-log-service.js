/**
 * USLUGAR EXCLUSIVE - Audit Log Service
 * 
 * Centralizirani servis za logiranje svih akcija vezanih uz poruke
 * Bilježi: kreiranje, uređivanje, brisanje poruka, privitke, otkrivanje kontakata
 */

import { prisma } from '../lib/prisma.js';
import { AuditActionType } from '@prisma/client';

/**
 * Kreira audit log zapis
 * @param {Object} params - Parametri za audit log
 * @param {AuditActionType} params.action - Tip akcije
 * @param {String} params.actorId - ID korisnika koji je izvršio akciju
 * @param {String} params.messageId - ID poruke (opcionalno)
 * @param {String} params.roomId - ID chat rooma (opcionalno)
 * @param {String} params.jobId - ID posla (opcionalno, za otkrivanje kontakata)
 * @param {Object} params.metadata - Dodatni podaci (opcionalno)
 * @param {String} params.ipAddress - IP adresa korisnika (opcionalno)
 * @param {String} params.userAgent - User agent korisnika (opcionalno)
 * @returns {Object} - Kreirani audit log
 */
export async function createAuditLog({
  action,
  actorId,
  messageId = null,
  roomId = null,
  jobId = null,
  metadata = null,
  ipAddress = null,
  userAgent = null
}) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        action,
        actorId,
        messageId,
        roomId,
        jobId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        ipAddress,
        userAgent
      },
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    console.log(`📋 Audit log kreiran: ${action} by ${actorId}`);
    
    return auditLog;
  } catch (error) {
    console.error('❌ Error creating audit log:', error);
    // Ne bacamo grešku - audit log ne smije blokirati glavnu funkcionalnost
    return null;
  }
}

/**
 * Logira kreiranje poruke
 * @param {String} messageId - ID poruke
 * @param {String} actorId - ID korisnika koji je kreirao poruku
 * @param {String} roomId - ID chat rooma
 * @param {Object} metadata - Dodatni podaci (content preview, attachments count, itd.)
 * @param {String} ipAddress - IP adresa
 * @param {String} userAgent - User agent
 */
export async function logMessageCreated(messageId, actorId, roomId, metadata = {}, ipAddress = null, userAgent = null) {
  return await createAuditLog({
    action: AuditActionType.MESSAGE_CREATED,
    actorId,
    messageId,
    roomId,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

/**
 * Logira uređivanje poruke
 * @param {String} messageId - ID poruke
 * @param {String} actorId - ID korisnika koji je uredio poruku
 * @param {String} roomId - ID chat rooma
 * @param {Number} version - Broj verzije
 * @param {Object} oldContent - Stari sadržaj
 * @param {Object} newContent - Novi sadržaj
 * @param {String} reason - Razlog uređivanja
 * @param {String} ipAddress - IP adresa
 * @param {String} userAgent - User agent
 */
export async function logMessageEdited(messageId, actorId, roomId, version, oldContent, newContent, reason = null, ipAddress = null, userAgent = null) {
  return await createAuditLog({
    action: AuditActionType.MESSAGE_EDITED,
    actorId,
    messageId,
    roomId,
    metadata: {
      version,
      oldContent: {
        content: oldContent.content,
        attachmentsCount: oldContent.attachments?.length || 0
      },
      newContent: {
        content: newContent.content,
        attachmentsCount: newContent.attachments?.length || 0
      },
      reason,
      timestamp: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

/**
 * Logira brisanje poruke
 * @param {String} messageId - ID poruke
 * @param {String} actorId - ID korisnika koji je obrisao poruku
 * @param {String} roomId - ID chat rooma
 * @param {Object} metadata - Dodatni podaci (razlog brisanja, itd.)
 * @param {String} ipAddress - IP adresa
 * @param {String} userAgent - User agent
 */
export async function logMessageDeleted(messageId, actorId, roomId, metadata = {}, ipAddress = null, userAgent = null) {
  return await createAuditLog({
    action: AuditActionType.MESSAGE_DELETED,
    actorId,
    messageId,
    roomId,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

/**
 * Logira upload privitka
 * @param {String} messageId - ID poruke
 * @param {String} actorId - ID korisnika koji je uploadao privitak
 * @param {String} roomId - ID chat rooma
 * @param {Object} attachment - Podaci o privitku (filename, size, type, url)
 * @param {String} ipAddress - IP adresa
 * @param {String} userAgent - User agent
 */
export async function logAttachmentUploaded(messageId, actorId, roomId, attachment, ipAddress = null, userAgent = null) {
  return await createAuditLog({
    action: AuditActionType.ATTACHMENT_UPLOADED,
    actorId,
    messageId,
    roomId,
    metadata: {
      attachment: {
        filename: attachment.filename,
        size: attachment.size,
        type: attachment.type || attachment.mimetype,
        url: attachment.url
      },
      timestamp: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

/**
 * Logira brisanje privitka
 * @param {String} messageId - ID poruke
 * @param {String} actorId - ID korisnika koji je obrisao privitak
 * @param {String} roomId - ID chat rooma
 * @param {Object} attachment - Podaci o obrisanom privitku
 * @param {String} ipAddress - IP adresa
 * @param {String} userAgent - User agent
 */
export async function logAttachmentDeleted(messageId, actorId, roomId, attachment, ipAddress = null, userAgent = null) {
  return await createAuditLog({
    action: AuditActionType.ATTACHMENT_DELETED,
    actorId,
    messageId,
    roomId,
    metadata: {
      attachment: {
        filename: attachment.filename,
        url: attachment.url
      },
      timestamp: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

/**
 * Logira otkrivanje kontakta
 * @param {String} jobId - ID posla
 * @param {String} actorId - ID korisnika koji je otkrio kontakt
 * @param {String} roomId - ID chat rooma (opcionalno)
 * @param {Object} metadata - Dodatni podaci (razlog, metoda otkrivanja, itd.)
 * @param {String} ipAddress - IP adresa
 * @param {String} userAgent - User agent
 */
export async function logContactRevealed(jobId, actorId, roomId = null, metadata = {}, ipAddress = null, userAgent = null) {
  return await createAuditLog({
    action: AuditActionType.CONTACT_REVEALED,
    actorId,
    jobId,
    roomId,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

/**
 * Logira maskiranje kontakta
 * @param {String} jobId - ID posla
 * @param {String} actorId - ID korisnika (opcionalno, može biti SYSTEM)
 * @param {String} roomId - ID chat rooma (opcionalno)
 * @param {Object} metadata - Dodatni podaci
 * @param {String} ipAddress - IP adresa
 * @param {String} userAgent - User agent
 */
export async function logContactMasked(jobId, actorId = null, roomId = null, metadata = {}, ipAddress = null, userAgent = null) {
  return await createAuditLog({
    action: AuditActionType.CONTACT_MASKED,
    actorId,
    jobId,
    roomId,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

/**
 * Logira kreiranje chat rooma
 * @param {String} roomId - ID chat rooma
 * @param {String} actorId - ID korisnika koji je kreirao room
 * @param {String} jobId - ID posla (opcionalno)
 * @param {Object} metadata - Dodatni podaci
 * @param {String} ipAddress - IP adresa
 * @param {String} userAgent - User agent
 */
export async function logRoomCreated(roomId, actorId, jobId = null, metadata = {}, ipAddress = null, userAgent = null) {
  return await createAuditLog({
    action: AuditActionType.ROOM_CREATED,
    actorId,
    roomId,
    jobId,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

/**
 * Logira brisanje chat rooma
 * @param {String} roomId - ID chat rooma
 * @param {String} actorId - ID korisnika koji je obrisao room
 * @param {String} jobId - ID posla (opcionalno)
 * @param {Object} metadata - Dodatni podaci
 * @param {String} ipAddress - IP adresa
 * @param {String} userAgent - User agent
 */
export async function logRoomDeleted(roomId, actorId, jobId = null, metadata = {}, ipAddress = null, userAgent = null) {
  return await createAuditLog({
    action: AuditActionType.ROOM_DELETED,
    actorId,
    roomId,
    jobId,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString()
    },
    ipAddress,
    userAgent
  });
}

/**
 * Dohvati audit logove za poruku
 * @param {String} messageId - ID poruke
 * @param {Number} limit - Maksimalan broj zapisa
 * @param {Number} offset - Offset za paginaciju
 * @returns {Array} - Lista audit logova
 */
export async function getMessageAuditLogs(messageId, limit = 50, offset = 0) {
  return await prisma.auditLog.findMany({
    where: { messageId },
    include: {
      actor: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });
}

/**
 * Dohvati audit logove za chat room
 * @param {String} roomId - ID chat rooma
 * @param {Number} limit - Maksimalan broj zapisa
 * @param {Number} offset - Offset za paginaciju
 * @returns {Array} - Lista audit logova
 */
export async function getRoomAuditLogs(roomId, limit = 100, offset = 0) {
  return await prisma.auditLog.findMany({
    where: { roomId },
    include: {
      actor: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      message: {
        select: {
          id: true,
          content: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });
}

/**
 * Dohvati audit logove za posao (otkrivanje kontakata)
 * @param {String} jobId - ID posla
 * @param {Number} limit - Maksimalan broj zapisa
 * @param {Number} offset - Offset za paginaciju
 * @returns {Array} - Lista audit logova
 */
export async function getJobAuditLogs(jobId, limit = 50, offset = 0) {
  return await prisma.auditLog.findMany({
    where: { 
      jobId,
      action: { in: [AuditActionType.CONTACT_REVEALED, AuditActionType.CONTACT_MASKED] }
    },
    include: {
      actor: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });
}

/**
 * Dohvati sve audit logove za korisnika
 * @param {String} actorId - ID korisnika
 * @param {Number} limit - Maksimalan broj zapisa
 * @param {Number} offset - Offset za paginaciju
 * @returns {Array} - Lista audit logova
 */
export async function getUserAuditLogs(actorId, limit = 100, offset = 0) {
  return await prisma.auditLog.findMany({
    where: { actorId },
    include: {
      message: {
        select: {
          id: true,
          content: true
        }
      },
      room: {
        select: {
          id: true
        }
      },
      job: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });
}

