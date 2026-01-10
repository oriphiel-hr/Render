// Credit System Service - USLUGAR EXCLUSIVE
import { prisma } from '../lib/prisma.js';

/**
 * Kreiraj notifikaciju o transakciji kredita
 */
async function notifyTransaction(userId, transaction, newBalance) {
  try {
    let title = '';
    let message = '';
    
    switch (transaction.type) {
      case 'PURCHASE':
        title = 'Krediti dodani';
        message = `Dodano vam je ${transaction.amount} kredita. ${transaction.description || ''} Novo stanje: ${newBalance} kredita.`;
        break;
      case 'LEAD_PURCHASE':
        title = 'Kupovina leada';
        message = `Potrošeno ${Math.abs(transaction.amount)} kredita za kupovinu leada. ${transaction.description || ''} Novo stanje: ${newBalance} kredita.`;
        break;
      case 'REFUND':
        title = 'Refund kredita';
        message = `Vraćeno vam je ${transaction.amount} kredita. ${transaction.description || ''} Novo stanje: ${newBalance} kredita.`;
        break;
      case 'BONUS':
        title = 'Bonus krediti';
        message = `Dodano vam je ${transaction.amount} bonus kredita! ${transaction.description || ''} Novo stanje: ${newBalance} kredita.`;
        break;
      case 'SUBSCRIPTION':
        title = 'Krediti iz pretplate';
        message = `Dodano vam je ${transaction.amount} kredita iz pretplate. ${transaction.description || ''} Novo stanje: ${newBalance} kredita.`;
        break;
      case 'ADMIN_ADJUST':
        title = 'Prilagodba kredita';
        message = `Admin je prilagodio vaše kredite za ${transaction.amount > 0 ? '+' : ''}${transaction.amount}. ${transaction.description || ''} Novo stanje: ${newBalance} kredita.`;
        break;
      default:
        title = 'Transakcija kredita';
        message = `Transakcija: ${transaction.description || 'Krediti ažurirani'}. Novo stanje: ${newBalance} kredita.`;
    }

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title,
        message,
        jobId: transaction.relatedJobId || null
      }
    });

    console.log(`[NOTIFICATION] Transaction notification sent to user ${userId}: ${title}`);
  } catch (error) {
    console.error('[NOTIFICATION] Error sending transaction notification:', error);
    // Don't throw - notification failure shouldn't break transaction
  }
}

/**
 * Dodaj kredite korisniku
 */
export async function addCredits(userId, amount, type, description = null, relatedJobId = null) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  const newBalance = subscription.creditsBalance + amount;

  // Update subscription
  await prisma.subscription.update({
    where: { userId },
    data: { creditsBalance: newBalance }
  });

  // Create transaction record
  const transaction = await prisma.creditTransaction.create({
    data: {
      userId,
      type,
      amount,
      balance: newBalance,
      description,
      relatedJobId
    }
  });

  // Send notification about transaction
  await notifyTransaction(userId, transaction, newBalance);

  console.log(`[CREDITS] Added ${amount} credits to user ${userId}. New balance: ${newBalance}`);
  return { balance: newBalance, transaction };
}

/**
 * Potroši kredite (kupovina leada)
 */
export async function deductCredits(userId, amount, description = null, relatedJobId = null, relatedPurchaseId = null) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  if (subscription.creditsBalance < amount) {
    throw new Error(`Insufficient credits. Available: ${subscription.creditsBalance}, Required: ${amount}`);
  }

  const newBalance = subscription.creditsBalance - amount;

  // Update subscription
  await prisma.subscription.update({
    where: { userId },
    data: {
      creditsBalance: newBalance,
      lifetimeCreditsUsed: subscription.lifetimeCreditsUsed + amount
    }
  });

  // Create transaction record
  const transaction = await prisma.creditTransaction.create({
    data: {
      userId,
      type: 'LEAD_PURCHASE',
      amount: -amount,
      balance: newBalance,
      description,
      relatedJobId,
      relatedPurchaseId
    }
  });

  // Send notification about transaction
  await notifyTransaction(userId, transaction, newBalance);

  console.log(`[CREDITS] Deducted ${amount} credits from user ${userId}. New balance: ${newBalance}`);
  return { balance: newBalance, transaction };
}

/**
 * Refund kredita (neuspješan lead)
 */
export async function refundCredits(userId, amount, description = null, relatedPurchaseId = null) {
  return await addCredits(userId, amount, 'REFUND', description, null);
}

/**
 * Dohvati trenutni balans kredita
 */
export async function getCreditsBalance(userId) {
  let subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      creditsBalance: true,
      lifetimeCreditsUsed: true,
      plan: true
    }
  });

  // Create default TRIAL subscription if doesn't exist
  if (!subscription) {
    console.log(`[CREDITS] Creating default TRIAL subscription for user ${userId}`);
    // TRIAL = maksimalni paket funkcionalnosti: 14 dana, 7-8 leadova
    const trialExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 dana trial
    const trialCredits = 8; // 7-8 leadova (srednja vrijednost)
    
    subscription = await prisma.subscription.create({
      data: {
        userId: userId,
        plan: 'TRIAL',
        status: 'ACTIVE',
        credits: 0,
        creditsBalance: trialCredits,
        expiresAt: trialExpiresAt
      },
      select: {
        creditsBalance: true,
        lifetimeCreditsUsed: true,
        plan: true
      }
    });
    
    // Create notification
    await prisma.notification.create({
      data: {
        title: 'Dobrodošli u Uslugar EXCLUSIVE!',
        message: 'Dobili ste 5 besplatnih leadova da probate našu platformu. Nadogradite pretplatu za više.',
        type: 'SYSTEM',
        userId: userId
      }
    });
  }

  return {
    balance: subscription.creditsBalance,
    lifetime: subscription.lifetimeCreditsUsed || 0,
    plan: subscription.plan
  };
}

/**
 * Dohvati povijest transakcija kredita
 * @param {String} userId - ID korisnika
 * @param {Number} limit - Maksimalan broj transakcija
 * @param {String} type - Filter po tipu transakcije (opcionalno)
 */
export async function getCreditHistory(userId, limit = 50, type = null) {
  const where = { userId };
  
  if (type) {
    where.type = type;
  }

  const transactions = await prisma.creditTransaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      relatedJob: {
        select: { id: true, title: true }
      },
      relatedPurchase: {
        select: { id: true, status: true }
      }
    }
  });

  return transactions;
}

/**
 * Provjeri ima li dovoljno kredita
 */
export async function hasEnoughCredits(userId, requiredAmount) {
  const { balance } = await getCreditsBalance(userId);
  return balance >= requiredAmount;
}

