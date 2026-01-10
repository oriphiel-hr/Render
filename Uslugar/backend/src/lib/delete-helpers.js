// src/lib/delete-helpers.js
// Helper funkcije za cascade delete (workaround dok ne primenimo SQL migraciju)

import { prisma } from './prisma.js';

/**
 * Briše User-a sa SVIM povezanim podacima (manual cascade delete)
 * @param {string} userId - ID korisnika koji treba obrisati
 * @returns {Promise<void>}
 */
export async function deleteUserWithRelations(userId) {
  console.log(`[DELETE] Starting cascade delete for user: ${userId}`);
  
  // 1. Obriši ChatMessage (mora prije ChatRoom zbog many-to-many)
  const deletedMessages = await prisma.chatMessage.deleteMany({ 
    where: { senderId: userId } 
  });
  console.log(`[DELETE] Deleted ${deletedMessages.count} chat messages`);
  
  // 2. Disconnect user from ChatRooms (many-to-many relacija)
  const userChatRooms = await prisma.chatRoom.findMany({
    where: { participants: { some: { id: userId } } }
  });
  
  for (const room of userChatRooms) {
    await prisma.chatRoom.update({
      where: { id: room.id },
      data: { participants: { disconnect: { id: userId } } }
    });
  }
  console.log(`[DELETE] Disconnected from ${userChatRooms.length} chat rooms`);
  
  // 3. Obriši Reviews (i date i primljene)
  const deletedReviewsGiven = await prisma.review.deleteMany({ 
    where: { fromUserId: userId } 
  });
  const deletedReviewsReceived = await prisma.review.deleteMany({ 
    where: { toUserId: userId } 
  });
  console.log(`[DELETE] Deleted ${deletedReviewsGiven.count + deletedReviewsReceived.count} reviews`);
  
  // 4. Obriši Notifications
  const deletedNotifications = await prisma.notification.deleteMany({ 
    where: { userId } 
  });
  console.log(`[DELETE] Deleted ${deletedNotifications.count} notifications`);
  
  // 5. Obriši Offers
  const deletedOffers = await prisma.offer.deleteMany({ 
    where: { userId } 
  });
  console.log(`[DELETE] Deleted ${deletedOffers.count} offers`);
  
  // 6. Obriši Jobs (i svi offers povezani sa njima)
  const userJobs = await prisma.job.findMany({ where: { userId } });
  
  for (const job of userJobs) {
    // Prvo obriši offers za ovaj job
    await prisma.offer.deleteMany({ where: { jobId: job.id } });
    
    // Obriši chat rooms za ovaj job
    const jobRooms = await prisma.chatRoom.findMany({ where: { jobId: job.id } });
    for (const room of jobRooms) {
      await prisma.chatMessage.deleteMany({ where: { roomId: room.id } });
      await prisma.chatRoom.delete({ where: { id: room.id } });
    }
    
    // Na kraju obriši job
    await prisma.job.delete({ where: { id: job.id } });
  }
  console.log(`[DELETE] Deleted ${userJobs.length} jobs with related data`);
  
  // 7. Obriši ProviderProfile (ako postoji)
  const providerProfile = await prisma.providerProfile.findUnique({ 
    where: { userId } 
  });
  
  if (providerProfile) {
    // Disconnect kategorije (many-to-many)
    await prisma.providerProfile.update({
      where: { userId },
      data: { categories: { set: [] } }
    });
    
    await prisma.providerProfile.delete({ where: { userId } });
    console.log(`[DELETE] Deleted provider profile`);
  }
  
  // 8. Obriši Subscription (ako postoji)
  const subscription = await prisma.subscription.findUnique({ 
    where: { userId } 
  });
  
  if (subscription) {
    await prisma.subscription.delete({ where: { userId } });
    console.log(`[DELETE] Deleted subscription`);
  }
  
  // 9. Konačno obriši User-a
  await prisma.user.delete({ where: { id: userId } });
  console.log(`[DELETE] ✅ User ${userId} successfully deleted with all relations`);
}

/**
 * Briše Job sa svim povezanim podacima
 * @param {string} jobId - ID posla koji treba obrisati
 * @returns {Promise<void>}
 */
export async function deleteJobWithRelations(jobId) {
  console.log(`[DELETE] Starting cascade delete for job: ${jobId}`);
  
  // 1. Obriši Offers
  const deletedOffers = await prisma.offer.deleteMany({ where: { jobId } });
  console.log(`[DELETE] Deleted ${deletedOffers.count} offers`);
  
  // 2. Obriši ChatRooms i Messages
  const jobRooms = await prisma.chatRoom.findMany({ where: { jobId } });
  
  for (const room of jobRooms) {
    await prisma.chatMessage.deleteMany({ where: { roomId: room.id } });
    await prisma.chatRoom.delete({ where: { id: room.id } });
  }
  console.log(`[DELETE] Deleted ${jobRooms.length} chat rooms`);
  
  // 3. Obriši Job
  await prisma.job.delete({ where: { id: jobId } });
  console.log(`[DELETE] ✅ Job ${jobId} successfully deleted with all relations`);
}

/**
 * Briše ChatRoom sa svim porukama
 * @param {string} roomId - ID chat room-a koji treba obrisati
 * @returns {Promise<void>}
 */
export async function deleteChatRoomWithMessages(roomId) {
  console.log(`[DELETE] Starting cascade delete for chat room: ${roomId}`);
  
  // 1. Obriši sve poruke
  const deletedMessages = await prisma.chatMessage.deleteMany({ where: { roomId } });
  console.log(`[DELETE] Deleted ${deletedMessages.count} messages`);
  
  // 2. Obriši room
  await prisma.chatRoom.delete({ where: { id: roomId } });
  console.log(`[DELETE] ✅ Chat room ${roomId} successfully deleted`);
}

