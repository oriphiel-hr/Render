import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';
import { deleteUserWithRelations } from '../lib/delete-helpers.js';
import { offerToNextInQueue } from '../lib/leadQueueManager.js';
import { getPlatformStatistics, getMonthlyTrends } from '../services/platform-stats-service.js';
import { getPendingModeration, moderateContent, getModerationStats, reportMessage } from '../services/moderation-service.js';
import { sendMonthlyReportsToAllUsers, sendMonthlyReport } from '../services/monthly-report-service.js';

const r = Router();

/**
 * GET /api/admin/platform-stats
 * Statistike platforme - sveobuhvatan pregled
 */
r.get('/platform-stats', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const stats = await getPlatformStatistics();
    res.json(stats);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/migration-status-test
 * Test endpoint za provjeru da li se route registrira
 */
console.log('🔍 Registering /migration-status-test endpoint');
r.get('/migration-status-test', auth(true, ['ADMIN']), async (req, res, next) => {
  console.log('✅ /migration-status-test endpoint called');
  try {
    res.json({ success: true, message: 'Endpoint is working!' });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/platform-trends
 * Mjesečni trendovi platforme
 * Query params: months (default: 12)
 */
r.get('/platform-trends', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const monthsBack = parseInt(req.query.months) || 12;
    const trends = await getMonthlyTrends(monthsBack);
    res.json(trends);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/moderation/pending
 * Dohvati sadržaj koji čeka moderaciju
 * Query params: type (job|review|offer|message|all), limit, offset
 */
r.get('/moderation/pending', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const contentType = req.query.type || 'all';
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const result = await getPendingModeration(contentType, limit, offset);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/moderation/stats
 * Statistike moderacije
 */
r.get('/moderation/stats', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const stats = await getModerationStats();
    res.json(stats);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/admin/moderation/:type/:id
 * Odobri ili odbij sadržaj
 * Body: { approved: boolean, reason?: string, notes?: string }
 */
r.post('/moderation/:type/:id', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { approved, reason, notes } = req.body;
    const adminId = req.user.id;
    
    if (!['job', 'review', 'offer', 'message'].includes(type)) {
      return res.status(400).json({ error: 'Invalid content type' });
    }
    
    if (typeof approved !== 'boolean') {
      return res.status(400).json({ error: 'approved must be boolean' });
    }
    
    const result = await moderateContent(type, id, adminId, approved, reason, notes);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// KYC Metrike - Admin Dashboard
r.get('/kyc-metrics', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    // Total registrations
    const totalRegistrations = await prisma.user.count({
      where: { role: 'PROVIDER' }
    });
    
    // Verified providers
    const verifiedProviders = await prisma.providerProfile.count({
      where: { kycVerified: true }
    });
    
    // Document uploaded (not yet verified)
    const withDocument = await prisma.providerProfile.count({
      where: { kycDocumentUrl: { not: null }, kycVerified: false }
    });
    
    // Never verified
    const neverVerified = totalRegistrations - verifiedProviders - withDocument;
    
    // By legal status
    const byStatus = await prisma.$queryRaw`
      SELECT ls.code, ls.name, COUNT(pp.id) as count
      FROM "ProviderProfile" pp
      JOIN "User" u ON pp."userId" = u."id"
      LEFT JOIN "LegalStatus" ls ON u."legalStatusId" = ls."id"
      WHERE u."role" = 'PROVIDER'
      GROUP BY ls.code, ls.name
      ORDER BY count DESC
    `;
    
    // Avg verification time
    const avgTime = await prisma.$queryRaw`
      SELECT AVG(EXTRACT(EPOCH FROM ("kycVerifiedAt" - "createdAt")) / 60) as avg_minutes
      FROM "ProviderProfile"
      WHERE "kycVerifiedAt" IS NOT NULL
    `;
    
    // Helper function to convert BigInt to Number
    const toNumber = (val) => typeof val === 'bigint' ? Number(val) : val;
    
    const metrics = {
      total: totalRegistrations,
      verified: verifiedProviders,
      pendingDocument: withDocument,
      neverVerified,
      verificationRate: totalRegistrations > 0 
        ? ((verifiedProviders / totalRegistrations) * 100).toFixed(1) + '%'
        : '0%',
      byStatus: byStatus.map(item => ({
        code: item.code,
        name: item.name,
        count: toNumber(item.count)
      })),
      avgVerificationMinutes: avgTime[0]?.avg_minutes 
        ? toNumber(avgTime[0].avg_minutes).toFixed(0) 
        : 'N/A'
    };
    
    res.json(metrics);
  } catch (err) {
    next(err);
  }
});

// Admin cleanup: get counts of rows that will be deleted (preview)
r.get('/cleanup/non-master/preview', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const preserveEmailsParam = req.query?.preserveEmails;
    const preserveEmailsArray = preserveEmailsParam 
      ? (Array.isArray(preserveEmailsParam) 
          ? preserveEmailsParam 
          : String(preserveEmailsParam).split(',').map(e => e.trim()).filter(Boolean))
      : [];

    const counts = {};

    // Helper function to safely count
    const safeCount = async (model, name) => {
      try {
        return await model.count({});
      } catch (error) {
        console.error(`Error counting ${name}:`, error.message);
        return 0;
      }
    };

    // 1) Chat-related data
    counts.messageSLAs = await safeCount(prisma.messageSLA, 'messageSLAs');
    counts.messageVersions = await safeCount(prisma.messageVersion, 'messageVersions');
    counts.auditLogs = await safeCount(prisma.auditLog, 'auditLogs');
    counts.chatMessages = await safeCount(prisma.chatMessage, 'chatMessages');
    counts.chatRooms = await safeCount(prisma.chatRoom, 'chatRooms');

    // 2) Reviews, Notifications
    counts.reviews = await safeCount(prisma.review, 'reviews');
    counts.notifications = await safeCount(prisma.notification, 'notifications');

    // 3) Offers, Jobs
    counts.offers = await safeCount(prisma.offer, 'offers');
    counts.jobs = await safeCount(prisma.job, 'jobs');

    // 4) Lead management
    counts.companyLeadQueues = await safeCount(prisma.companyLeadQueue, 'companyLeadQueues');
    counts.leadQueues = await safeCount(prisma.leadQueue, 'leadQueues');
    counts.leadPurchases = await safeCount(prisma.leadPurchase, 'leadPurchases');

    // 5) Provider-related data
    counts.providerROIs = await safeCount(prisma.providerROI, 'providerROIs');
    counts.providerLicenses = await safeCount(prisma.providerLicense, 'providerLicenses');
    counts.providerTeamLocations = await safeCount(prisma.providerTeamLocation, 'providerTeamLocations');
    counts.providerProfiles = await safeCount(prisma.providerProfile, 'providerProfiles');

    // 6) Subscriptions and billing
    counts.addonEventLogs = await safeCount(prisma.addonEventLog, 'addonEventLogs');
    counts.addonUsages = await safeCount(prisma.addonUsage, 'addonUsages');
    counts.addonSubscriptions = await safeCount(prisma.addonSubscription, 'addonSubscriptions');
    counts.subscriptionHistories = await safeCount(prisma.subscriptionHistory, 'subscriptionHistories');
    counts.trialEngagements = await safeCount(prisma.trialEngagement, 'trialEngagements');
    counts.subscriptions = await safeCount(prisma.subscription, 'subscriptions');
    counts.billingAdjustments = await safeCount(prisma.billingAdjustment, 'billingAdjustments');
    counts.billingPlans = await safeCount(prisma.billingPlan, 'billingPlans');

    // 7) Invoices
    counts.invoices = await safeCount(prisma.invoice, 'invoices');

    // 8) Credit transactions
    counts.creditTransactions = await safeCount(prisma.creditTransaction, 'creditTransactions');

    // 9) Feature ownership
    counts.featureOwnershipHistories = await safeCount(prisma.featureOwnershipHistory, 'featureOwnershipHistories');
    counts.companyFeatureOwnerships = await safeCount(prisma.companyFeatureOwnership, 'companyFeatureOwnerships');

    // 10) Client verification
    counts.clientVerifications = await safeCount(prisma.clientVerification, 'clientVerifications');

    // 11) Support tickets
    counts.supportTickets = await safeCount(prisma.supportTicket, 'supportTickets');

    // 12) WhiteLabel settings
    counts.whiteLabels = await safeCount(prisma.whiteLabel, 'whiteLabels');

    // 13) SMS and Push notifications
    counts.pushSubscriptions = await safeCount(prisma.pushSubscription, 'pushSubscriptions');
    counts.smsLogs = await safeCount(prisma.smsLog, 'smsLogs');

    // 14) Chatbot sessions
    counts.chatbotSessions = await safeCount(prisma.chatbotSession, 'chatbotSessions');

    // 15) Saved searches and job alerts
    counts.savedSearches = await safeCount(prisma.savedSearch, 'savedSearches');
    counts.jobAlerts = await safeCount(prisma.jobAlert, 'jobAlerts');

    // 16) Logging tables
    counts.apiRequestLogs = await safeCount(prisma.apiRequestLog, 'apiRequestLogs');
    counts.errorLogs = await safeCount(prisma.errorLog, 'errorLogs');
    // Note: addonEventLogs already counted in section 6

    // 17) Users except ADMIN and optionally preserved emails
    try {
      const whereClause = {
        role: { not: 'ADMIN' }
      };
      if (preserveEmailsArray.length > 0) {
        whereClause.email = { notIn: preserveEmailsArray };
      }
      counts.users = await prisma.user.count({ where: whereClause });
    } catch (error) {
      console.error('Error counting users:', error.message);
      counts.users = 0;
    }

    res.json({ success: true, counts });
  } catch (e) {
    console.error('Error in cleanup preview:', e);
    next(e);
  }
});

// Admin cleanup: delete non-master data, preserve ADMIN user and master tables
r.post('/cleanup/non-master', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    // Optional: preserveEmails array to keep certain users
    const { preserveEmails = [] } = req.body || {};

    const result = { deleted: {} };

    // IMPORTANT: Delete in correct order to avoid foreign key constraint violations
    // Delete child tables BEFORE parent tables

    // 1) Delete most dependent data first (deepest level)
    result.deleted.messageVersions = await prisma.messageVersion.deleteMany({});
    result.deleted.messageSLAs = await prisma.messageSLA.deleteMany({});
    result.deleted.chatMessages = await prisma.chatMessage.deleteMany({});
    result.deleted.auditLogs = await prisma.auditLog.deleteMany({});
    
    // Disconnect ChatRoom participants (many-to-many) before deleting rooms
    const allChatRooms = await prisma.chatRoom.findMany({ select: { id: true } });
    for (const room of allChatRooms) {
      await prisma.chatRoom.update({
        where: { id: room.id },
        data: { participants: { set: [] } }
      });
    }
    result.deleted.chatRooms = await prisma.chatRoom.deleteMany({});

    // 2) Delete reviews and notifications (depend on User)
    result.deleted.reviews = await prisma.review.deleteMany({});
    result.deleted.notifications = await prisma.notification.deleteMany({});

    // 3) Delete offers first (depend on Job and User), then jobs (depend on User)
    result.deleted.offers = await prisma.offer.deleteMany({});
    result.deleted.jobs = await prisma.job.deleteMany({});

    // 4) Lead management (depend on Job, ProviderProfile, User)
    result.deleted.companyLeadQueues = await prisma.companyLeadQueue.deleteMany({});
    result.deleted.leadQueues = await prisma.leadQueue.deleteMany({});
    result.deleted.leadPurchases = await prisma.leadPurchase.deleteMany({});

    // 5) Provider-related data (depend on ProviderProfile)
    result.deleted.providerROIs = await prisma.providerROI.deleteMany({});
    result.deleted.providerLicenses = await prisma.providerLicense.deleteMany({});
    result.deleted.providerTeamLocations = await prisma.providerTeamLocation.deleteMany({});
    
    // Provider profiles - disconnect categories (many-to-many) before deleting
    const providerList = await prisma.providerProfile.findMany({ select: { id: true, userId: true } });
    for (const p of providerList) {
      await prisma.providerProfile.update({
        where: { id: p.id },
        data: { categories: { set: [] } }
      });
    }
    result.deleted.providerProfiles = await prisma.providerProfile.deleteMany({});

    // 6) Subscriptions and billing (depend on User, Subscription, AddonSubscription)
    result.deleted.addonEventLogs = await prisma.addonEventLog.deleteMany({});
    result.deleted.addonUsages = await prisma.addonUsage.deleteMany({});
    result.deleted.subscriptionHistories = await prisma.subscriptionHistory.deleteMany({});
    result.deleted.trialEngagements = await prisma.trialEngagement.deleteMany({});
    result.deleted.addonSubscriptions = await prisma.addonSubscription.deleteMany({});
    result.deleted.subscriptions = await prisma.subscription.deleteMany({});
    result.deleted.billingAdjustments = await prisma.billingAdjustment.deleteMany({});
    result.deleted.billingPlans = await prisma.billingPlan.deleteMany({});

    // 7) Invoices (depend on User, Subscription, AddonSubscription, LeadPurchase)
    result.deleted.invoices = await prisma.invoice.deleteMany({});

    // 8) Credit transactions (depend on User, Job, LeadPurchase)
    result.deleted.creditTransactions = await prisma.creditTransaction.deleteMany({});

    // 9) Feature ownership (depend on User, FeatureCatalog)
    result.deleted.featureOwnershipHistories = await prisma.featureOwnershipHistory.deleteMany({});
    result.deleted.companyFeatureOwnerships = await prisma.companyFeatureOwnership.deleteMany({});

    // 10) Client verification (depend on User)
    result.deleted.clientVerifications = await prisma.clientVerification.deleteMany({});

    // 11) Support tickets (depend on User)
    result.deleted.supportTickets = await prisma.supportTicket.deleteMany({});

    // 12) WhiteLabel settings (depend on User)
    result.deleted.whiteLabels = await prisma.whiteLabel.deleteMany({});

    // 13) SMS and Push notifications (depend on User)
    result.deleted.pushSubscriptions = await prisma.pushSubscription.deleteMany({});
    result.deleted.smsLogs = await prisma.smsLog.deleteMany({});

    // 14) Chatbot sessions (depend on User, Job)
    result.deleted.chatbotSessions = await prisma.chatbotSession.deleteMany({});

    // 15) Saved searches and job alerts (depend on User)
    result.deleted.savedSearches = await prisma.savedSearch.deleteMany({});
    result.deleted.jobAlerts = await prisma.jobAlert.deleteMany({});

    // 16) Logging tables (depend on User, Job, ChatMessage, ChatRoom)
    result.deleted.apiRequestLogs = await prisma.apiRequestLog.deleteMany({});
    result.deleted.errorLogs = await prisma.errorLog.deleteMany({});

    // 17) Users except ADMIN and optionally preserved emails
    // All relations are already deleted above, so direct delete is safe
    const usersToDelete = await prisma.user.findMany({
      where: {
        role: { not: 'ADMIN' },
        email: preserveEmails.length ? { notIn: preserveEmails } : undefined
      },
      select: { id: true }
    });

    let usersDeleted = 0;
    for (const u of usersToDelete) {
      try {
        // Direct delete is safe as all relations are already removed above
        await prisma.user.delete({ where: { id: u.id } });
        usersDeleted++;
      } catch (userDeleteError) {
        // If direct delete fails, use helper function as fallback
        console.warn(`[CLEANUP] Direct delete failed for user ${u.id}, using helper:`, userDeleteError.message);
        try {
          await deleteUserWithRelations(u.id);
          usersDeleted++;
        } catch (helperError) {
          console.error(`[CLEANUP] Failed to delete user ${u.id}:`, helperError.message);
          // Continue with other users
        }
      }
    }
    result.deleted.users = { count: usersDeleted };

    // IMPORTANT: Preserve testing data
    // Do NOT delete TestPlan/TestItem/TestRun/TestRunItem (explicitly ensured by not touching them here)
    // Note: Master data preserved: Category, SubscriptionPlan, LegalStatus, ADMIN user, and all Testing models
    res.json({ success: true, ...result });
  } catch (e) {
    console.error('[CLEANUP] Error during cleanup:', e);
    next(e);
  }
});

// Dodaj nedostajuće kategorije - potpuno javni endpoint (MUST be before generic routes)
r.post('/add-categories', async (req, res, next) => {
  try {
    
    const categories = [
      // 🏗️ GRAĐEVINSKE USLUGE
      { name: "Građevina", description: "Opći građevinski radovi, renovacije, adaptacije", icon: "🏗️", nkdCode: "41.20", requiresLicense: true, licenseType: "Građevinska licenca", licenseAuthority: "Hrvatska komora inženjera građevinarstva" },
      { name: "Građevinski nadzor", description: "Nadzor nad izvođenjem građevinskih radova", icon: "👷", nkdCode: "71.12", requiresLicense: true, licenseType: "Licenca građevinskog nadzora", licenseAuthority: "Hrvatska komora inženjera građevinarstva" },
      { name: "Geodetske usluge", description: "Mjerenja, izrada geodetskih elaborata", icon: "📐", nkdCode: "71.12", requiresLicense: true, licenseType: "Geodetska licenca", licenseAuthority: "Hrvatska komora inženjera geodezije" },
      { name: "Energetski certifikati", description: "Izdavanje energetskih certifikata za zgrade", icon: "⚡", nkdCode: "71.12", requiresLicense: true, licenseType: "Licenca energetskog certifikata", licenseAuthority: "Hrvatska energetska agencija" },
      { name: "Legalizacija objekata", description: "Pomoć pri legalizaciji bespravno sagrađenih objekata", icon: "📋", nkdCode: "71.12", requiresLicense: false },

      // 🎨 DIZAJN I INTERIJER
      { name: "Dizajn interijera", description: "Uređenje i dizajn unutarnjih prostora", icon: "🎨", nkdCode: "74.10", requiresLicense: false },
      { name: "Arhitektonske usluge", description: "Projektiranje, izrada arhitektonskih planova", icon: "🏛️", nkdCode: "71.11", requiresLicense: true, licenseType: "Arhitektonska licenca", licenseAuthority: "Hrvatska komora arhitekata" },
      { name: "Landscape dizajn", description: "Uređenje vanjskih prostora, vrtovi", icon: "🌳", nkdCode: "71.12", requiresLicense: false },

      // 🔌 INSTALACIJE
      { name: "Električar", description: "Električne instalacije, popravak električnih uređaja", icon: "⚡", nkdCode: "43.21", requiresLicense: true, licenseType: "Elektrotehnička licenca", licenseAuthority: "Hrvatska komora inženjera elektrotehnike" },
      { name: "Vodoinstalater", description: "Vodovodne instalacije, popravak cijevi", icon: "🚿", nkdCode: "43.22", requiresLicense: true, licenseType: "Licenca za vodovodne instalacije", licenseAuthority: "Hrvatska komora inženjera građevinarstva" },
      { name: "Solarni sustavi", description: "Ugradnja solarnih panela i sustava", icon: "☀️", nkdCode: "43.21", requiresLicense: true, licenseType: "Elektrotehnička licenca", licenseAuthority: "Hrvatska komora inženjera elektrotehnike" },

      // 🎨 ZANATI
      { name: "Soboslikarstvo", description: "Soboslikarski radovi, bojanje zidova", icon: "🎨", nkdCode: "43.30", requiresLicense: false },
      { name: "Keramičar", description: "Položba keramike, pločica", icon: "🧱", nkdCode: "43.30", requiresLicense: false },

      // 💻 IT I DIGITALNE USLUGE
      { name: "IT usluge", description: "Općenite IT usluge, održavanje računala", icon: "💻", nkdCode: "62.01", requiresLicense: false },
      { name: "Web dizajn", description: "Izrada i dizajn web stranica", icon: "🌐", nkdCode: "62.01", requiresLicense: false },
      { name: "SEO usluge", description: "Optimizacija web stranica za pretraživače", icon: "🔍", nkdCode: "62.01", requiresLicense: false },
      { name: "Digitalni marketing", description: "Online marketing, društvene mreže", icon: "📱", nkdCode: "73.11", requiresLicense: false },
      { name: "E-commerce", description: "Izrada online trgovina", icon: "🛒", nkdCode: "62.01", requiresLicense: false },

      // 📸 MEDIJSKE USLUGE
      { name: "Fotografija", description: "Profesionalno fotografiranje za različite potrebe", icon: "📸", nkdCode: "74.20", requiresLicense: false },
      { name: "Drone snimanje", description: "Zračno snimanje dronovima", icon: "🚁", nkdCode: "74.20", requiresLicense: false },
      { name: "3D vizualizacija", description: "3D modeli, renderi, vizualizacije", icon: "🎬", nkdCode: "74.20", requiresLicense: false },

      // 🚚 LOGISTIKA I TRANSPORT
      { name: "Prijevoz", description: "Općenite prijevozne usluge", icon: "🚚", nkdCode: "49.41", requiresLicense: true, licenseType: "Licenca za prijevoz", licenseAuthority: "Ministarstvo mora, prometa i infrastrukture" },
      { name: "Dostava", description: "Dostava paketa, hrane, pošiljki", icon: "📦", nkdCode: "53.20", requiresLicense: false },
      { name: "Selidbe", description: "Usluge selidbe, premještanje namještaja", icon: "📦", nkdCode: "49.41", requiresLicense: false },
      { name: "Prijevoz putnika", description: "Taxi, prijevoz putnika", icon: "🚕", nkdCode: "49.32", requiresLicense: true, licenseType: "Licenca za prijevoz putnika", licenseAuthority: "Ministarstvo mora, prometa i infrastrukture" },

      // 🧹 ČIŠĆENJE I ODRŽAVANJE
      { name: "Čišćenje", description: "Općenite usluge čišćenja", icon: "🧹", nkdCode: "81.21", requiresLicense: false },
      { name: "Čišćenje kućanstva", description: "Čišćenje domova, stanova", icon: "🏠", nkdCode: "81.21", requiresLicense: false },
      { name: "Čišćenje ureda", description: "Čišćenje poslovnih prostora", icon: "🏢", nkdCode: "81.21", requiresLicense: false },
      { name: "Čišćenje nakon gradnje", description: "Čišćenje nakon građevinskih radova", icon: "🏗️", nkdCode: "81.21", requiresLicense: false },

      // 🏥 ZDRAVLJE I LJEPOTA
      { name: "Fizioterapija", description: "Fizioterapijske usluge, rehabilitacija", icon: "🏥", nkdCode: "86.90", requiresLicense: true, licenseType: "Licenca fizioterapeuta", licenseAuthority: "Hrvatska komora fizioterapeuta" },
      { name: "Masage", description: "Opuštajuće i terapeutske masaže", icon: "💆", nkdCode: "96.09", requiresLicense: false },
      { name: "Kozmetika", description: "Kozmetičke usluge, njega lica", icon: "💄", nkdCode: "96.02", requiresLicense: false },
      { name: "Manikura/Pedikura", description: "Njega noktiju ruku i nogu", icon: "💅", nkdCode: "96.02", requiresLicense: false },

      // 🎓 OBRAZOVANJE
      { name: "Instrukcije", description: "Poduka učenika, instrukcije", icon: "📚", nkdCode: "85.59", requiresLicense: false },
      { name: "Jezici", description: "Učenje stranih jezika", icon: "🗣️", nkdCode: "85.59", requiresLicense: false },
      { name: "Muzika", description: "Glazbena nastava, poduka", icon: "🎵", nkdCode: "85.59", requiresLicense: false },

      // ⚖️ PRAVNE I FINANCIJSKE USLUGE
      { name: "Pravo", description: "Općenite pravne usluge", icon: "⚖️", nkdCode: "69.10", requiresLicense: true, licenseType: "Odvjetnička licenca", licenseAuthority: "Hrvatska odvjetnička komora" },
      { name: "Računovodstvo", description: "Knjigovodstvo, računovodstvene usluge", icon: "📊", nkdCode: "69.20", requiresLicense: false },
      { name: "Osiguranje", description: "Osiguravajuće usluge", icon: "🛡️", nkdCode: "65.20", requiresLicense: true, licenseType: "Licenca osiguravajućeg agenta", licenseAuthority: "Hrvatska agencija za nadzor financijskih usluga" },

      // 🌱 EKOLOGIJA I ODRŽIVOST
      { name: "Energetska učinkovitost", description: "Energetski pregledi, optimizacija potrošnje", icon: "🌱", nkdCode: "71.12", requiresLicense: true, licenseType: "Licenca energetskog savjetnika", licenseAuthority: "Hrvatska energetska agencija" },
      { name: "Recikliranje", description: "Usluge recikliranja, odvoz otpada", icon: "♻️", nkdCode: "38.11", requiresLicense: false },

      // 🏠 DOMAĆI RADOVI
      { name: "Popravak kućanskih aparata", description: "Popravak perilica, sušilica, frižidera", icon: "🔧", nkdCode: "95.21", requiresLicense: false },
      { name: "Montaža namještaja", description: "Montaža namještaja, sklapanje", icon: "🪑", nkdCode: "43.30", requiresLicense: false },
      { name: "Montaža klima uređaja", description: "Ugradnja i servis klima uređaja", icon: "❄️", nkdCode: "43.22", requiresLicense: true, licenseType: "Licenca za klimatizaciju", licenseAuthority: "Hrvatska komora inženjera građevinarstva" }
    ];

    let addedCount = 0;
    let updatedCount = 0;
    
    for (const categoryData of categories) {
      try {
        const existing = await prisma.category.findUnique({
          where: { name: categoryData.name }
        });
        
        if (existing) {
          // Ažuriraj postojeću kategoriju s novim podacima
          await prisma.category.update({
            where: { name: categoryData.name },
            data: {
              description: categoryData.description,
              icon: categoryData.icon,
              nkdCode: categoryData.nkdCode,
              requiresLicense: categoryData.requiresLicense,
              licenseType: categoryData.licenseType,
              licenseAuthority: categoryData.licenseAuthority,
              isActive: true
            }
          });
          updatedCount++;
        } else {
          // Kreiraj novu kategoriju
          await prisma.category.create({
            data: {
              name: categoryData.name,
              description: categoryData.description,
              icon: categoryData.icon,
              nkdCode: categoryData.nkdCode,
              requiresLicense: categoryData.requiresLicense,
              licenseType: categoryData.licenseType,
              licenseAuthority: categoryData.licenseAuthority,
              isActive: true
            }
          });
          addedCount++;
        }
      } catch (error) {
        console.error(`❌ Greška za ${categoryData.name}:`, error.message);
      }
    }
    
    const totalCount = addedCount + updatedCount;
    
    
    res.json({
      success: true,
      addedCount,
      updatedCount,
      totalCount,
      message: `Uspješno dodano ${addedCount} i ažurirano ${updatedCount} kategorija`
    });
    
  } catch (e) {
    console.error('❌ Greška pri seed-u kategorija:', e);
    next(e);
  }
});

/**
 * POST /api/admin/licenses/:licenseId/validate
 * Automatska provjera valjanosti licence
 */
r.post('/licenses/:licenseId/validate', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { licenseId } = req.params;
    
    const license = await prisma.providerLicense.findUnique({
      where: { id: licenseId },
      include: {
        provider: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true
              }
            }
          }
        }
      }
    });
    
    if (!license) {
      return res.status(404).json({ error: 'Licenca nije pronađena' });
    }
    
    const { validateLicense } = await import('../services/license-validator.js');
    const result = await validateLicense(license);
    
    // Ažuriraj notes sa rezultatom provjere
    await prisma.providerLicense.update({
      where: { id: licenseId },
      data: {
        notes: result.message + (license.notes ? ` | ${license.notes}` : ''),
        updatedAt: new Date()
      }
    });
    
    res.json({
      success: true,
      validation: result,
      license: {
        id: license.id,
        licenseType: license.licenseType,
        licenseNumber: license.licenseNumber,
        issuingAuthority: license.issuingAuthority,
        expiresAt: license.expiresAt,
        isVerified: license.isVerified
      }
    });
  } catch (e) {
    next(e);
  }
});

// Verify license - Admin endpoint
r.patch('/licenses/:licenseId/verify', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { licenseId } = req.params;
    const { isVerified, notes } = req.body;

    // Get license
    const license = await prisma.providerLicense.findUnique({
      where: { id: licenseId },
      include: {
        provider: {
          include: {
            user: true
          }
        }
      }
    });

    if (!license) {
      return res.status(404).json({ error: 'License not found' });
    }

    // Update license
    const updatedLicense = await prisma.providerLicense.update({
      where: { id: licenseId },
      data: {
        isVerified: isVerified !== undefined ? Boolean(isVerified) : true,
        verifiedAt: isVerified !== undefined && Boolean(isVerified) ? new Date() : null,
        verifiedBy: isVerified !== undefined && Boolean(isVerified) ? req.user.id : null,
        notes: notes || undefined
      },
      include: {
        provider: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: isVerified ? 'License verified successfully' : 'License verification removed',
      license: updatedLicense
    });
  } catch (e) {
    next(e);
  }
});

// Get all licenses (Admin)
r.get('/licenses', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { verified, providerId } = req.query;

    const where = {};
    if (verified !== undefined) {
      where.isVerified = verified === 'true';
    }
    if (providerId) {
      where.providerId = providerId;
    }

    const licenses = await prisma.providerLicense.findMany({
      where,
      include: {
        provider: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(licenses);
  } catch (e) {
    next(e);
  }
});

// Get pending providers (waiting for approval)
r.get('/providers/pending', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const providers = await prisma.providerProfile.findMany({
      where: {
        approvalStatus: 'WAITING_FOR_APPROVAL'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            city: true,
            createdAt: true
          }
        },
        licenses: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        categories: true,
        legalStatus: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(providers);
  } catch (e) {
    next(e);
  }
});

// Approve or reject provider
r.patch('/providers/:providerId/approval', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const { status, notes } = req.body; // status: 'APPROVED' | 'REJECTED'

    if (!status || !['APPROVED', 'REJECTED', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be APPROVED, REJECTED, or INACTIVE' });
    }

    // Get provider with user info
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        licenses: true
      }
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Update approval status
    const updatedProvider = await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        approvalStatus: status,
        updatedAt: new Date()
      },
      include: {
        user: true,
        licenses: true,
        categories: true
      }
    });

    // Send notification to provider
    const message = status === 'APPROVED' 
      ? `Vaša registracija je odobrena! Sada možete koristiti TRIAL status i prikazivati svoje usluge.`
      : status === 'REJECTED'
      ? `Vaša registracija je odbijena. Razlog: ${notes || 'Nisu zadovoljeni uvjeti.'}`
      : `Vaš status je ažuriran na INACTIVE.`;

    await prisma.notification.create({
      data: {
        title: status === 'APPROVED' ? 'Registracija odobrena!' : status === 'REJECTED' ? 'Registracija odbijena' : 'Status ažuriran',
        message: message,
        type: 'SYSTEM',
        userId: provider.userId,
        jobId: null,
        offerId: null
      }
    });

    // If approved, ensure they have a subscription or set them to TRIAL
    if (status === 'APPROVED') {
      const existingSubscription = await prisma.subscription.findUnique({
        where: { userId: provider.userId }
      });

      if (!existingSubscription) {
        await prisma.subscription.create({
          data: {
            userId: provider.userId,
            plan: 'TRIAL',
            status: 'ACTIVE',
            credits: 0,
            creditsBalance: 0,
            // Set expiration to 30 days from now
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });
      }
    }

    res.json({
      message: `Provider ${status === 'APPROVED' ? 'approved' : status === 'REJECTED' ? 'rejected' : 'updated'} successfully`,
      provider: updatedProvider
    });
  } catch (e) {
    next(e);
  }
});

// Generic CRUD routes for all models
const MODELS = {
  User: prisma.user,
  ProviderProfile: prisma.providerProfile,
  Category: prisma.category,
  Job: prisma.job,
  Offer: prisma.offer,
  Review: prisma.review,
  Notification: prisma.notification,
  ChatRoom: prisma.chatRoom,
  ChatMessage: prisma.chatMessage,
  Subscription: prisma.subscription,
  SubscriptionPlan: prisma.subscriptionPlan,
  LegalStatus: prisma.legalStatus
};

// SMS Verifikacija - Reset pokušaja (MORA BITI PRIJE generičkih ruta)
r.post('/users/:userId/reset-sms-attempts', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        phoneVerificationAttempts: true,
        phoneVerified: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Korisnik nije pronađen' });
    }
    
    // Reset pokušaja
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        phoneVerificationAttempts: 0
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        phoneVerificationAttempts: true,
        phoneVerified: true
      }
    });
    
    res.json({
      success: true,
      message: `SMS pokušaji resetirani za korisnika ${user.email}`,
      user: updated
    });
  } catch (e) {
    next(e);
  }
});

// Generic GET /:model - list with pagination
Object.keys(MODELS).forEach(modelName => {
  const model = MODELS[modelName];
  
  r.get(`/${modelName}`, auth(true, ['ADMIN']), async (req, res, next) => {
    try {
      const { skip = 0, take = 25, where: whereStr, include: includeStr } = req.query;
      
      const where = whereStr ? JSON.parse(whereStr) : {};
      
      // Default include based on model
      let defaultInclude = undefined;
      if (modelName === 'Notification') {
        defaultInclude = { user: true, job: true, offer: true };
      } else if (modelName === 'Job') {
        defaultInclude = { user: true, category: true, assignedProvider: true };
      } else if (modelName === 'Offer') {
        defaultInclude = { user: true, job: true };
      } else if (modelName === 'Review') {
        defaultInclude = { from: true, to: true };
      } else if (modelName === 'User') {
        defaultInclude = { providerProfile: true, legalStatus: true };
      } else if (modelName === 'ProviderProfile') {
        defaultInclude = { user: true, categories: true, legalStatus: true };
      }
      
      // Use provided include or default
      const include = includeStr ? JSON.parse(includeStr) : defaultInclude;
      
      const [items, total] = await Promise.all([
        model.findMany({
          where,
          include,
          skip: parseInt(skip),
          take: parseInt(take),
          orderBy: { createdAt: 'desc' }
        }),
        model.count({ where })
      ]);
      
      res.json({ items, total });
    } catch (e) {
      next(e);
    }
  });
  
  // Generic GET /:model/:id
  r.get(`/${modelName}/:id`, auth(true, ['ADMIN']), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { include: includeStr } = req.query;
      
      // Default include based on model
      let defaultInclude = undefined;
      if (modelName === 'Notification') {
        defaultInclude = { user: true, job: true, offer: true };
      } else if (modelName === 'Job') {
        defaultInclude = { user: true, category: true, assignedProvider: true };
      } else if (modelName === 'Offer') {
        defaultInclude = { user: true, job: true };
      } else if (modelName === 'Review') {
        defaultInclude = { from: true, to: true };
      } else if (modelName === 'User') {
        defaultInclude = { providerProfile: true, legalStatus: true };
      } else if (modelName === 'ProviderProfile') {
        defaultInclude = { user: true, categories: true, legalStatus: true };
      }
      
      // Use provided include or default
      const include = includeStr ? JSON.parse(includeStr) : defaultInclude;
      
      const item = await model.findUnique({
        where: { id },
        include
      });
      
      if (!item) {
        return res.status(404).json({ error: 'Not found' });
      }
      
      res.json(item);
    } catch (e) {
      next(e);
    }
  });
  
  // Generic POST /:model
  r.post(`/${modelName}`, auth(true, ['ADMIN']), async (req, res, next) => {
    try {
      const data = req.body;
      const item = await model.create({ data });
      res.status(201).json(item);
    } catch (e) {
      next(e);
    }
  });
  
  // Generic PUT /:model/:id
  r.put(`/${modelName}/:id`, auth(true, ['ADMIN']), async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // Remove fields that shouldn't be updated
      delete data.id;
      delete data.createdAt;
      
      const item = await model.update({
        where: { id },
        data
      });
      
      res.json(item);
    } catch (e) {
      next(e);
    }
  });
  
  // Generic DELETE /:model/:id
  r.delete(`/${modelName}/:id`, auth(true, ['ADMIN']), async (req, res, next) => {
    try {
      const { id } = req.params;

      // Special handling for User deletion (cascade delete with relations)
      if (modelName === 'User') {
        const user = await prisma.user.findUnique({ where: { id }, select: { role: true, email: true } });
        if (!user) {
          return res.status(404).json({ error: 'Not found' });
        }
        if (user.role === 'ADMIN') {
          return res.status(400).json({ error: 'ADMIN korisnika nije moguće obrisati' });
        }
        
        // Use cascade delete helper to properly delete all related data
        await deleteUserWithRelations(id);
        return res.json({ success: true, message: 'User and all related data deleted successfully' });
      }

      // For other models, use standard delete
      await model.delete({ where: { id } });
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  });
}); // Zatvaranje forEach petlje

// ============================================================
// ADMIN QUEUE MANAGEMENT
// ============================================================

/**
 * GET /api/admin/queue
 * Pregled svih queue stavki s filterima i paginacijom
 */
r.get('/queue', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { 
      status, 
      jobId, 
      providerId, 
      skip = 0, 
      take = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where = {};
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;
    if (providerId) where.providerId = providerId;

    const [queueItems, total] = await Promise.all([
      prisma.leadQueue.findMany({
        where,
        include: {
          job: {
            include: {
              category: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  city: true
                }
              }
            }
          },
          provider: {
            select: {
              id: true,
              fullName: true,
              email: true,
              city: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: parseInt(skip),
        take: parseInt(take)
      }),
      prisma.leadQueue.count({ where })
    ]);

    res.json({
      success: true,
      queueItems,
      pagination: {
        total,
        skip: parseInt(skip),
        take: parseInt(take),
        hasMore: total > parseInt(skip) + parseInt(take)
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/queue/stats
 * Statistika queue sustava
 */
r.get('/queue/stats', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    // Ukupan broj queue stavki po statusu
    const statusCounts = await prisma.leadQueue.groupBy({
      by: ['status'],
      _count: true
    });

    // Ukupan broj aktivnih queue-ova (job-ovi koji još čekaju providera)
    const activeQueues = await prisma.leadQueue.groupBy({
      by: ['jobId'],
      where: {
        status: { in: ['WAITING', 'OFFERED'] }
      },
      _count: true
    });

    // Prosječno vrijeme odgovora
    const avgResponseTime = await prisma.$queryRaw`
      SELECT AVG(EXTRACT(EPOCH FROM ("respondedAt" - "offeredAt")) / 3600) as avg_hours
      FROM "LeadQueue"
      WHERE "respondedAt" IS NOT NULL AND "offeredAt" IS NOT NULL
    `;

    // Prosječna pozicija kada je lead prihvaćen
    const avgAcceptPosition = await prisma.leadQueue.aggregate({
      where: {
        status: 'ACCEPTED'
      },
      _avg: {
        position: true
      }
    });

    // Broj isteklih ponuda
    const expiredCount = await prisma.leadQueue.count({
      where: {
        status: 'EXPIRED'
      }
    });

    // Broj uspješno prihvaćenih
    const acceptedCount = await prisma.leadQueue.count({
      where: {
        status: 'ACCEPTED'
      }
    });

    // Acceptance rate
    const totalOffered = await prisma.leadQueue.count({
      where: {
        status: { in: ['ACCEPTED', 'DECLINED', 'EXPIRED'] }
      }
    });

    const acceptanceRate = totalOffered > 0 
      ? (acceptedCount / totalOffered * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      stats: {
        statusCounts: statusCounts.map(s => ({
          status: s.status,
          count: s._count
        })),
        activeQueuesCount: activeQueues.length,
        avgResponseTimeHours: avgResponseTime[0]?.avg_hours 
          ? parseFloat(avgResponseTime[0].avg_hours) 
          : null,
        avgAcceptPosition: avgAcceptPosition._avg.position || null,
        expiredCount,
        acceptedCount,
        acceptanceRate: parseFloat(acceptanceRate),
        totalQueueItems: await prisma.leadQueue.count()
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/queue/job/:jobId
 * Pregled queue za određeni job
 */
r.get('/queue/job/:jobId', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const queueItems = await prisma.leadQueue.findMany({
      where: { jobId },
      include: {
        provider: {
          select: {
            id: true,
            fullName: true,
            email: true,
            city: true,
            phone: true
          }
        }
      },
      orderBy: {
        position: 'asc'
      }
    });

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            city: true
          }
        }
      }
    });

    res.json({
      success: true,
      job,
      queueItems,
      summary: {
        total: queueItems.length,
        waiting: queueItems.filter(q => q.status === 'WAITING').length,
        offered: queueItems.filter(q => q.status === 'OFFERED').length,
        accepted: queueItems.filter(q => q.status === 'ACCEPTED').length,
        declined: queueItems.filter(q => q.status === 'DECLINED').length,
        expired: queueItems.filter(q => q.status === 'EXPIRED').length,
        skipped: queueItems.filter(q => q.status === 'SKIPPED').length
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * PATCH /api/admin/queue/:queueId
 * Promjena statusa ili pozicije queue stavke
 */
r.patch('/queue/:queueId', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { queueId } = req.params;
    const { status, position, notes } = req.body;

    const updateData = {};
    if (status) {
      if (!['WAITING', 'OFFERED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'SKIPPED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updateData.status = status;
      
      if (status === 'OFFERED') {
        updateData.offeredAt = new Date();
        updateData.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      }
      if (status === 'ACCEPTED' || status === 'DECLINED') {
        updateData.respondedAt = new Date();
      }
    }
    if (position !== undefined) {
      updateData.position = parseInt(position);
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedQueue = await prisma.leadQueue.update({
      where: { id: queueId },
      data: updateData,
      include: {
        job: {
          include: {
            category: true
          }
        },
        provider: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Queue stavka ažurirana',
      queueItem: updatedQueue
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/admin/queue/:queueId/skip
 * Preskoči providera i ponudi lead sljedećem u queueu
 */
r.post('/queue/:queueId/skip', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { queueId } = req.params;
    const { reason } = req.body;

    // Pronađi queue stavku
    const queueItem = await prisma.leadQueue.findUnique({
      where: { id: queueId },
      include: {
        job: true
      }
    });

    if (!queueItem) {
      return res.status(404).json({ error: 'Queue stavka nije pronađena' });
    }

    // Označi kao SKIPPED
    await prisma.leadQueue.update({
      where: { id: queueId },
      data: {
        status: 'SKIPPED',
        notes: reason ? `Preskočeno od strane admina: ${reason}` : 'Preskočeno od strane admina'
      }
    });

    // Ponudi sljedećem u queueu
    const nextInQueue = await offerToNextInQueue(queueItem.jobId);

    res.json({
      success: true,
      message: nextInQueue 
        ? `Provider preskočen. Lead je ponuđen sljedećem provideru na poziciji ${nextInQueue.position}`
        : 'Provider preskočen. Nema više providera u queueu',
      skippedQueueItem: queueItem,
      nextInQueue
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/admin/queue/:queueId/offer
 * Ručno ponuditi lead provideru
 */
r.post('/queue/:queueId/offer', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { queueId } = req.params;

    const queueItem = await prisma.leadQueue.findUnique({
      where: { id: queueId },
      include: {
        job: {
          include: {
            category: true
          }
        },
        provider: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    if (!queueItem) {
      return res.status(404).json({ error: 'Queue stavka nije pronađena' });
    }

    if (queueItem.status !== 'WAITING') {
      return res.status(400).json({ 
        error: `Provider je već u statusu ${queueItem.status}. Možete ponuditi samo stavke u statusu WAITING.` 
      });
    }

    // Provjeri da li neki drugi provider već ima OFFERED status za ovaj job
    const currentOffered = await prisma.leadQueue.findFirst({
      where: {
        jobId: queueItem.jobId,
        status: 'OFFERED',
        id: { not: queueId }
      }
    });

    if (currentOffered) {
      return res.status(400).json({ 
        error: `Već postoji aktivna ponuda za ovaj job (pozicija ${currentOffered.position}). Prvo preskočite ili završite tu ponudu.` 
      });
    }

    // Ažuriraj status na OFFERED
    const updatedQueue = await prisma.leadQueue.update({
      where: { id: queueId },
      data: {
        status: 'OFFERED',
        offeredAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      },
      include: {
        provider: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        job: {
          include: {
            category: true
          }
        }
      }
    });

    // Pošalji notifikaciju provideru
    await prisma.notification.create({
      data: {
        userId: queueItem.providerId,
        type: 'NEW_JOB',
        title: '🎯 Novi ekskluzivni lead dostupan!',
        message: `${queueItem.job.category.name}: ${queueItem.job.title}. Cijena: ${queueItem.job.leadPrice} kredita. Imate 24h da odgovorite.`,
        jobId: queueItem.jobId
      }
    });

    res.json({
      success: true,
      message: `Lead ponuđen provideru ${updatedQueue.provider.fullName}`,
      queueItem: updatedQueue
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/admin/queue/reset/:jobId
 * Resetiraj queue za job (briše sve postojeće queue stavke i kreira novi queue)
 */
r.post('/queue/reset/:jobId', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { providerLimit = 5 } = req.body;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        category: true
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job nije pronađen' });
    }

    // Obriši postojeći queue
    const deletedCount = await prisma.leadQueue.deleteMany({
      where: { jobId }
    });

    // Ponovno pronađi top providere
    const { findTopProviders, createLeadQueue } = await import('../lib/leadQueueManager.js');
    const topProviders = await findTopProviders(job, parseInt(providerLimit));

    if (topProviders.length === 0) {
      return res.status(404).json({
        error: 'Nema dostupnih providera za ovu kategoriju i lokaciju'
      });
    }

    // Kreiraj novi queue
    const newQueue = await createLeadQueue(jobId, topProviders);

    res.json({
      success: true,
      message: `Queue resetiran. Obrisano ${deletedCount.count} stavki, kreirano ${newQueue.length} novih.`,
      deletedCount: deletedCount.count,
      newQueueItems: newQueue.length,
      queue: newQueue
    });
  } catch (e) {
    next(e);
  }
});

// ============================================================
// ADMIN REFUND MANAGEMENT
// ============================================================

/**
 * GET /api/admin/refunds/pending
 * Pregled svih refund zahtjeva koji čekaju odobrenje
 */
r.get('/refunds/pending', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { skip = 0, take = 50, type = 'all' } = req.query;

    // Lead purchase refunds
    const leadRefunds = type === 'all' || type === 'lead' ? await prisma.leadPurchase.findMany({
      where: {
        refundRequestStatus: 'PENDING'
      },
      include: {
        job: {
          include: {
            category: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                city: true
              }
            }
          }
        },
        provider: {
          select: {
            id: true,
            fullName: true,
            email: true,
            city: true
          }
        }
      },
      orderBy: {
        refundRequestedAt: 'asc' // Stariji zahtjevi prvo
      },
      skip: parseInt(skip),
      take: parseInt(take)
    }) : [];

    res.json({
      success: true,
      refunds: {
        leadPurchases: leadRefunds.map(r => ({
          id: r.id,
          type: 'lead_purchase',
          purchaseId: r.id,
          job: r.job,
          provider: r.provider,
          creditsSpent: r.creditsSpent,
          refundReason: r.refundReason,
          refundRequestedAt: r.refundRequestedAt,
          createdAt: r.createdAt,
          status: r.status,
          stripePaymentIntentId: r.stripePaymentIntentId
        })),
        // Subscription refunds - možemo dodati kasnije ako zatreba
        subscriptions: []
      },
      total: leadRefunds.length
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/refunds/stats
 * Statistika refund-ova
 */
r.get('/refunds/stats', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const pendingCount = await prisma.leadPurchase.count({
      where: { refundRequestStatus: 'PENDING' }
    });

    const approvedCount = await prisma.leadPurchase.count({
      where: { refundRequestStatus: 'APPROVED' }
    });

    const rejectedCount = await prisma.leadPurchase.count({
      where: { refundRequestStatus: 'REJECTED' }
    });

    const totalRefundedAmount = await prisma.leadPurchase.aggregate({
      where: { refundRequestStatus: 'APPROVED' },
      _sum: {
        creditsSpent: true
      }
    });

    const avgResponseTime = await prisma.$queryRaw`
      SELECT AVG(EXTRACT(EPOCH FROM ("refundApprovedAt" - "refundRequestedAt")) / 3600) as avg_hours
      FROM "LeadPurchase"
      WHERE "refundRequestStatus" = 'APPROVED' 
        AND "refundApprovedAt" IS NOT NULL 
        AND "refundRequestedAt" IS NOT NULL
    `;

    res.json({
      success: true,
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        totalRefundedCredits: totalRefundedAmount._sum.creditsSpent || 0,
        approvalRate: (approvedCount + rejectedCount) > 0
          ? ((approvedCount / (approvedCount + rejectedCount)) * 100).toFixed(2)
          : 0,
        avgResponseTimeHours: avgResponseTime[0]?.avg_hours 
          ? parseFloat(avgResponseTime[0].avg_hours) 
          : null
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/admin/refunds/lead/:purchaseId/approve
 * Odobri refund zahtjev za lead purchase
 */
r.post('/refunds/lead/:purchaseId/approve', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { purchaseId } = req.params;
    const { adminNotes } = req.body;

    const { processLeadRefund } = await import('../services/lead-service.js');
    
    const result = await processLeadRefund(purchaseId, req.user.id, true, adminNotes);

    res.json({
      success: true,
      message: 'Refund odobren i procesiran',
      purchase: result
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/admin/refunds/lead/:purchaseId/reject
 * Odbij refund zahtjev za lead purchase
 */
r.post('/refunds/lead/:purchaseId/reject', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { purchaseId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Razlog odbijanja je obavezan' });
    }

    const { processLeadRefund } = await import('../services/lead-service.js');
    
    const result = await processLeadRefund(purchaseId, req.user.id, false, reason);

    res.json({
      success: true,
      message: 'Refund zahtjev odbijen',
      purchase: result
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/admin/refunds/subscription/:userId/approve
 * Odobri refund za pretplatu (subscription refund već ima admin mogućnost, ali dodajemo eksplicitni endpoint)
 */
r.post('/refunds/subscription/:userId/approve', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason, refundCredits } = req.body;

    const { refundSubscription } = await import('../services/subscription-refund-service.js');
    
    const result = await refundSubscription(
      userId,
      reason || 'Approved by admin',
      refundCredits !== false // Default: true
    );

    res.json({
      success: true,
      message: 'Refund za pretplatu odobren i procesiran',
      ...result
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/verification-documents
 * Dohvati sve dokumente za verifikaciju (KYC, licence, osiguranje)
 * 
 * Query params:
 * - status: 'all' | 'pending' | 'verified' | 'rejected' (default: 'all')
 * - type: 'all' | 'kyc' | 'license' | 'insurance' (default: 'all')
 * - skip: number (default: 0)
 * - take: number (default: 50)
 */
r.get('/verification-documents', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { status = 'all', type = 'all', skip = 0, take = 50 } = req.query;
    
    const documents = [];
    
    // KYC dokumenati
    if (type === 'all' || type === 'kyc') {
      const where = {};
      
      if (status === 'pending') {
        where.kycDocumentUrl = { not: null };
        where.kycVerified = false;
      } else if (status === 'verified') {
        where.kycVerified = true;
      } else if (status === 'rejected') {
        // Rejected = ima dokument ali nije verificiran nakon određenog vremena
        where.kycDocumentUrl = { not: null };
        where.kycVerified = false;
        // Optional: dodati provjeru starijih od X dana
      }
      
      const kycProfiles = await prisma.providerProfile.findMany({
        where: {
          ...where,
          ...(status !== 'all' ? {} : { kycDocumentUrl: { not: null } })
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              taxId: true,
              legalStatus: {
                select: {
                  code: true,
                  name: true
                }
              }
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(take)
      });
      
      for (const profile of kycProfiles) {
        if (profile.kycDocumentUrl) {
          documents.push({
            id: `kyc-${profile.userId}`,
            type: 'kyc',
            userId: profile.userId,
            userName: profile.user.fullName || profile.user.email,
            userEmail: profile.user.email,
            taxId: profile.user.taxId,
            legalStatus: profile.user.legalStatus,
            documentUrl: profile.kycDocumentUrl,
            status: profile.kycVerified ? 'verified' : 'pending',
            verified: profile.kycVerified,
            verifiedAt: profile.kycVerifiedAt,
            extractedOIB: profile.kycExtractedOib,
            extractedName: profile.kycExtractedName,
            documentType: profile.kycDocumentType,
            notes: profile.kycVerificationNotes,
            createdAt: profile.createdAt,
            // Calculate days since upload if not verified
            daysPending: profile.kycVerified ? null : Math.floor((new Date() - new Date(profile.createdAt)) / (1000 * 60 * 60 * 24))
          });
        }
      }
    }
    
    // Licence dokumenati
    if (type === 'all' || type === 'license') {
      const where = {};
      
      if (status === 'pending') {
        where.isVerified = false;
        where.documentUrl = { not: null };
      } else if (status === 'verified') {
        where.isVerified = true;
      }
      
      const licenses = await prisma.providerLicense.findMany({
        where: {
          ...where,
          ...(status !== 'all' ? {} : { documentUrl: { not: null } })
        },
        include: {
          provider: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  taxId: true
                }
              }
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(take)
      });
      
      for (const license of licenses) {
        if (license.documentUrl) {
          documents.push({
            id: `license-${license.id}`,
            type: 'license',
            userId: license.provider.userId,
            userName: license.provider.user.fullName || license.provider.user.email,
            userEmail: license.provider.user.email,
            taxId: license.provider.user.taxId,
            documentUrl: license.documentUrl,
            status: license.isVerified ? 'verified' : 'pending',
            verified: license.isVerified,
            verifiedAt: license.verifiedAt,
            verifiedBy: license.verifiedBy,
            licenseType: license.licenseType,
            licenseNumber: license.licenseNumber,
            issuingAuthority: license.issuingAuthority,
            expiresAt: license.expiresAt,
            notes: license.notes,
            createdAt: license.createdAt,
            daysPending: license.isVerified ? null : Math.floor((new Date() - new Date(license.createdAt)) / (1000 * 60 * 60 * 24))
          });
        }
      }
    }
    
    // Safety Insurance dokumenati
    if (type === 'all' || type === 'insurance') {
      const where = {};
      
      if (status === 'pending') {
        where.safetyInsuranceUrl = { not: null };
        // Optional: dodati status field za osiguranje ako postoji
      }
      
      const insuranceProfiles = await prisma.providerProfile.findMany({
        where: {
          ...where,
          ...(status !== 'all' ? {} : { safetyInsuranceUrl: { not: null } })
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              taxId: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(take)
      });
      
      for (const profile of insuranceProfiles) {
        if (profile.safetyInsuranceUrl) {
          documents.push({
            id: `insurance-${profile.userId}`,
            type: 'insurance',
            userId: profile.userId,
            userName: profile.user.fullName || profile.user.email,
            userEmail: profile.user.email,
            taxId: profile.user.taxId,
            documentUrl: profile.safetyInsuranceUrl,
            status: 'pending', // Insurance ne može biti verified (možda bi trebalo dodati status)
            verified: false,
            uploadedAt: profile.safetyInsuranceUploadedAt,
            createdAt: profile.createdAt,
            daysPending: Math.floor((new Date() - (profile.safetyInsuranceUploadedAt || profile.createdAt)) / (1000 * 60 * 60 * 24))
          });
        }
      }
    }
    
    // Sort by creation date (newest first)
    documents.sort((a, b) => new Date(b.createdAt || b.uploadedAt) - new Date(a.createdAt || a.uploadedAt));
    
    // Apply status filter if needed (after combining)
    let filteredDocuments = documents;
    if (status === 'pending') {
      filteredDocuments = documents.filter(d => !d.verified && d.status === 'pending');
    } else if (status === 'verified') {
      filteredDocuments = documents.filter(d => d.verified && d.status === 'verified');
    }
    
    res.json({
      success: true,
      total: filteredDocuments.length,
      documents: filteredDocuments.slice(parseInt(skip), parseInt(skip) + parseInt(take)),
      summary: {
        total: documents.length,
        pending: documents.filter(d => !d.verified).length,
        verified: documents.filter(d => d.verified).length,
        byType: {
          kyc: documents.filter(d => d.type === 'kyc').length,
          license: documents.filter(d => d.type === 'license').length,
          insurance: documents.filter(d => d.type === 'insurance').length
        }
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/sms-logs
 * Pregled svih SMS-ova (admin)
 * Query params: phone, type, status, limit, offset, startDate, endDate
 */
r.get('/sms-logs', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { phone, type, status, limit = 50, offset = 0, startDate, endDate } = req.query;
    
    const where = {};
    
    if (phone) {
      where.phone = { contains: phone };
    }
    
    if (type) {
      where.type = type;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }
    
    const [logs, total] = await Promise.all([
      prisma.smsLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.smsLog.count({ where })
    ]);
    
    // Statistike
    const stats = await prisma.smsLog.groupBy({
      by: ['status', 'type'],
      where,
      _count: {
        id: true
      }
    });
    
    res.json({
      logs,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      stats: {
        byStatus: stats.reduce((acc, s) => {
          acc[s.status] = (acc[s.status] || 0) + s._count.id;
          return acc;
        }, {}),
        byType: stats.reduce((acc, s) => {
          acc[s.type] = (acc[s.type] || 0) + s._count.id;
          return acc;
        }, {})
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/admin/sms-logs/sync-from-twilio
 * Sinkroniziraj SMS-ove iz Twilio API-ja u bazu (admin)
 * Query params: limit (default 100), days (default 30)
 */
r.post('/sms-logs/sync-from-twilio', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    // Query params, ne body
    const { limit = 100, days = 30 } = req.query;
    
    // Provjeri Twilio konfiguraciju
    const accountSid = process.env.TEST_TWILIO_ACCOUNT_SID;
    const authToken = process.env.TEST_TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      console.error('❌ Twilio credentials missing:', {
        hasAccountSid: !!accountSid,
        hasAuthToken: !!authToken
      });
      return res.status(400).json({
        success: false,
        error: 'Twilio credentials not configured',
        message: 'TEST_TWILIO_ACCOUNT_SID and TEST_TWILIO_AUTH_TOKEN must be set in environment variables or AWS Secrets Manager',
        details: {
          hasAccountSid: !!accountSid,
          hasAuthToken: !!authToken
        }
      });
    }
    
    // Import Twilio client
    const twilio = (await import('twilio')).default;
    const client = twilio(accountSid, authToken);
    
    // Izračunaj datum (koliko dana unazad)
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));
    
    console.log(`🔄 Syncing SMS logs from Twilio (last ${days} days, limit: ${limit})...`);
    
    // Dohvati poruke iz Twilio
    let twilioMessages = [];
    let pageCount = 0;
    const maxPages = Math.ceil(parseInt(limit) / 50); // Twilio vraća 50 po stranici
    
    try {
      // Twilio messages.list() vraća iterator - konvertiraj u array
      const messages = await client.messages.list({
        dateSentAfter: dateLimit,
        limit: parseInt(limit)
      });
      
      // Konvertiraj iterator u array
      twilioMessages = [];
      for await (const message of messages) {
        twilioMessages.push(message);
      }
      
      console.log(`📱 Fetched ${twilioMessages.length} messages from Twilio`);
      
    } catch (twilioError) {
      console.error('❌ Twilio API error:', twilioError);
      console.error('❌ Twilio error details:', {
        message: twilioError.message,
        code: twilioError.code,
        status: twilioError.status,
        moreInfo: twilioError.moreInfo
      });
      
      const errorMessage = twilioError.message || '';
      const errorMessageLower = errorMessage.toLowerCase();
      
      // Provjeri da li je greška zbog ograničenog računa (suspicious activity)
      if (errorMessageLower.includes('restricted') ||
          errorMessageLower.includes('suspicious activity') ||
          errorMessageLower.includes('suspended') ||
          errorMessageLower.includes('limited your twilio account') ||
          errorMessageLower.includes('account recovery')) {
        return res.status(403).json({
          success: false,
          error: 'Twilio account restricted',
          message: 'Your Twilio account has been restricted due to suspicious activity. Please complete the account recovery process.',
          code: twilioError.code || 'ACCOUNT_RESTRICTED',
          details: {
            hasAccountSid: !!accountSid,
            hasAuthToken: !!authToken,
            accountSidPrefix: accountSid ? accountSid.substring(0, 5) + '...' : null,
            recoveryUrl: 'https://www.twilio.com/help/account-recovery'
          },
          actionRequired: {
            step1: 'Start Account Recovery Flow',
            step2: 'Visit: https://www.twilio.com/help/account-recovery',
            step3: 'Review and secure your account',
            step4: 'Change passwords and regenerate API keys after recovery',
            urgent: true,
            reason: 'Account restricted due to suspicious/unauthorized activity'
          }
        });
      }
      
      // Provjeri da li je greška zbog neaktivnog korisnika
      if (errorMessageLower.includes('inactive user') || 
          errorMessageLower.includes('unable to log in') ||
          errorMessageLower.includes('user is inactive')) {
        return res.status(403).json({
          success: false,
          error: 'Twilio account is inactive',
          message: 'Your Twilio account is inactive. Please contact Twilio support to activate your account.',
          code: twilioError.code || 'INACTIVE_USER',
          details: {
            hasAccountSid: !!accountSid,
            hasAuthToken: !!authToken,
            accountSidPrefix: accountSid ? accountSid.substring(0, 5) + '...' : null,
            supportUrl: 'https://support.twilio.com/'
          },
          actionRequired: {
            step1: 'Contact Twilio Support to activate your account',
            step2: 'Visit: https://support.twilio.com/',
            step3: 'Or email: help@twilio.com'
          }
        });
      }
      
      // Provjeri da li je greška zbog autentifikacije
      if (twilioError.code === 20003 || errorMessageLower.includes('authenticate')) {
        return res.status(401).json({
          success: false,
          error: 'Twilio authentication failed',
          message: 'Twilio credentials are invalid or expired. Please check TEST_TWILIO_ACCOUNT_SID and TEST_TWILIO_AUTH_TOKEN environment variables.',
          code: twilioError.code,
          details: {
            hasAccountSid: !!accountSid,
            hasAuthToken: !!authToken,
            accountSidPrefix: accountSid ? accountSid.substring(0, 5) + '...' : null
          }
        });
      }
      
      // Općenita Twilio greška
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch messages from Twilio',
        message: errorMessage || 'Unknown Twilio API error',
        code: twilioError.code || 'UNKNOWN',
        moreInfo: twilioError.moreInfo
      });
    }
    
    // Sinkroniziraj poruke u bazu
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const msg of twilioMessages) {
      try {
        // Provjeri postoji li već u bazi (po twilioSid)
        const existing = await prisma.smsLog.findFirst({
          where: { twilioSid: msg.sid }
        });
        
        if (existing) {
          skipped++;
          continue;
        }
        
        // Pokušaj pronaći korisnika po broju telefona
        let userId = null;
        try {
          const user = await prisma.user.findFirst({
            where: {
              phone: {
                contains: msg.to.replace(/\s/g, '') // Ukloni razmake
              }
            }
          });
          if (user) userId = user.id;
        } catch (userError) {
          // Ignoriraj greške pri traženju korisnika
        }
        
        // Mapiraj Twilio status na naš status
        let status = 'PENDING';
        if (msg.status === 'delivered' || msg.status === 'sent') {
          status = 'SUCCESS';
        } else if (msg.status === 'failed' || msg.status === 'undelivered') {
          status = 'FAILED';
        }
        
        // Pokušaj odrediti tip poruke iz sadržaja
        let type = 'OTHER';
        const messageBody = (msg.body || '').toLowerCase();
        if (messageBody.includes('kod') || messageBody.includes('verifikacij')) {
          type = 'VERIFICATION';
        } else if (messageBody.includes('lead') || messageBody.includes('ekskluzivni')) {
          type = 'LEAD_NOTIFICATION';
        } else if (messageBody.includes('refund') || messageBody.includes('vraćen')) {
          type = 'REFUND';
        } else if (messageBody.includes('urgent') || messageBody.includes('hitno')) {
          type = 'URGENT';
        }
        
        // Kreiraj zapis u bazi
        await prisma.smsLog.create({
          data: {
            phone: msg.to,
            message: msg.body || '',
            type,
            status,
            mode: 'twilio',
            twilioSid: msg.sid,
            error: msg.errorMessage || msg.errorCode ? `${msg.errorCode}: ${msg.errorMessage}` : null,
            userId,
            metadata: {
              direction: msg.direction,
              from: msg.from,
              dateSent: msg.dateSent,
              dateUpdated: msg.dateUpdated,
              price: msg.price,
              priceUnit: msg.priceUnit,
              uri: msg.uri
            },
            createdAt: msg.dateSent || msg.dateCreated
          }
        });
        
        created++;
        
      } catch (dbError) {
        console.error(`❌ Error saving SMS ${msg.sid}:`, dbError);
        errors++;
      }
    }
    
    res.json({
      success: true,
      synced: {
        total: twilioMessages.length,
        created,
        skipped,
        errors
      },
      message: `Sinkronizirano ${created} novih SMS-ova, ${skipped} već postoje, ${errors} grešaka`
    });
    
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/invoices
 * Pregled svih faktura (admin)
 * Query params: status, type, userId, limit, offset, startDate, endDate
 */
r.get('/invoices', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { status, type, userId, limit = 50, offset = 0, startDate, endDate, hasS3 } = req.query;
    
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (hasS3 === 'true') {
      where.pdfUrl = { not: null };
    } else if (hasS3 === 'false') {
      where.pdfUrl = null;
    }
    
    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) {
        where.issueDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.issueDate.lte = new Date(endDate);
      }
    }
    
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              companyName: true,
              taxId: true
            }
          },
          subscription: {
            select: {
              plan: true
            }
          },
          leadPurchase: {
            include: {
              job: {
                select: {
                  title: true,
                  city: true
                }
              }
            }
          }
        },
        orderBy: {
          issueDate: 'desc'
        },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.invoice.count({ where })
    ]);
    
    // Statistike
    const stats = await prisma.invoice.groupBy({
      by: ['status', 'type'],
      where,
      _count: {
        id: true
      },
      _sum: {
        totalAmount: true
      }
    });
    
    res.json({
      invoices,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      stats: {
        byStatus: stats.reduce((acc, s) => {
          acc[s.status] = {
            count: (acc[s.status]?.count || 0) + s._count.id,
            total: (acc[s.status]?.total || 0) + (s._sum.totalAmount || 0)
          };
          return acc;
        }, {}),
        byType: stats.reduce((acc, s) => {
          acc[s.type] = {
            count: (acc[s.type]?.count || 0) + s._count.id,
            total: (acc[s.type]?.total || 0) + (s._sum.totalAmount || 0)
          };
          return acc;
        }, {})
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/audit-logs
 * Pregled audit logova (admin)
 * Query params: action, actorId, messageId, roomId, jobId, limit, offset, startDate, endDate
 */
r.get('/audit-logs', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { action, actorId, messageId, roomId, jobId, limit = 50, offset = 0, startDate, endDate } = req.query;
    
    const where = {};
    
    if (action) {
      where.action = action;
    }
    
    if (actorId) {
      where.actorId = actorId;
    }
    
    if (messageId) {
      where.messageId = messageId;
    }
    
    if (roomId) {
      where.roomId = roomId;
    }
    
    if (jobId) {
      where.jobId = jobId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }
    
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true
            }
          },
          message: {
            select: {
              id: true,
              content: true
            }
          },
          room: {
            select: {
              id: true,
              name: true
            }
          },
          job: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.auditLog.count({ where })
    ]);
    
    // Statistike
    const stats = await prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: {
        id: true
      }
    });
    
    res.json({
      logs,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      stats: stats.reduce((acc, s) => {
        acc[s.action] = s._count.id;
        return acc;
      }, {})
    });
  } catch (e) {
    console.error('[ADMIN] Error in GET /audit-logs:', e);
    console.error('[ADMIN] Error details:', {
      message: e.message,
      code: e.code,
      meta: e.meta
    });
    next(e);
  }
});

/**
 * GET /api/admin/addon-event-logs
 * Pregled addon event logova (admin)
 * Query params: addonId, eventType, limit, offset, startDate, endDate
 */
r.get('/addon-event-logs', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { addonId, eventType, limit = 50, offset = 0, startDate, endDate } = req.query;
    
    const where = {};
    
    if (addonId) {
      where.addonId = addonId;
    }
    
    if (eventType) {
      where.eventType = eventType;
    }
    
    if (startDate || endDate) {
      where.occurredAt = {};
      if (startDate) {
        where.occurredAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.occurredAt.lte = new Date(endDate);
      }
    }
    
    const [logs, total] = await Promise.all([
      prisma.addonEventLog.findMany({
        where,
        include: {
          addon: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  fullName: true
                }
              }
            }
          }
        },
        orderBy: {
          occurredAt: 'desc'
        },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.addonEventLog.count({ where })
    ]);
    
    // Statistike
    const stats = await prisma.addonEventLog.groupBy({
      by: ['eventType'],
      where,
      _count: {
        id: true
      }
    });
    
    res.json({
      logs,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      stats: stats.reduce((acc, s) => {
        acc[s.eventType] = s._count.id;
        return acc;
      }, {})
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/api-request-logs
 * Pregled API request logova (admin)
 * Query params: method, path, statusCode, userId, limit, offset, startDate, endDate
 */
r.get('/api-request-logs', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { method, path, statusCode, userId, limit = 50, offset = 0, startDate, endDate } = req.query;
    
    const where = {};
    
    if (method) {
      where.method = method;
    }
    
    if (path) {
      where.path = { contains: path };
    }
    
    if (statusCode) {
      where.statusCode = parseInt(statusCode);
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }
    
    const [logs, total] = await Promise.all([
      prisma.apiRequestLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.apiRequestLog.count({ where })
    ]);
    
    // Statistike
    const [statusStats, methodStats, pathStats] = await Promise.all([
      prisma.apiRequestLog.groupBy({
        by: ['statusCode'],
        where,
        _count: { id: true },
        _avg: { responseTime: true }
      }),
      prisma.apiRequestLog.groupBy({
        by: ['method'],
        where,
        _count: { id: true },
        _avg: { responseTime: true }
      }),
      prisma.apiRequestLog.groupBy({
        by: ['path'],
        where,
        _count: { id: true },
        _avg: { responseTime: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })
    ]);
    
    res.json({
      logs,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      stats: {
        byStatus: statusStats.reduce((acc, s) => {
          acc[s.statusCode] = {
            count: s._count.id,
            avgResponseTime: s._avg.responseTime
          };
          return acc;
        }, {}),
        byMethod: methodStats.reduce((acc, s) => {
          acc[s.method] = {
            count: s._count.id,
            avgResponseTime: s._avg.responseTime
          };
          return acc;
        }, {}),
        topPaths: pathStats.map(s => ({
          path: s.path,
          count: s._count.id,
          avgResponseTime: s._avg.responseTime
        }))
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/error-logs
 * Pregled error logova (admin)
 * Query params: level, status, endpoint, userId, limit, offset, startDate, endDate
 */
r.get('/error-logs', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { level, status, endpoint, userId, limit = 50, offset = 0, startDate, endDate } = req.query;
    
    const where = {};
    
    if (level) {
      where.level = level;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (endpoint) {
      where.endpoint = { contains: endpoint };
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }
    
    const [logs, total] = await Promise.all([
      prisma.errorLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.errorLog.count({ where })
    ]);
    
    // Statistike
    const [levelStats, statusStats, endpointStats] = await Promise.all([
      prisma.errorLog.groupBy({
        by: ['level'],
        where,
        _count: { id: true }
      }),
      prisma.errorLog.groupBy({
        by: ['status'],
        where,
        _count: { id: true }
      }),
      prisma.errorLog.groupBy({
        by: ['endpoint'],
        where: { endpoint: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })
    ]);
    
    res.json({
      logs,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      stats: {
        byLevel: levelStats.reduce((acc, s) => {
          acc[s.level] = s._count.id;
          return acc;
        }, {}),
        byStatus: statusStats.reduce((acc, s) => {
          acc[s.status] = s._count.id;
          return acc;
        }, {}),
        topEndpoints: endpointStats.map(s => ({
          endpoint: s.endpoint,
          count: s._count.id
        }))
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * PATCH /api/admin/error-logs/:id
 * Ažuriraj status error loga (admin)
 */
r.patch('/error-logs/:id', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;
    
    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = userId;
      }
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    const errorLog = await prisma.errorLog.update({
      where: { id },
      data: updateData
    });
    
    res.json({ success: true, errorLog });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/sms-logs/stats
 * Statistike SMS-ova (admin)
 */
r.get('/sms-logs/stats', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }
    
    const [total, byStatus, byType, byMode, recent] = await Promise.all([
      prisma.smsLog.count({ where }),
      prisma.smsLog.groupBy({
        by: ['status'],
        where,
        _count: { id: true }
      }),
      prisma.smsLog.groupBy({
        by: ['type'],
        where,
        _count: { id: true }
      }),
      prisma.smsLog.groupBy({
        by: ['mode'],
        where,
        _count: { id: true }
      }),
      prisma.smsLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          createdAt: true,
          status: true,
          type: true
        }
      })
    ]);
    
    res.json({
      total,
      byStatus: byStatus.reduce((acc, s) => {
        acc[s.status] = s._count.id;
        return acc;
      }, {}),
      byType: byType.reduce((acc, t) => {
        acc[t.type] = t._count.id;
        return acc;
      }, {}),
      byMode: byMode.reduce((acc, m) => {
        acc[m.mode] = m._count.id;
        return acc;
      }, {}),
      recentActivity: recent
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/users-overview
 * Pregled svih korisnika s detaljnim informacijama o pravnom statusu, verifikaciji, licencama i pretplati
 */
r.get('/users-overview', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        legalStatus: true,
        providerProfile: {
          include: {
            legalStatus: true,
            licenses: true, // Sve licence (ne samo verificirane) za provjeru
            categories: {
              select: {
                id: true,
                name: true,
                requiresLicense: true
              }
            }
          }
        },
        clientVerification: true,
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformiraj podatke u format pogodan za prikaz
    const usersOverview = users.map(user => {
      const providerProfile = user.providerProfile;
      const subscription = user.subscriptions[0] || null;
      const clientVerification = user.clientVerification;
      
      // Odredi tip korisnika
      let userType = 'Korisnik';
      let userRoleDetail = '';
      if (user.role === 'PROVIDER') {
        userType = 'Pružatelj usluga';
        // Može biti direktor ako ima ProviderProfile s companyName
        if (providerProfile?.companyName) {
          userRoleDetail = 'Direktor/Predstavnik tvrtke';
        }
      } else if (user.role === 'ADMIN') {
        userType = 'Administrator';
      } else if (user.role === 'USER' && user.legalStatusId) {
        userType = 'Poslovni korisnik';
        if (user.companyName) {
          userRoleDetail = 'Predstavnik tvrtke';
        }
      }

      // Provjeri da li ima licence za kategorije koje zahtijevaju dopuštenje
      const categoriesRequiringLicense = providerProfile?.categories.filter(cat => cat.requiresLicense) || [];
      const hasRequiredLicenses = categoriesRequiringLicense.length > 0 
        ? categoriesRequiringLicense.every(cat => {
            // Provjeri da li postoji verificirana licenca za ovu kategoriju
            return providerProfile?.licenses.some(license => 
              license.licenseType && cat.name.includes(license.licenseType.split(' ')[0])
            );
          })
        : true; // Ako nema kategorija koje zahtijevaju licencu, smatra se da ima

      // Status verifikacije tvrtke
      const companyVerified = clientVerification?.companyVerified || false;
      const verificationStatus = user.role === 'PROVIDER' 
        ? (companyVerified ? 'Verificirano' : 'Nije verificirano')
        : (user.legalStatusId ? (companyVerified ? 'Verificirano' : 'Nije verificirano') : 'N/A');

      // Status licence
      const licenseStatus = providerProfile?.licenses.length > 0
        ? providerProfile.licenses.some(l => l.isVerified)
          ? (hasRequiredLicenses ? 'Sve licence OK' : 'Nedostaju licence')
          : 'Čeka verifikaciju'
        : (categoriesRequiringLicense.length > 0 ? 'Nema licence' : 'Nije potrebno');

      // Subscription status
      let subscriptionStatus = 'Nema pretplate';
      if (subscription) {
        if (subscription.plan === 'TRIAL') {
          subscriptionStatus = `TRIAL (istječe: ${new Date(subscription.expiresAt).toLocaleDateString('hr-HR')})`;
        } else {
          subscriptionStatus = `${subscription.plan} (${subscription.status})`;
          if (subscription.expiresAt) {
            subscriptionStatus += ` - istječe: ${new Date(subscription.expiresAt).toLocaleDateString('hr-HR')}`;
          }
        }
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        userType,
        userRoleDetail,
        legalStatus: user.legalStatus?.name || providerProfile?.legalStatus?.name || 'N/A',
        companyName: user.companyName || providerProfile?.companyName || 'N/A',
        taxId: user.taxId || providerProfile?.taxId || 'N/A',
        verificationStatus,
        companyVerified,
        licenseStatus,
        hasRequiredLicenses,
        licensesCount: providerProfile?.licenses.length || 0,
        verifiedLicensesCount: providerProfile?.licenses.filter(l => l.isVerified).length || 0,
        categoriesRequiringLicense: categoriesRequiringLicense.length,
        subscriptionStatus,
        subscriptionPlan: subscription?.plan || null,
        subscriptionExpiresAt: subscription?.expiresAt || null,
        createdAt: user.createdAt,
        isVerified: user.isVerified,
        phoneVerified: user.phoneVerified
      };
    });

    res.json({
      users: usersOverview,
      total: usersOverview.length,
      stats: {
        totalUsers: usersOverview.length,
        providers: usersOverview.filter(u => u.role === 'PROVIDER').length,
        businessUsers: usersOverview.filter(u => u.role === 'USER' && u.legalStatus).length,
        verified: usersOverview.filter(u => u.companyVerified).length,
        withLicenses: usersOverview.filter(u => u.licensesCount > 0).length,
        withSubscription: usersOverview.filter(u => u.subscriptionPlan).length,
        trial: usersOverview.filter(u => u.subscriptionPlan === 'TRIAL').length
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/migration-status
 * Provjeri status migracije - SVE razlike između Prisma schema i baze
 * Provjerava SVE tablice i SVA polja
 * Query params: table (optional) - provjeri samo određenu tablicu
 */
console.log('🔍 Registering /migration-status endpoint');
r.get('/migration-status', auth(true, ['ADMIN']), async (req, res, next) => {
  console.log('✅ /migration-status endpoint called');
  try {
    const { table } = req.query;
    
    // Dobij SVE tablice koje stvarno postoje u bazi
    const actualTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '_prisma%'
      ORDER BY table_name
    `;

    const actualTableNames = actualTables.map(t => t.table_name);

    // Filtrirati ako je specificirana tablica
    const tablesToCheck = table 
      ? (actualTableNames.includes(table) ? [table] : [])
      : actualTableNames;

    const tablesStatus = {};
    const tablesDetails = {};

    // Provjeri svaku tablicu
    for (const tableName of tablesToCheck) {
      // Provjeri da li tablica postoji
      const tableExists = actualTableNames.includes(tableName);
      tablesStatus[tableName] = {
        exists: tableExists,
        status: tableExists ? '✅ EXISTS' : '❌ MISSING'
      };

      if (!tableExists) {
        tablesDetails[tableName] = {
          exists: false,
          actualFields: [],
          fields: {}
        };
        continue;
      }

      // Dobij SVA polja iz baze za ovu tablicu
      // Escape table name to prevent SQL injection (table names come from database, not user input)
      const escapedTableName = tableName.replace(/"/g, '""');
      const actualFields = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type, is_nullable, column_default, character_maximum_length, numeric_precision, numeric_scale
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = '${escapedTableName}'
        ORDER BY ordinal_position
      `);

      const actualFieldNames = actualFields.map(f => f.column_name);

      // Provjeri svako polje detaljno
      const fieldsCheck = {};
      for (const field of actualFields) {
        fieldsCheck[field.column_name] = {
          exists: true,
          status: '✅ EXISTS',
          data_type: field.data_type,
          is_nullable: field.is_nullable === 'YES',
          default: field.column_default,
          max_length: field.character_maximum_length,
          precision: field.numeric_precision,
          scale: field.numeric_scale
        };
      }

      tablesDetails[tableName] = {
        exists: true,
        actualFields: actualFieldNames,
        fields: fieldsCheck,
        summary: {
          totalFields: actualFieldNames.length,
          fields: actualFieldNames
        }
      };
    }

    // Provjeri migration history za director fields
    let migrationRecorded = false;
    let migrationDetails = null;
    try {
      const migrations = await prisma.$queryRaw`
        SELECT migration_name, applied_steps_count, started_at, finished_at
        FROM _prisma_migrations
        WHERE migration_name = '20251123000000_add_director_fields'
        ORDER BY started_at DESC
        LIMIT 1
      `;
      
      if (migrations && migrations.length > 0) {
        migrationRecorded = true;
        migrationDetails = {
          migration_name: migrations[0].migration_name,
          applied_steps_count: migrations[0].applied_steps_count,
          started_at: migrations[0].started_at,
          finished_at: migrations[0].finished_at
        };
      }
    } catch (error) {
      // Ignore error
    }

    // Provjeri sve migracije
    let allMigrations = [];
    try {
      allMigrations = await prisma.$queryRaw`
        SELECT migration_name, applied_steps_count, started_at, finished_at
        FROM _prisma_migrations
        ORDER BY started_at DESC
        LIMIT 50
      `;
    } catch (error) {
      // Ignore error
    }

    // Izračunaj ukupne statistike
    const totalTables = tablesToCheck.length;
    const existingTables = Object.values(tablesStatus).filter(t => t.exists).length;
    const missingTables = totalTables - existingTables;
    
    let totalFields = 0;
    for (const [tableName, details] of Object.entries(tablesDetails)) {
      if (details.exists) {
        totalFields += details.summary.totalFields || 0;
      }
    }

    res.json({
      success: true,
      summary: {
        totalTables: totalTables,
        existingTables: existingTables,
        missingTables: missingTables,
        totalFields: totalFields
      },
      tables: tablesStatus,
      tablesDetails: tablesDetails,
      migrations: {
        directorFieldsMigration: {
          recorded: migrationRecorded,
          details: migrationDetails
        },
        recent: allMigrations.slice(0, 10).map(m => ({
          name: m.migration_name,
          applied_steps: m.applied_steps_count,
          started_at: m.started_at,
          finished_at: m.finished_at
        }))
      }
    });
  } catch (e) {
    next(e);
  }
});

// Note: Route registration check moved to end of file after all routes are registered
/**
 * GET /api/admin/database/tables
 * Dohvati listu svih tablica u bazi
 */
r.get('/database/tables', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '_prisma%'
      ORDER BY table_name
    `;
    
    res.json({ success: true, tables });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/database/table/:tableName
 * Dohvati podatke iz tablice s paginacijom
 */
r.get('/database/table/:tableName', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { tableName } = req.params;
    const { page = 1, limit = 50, orderBy, order = 'asc' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Provjeri da li tablica postoji
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = ${tableName}
      )
    `;
    
    if (!tableExists[0].exists) {
      return res.status(404).json({ error: 'Tablica nije pronađena' });
    }
    
    // Dohvati kolone
    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, tableName);
    
    // Dohvati podatke
    const orderByClause = orderBy 
      ? `ORDER BY "${orderBy}" ${order.toUpperCase()}`
      : '';
    
    const data = await prisma.$queryRawUnsafe(`
      SELECT * FROM "${tableName}"
      ${orderByClause}
      LIMIT $1 OFFSET $2
    `, parseInt(limit), offset);
    
    // Dohvati ukupan broj redaka
    const count = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total FROM "${tableName}"
    `);
    
    res.json({
      success: true,
      tableName,
      columns,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(count[0].total),
        totalPages: Math.ceil(parseInt(count[0].total) / parseInt(limit))
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/database/table/:tableName/structure
 * Dohvati strukturu tablice (kolone, tipovi, indeksi)
 */
r.get('/database/table/:tableName/structure', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { tableName } = req.params;
    
    // Dohvati kolone s detaljima
    const columns = await prisma.$queryRawUnsafe(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, tableName);
    
    // Dohvati indekse
    const indexes = await prisma.$queryRawUnsafe(`
      SELECT
        i.indexname,
        i.indexdef,
        a.attname as column_name
      FROM pg_indexes i
      JOIN pg_class c ON c.relname = i.tablename
      JOIN pg_index idx ON idx.indexrelid = (
        SELECT oid FROM pg_class WHERE relname = i.indexname
      )
      JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(idx.indkey)
      WHERE i.schemaname = 'public' AND i.tablename = $1
      ORDER BY i.indexname, a.attnum
    `, tableName);
    
    // Dohvati foreign keys
    const foreignKeys = await prisma.$queryRawUnsafe(`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1
    `, tableName);
    
    res.json({
      success: true,
      tableName,
      columns,
      indexes,
      foreignKeys
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/admin/database/query
 * Izvrši SQL query (samo SELECT za sigurnost)
 */
r.post('/database/query', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query je obavezan' });
    }
    
    // Provjeri da li je SELECT query (za sigurnost)
    const trimmedQuery = query.trim().toUpperCase();
    if (!trimmedQuery.startsWith('SELECT')) {
      return res.status(400).json({ error: 'Samo SELECT queries su dozvoljene' });
    }
    
    // Izvrši query
    const result = await prisma.$queryRawUnsafe(query);
    
    res.json({
      success: true,
      result,
      rowCount: Array.isArray(result) ? result.length : 0
    });
  } catch (e) {
    next(e);
  }
});

/**
 * PATCH /api/admin/database/table/:tableName/cell
 * Update pojedinačne ćelije
 */
r.patch('/database/table/:tableName/cell', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { tableName } = req.params;
    const { id, idColumn = 'id', column, value } = req.body;
    
    if (!id || !column || value === undefined) {
      return res.status(400).json({ error: 'id, column i value su obavezni' });
    }
    
    // Provjeri da li kolona postoji
    const columnExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = $1 
          AND column_name = $2
      )
    `, tableName, column);
    
    if (!columnExists[0].exists) {
      return res.status(400).json({ error: 'Kolona ne postoji' });
    }
    
    // Update ćelije
    const result = await prisma.$queryRawUnsafe(`
      UPDATE "${tableName}"
      SET "${column}" = $1
      WHERE "${idColumn}" = $2
      RETURNING *
    `, value, id);
    
    res.json({
      success: true,
      updated: result[0]
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/api-reference
 * Dohvati sve API endpointe s detaljima
 */
r.get('/api-reference', (req, res, next) => {
  console.log('[API-REF] ============================================');
  console.log('[API-REF] Endpoint /api-reference hit!');
  console.log('[API-REF] Method:', req.method);
  console.log('[API-REF] Path:', req.path);
  console.log('[API-REF] Original URL:', req.originalUrl);
  console.log('[API-REF] User:', req.user ? req.user.id : 'NO USER');
  next();
}, auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    console.log('[API-REF] Endpoint called - starting route parsing...');
    
    // Koristi Express app instance iz req.app
    const app = req.app;
    
    if (!app || !app._router || !app._router.stack) {
      console.error('[API-REF] ERROR: app._router.stack is not available!');
      return res.status(500).json({ error: 'Router stack not available' });
    }
    
    console.log(`[API-REF] Router stack has ${app._router.stack.length} layers`);
    
    // Funkcija za rekurzivno dohvaćanje ruta
    const getRoutes = (stack, basePath = '') => {
      const routes = [];
      
      if (!stack || !Array.isArray(stack)) {
        return routes;
      }
      
      for (const layer of stack) {
        // Preskoči middleware koji nisu rute (npr. error handleri, CORS, itd.)
        if (layer.name && ['query', 'expressInit', 'jsonParser', 'urlencodedParser', 'cors'].includes(layer.name)) {
          continue;
        }
        
        if (layer.route) {
          // Direktna ruta
          const path = basePath + layer.route.path;
          
          // Preskoči rute koje su vjerojatno middleware ili error handleri
          // (path je samo "/" ili prazan, i nema smislenog handlera)
          if ((path === '/' || path === '' || path === basePath) && basePath === '') {
            // Provjeri da li je to stvarno ruta ili samo middleware
            const handler = layer.route.stack[0];
            const handlerName = handler?.name || '';
            // Ako je anonymous i path je samo "/", vjerojatno je middleware
            if (handlerName === '' || handlerName === 'anonymous') {
              continue;
            }
          }
          
          const methods = Object.keys(layer.route.methods).filter(m => m !== '_all' && layer.route.methods[m]);
          
          // Preskoči ako nema metoda
          if (methods.length === 0) {
            continue;
          }
          
          // Izvuci parametre iz path-a (npr. :id, :licenseId)
          const params = [];
          const paramMatches = path.matchAll(/:(\w+)/g);
          for (const match of paramMatches) {
            params.push(match[1]);
          }
          
          methods.forEach(method => {
            const handler = layer.route.stack[0];
            const fullPath = path.startsWith('/api') ? path : (path.startsWith('/') ? `/api${path}` : `/api/${path}`);
            
            // Preskoči ako je path samo "/api/" bez dodatnog path-a
            if (fullPath === '/api/' || fullPath === '/api') {
              return; // continue u forEach-u
            }
            
            routes.push({
              method: method.toUpperCase(),
              path: path,
              fullPath: fullPath,
              handler: handler?.name || 'anonymous',
              middleware: handler?.name || null,
              params: params.length > 0 ? params : null
            });
          });
        } else if (layer.name === 'router' && layer.handle?.stack) {
          // Nested router - pokušaj izvući path iz regexp-a
          let routerPath = '';
          if (layer.regexp) {
            const regexStr = layer.regexp.toString();
            // Poboljšana ekstrakcija path-a iz regexp-a
            // Express regexp format: /^\/api\/exclusive\/leads(?:\/(?=$))?$/i
            // Ili: /^\/api\/chatbot(?:\/(?=$))?$/i
            // Prvo pokušaj izvući kompletan path (uključujući /api/)
            let match = regexStr.match(/\^\\?\/?api\\?\/?([^\\$]*)/);
            if (match && match[1]) {
              routerPath = '/' + match[1]
                .replace(/\\\//g, '/')
                .replace(/\\\./g, '.')
                .replace(/\\\?/g, '?')
                .replace(/\(\\?\/\?\(\?\$\)\)\?/g, '') // Remove optional trailing slash
                .replace(/\(\?\$\)/g, ''); // Remove end anchor
            } else {
              // Ako nismo uspjeli, pokušaj bez /api/ prefixa
              match = regexStr.match(/\^\\?\/?([^\\$]*)/);
              if (match && match[1]) {
                routerPath = '/' + match[1]
                  .replace(/\\\//g, '/')
                  .replace(/\\\./g, '.')
                  .replace(/\\\?/g, '?')
                  .replace(/\(\\?\/\?\(\?\$\)\)\?/g, '') // Remove optional trailing slash
                  .replace(/\(\?\$\)/g, ''); // Remove end anchor
                
                // Ako routerPath još uvijek sadrži /api/, ukloni ga (jer će se dodati kasnije)
                if (routerPath.startsWith('/api/')) {
                  routerPath = routerPath.substring(4); // Remove '/api'
                }
              }
            }
          }
          
          // Ako nismo uspjeli izvući iz regexp-a, pokušaj iz route path-a
          if (!routerPath && layer.route && layer.route.path) {
            routerPath = layer.route.path;
          }
          
          // Pokušaj izvući iz keys (Express često čuva mount path u keys)
          if (!routerPath && layer.keys && layer.keys.length > 0) {
            // Keys mogu sadržavati informacije o path-u
            for (const key of layer.keys) {
              if (key.name && key.name !== '0') {
                routerPath = '/' + key.name;
                break;
              }
            }
          }
          
          // Ako još uvijek nema path-a, pokušaj direktno iz regexp-a s alternativnim pristupom
          if (!routerPath && layer.regexp) {
            const regexStr = layer.regexp.toString();
            // Pokušaj izvući path iz kompleksnijeg regexp-a
            // Format: /^\/api\/(chatbot|wizard|director|matchmaking)(?:\/(?=$))?$/i
            const complexMatch = regexStr.match(/\/api\/(\w+)/);
            if (complexMatch && complexMatch[1]) {
              routerPath = '/' + complexMatch[1];
            }
          }
          
          // Ako još uvijek nema path-a, pokušaj iz app mount path-a
          // (ovo je fallback - Express često ne eksponira mount path direktno)
          const nestedBasePath = basePath + routerPath;
          
          // Debug: loguj nested routere koji se parsiraju
          console.log(`[API-REF] Parsing nested router: basePath="${basePath}", routerPath="${routerPath}", nestedBasePath="${nestedBasePath}", regexp="${layer.regexp?.toString()?.substring(0, 100)}"`);
          
          const nestedRoutes = getRoutes(layer.handle.stack, nestedBasePath);
          if (nestedRoutes.length > 0) {
            console.log(`[API-REF] Found ${nestedRoutes.length} routes in nested router at "${nestedBasePath}":`, nestedRoutes.map(r => `${r.method} ${r.fullPath}`).join(', '));
          }
          routes.push(...nestedRoutes);
        }
      }
      
      return routes;
    };
    
    // Dohvati sve rute iz Express app instance
    const allRoutes = getRoutes(app._router?.stack || []);
    
    // Debug: loguj ukupan broj parsiranih ruta
    console.log(`[API-REF] Total routes parsed: ${allRoutes.length}`);
    
    // Debug: loguj sve unique base paths
    const uniqueBasePaths = new Set();
    allRoutes.forEach(route => {
      const pathWithoutApi = route.fullPath.replace(/^\/api\/?/, '');
      const pathParts = pathWithoutApi.split('/').filter(p => p);
      const basePath = pathParts[0] || 'root';
      uniqueBasePaths.add(basePath);
    });
    console.log(`[API-REF] Unique base paths: ${Array.from(uniqueBasePaths).sort().join(', ')}`);
    
    // Debug: provjeri da li se određene rute parsiraju
    const expectedRoutes = ['chatbot', 'wizard', 'director', 'matchmaking', 'exclusive', 'reviews', 'payments', 'subscriptions'];
    expectedRoutes.forEach(expectedRoute => {
      const found = allRoutes.some(route => route.fullPath.includes(`/api/${expectedRoute}`));
      if (!found) {
        console.log(`[API-REF] WARNING: Expected route "/api/${expectedRoute}" not found in parsed routes!`);
      } else {
        const count = allRoutes.filter(route => route.fullPath.includes(`/api/${expectedRoute}`)).length;
        console.log(`[API-REF] Found ${count} routes for "/api/${expectedRoute}"`);
      }
    });
    
    // Funkcija za određivanje sigurnosnih zahtjeva na temelju path-a i metode
    const getSecurityInfo = (fullPath, method) => {
      const security = {
        authRequired: false,
        roles: [],
        additionalChecks: [],
        businessRules: []
      };
      
      // Admin rute - zahtijevaju ADMIN role
      if (fullPath.startsWith('/api/admin')) {
        security.authRequired = true;
        security.roles = ['ADMIN'];
        security.additionalChecks.push('Samo ADMIN korisnici');
      }
      // Auth rute - javne ili zahtijevaju autentikaciju
      else if (fullPath.startsWith('/api/auth')) {
        if (fullPath.includes('/me') || fullPath.includes('/logout')) {
          security.authRequired = true;
          security.roles = ['USER', 'PROVIDER', 'ADMIN'];
        } else if (fullPath.includes('/register')) {
          security.authRequired = false;
          security.businessRules.push('PROVIDER registracija: obavezan pravni status (ne može biti INDIVIDUAL)');
          security.businessRules.push('PROVIDER registracija: obavezan OIB');
          security.businessRules.push('Email mora biti jedinstven');
        } else {
          security.authRequired = false; // Login je javan
        }
      }
      // Invoices - zahtijevaju autentikaciju i ownership check
      else if (fullPath.startsWith('/api/invoices')) {
        security.authRequired = true;
        security.roles = ['PROVIDER', 'ADMIN', 'USER'];
        security.additionalChecks.push('Ownership check: korisnik može pristupiti samo svojim fakturima (osim ADMIN)');
      }
      // Chat - zahtijevaju autentikaciju i ownership/participant check
      else if (fullPath.startsWith('/api/chat')) {
        security.authRequired = true;
        security.roles = ['USER', 'PROVIDER', 'ADMIN'];
        security.additionalChecks.push('Participant check: korisnik mora biti sudionik chat sobe');
        if (fullPath.includes('/rooms') && method === 'POST') {
          security.businessRules.push('Posao mora imati ACCEPTED offer prije kreiranja chat sobe');
          security.businessRules.push('Korisnik mora biti vlasnik posla ili provider s prihvaćenom ponudom');
        }
        if (fullPath.includes('/internal')) {
          security.additionalChecks.push('INTERNAL chat: samo PROVIDER role, direktor za kreiranje grupnih soba');
        }
      }
      // Jobs - zahtijevaju autentikaciju, ownership check za edit/delete
      else if (fullPath.startsWith('/api/jobs')) {
        security.authRequired = true;
        security.roles = ['USER', 'PROVIDER', 'ADMIN'];
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
          security.additionalChecks.push('Ownership check: samo vlasnik posla može editirati/brisati');
        }
        if (fullPath.includes('/accept') && method === 'PATCH') {
          security.businessRules.push('Posao mora biti OPEN status');
          security.businessRules.push('Ne možeš prihvatiti ponudu od iste tvrtke (isti OIB/email)');
        }
        if (fullPath.includes('/complete') && method === 'PATCH') {
          security.businessRules.push('Posao mora biti IN_PROGRESS status');
          security.businessRules.push('Korisnik mora biti vlasnik posla ili provider s prihvaćenom ponudom');
        }
      }
      // Offers - zahtijevaju autentikaciju, ownership check
      else if (fullPath.startsWith('/api/offers')) {
        security.authRequired = true;
        security.roles = ['PROVIDER', 'ADMIN'];
        if (method === 'POST') {
          security.businessRules.push('Posao mora biti OPEN status');
          security.businessRules.push('Ne možeš poslati ponudu na vlastiti posao (isti userId, taxId ili email)');
          security.businessRules.push('Zahtijeva kredite (osim PRO plan koji ima unlimited)');
        }
        if (fullPath.includes('/accept') && method === 'PATCH') {
          security.additionalChecks.push('Ownership check: samo vlasnik posla može prihvatiti ponudu');
          security.businessRules.push('Ne možeš prihvatiti ponudu od iste tvrtke (isti OIB/email)');
        }
        if (['PUT', 'PATCH', 'DELETE'].includes(method)) {
          security.additionalChecks.push('Ownership check: samo vlasnik ponude može editirati');
        }
      }
      // Providers - zahtijevaju autentikaciju, ownership check
      else if (fullPath.startsWith('/api/providers')) {
        security.authRequired = true;
        security.roles = ['PROVIDER', 'ADMIN'];
        if (['PUT', 'PATCH', 'DELETE'].includes(method)) {
          security.additionalChecks.push('Ownership check: samo vlasnik profila može editirati');
        }
      }
      // Subscriptions - zahtijevaju autentikaciju
      else if (fullPath.startsWith('/api/subscriptions')) {
        security.authRequired = true;
        security.roles = ['USER', 'PROVIDER', 'ADMIN'];
        security.additionalChecks.push('Ownership check: korisnik može pristupiti samo svojoj pretplati');
      }
      // Payments - zahtijevaju autentikaciju
      else if (fullPath.startsWith('/api/payments')) {
        security.authRequired = true;
        security.roles = ['USER', 'PROVIDER', 'ADMIN'];
        security.additionalChecks.push('Ownership check: korisnik može pristupiti samo svojim transakcijama');
      }
      // KYC - zahtijevaju autentikaciju i PROVIDER role
      else if (fullPath.startsWith('/api/kyc')) {
        security.authRequired = true;
        security.roles = ['PROVIDER', 'ADMIN'];
        security.additionalChecks.push('Samo PROVIDER role može uploadati KYC dokumente');
      }
      // Whitelabel - zahtijevaju autentikaciju, PROVIDER role i PRO plan
      else if (fullPath.startsWith('/api/whitelabel')) {
        security.authRequired = true;
        security.roles = ['PROVIDER'];
        security.additionalChecks.push('Subscription check: zahtijeva PRO plan');
      }
      // Exclusive leads - zahtijevaju autentikaciju i PROVIDER role
      else if (fullPath.startsWith('/api/exclusive')) {
        security.authRequired = true;
        security.roles = ['PROVIDER', 'ADMIN'];
        security.additionalChecks.push('Subscription check: može zahtijevati određeni subscription plan');
      }
      // Lead queue - zahtijevaju autentikaciju i PROVIDER role
      else if (fullPath.startsWith('/api/lead-queue') || fullPath.includes('/my-offers') || fullPath.includes('/my-queue')) {
        security.authRequired = true;
        security.roles = ['PROVIDER', 'ADMIN'];
        if (fullPath.includes('/my-offers') || fullPath === '/api/my-offers') {
          security.businessRules.push('Vraća samo aktivne ponude (status: OFFERED, expiresAt > now)');
          security.businessRules.push('Samo PROVIDER može vidjeti svoje ponude');
        }
        if (fullPath.includes('/my-queue') || fullPath === '/api/my-queue') {
          security.businessRules.push('Vraća sve queue stavke za providera (povijest)');
          security.businessRules.push('Samo PROVIDER može vidjeti svoju queue povijest');
        }
        if (fullPath.includes('/respond') && method === 'POST') {
          security.businessRules.push('Ponuda mora biti aktivna (status: OFFERED, expiresAt > now)');
          security.businessRules.push('Samo provider koji je dobio ponudu može odgovoriti');
        }
      }
      // Reviews - zahtijevaju autentikaciju
      else if (fullPath.startsWith('/api/reviews')) {
        security.authRequired = true;
        security.roles = ['USER', 'PROVIDER', 'ADMIN'];
        if (method === 'POST') {
          security.businessRules.push('Posao mora biti COMPLETED status');
          security.businessRules.push('Ne možeš ocjenjivati ako već imaš recenziju za taj posao');
          security.businessRules.push('Korisnici moraju biti povezani preko job-a (vlasnik posla ↔ assigned provider)');
          security.businessRules.push('AI automatska moderacija sadržaja (komentar i ocjena)');
        }
        if (fullPath.includes('/reply') && method === 'POST') {
          security.businessRules.push('Možeš odgovoriti samo jednom na recenziju');
          security.businessRules.push('Samo toUserId može odgovoriti na recenziju');
          security.businessRules.push('Recenzija mora biti objavljena (isPublished: true)');
        }
        if (fullPath.includes('/user/') && method === 'GET') {
          security.businessRules.push('Vraća samo objavljene i odobrene review-e (osim admin/vlasnik)');
        }
      }
      // Exclusive leads - zahtijevaju autentikaciju i PROVIDER role
      else if (fullPath.startsWith('/api/exclusive')) {
        security.authRequired = true;
        security.roles = ['PROVIDER', 'ADMIN'];
        security.additionalChecks.push('Subscription check: može zahtijevati određeni subscription plan');
        if (fullPath.includes('/purchase') && method === 'POST') {
          security.businessRules.push('Lead mora biti AVAILABLE (leadStatus: AVAILABLE, assignedProviderId: null)');
          security.businessRules.push('Zahtijeva kredite ili Stripe Payment Intent (osim PRO plan koji ima unlimited)');
          security.businessRules.push('Ne možeš kupiti lead koji si već kupio');
        }
        if (fullPath.includes('/create-payment-intent') && method === 'POST') {
          security.businessRules.push('Lead mora biti AVAILABLE');
          security.businessRules.push('Stripe mora biti konfiguriran');
        }
        if (fullPath.includes('/contacted') && method === 'POST') {
          security.businessRules.push('Samo provider koji je kupio lead može označiti kao contacted');
        }
        if (fullPath.includes('/converted') && method === 'POST') {
          security.businessRules.push('Samo provider koji je kupio lead može označiti kao converted');
        }
        if (fullPath.includes('/refund') && method === 'POST') {
          security.businessRules.push('Samo provider koji je kupio lead može zatražiti refund');
          security.businessRules.push('Refund zahtijeva admin odobrenje');
        }
      }
      // Payments - dodatna poslovna ograničenja
      else if (fullPath.startsWith('/api/payments')) {
        security.authRequired = true;
        security.roles = ['USER', 'PROVIDER', 'ADMIN'];
        security.additionalChecks.push('Ownership check: korisnik može pristupiti samo svojim transakcijama');
        if (fullPath.includes('/create-checkout') && method === 'POST') {
          security.businessRules.push('Stripe mora biti konfiguriran');
          security.businessRules.push('Novi korisnici dobivaju 20% popust');
          security.businessRules.push('TRIAL korisnici dobivaju 20% popust pri upgrade-u');
          security.businessRules.push('Prorated billing za upgrade/downgrade postojećih pretplata');
        }
        if (fullPath.includes('/webhook') && method === 'POST') {
          security.authRequired = false; // Webhook ne zahtijeva auth (Stripe signature verification)
          security.businessRules.push('Stripe webhook signature verification');
        }
      }
      // Subscriptions - dodatna poslovna ograničenja
      else if (fullPath.startsWith('/api/subscriptions')) {
        security.authRequired = true;
        security.roles = ['USER', 'PROVIDER', 'ADMIN'];
        security.additionalChecks.push('Ownership check: korisnik može pristupiti samo svojoj pretplati');
        if (fullPath.includes('/subscribe') && method === 'POST') {
          security.businessRules.push('Zahtijeva Stripe Payment Intent ili postojeće kredite');
          security.businessRules.push('Automatski downgrade na BASIC nakon isteka pretplate');
        }
        if (fullPath.includes('/cancel') && method === 'POST') {
          security.businessRules.push('Pretplata se ne može otkazati prije isteka (samo se neće obnoviti)');
        }
      }
      // Jobs - dodatna poslovna ograničenja
      else if (fullPath.startsWith('/api/jobs')) {
        security.authRequired = true;
        security.roles = ['USER', 'PROVIDER', 'ADMIN'];
        if (method === 'POST') {
          security.businessRules.push('Kategorija mora postojati i biti aktivna');
          security.businessRules.push('Geolokacija se automatski generira iz city-a (ako nije specificirana)');
        }
        if (fullPath.includes('/for-provider') && method === 'GET') {
          security.businessRules.push('Vraća samo poslove u kategorijama providera (uključujući subkategorije)');
          security.businessRules.push('Filtrira po udaljenosti ako su specificirane koordinate');
        }
      }
      // Providers - dodatna poslovna ograničenja
      else if (fullPath.startsWith('/api/providers')) {
        security.authRequired = true;
        security.roles = ['PROVIDER', 'ADMIN'];
        if (method === 'POST') {
          security.businessRules.push('Korisnik mora imati PROVIDER role');
          security.businessRules.push('Pravni status mora postojati i biti aktivan');
        }
        if (['PUT', 'PATCH'].includes(method)) {
          security.additionalChecks.push('Ownership check: samo vlasnik profila može editirati');
          security.businessRules.push('Kategorije moraju postojati i biti aktivne');
        }
      }
      // Users - dodatna poslovna ograničenja
      else if (fullPath.startsWith('/api/users')) {
        security.authRequired = true;
        security.roles = ['USER', 'PROVIDER', 'ADMIN'];
        if (fullPath.includes('/me') && method === 'PUT') {
          security.businessRules.push('Korisnik može ažurirati samo svoje podatke');
        }
      }
      // Chat - dodatna poslovna ograničenja
      else if (fullPath.startsWith('/api/chat')) {
        security.authRequired = true;
        security.roles = ['USER', 'PROVIDER', 'ADMIN'];
        security.additionalChecks.push('Participant check: korisnik mora biti sudionik chat sobe');
        if (fullPath.includes('/rooms') && method === 'POST') {
          security.businessRules.push('Posao mora imati ACCEPTED offer prije kreiranja chat sobe');
          security.businessRules.push('Korisnik mora biti vlasnik posla ili provider s prihvaćenom ponudom');
          security.businessRules.push('Provjera da soba već ne postoji');
        }
        if (fullPath.includes('/messages') && method === 'POST') {
          security.businessRules.push('Korisnik mora biti sudionik chat sobe');
          security.businessRules.push('Chat soba ne smije biti zaključana');
        }
        if (fullPath.includes('/read') && method === 'POST') {
          security.businessRules.push('Ne možeš označiti svoju poruku kao pročitanu');
        }
      }
      // KYC - dodatna poslovna ograničenja
      else if (fullPath.startsWith('/api/kyc')) {
        security.authRequired = true;
        security.roles = ['PROVIDER', 'ADMIN'];
        security.additionalChecks.push('Samo PROVIDER role može uploadati KYC dokumente');
        if (fullPath.includes('/upload-document') && method === 'POST') {
          security.businessRules.push('Dokument mora biti PDF, JPG ili PNG format');
          security.businessRules.push('Automatska verifikacija OIB-a i naziva tvrtke (Sudski registar, Obrtni registar)');
          security.businessRules.push('Public consent je obavezan');
        }
      }
      // Support - dodatna poslovna ograničenja
      else if (fullPath.startsWith('/api/support')) {
        security.authRequired = true;
        security.roles = ['USER', 'PROVIDER', 'ADMIN'];
        if (method === 'POST') {
          security.businessRules.push('Korisnik može kreirati ticket samo za sebe');
        }
        if (fullPath.includes('/reply') && method === 'POST') {
          security.businessRules.push('Samo admin ili vlasnik ticket-a može odgovoriti');
        }
      }
      // Notifications - dodatna poslovna ograničenja
      else if (fullPath.startsWith('/api/notifications')) {
        security.authRequired = true;
        security.roles = ['USER', 'PROVIDER', 'ADMIN'];
        security.additionalChecks.push('Ownership check: korisnik može pristupiti samo svojim notifikacijama');
        if (fullPath.includes('/read') && method === 'POST') {
          security.businessRules.push('Korisnik može označiti samo svoje notifikacije kao pročitane');
        }
      }
      // Wizard - dodatna poslovna ograničenja
      else if (fullPath.startsWith('/api/wizard')) {
        security.authRequired = true;
        security.roles = ['PROVIDER'];
        if (fullPath.includes('/complete') && method === 'POST') {
          security.businessRules.push('Korisnik mora odabrati barem jednu kategoriju');
          security.businessRules.push('Korisnik mora odabrati barem jednu regiju');
        }
      }
      // Saved Searches - zahtijevaju autentikaciju
      else if (fullPath.startsWith('/api/saved-searches')) {
        security.authRequired = true;
        security.roles = ['USER', 'PROVIDER', 'ADMIN'];
        security.additionalChecks.push('Ownership check: korisnik može pristupiti samo svojim spremljenim pretragama');
        if (method === 'POST') {
          security.businessRules.push('Naziv pretrage je obavezan');
          security.businessRules.push('Filteri se spremaju kao JSON objekt');
        }
        if (['PUT', 'DELETE'].includes(method)) {
          security.businessRules.push('Samo vlasnik pretrage može ažurirati ili obrisati');
        }
        if (fullPath.includes('/use') && method === 'POST') {
          security.businessRules.push('Ažurira lastUsedAt timestamp');
        }
      }
      // Job Alerts - zahtijevaju autentikaciju
      else if (fullPath.startsWith('/api/job-alerts')) {
        security.authRequired = true;
        security.roles = ['USER', 'PROVIDER', 'ADMIN'];
        security.additionalChecks.push('Ownership check: korisnik može pristupiti samo svojim job alertovima');
        if (method === 'POST') {
          security.businessRules.push('Naziv alerta je obavezan');
          security.businessRules.push('Frekvencija mora biti DAILY, WEEKLY ili INSTANT (default: DAILY)');
          security.businessRules.push('Filteri se spremaju kao JSON objekt');
        }
        if (['PUT', 'DELETE'].includes(method)) {
          security.businessRules.push('Samo vlasnik alerta može ažurirati ili obrisati');
        }
        security.businessRules.push('Background job provjerava nove poslove i šalje email notifikacije prema frekvenciji');
      }
      // Chatbot - dodatna poslovna ograničenja
      else if (fullPath.startsWith('/api/chatbot')) {
        security.authRequired = true;
        security.roles = ['PROVIDER'];
        if (fullPath.includes('/advance') && method === 'POST') {
          security.businessRules.push('Chatbot session mora biti aktivan');
          security.businessRules.push('Korisnik mora biti na određenom koraku');
        }
      }
      // Public rute - javne
      else if (fullPath.startsWith('/api/public')) {
        security.authRequired = false;
      }
      // Ostale rute - pretpostavljamo da zahtijevaju autentikaciju
      else {
        security.authRequired = true;
        security.roles = ['USER', 'PROVIDER', 'ADMIN'];
      }
      
      return security;
    };
    
    // Funkcija za generiranje detaljnog opisa API endpointa
    const getEndpointDescription = (fullPath, method, handler) => {
      const pathLower = fullPath.toLowerCase();
      const methodUpper = method.toUpperCase();
      
      // Admin endpoints
      if (pathLower.startsWith('/api/admin')) {
        if (pathLower.includes('/api-reference')) {
          return 'Dohvaća kompletan popis svih API endpointa s detaljima o sigurnosti, parametrima i handler-ima. Koristi se za generiranje API dokumentacije u Admin panelu.';
        }
        if (pathLower.includes('/cleanup/non-master')) {
          if (methodUpper === 'GET' && pathLower.includes('/preview')) {
            return 'Vraća pregled broja redaka u svakoj tablici koji će biti obrisani prije pokretanja čišćenja. Omogućava adminu da vidi koliko će podataka biti obrisano.';
          }
          if (methodUpper === 'POST') {
            return 'Briše sve transakcijske podatke (chat, poslovi, ponude, leadovi, pretplate, fakture, itd.) osim master podataka (kategorije, planovi, ADMIN korisnik, testiranje). Nepovratna akcija.';
          }
        }
        if (pathLower.includes('/payments')) {
          return 'Upravljanje plaćanjima i transakcijama. Omogućava pregled svih plaćanja, refundova i billing informacija.';
        }
        if (pathLower.includes('/provider-approvals')) {
          return 'Upravljanje odobravanjem provider profila. Omogućava adminu da pregleda i odobri/odbije zahtjeve za provider profil.';
        }
        if (pathLower.includes('/kyc-metrics')) {
          return 'Pregled KYC (Know Your Customer) metrika i statistika. Prikazuje broj verifikacija, status verifikacija i trendove.';
        }
        if (pathLower.includes('/verification-documents')) {
          return 'Upravljanje dokumentima za verifikaciju. Omogućava pregled i odobravanje/odbijanje verifikacijskih dokumenata.';
        }
        if (pathLower.includes('/platform-stats')) {
          return 'Statistike platforme. Prikazuje ukupan broj korisnika, poslova, ponuda, pretplata i drugih metrika.';
        }
        if (pathLower.includes('/moderation')) {
          return 'Moderacija sadržaja. Omogućava pregled i moderaciju recenzija, poruka i drugog korisničkog sadržaja.';
        }
        if (pathLower.includes('/sms-logs')) {
          return 'Pregled SMS logova. Prikazuje sve poslane SMS poruke, njihov status i rezultate.';
        }
        if (pathLower.includes('/invoices')) {
          return 'Upravljanje fakturama. Omogućava pregled, kreiranje i upravljanje fakturama za korisnike.';
        }
        if (pathLower.includes('/users-overview')) {
          return 'Pregled korisnika. Prikazuje sve korisnike s detaljima o njihovim profilima, pretplatama i aktivnostima.';
        }
        if (pathLower.includes('/testing')) {
          return 'Testiranje funkcionalnosti. Omogućava pokretanje testova i provjeru funkcionalnosti sistema.';
        }
        if (pathLower.includes('/database')) {
          return 'Database editor. Omogućava direktan pristup i uređivanje podataka u bazi podataka.';
        }
        if (pathLower.includes('/user-types')) {
          return 'Pregled tipova korisnika. Prikazuje statistike o različitim tipovima korisnika (privatni, poslovni, pružatelji, pretplate).';
        }
        if (pathLower.includes('/reports/send-monthly-reports')) {
          return 'Slanje mjesečnih izvještaja svim aktivnim korisnicima. Pokreće se ručno ili automatski 1. u mjesecu.';
        }
        if (pathLower.includes('/audit-logs')) {
          return 'Pregled audit logova za chat akcije, otkrivanje kontakata i druge akcije. Omogućava filtriranje po akciji, korisniku, poruci, sobi, poslu i datumu. Vraća statistike po tipovima akcija.';
        }
        if (pathLower.includes('/api-request-logs')) {
          return 'Pregled automatski logiranih API zahtjeva. Prikazuje metodu, path, status kod, response time, korisnika i IP adresu. Omogućava filtriranje i prikaz statistika po status kodovima, metodama i top path-ovima.';
        }
        if (pathLower.includes('/error-logs')) {
          if (methodUpper === 'GET') {
            return 'Pregled centralizirano logiranih grešaka. Prikazuje error poruke, stack trace, kontekst i status (NEW, IN_PROGRESS, RESOLVED, IGNORED). Omogućava filtriranje po levelu, statusu, endpointu i korisniku.';
          }
          if (methodUpper === 'PATCH') {
            return 'Ažuriranje statusa error loga. Omogućava promjenu statusa (NEW, IN_PROGRESS, RESOLVED, IGNORED) i dodavanje napomena. Automatski bilježi tko je riješio grešku i kada.';
          }
        }
        if (pathLower.includes('/addon-event-logs')) {
          return 'Pregled event logova za addon pretplate. Prikazuje sve događaje vezane uz addon pretplate (PURCHASED, RENEWED, EXPIRED, DEPLETED, LOW_BALANCE, GRACE_STARTED, CANCELLED). Omogućava filtriranje po addon ID-u, event tipu i datumu.';
        }
        if (pathLower.includes('/sms-logs')) {
          if (methodUpper === 'GET' && !pathLower.includes('/stats') && !pathLower.includes('/sync')) {
            return 'Pregled SMS logova. Prikazuje sve poslane SMS poruke s detaljima o statusu, tipu, korisniku i Twilio SID-u. Omogućava filtriranje po telefonu, tipu, statusu i datumu.';
          }
          if (pathLower.includes('/stats')) {
            return 'Statistike SMS logova. Vraća agregirane podatke po statusu, tipu i modu. Koristi se za monitoring uspješnosti SMS slanja.';
          }
          if (pathLower.includes('/sync-from-twilio')) {
            return 'Sinkronizacija SMS logova iz Twilio API-ja. Dohvaća SMS poruke iz Twilio-a i sprema ih u bazu. Omogućava ručno osvježavanje logova.';
          }
        }
        // Generic admin CRUD endpoints
        if (methodUpper === 'GET' && !pathLower.includes('/')) {
          return 'Dohvaća listu svih zapisa iz admin panela. Podržava paginaciju i filtriranje.';
        }
        if (methodUpper === 'GET' && pathLower.match(/\/[^\/]+$/)) {
          return 'Dohvaća pojedinačni zapis po ID-u. Vraća sve detalje zapisa uključujući povezane podatke.';
        }
        if (methodUpper === 'POST') {
          return 'Kreira novi zapis. Validira podatke i provjerava dozvole prije kreiranja.';
        }
        if (methodUpper === 'PUT' || methodUpper === 'PATCH') {
          return 'Ažurira postojeći zapis. Validira podatke i provjerava ownership prije ažuriranja.';
        }
        if (methodUpper === 'DELETE') {
          return 'Briše zapis. Provjerava dozvole i cascade delete povezanih podataka.';
        }
        return 'Admin endpoint za upravljanje podacima.';
      }
      
      // Auth endpoints
      if (pathLower.startsWith('/api/auth')) {
        if (pathLower.includes('/login')) {
          return 'Prijava korisnika. Provjerava credentials i vraća JWT token. Podržava različite role (USER, PROVIDER, ADMIN).';
        }
        if (pathLower.includes('/register')) {
          return 'Registracija novog korisnika. Kreira User zapis i opcionalno ProviderProfile ako je role PROVIDER. Validira email jedinstvenost i pravni status.';
        }
        if (pathLower.includes('/me')) {
          return 'Dohvaća podatke trenutno prijavljenog korisnika. Vraća user podatke, profil, pretplatu i povezane informacije.';
        }
        if (pathLower.includes('/logout')) {
          return 'Odjava korisnika. Invalidira token i čisti session podatke.';
        }
        if (pathLower.includes('/verify-email')) {
          return 'Verifikacija email adrese. Aktivira korisnički račun nakon što korisnik klikne na link u email-u.';
        }
        if (pathLower.includes('/forgot-password')) {
          return 'Zaboravljena lozinka. Šalje email s linkom za reset lozinke.';
        }
        if (pathLower.includes('/reset-password')) {
          return 'Reset lozinke. Postavlja novu lozinku koristeći token iz email-a.';
        }
        return 'Autentifikacija i autorizacija korisnika.';
      }
      
      // Jobs endpoints
      if (pathLower.startsWith('/api/jobs')) {
        if (methodUpper === 'GET' && !pathLower.includes('/')) {
          return 'Dohvaća listu poslova. Podržava filtriranje po kategoriji, lokaciji, statusu i drugim kriterijima.';
        }
        if (methodUpper === 'GET' && pathLower.includes('/for-provider')) {
          return 'Dohvaća poslove relevantne za providera. Filtrira po kategorijama providera i udaljenosti.';
        }
        if (methodUpper === 'POST') {
          return 'Kreira novi posao. Validira kategoriju, geolokaciju i podatke prije kreiranja.';
        }
        if (pathLower.includes('/accept')) {
          return 'Prihvaća ponudu na posao. Mijenja status posla na IN_PROGRESS i kreira chat sobu.';
        }
        if (pathLower.includes('/complete')) {
          return 'Označava posao kao završen. Mijenja status posla na COMPLETED i omogućava recenzije.';
        }
        if (methodUpper === 'PUT' || methodUpper === 'PATCH') {
          return 'Ažurira postojeći posao. Provjerava ownership i validira podatke prije ažuriranja.';
        }
        if (methodUpper === 'DELETE') {
          return 'Briše posao. Provjerava ownership i briše povezane ponude i chat sobe.';
        }
        return 'Upravljanje poslovima (jobs).';
      }
      
      // Offers endpoints
      if (pathLower.startsWith('/api/offers')) {
        if (methodUpper === 'POST') {
          return 'Kreira novu ponudu na posao. Zahtijeva kredite (osim PRO plan) i provjerava da posao nije vlastiti.';
        }
        if (pathLower.includes('/accept')) {
          return 'Prihvaća ponudu. Mijenja status ponude na ACCEPTED i automatski prihvaća posao.';
        }
        if (methodUpper === 'PUT' || methodUpper === 'PATCH') {
          return 'Ažurira ponudu. Provjerava ownership i validira podatke prije ažuriranja.';
        }
        if (methodUpper === 'DELETE') {
          return 'Briše ponudu. Provjerava ownership i vraća kredite ako je potrebno.';
        }
        return 'Upravljanje ponudama (offers) na poslove.';
      }
      
      // Providers endpoints
      if (pathLower.startsWith('/api/providers')) {
        if (methodUpper === 'GET' && !pathLower.match(/\/[^\/]+$/)) {
          return 'Dohvaća listu pružatelja usluga. Podržava filtriranje po kategorijama, lokaciji i drugim kriterijima.';
        }
        if (methodUpper === 'GET' && pathLower.match(/\/[^\/]+$/)) {
          return 'Dohvaća detalje pojedinačnog pružatelja. Vraća profil, recenzije, licence i povezane informacije.';
        }
        if (methodUpper === 'POST') {
          return 'Kreira novi provider profil. Zahtijeva PROVIDER role i validni pravni status.';
        }
        if (methodUpper === 'PUT' || methodUpper === 'PATCH') {
          return 'Ažurira provider profil. Provjerava ownership i validira kategorije prije ažuriranja.';
        }
        if (methodUpper === 'DELETE') {
          return 'Briše provider profil. Provjerava ownership i briše povezane podatke.';
        }
        return 'Upravljanje provider profilima.';
      }
      
      // Chat endpoints
      if (pathLower.startsWith('/api/chat')) {
        if (pathLower.includes('/rooms') && methodUpper === 'GET') {
          return 'Dohvaća listu chat soba za korisnika. Vraća sve sobe u kojima je korisnik sudionik.';
        }
        if (pathLower.includes('/rooms') && methodUpper === 'POST') {
          return 'Kreira novu chat sobu. Zahtijeva da posao ima prihvaćenu ponudu.';
        }
        if (pathLower.includes('/messages')) {
          if (methodUpper === 'GET') {
            return 'Dohvaća poruke iz chat sobe. Podržava paginaciju i filtriranje.';
          }
          if (methodUpper === 'POST') {
            return 'Šalje novu poruku u chat sobu. Provjerava da je korisnik sudionik sobe.';
          }
        }
        if (pathLower.includes('/read')) {
          return 'Označava poruke kao pročitane. Automatski ažurira read status za korisnika.';
        }
        if (pathLower.includes('/internal')) {
          return 'Internal chat za PROVIDER role. Omogućava grupne sobe i komunikaciju unutar tima.';
        }
        return 'Upravljanje chat sobama i porukama.';
      }
      
      // Exclusive leads endpoints
      if (pathLower.startsWith('/api/exclusive')) {
        if (pathLower.includes('/leads') && methodUpper === 'GET') {
          return 'Dohvaća listu dostupnih ekskluzivnih leadova. Filtrira po kategorijama, lokaciji i statusu.';
        }
        if (pathLower.includes('/purchase')) {
          return 'Kupuje ekskluzivni lead. Zahtijeva kredite ili Stripe Payment Intent. Dodjeljuje lead samo jednom provideru.';
        }
        if (pathLower.includes('/create-payment-intent')) {
          return 'Kreira Stripe Payment Intent za kupovinu leada. Omogućava plaćanje kreditnom karticom.';
        }
        if (pathLower.includes('/contacted')) {
          return 'Označava lead kao kontaktiran. Ažurira ROI statistiku i status leada.';
        }
        if (pathLower.includes('/converted')) {
          return 'Označava lead kao konvertiran (uspešan). Ažurira ROI statistiku i status leada.';
        }
        if (pathLower.includes('/refund')) {
          return 'Zahtijeva refund za lead. Zahtijeva admin odobrenje i validaciju razloga.';
        }
        return 'Upravljanje ekskluzivnim leadovima.';
      }
      
      // Lead queue endpoints
      if (pathLower.startsWith('/api/lead-queue') || pathLower.includes('/my-offers') || pathLower.includes('/my-queue')) {
        if (pathLower.includes('/my-offers') || pathLower === '/api/my-offers') {
          return 'Dohvaća aktivne ponude u queueu za providera. Vraća samo ponude koje nisu istekle.';
        }
        if (pathLower.includes('/my-queue') || pathLower === '/api/my-queue') {
          return 'Dohvaća povijest queue ponuda za providera. Vraća sve ponude koje je provider dobio.';
        }
        if (pathLower.includes('/respond')) {
          return 'Odgovara na queue ponudu. Prihvaća ili odbija ponudu u queueu.';
        }
        return 'Upravljanje lead queue sistemom.';
      }
      
      // Subscriptions endpoints
      if (pathLower.startsWith('/api/subscriptions')) {
        if (pathLower.includes('/subscribe')) {
          return 'Pretplaćuje korisnika na plan. Zahtijeva Stripe Payment Intent ili postojeće kredite.';
        }
        if (pathLower.includes('/cancel')) {
          return 'Otkazuje pretplatu. Pretplata se neće obnoviti nakon isteka, ali ostaje aktivan do kraja perioda.';
        }
        if (methodUpper === 'GET') {
          return 'Dohvaća informacije o pretplati korisnika. Vraća trenutni plan, status i billing informacije.';
        }
        if (pathLower.includes('/downgrade') || pathLower.includes('/check-expiring')) {
          return 'Automatski downgrade isteklih pretplata na BASIC. Pokreće se iz scheduled job-a.';
        }
        return 'Upravljanje pretplatama.';
      }
      
      // Payments endpoints
      if (pathLower.startsWith('/api/payments')) {
        if (pathLower.includes('/create-checkout')) {
          return 'Kreira Stripe Checkout Session za plaćanje. Podržava popuste za nove korisnike i upgrade/downgrade.';
        }
        if (pathLower.includes('/webhook')) {
          return 'Stripe webhook endpoint. Prima notifikacije o plaćanjima i ažurira pretplate automatski.';
        }
        if (methodUpper === 'GET') {
          return 'Dohvaća povijest plaćanja korisnika. Vraća sve transakcije i billing informacije.';
        }
        return 'Upravljanje plaćanjima i transakcijama.';
      }
      
      // Reviews endpoints
      if (pathLower.startsWith('/api/reviews')) {
        if (methodUpper === 'POST') {
          return 'Kreira novu recenziju. Zahtijeva da je posao COMPLETED i provjerava da korisnik već nije recenzirao. AI automatska moderacija.';
        }
        if (pathLower.includes('/reply')) {
          return 'Odgovara na recenziju. Omogućava provideru da odgovori na recenziju jednom.';
        }
        if (methodUpper === 'GET') {
          return 'Dohvaća recenzije. Vraća samo objavljene i odobrene recenzije (osim admin/vlasnik).';
        }
        if (pathLower.includes('/publish')) {
          return 'Automatski objavljuje recenzije čiji je reciprocal delay istekao. Pokreće se iz scheduled job-a.';
        }
        return 'Upravljanje recenzijama.';
      }
      
      // Notifications endpoints
      if (pathLower.startsWith('/api/notifications')) {
        if (methodUpper === 'GET') {
          return 'Dohvaća notifikacije korisnika. Podržava filtriranje po tipu i statusu (pročitano/nepročitano).';
        }
        if (pathLower.includes('/read')) {
          return 'Označava notifikacije kao pročitane. Ažurira read status za odabrane notifikacije.';
        }
        return 'Upravljanje notifikacijama.';
      }
      
      // KYC endpoints
      if (pathLower.startsWith('/api/kyc')) {
        if (pathLower.includes('/upload-document')) {
          return 'Upload KYC dokumenta. Validira format (PDF, JPG, PNG) i automatski provjerava OIB i naziv tvrtke.';
        }
        if (methodUpper === 'GET') {
          return 'Dohvaća KYC dokumente i status verifikacije. Vraća sve dokumente za providera.';
        }
        return 'Upravljanje KYC verifikacijom.';
      }
      
      // Support endpoints
      if (pathLower.startsWith('/api/support')) {
        if (methodUpper === 'POST' && !pathLower.includes('/reply')) {
          return 'Kreira novi support ticket. Korisnik može kreirati ticket samo za sebe.';
        }
        if (pathLower.includes('/reply')) {
          return 'Odgovara na support ticket. Samo admin ili vlasnik ticket-a može odgovoriti.';
        }
        if (methodUpper === 'GET') {
          return 'Dohvaća support ticket-e. Vraća ticket-e korisnika ili sve ticket-e (admin).';
        }
        return 'Upravljanje support ticket-ima.';
      }
      
      // Public endpoints
      if (pathLower.startsWith('/api/public')) {
        if (pathLower.includes('/user-types')) {
          return 'Javni endpoint za pregled tipova korisnika. Vraća statistike o korisnicima, pružateljima i pretplatama. Admin vidi brojke, ne-admin samo tekst.';
        }
        if (pathLower.includes('/providers')) {
          return 'Javni endpoint za pregled pružatelja. Vraća javne profile pružatelja bez osjetljivih podataka.';
        }
        return 'Javni endpointi dostupni bez autentifikacije.';
      }
      
      // Saved Searches endpoints
      if (pathLower.startsWith('/api/saved-searches')) {
        if (methodUpper === 'GET' && !pathLower.match(/\/[^\/]+/)) {
          return 'Dohvaća sve spremljene pretrage korisnika. Vraća samo aktivne pretrage sortirane po zadnjem korištenju.';
        }
        if (methodUpper === 'POST') {
          return 'Kreira novu spremljenu pretragu. Zahtijeva naziv pretrage. Opcionalno može sadržavati searchQuery i filters (JSON).';
        }
        if (pathLower.includes('/use') && methodUpper === 'POST') {
          return 'Označava pretragu kao korištenu. Ažurira lastUsedAt timestamp za tracking najčešće korištenih pretraga.';
        }
        if (methodUpper === 'PUT' || methodUpper === 'PATCH') {
          return 'Ažurira spremljenu pretragu. Provjerava ownership i omogućava ažuriranje naziva, query-ja, filtera i statusa.';
        }
        if (methodUpper === 'DELETE') {
          return 'Briše spremljenu pretragu. Provjerava ownership prije brisanja.';
        }
        return 'Upravljanje spremljenim pretragama. Omogućava korisnicima da spreme svoje filtere za brzo ponovno korištenje.';
      }
      
      // Job Alerts endpoints
      if (pathLower.startsWith('/api/job-alerts')) {
        if (methodUpper === 'GET' && !pathLower.match(/\/[^\/]+/)) {
          return 'Dohvaća sve job alertove korisnika. Vraća samo aktivne alertove sortirane po datumu kreiranja.';
        }
        if (methodUpper === 'POST') {
          return 'Kreira novi job alert. Zahtijeva naziv alerta. Opcionalno može sadržavati searchQuery, filters (JSON) i frequency (DAILY, WEEKLY, INSTANT). Default frequency je DAILY.';
        }
        if (methodUpper === 'PUT' || methodUpper === 'PATCH') {
          return 'Ažurira job alert. Provjerava ownership i omogućava ažuriranje naziva, query-ja, filtera, frekvencije i statusa (aktiviran/pauziran).';
        }
        if (methodUpper === 'DELETE') {
          return 'Briše job alert. Provjerava ownership prije brisanja.';
        }
        return 'Upravljanje job alertovima. Omogućava korisnicima da primaju email notifikacije za nove poslove koji odgovaraju njihovim kriterijima pretrage. Background job provjerava nove poslove i šalje email notifikacije prema frekvenciji.';
      }
      
      // Users endpoints
      if (pathLower.startsWith('/api/users')) {
        if (pathLower.includes('/me')) {
          if (methodUpper === 'GET') {
            return 'Dohvaća podatke trenutno prijavljenog korisnika.';
          }
          if (methodUpper === 'PUT' || methodUpper === 'PATCH') {
            return 'Ažurira podatke trenutno prijavljenog korisnika. Provjerava ownership.';
          }
        }
        return 'Upravljanje korisnicima.';
      }
      
      // Categories endpoints
      if (pathLower.startsWith('/api/categories')) {
        if (methodUpper === 'GET') {
          return 'Dohvaća listu kategorija. Vraća aktivne kategorije s detaljima o licencama i NKD kodovima.';
        }
        return 'Upravljanje kategorijama usluga.';
      }
      
      // Documentation endpoints
      if (pathLower.startsWith('/api/documentation')) {
        if (methodUpper === 'GET') {
          return 'Dohvaća dokumentaciju funkcionalnosti. Vraća kategorije i feature-e s opisima.';
        }
        return 'Upravljanje dokumentacijom.';
      }
      
      // Wizard endpoints
      if (pathLower.startsWith('/api/wizard')) {
        if (pathLower.includes('/complete')) {
          return 'Završava wizard setup za providera. Zahtijeva barem jednu kategoriju i regiju.';
        }
        return 'Wizard setup za nove providere.';
      }
      
      // Chatbot endpoints
      if (pathLower.startsWith('/api/chatbot')) {
        if (pathLower.includes('/advance')) {
          return 'Napreduje chatbot sesiju na sljedeći korak. Validira trenutni korak i prelazi na sljedeći.';
        }
        return 'Upravljanje chatbot sesijama.';
      }
      
      // Director endpoints
      if (pathLower.startsWith('/api/director')) {
        return 'Director Dashboard endpointi. Omogućava direktorima upravljanje timom i pregled statistika.';
      }
      
      // Matchmaking endpoints
      if (pathLower.startsWith('/api/matchmaking')) {
        return 'Matchmaking sistem. Automatski povezuje poslove s relevantnim providerima.';
      }
      
      // Provider ROI endpoints
      if (pathLower.startsWith('/api/provider-roi')) {
        return 'ROI Dashboard endpointi. Prikazuje statistike o ROI-u za providere (konvertirani, kontaktirani leadovi).';
      }
      
      // Invoices endpoints
      if (pathLower.startsWith('/api/invoices')) {
        if (methodUpper === 'GET') {
          return 'Dohvaća fakture korisnika. Vraća sve fakture s detaljima o plaćanjima.';
        }
        return 'Upravljanje fakturama.';
      }
      
      // Whitelabel endpoints
      if (pathLower.startsWith('/api/whitelabel')) {
        return 'WhiteLabel funkcionalnost za PRO plan. Omogućava prilagodbu brandinga.';
      }
      
      // Client verification endpoints
      if (pathLower.startsWith('/api/client-verification')) {
        return 'Client verifikacija. Automatska verifikacija klijenata na temelju OIB-a i naziva tvrtke.';
      }
      
      // SMS verification endpoints
      if (pathLower.startsWith('/api/sms-verification')) {
        return 'SMS verifikacija. Šalje SMS kod za verifikaciju telefonskog broja.';
      }
      
      // Upload endpoints
      if (pathLower.startsWith('/api/upload')) {
        return 'Upload fajlova. Podržava upload slika i dokumenata s validacijom formata i veličine.';
      }
      
      // Push notifications endpoints
      if (pathLower.startsWith('/api/push-notifications')) {
        return 'Push notification subscription. Omogućava korisnicima da se pretplate na push notifikacije.';
      }
      
      // Default description
      return `API endpoint za ${methodUpper} operacije na ${fullPath}.`;
    };
    
    // Funkcija za određivanje tko pokreće API endpoint
    const getTriggerInfo = (fullPath, method) => {
      const triggers = {
        type: null, // 'page', 'job', 'api', 'webhook', 'manual'
        details: []
      };
      
      // Webhook endpoints
      if (fullPath.includes('/webhook')) {
        triggers.type = 'webhook';
        if (fullPath.includes('/stripe')) {
          triggers.details.push('Stripe webhook - automatski poziv od Stripe-a');
        } else {
          triggers.details.push('Webhook - automatski poziv od vanjskog servisa');
        }
        return triggers;
      }
      
      // Admin endpoints - ručno ili iz admin panela
      if (fullPath.startsWith('/api/admin')) {
        triggers.type = 'page';
        triggers.details.push('Admin Panel: https://uslugar.oriph.io/admin/...');
        if (fullPath.includes('/api-reference')) {
          triggers.details.push('Admin Panel → API Reference stranica');
        } else if (fullPath.includes('/cleanup')) {
          triggers.details.push('Admin Panel → Čišćenje podataka stranica');
        } else if (fullPath.includes('/payments')) {
          triggers.details.push('Admin Panel → Payments stranica');
        } else if (fullPath.includes('/provider-approvals')) {
          triggers.details.push('Admin Panel → Provider Approvals stranica');
        } else if (fullPath.includes('/reports/send-monthly-reports')) {
          triggers.type = 'manual';
          triggers.details.push('Ručno pokretanje iz Admin Panela');
        } else if (fullPath.includes('/audit-logs')) {
          triggers.details.push('Admin Panel → Audit Logs stranica (https://uslugar.oriph.io/admin/audit-logs)');
        } else if (fullPath.includes('/api-request-logs')) {
          triggers.details.push('Admin Panel → API Request Logs stranica (https://uslugar.oriph.io/admin/api-request-logs)');
          triggers.details.push('Automatski: Middleware logira sve API zahtjeve u real-time');
        } else if (fullPath.includes('/error-logs')) {
          triggers.details.push('Admin Panel → Error Logs stranica (https://uslugar.oriph.io/admin/error-logs)');
          triggers.details.push('Automatski: Error handler middleware logira sve greške u real-time');
        } else if (fullPath.includes('/addon-event-logs')) {
          triggers.details.push('Admin Panel → Addon Event Logs stranica (https://uslugar.oriph.io/admin/addon-event-logs)');
          triggers.details.push('Automatski: Addon lifecycle service logira evente pri promjenama statusa');
        } else if (fullPath.includes('/sms-logs')) {
          triggers.details.push('Admin Panel → SMS Logs stranica (https://uslugar.oriph.io/admin/sms-logs)');
          triggers.details.push('Automatski: SMS service logira sve poslane SMS poruke');
        }
        return triggers;
      }
      
      // Auth endpoints
      if (fullPath.startsWith('/api/auth')) {
        triggers.type = 'page';
        if (fullPath.includes('/login')) {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#login');
        } else if (fullPath.includes('/register')) {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#register-user');
        } else if (fullPath.includes('/me')) {
          triggers.type = 'api';
          triggers.details.push('Poziva se iz drugih API-ja ili frontend komponenti za provjeru autentifikacije');
        } else if (fullPath.includes('/logout')) {
          triggers.details.push('Stranica: bilo koja stranica s logout gumbom');
        }
        return triggers;
      }
      
      // Jobs endpoints
      if (fullPath.startsWith('/api/jobs')) {
        triggers.type = 'page';
        if (method === 'GET') {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#user (Početna - lista poslova)');
        } else if (method === 'POST') {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#user (JobForm komponenta)');
        } else if (fullPath.includes('/accept')) {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#my-jobs (prihvaćanje ponude)');
        } else if (fullPath.includes('/complete')) {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#my-jobs (završavanje posla)');
        } else {
          triggers.details.push('Stranica: Nema specifične stranice - poziva se iz frontend komponenti');
        }
        return triggers;
      }
      
      // Saved Searches endpoints
      if (fullPath.startsWith('/api/saved-searches')) {
        triggers.type = 'page';
        if (method === 'GET') {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#user-profile (SavedSearchesSection komponenta)');
          triggers.details.push('Stranica: https://uslugar.oriph.io/#user (tražilica - dropdown spremljenih pretraga)');
        } else if (method === 'POST') {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#user (tražilica - gumb "Spremi pretragu")');
          triggers.details.push('Stranica: https://uslugar.oriph.io/#user-profile (SavedSearchesSection - dodavanje nove pretrage)');
        } else if (fullPath.includes('/use') && method === 'POST') {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#user (tražilica - odabir spremljene pretrage iz dropdowna)');
        } else if (['PUT', 'DELETE'].includes(method)) {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#user-profile (SavedSearchesSection - upravljanje pretragama)');
        }
        return triggers;
      }
      
      // Job Alerts endpoints
      if (fullPath.startsWith('/api/job-alerts')) {
        triggers.type = 'page';
        if (method === 'GET') {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#user-profile (SavedSearchesSection komponenta)');
        } else if (method === 'POST') {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#user-profile (SavedSearchesSection - kreiranje novog alerta)');
        } else if (['PUT', 'DELETE'].includes(method)) {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#user-profile (SavedSearchesSection - upravljanje alertovima)');
        }
        // Background job također poziva provjeru novih poslova
        triggers.details.push('Backend Job: Provjera novih poslova i slanje email notifikacija (cron job)');
        return triggers;
      }
      
      // Offers endpoints
      if (fullPath.startsWith('/api/offers')) {
        triggers.type = 'page';
        if (method === 'POST') {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#providers (slanje ponude na posao)');
        } else if (fullPath.includes('/accept')) {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#my-jobs (prihvaćanje ponude)');
        } else {
          triggers.details.push('Stranica: Nema specifične stranice - poziva se iz frontend komponenti');
        }
        return triggers;
      }
      
      // Providers endpoints
      if (fullPath.startsWith('/api/providers')) {
        triggers.type = 'page';
        if (method === 'GET') {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#providers (lista pružatelja)');
        } else if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#provider-profile (uređivanje profila)');
        } else {
          triggers.details.push('Stranica: Nema specifične stranice - poziva se iz frontend komponenti');
        }
        return triggers;
      }
      
      // Chat endpoints
      if (fullPath.startsWith('/api/chat')) {
        triggers.type = 'page';
        if (fullPath.includes('/rooms') && method === 'POST') {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#my-jobs (kreiranje chat sobe nakon prihvaćanja ponude)');
        } else if (fullPath.includes('/messages')) {
          triggers.details.push('Stranica: Nema specifične stranice - poziva se iz ChatRoom komponente (real-time chat)');
        } else {
          triggers.details.push('Stranica: Nema specifične stranice - poziva se iz ChatRoom komponente');
        }
        return triggers;
      }
      
      // Exclusive leads endpoints
      if (fullPath.startsWith('/api/exclusive')) {
        triggers.type = 'page';
        if (fullPath.includes('/leads') && method === 'GET') {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#leads (Lead Marketplace)');
        } else if (fullPath.includes('/purchase')) {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#leads (kupnja leada)');
        } else if (fullPath.includes('/contacted') || fullPath.includes('/converted')) {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#my-leads (označavanje statusa leada)');
        } else {
          triggers.details.push('Stranica: Nema specifične stranice - poziva se iz frontend komponenti');
        }
        return triggers;
      }
      
      // Lead queue endpoints
      if (fullPath.startsWith('/api/lead-queue') || fullPath.includes('/my-offers') || fullPath.includes('/my-queue')) {
        triggers.type = 'page';
        if (fullPath.includes('/respond')) {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#my-leads (odgovaranje na queue ponudu)');
        } else {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#my-leads (Lead Queue management)');
        }
        return triggers;
      }
      
      // Subscriptions endpoints
      if (fullPath.startsWith('/api/subscriptions')) {
        // Auto-downgrade se pokreće iz job-a
        if (fullPath.includes('/downgrade') || fullPath.includes('/check-expiring')) {
          triggers.type = 'job';
          triggers.details.push('Job: checkExpiringSubscriptions (svaki dan u ponoć)');
          return triggers;
        }
        triggers.type = 'page';
        if (fullPath.includes('/subscribe')) {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#pricing (pretplata)');
        } else if (fullPath.includes('/cancel')) {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#subscription (otkazivanje pretplate)');
        } else if (method === 'GET') {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#subscription (pregled pretplate)');
        } else {
          triggers.details.push('Stranica: Nema specifične stranice - poziva se iz frontend komponenti');
        }
        return triggers;
      }
      
      // Payments endpoints
      if (fullPath.startsWith('/api/payments')) {
        if (fullPath.includes('/webhook')) {
          triggers.type = 'webhook';
          triggers.details.push('Stripe webhook - automatski poziv od Stripe-a nakon plaćanja');
          return triggers;
        }
        triggers.type = 'page';
        if (fullPath.includes('/create-checkout')) {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#pricing (Stripe checkout)');
        } else {
          triggers.details.push('Stranica: Nema specifične stranice - poziva se iz frontend komponenti');
        }
        return triggers;
      }
      
      // Reviews endpoints
      if (fullPath.startsWith('/api/reviews')) {
        // Auto-publish se pokreće iz job-a
        if (fullPath.includes('/publish')) {
          triggers.type = 'job';
          triggers.details.push('Job: publishExpiredReviews (svaki dan u ponoć)');
          return triggers;
        }
        triggers.type = 'page';
        if (method === 'POST') {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#my-jobs (dodavanje recenzije nakon završetka posla)');
        } else if (method === 'GET') {
          triggers.details.push('Stranica: Nema specifične stranice - poziva se iz ProviderProfile komponente (prikaz recenzija)');
        } else {
          triggers.details.push('Stranica: Nema specifične stranice - poziva se iz frontend komponenti');
        }
        return triggers;
      }
      
      // Notifications endpoints
      if (fullPath.startsWith('/api/notifications')) {
        if (fullPath.includes('/read')) {
          triggers.type = 'page';
          triggers.details.push('Stranica: Nema specifične stranice - poziva se iz Notification komponente (označavanje kao pročitano)');
        } else {
          triggers.type = 'api';
          triggers.details.push('Poziva se iz drugih API-ja (automatski) ili frontend komponenti');
        }
        return triggers;
      }
      
      // KYC endpoints
      if (fullPath.startsWith('/api/kyc')) {
        triggers.type = 'page';
        triggers.details.push('Stranica: https://uslugar.oriph.io/#provider-profile (KYC upload)');
        return triggers;
      }
      
      // Support endpoints
      if (fullPath.startsWith('/api/support')) {
        triggers.type = 'page';
        triggers.details.push('Stranica: https://uslugar.oriph.io/#contact (Support ticket)');
        return triggers;
      }
      
      // Public endpoints
      if (fullPath.startsWith('/api/public')) {
        triggers.type = 'page';
        if (fullPath.includes('/user-types')) {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#user-types (Tipovi korisnika)');
        } else if (fullPath.includes('/providers')) {
          triggers.details.push('Stranica: https://uslugar.oriph.io/#providers (Javni pregled pružatelja)');
        } else {
          triggers.details.push('Stranica: Nema specifične stranice - javni endpoint');
        }
        return triggers;
      }
      
      // Users endpoints
      if (fullPath.startsWith('/api/users')) {
        triggers.type = 'page';
        if (fullPath.includes('/me')) {
          triggers.details.push('Stranica: Nema specifične stranice - poziva se iz frontend komponenti za dohvaćanje korisničkih podataka');
        } else {
          triggers.details.push('Stranica: Nema specifične stranice - poziva se iz frontend komponenti');
        }
        return triggers;
      }
      
      // Categories endpoints
      if (fullPath.startsWith('/api/categories')) {
        triggers.type = 'page';
        triggers.details.push('Stranica: Nema specifične stranice - poziva se iz frontend komponenti (dropdown meniji, filteri)');
        return triggers;
      }
      
      // Legal statuses endpoints
      if (fullPath.startsWith('/api/legal-statuses')) {
        triggers.type = 'page';
        triggers.details.push('Stranica: Nema specifične stranice - poziva se iz frontend komponenti (dropdown meniji)');
        return triggers;
      }
      
      // Documentation endpoints
      if (fullPath.startsWith('/api/documentation')) {
        triggers.type = 'page';
        triggers.details.push('Stranica: https://uslugar.oriph.io/#documentation (Dokumentacija)');
        return triggers;
      }
      
      // Wizard endpoints
      if (fullPath.startsWith('/api/wizard')) {
        triggers.type = 'page';
        triggers.details.push('Stranica: Nema specifične stranice - poziva se iz Wizard komponente');
        return triggers;
      }
      
      // Chatbot endpoints
      if (fullPath.startsWith('/api/chatbot')) {
        triggers.type = 'page';
        triggers.details.push('Stranica: Nema specifične stranice - poziva se iz Chatbot komponente');
        return triggers;
      }
      
      // Director endpoints
      if (fullPath.startsWith('/api/director')) {
        triggers.type = 'page';
        triggers.details.push('Stranica: https://uslugar.oriph.io/#director (Director Dashboard)');
        return triggers;
      }
      
      // Matchmaking endpoints
      if (fullPath.startsWith('/api/matchmaking')) {
        triggers.type = 'page';
        triggers.details.push('Stranica: Nema specifične stranice - poziva se iz Matchmaking komponente');
        return triggers;
      }
      
      // Provider ROI endpoints
      if (fullPath.startsWith('/api/provider-roi')) {
        triggers.type = 'page';
        triggers.details.push('Stranica: https://uslugar.oriph.io/#roi (ROI Dashboard)');
        return triggers;
      }
      
      // Invoices endpoints
      if (fullPath.startsWith('/api/invoices')) {
        triggers.type = 'page';
        triggers.details.push('Stranica: https://uslugar.oriph.io/#invoices (Fakture)');
        return triggers;
      }
      
      // Whitelabel endpoints
      if (fullPath.startsWith('/api/whitelabel')) {
        triggers.type = 'page';
        triggers.details.push('Stranica: Nema specifične stranice - poziva se iz ProviderProfile komponente (PRO plan)');
        return triggers;
      }
      
      // Client verification endpoints
      if (fullPath.startsWith('/api/client-verification')) {
        triggers.type = 'page';
        triggers.details.push('Stranica: Nema specifične stranice - poziva se iz frontend komponenti');
        return triggers;
      }
      
      // SMS verification endpoints
      if (fullPath.startsWith('/api/sms-verification')) {
        triggers.type = 'page';
        triggers.details.push('Stranica: Nema specifične stranice - poziva se iz frontend komponenti (SMS verifikacija)');
        return triggers;
      }
      
      // Upload endpoints
      if (fullPath.startsWith('/api/upload')) {
        triggers.type = 'page';
        triggers.details.push('Stranica: Nema specifične stranice - poziva se iz frontend komponenti (upload slika/dokumenata)');
        return triggers;
      }
      
      // Push notifications endpoints
      if (fullPath.startsWith('/api/push-notifications')) {
        triggers.type = 'api';
        triggers.details.push('Poziva se iz frontend komponenti (push notification subscription)');
        return triggers;
      }
      
      // Queue Scheduler jobs
      if (fullPath.includes('/check-expired') || fullPath.includes('/check-inactive')) {
        triggers.type = 'job';
        triggers.details.push('Job: Queue Scheduler (svaki sat)');
        if (fullPath.includes('/offers')) {
          triggers.details.push('Job: checkExpiredOffers');
        } else if (fullPath.includes('/lead-purchases')) {
          triggers.details.push('Job: checkInactiveLeadPurchases (automatski refund nakon 48h)');
        }
        return triggers;
      }
      
      // License expiry check
      if (fullPath.includes('/check-expiring-licenses') || fullPath.includes('/validate-licenses')) {
        triggers.type = 'job';
        triggers.details.push('Job: checkExpiringLicenses (svaki dan u ponoć)');
        triggers.details.push('Job: validateAllLicenses (svaki dan u ponoć)');
        return triggers;
      }
      
      // SLA reminders
      if (fullPath.includes('/sla-reminders')) {
        triggers.type = 'job';
        triggers.details.push('Job: checkAndSendSLAReminders (svaki sat)');
        return triggers;
      }
      
      // Addon lifecycle
      if (fullPath.includes('/addon-lifecycle')) {
        triggers.type = 'job';
        triggers.details.push('Job: checkAddonLifecycles (svaki dan u ponoć)');
        triggers.details.push('Job: processAutoRenewals (svaki dan u ponoć)');
        triggers.details.push('Job: processAddonUpsells (svaki dan u ponoć)');
        return triggers;
      }
      
      // Auto verification
      if (fullPath.includes('/auto-verify')) {
        triggers.type = 'job';
        triggers.details.push('Job: batchAutoVerifyClients (svaki dan u ponoć)');
        return triggers;
      }
      
      // Monthly reports
      if (fullPath.includes('/monthly-reports')) {
        triggers.type = 'job';
        triggers.details.push('Job: sendMonthlyReportsToAllUsers (1. u mjesecu u ponoć)');
        return triggers;
      }
      
      // Thread locking
      if (fullPath.includes('/thread-locking')) {
        triggers.type = 'job';
        triggers.details.push('Job: lockInactiveThreads (svaki sat)');
        triggers.details.push('Job: reLockExpiredTemporaryUnlocks (svaki sat)');
        return triggers;
      }
      
      // Default - provjeri da li postoji stranica ili nema
      // Većina endpointa se poziva iz frontend komponenti, ali ako nema specifične stranice, označi kao "nema"
      triggers.type = 'page';
      triggers.details.push('Stranica: Nema specifične stranice - poziva se iz frontend komponenti ili API-ja');
      return triggers;
    };
    
    // Dodaj sigurnosne informacije, trigger informacije i opis svakoj ruti
    allRoutes.forEach(route => {
      const security = getSecurityInfo(route.fullPath, route.method);
      const trigger = getTriggerInfo(route.fullPath, route.method);
      const description = getEndpointDescription(route.fullPath, route.method, route.handler);
      route.security = security;
      route.trigger = trigger;
      route.description = description;
      // Debug: loguj rute s businessRules
      if (security.businessRules && security.businessRules.length > 0) {
        console.log(`[API-REF] Route with businessRules: ${route.method} ${route.fullPath}`, security.businessRules);
      }
      // Debug: loguj rute koje bi trebale imati businessRules ali nemaju
      if ((route.fullPath.includes('/my-offers') || route.fullPath.includes('/my-queue')) && 
          (!security.businessRules || security.businessRules.length === 0)) {
        console.log(`[API-REF] WARNING: Route ${route.method} ${route.fullPath} should have businessRules but doesn't`);
      }
    });
    
    // Filtriraj rute koje su vjerojatno lažne (middleware, error handleri)
    const validRoutes = allRoutes.filter(route => {
      // Preskoči rute s path-om koji je samo "/api/" ili "/api"
      if (route.fullPath === '/api/' || route.fullPath === '/api') {
        return false;
      }
      // Preskoči rute koje nemaju smislen path (samo "/")
      if (route.path === '/' && route.handler === 'anonymous') {
        return false;
      }
      return true;
    });
    
    // Grupiraj po base path-u (prvi segment nakon /api)
    const groupedRoutes = {};
    validRoutes.forEach(route => {
      // Ekstraktiraj base path (prvi segment nakon /api/)
      const pathWithoutApi = route.fullPath.replace(/^\/api\/?/, '');
      const pathParts = pathWithoutApi.split('/').filter(p => p);
      let basePath = pathParts[0] || 'root';
      
      // Ako je basePath "root", pokušaj izvući iz path-a direktno
      if (basePath === 'root' && route.path && route.path !== '/') {
        const pathPartsFromRoute = route.path.split('/').filter(p => p);
        if (pathPartsFromRoute.length > 0) {
          basePath = pathPartsFromRoute[0];
        }
      }
      
      // Debug: loguj rute koje imaju basePath "root" (možda problem s parsiranjem)
      if (basePath === 'root' && route.fullPath !== '/api/' && route.fullPath !== '/api') {
        console.log(`[API-REF] WARNING: Route ${route.method} ${route.fullPath} has basePath "root" - path="${route.path}"`);
      }
      
      // Ako je basePath "root", možda je to stvarno root ruta ili greška
      if (basePath === 'root' && route.fullPath !== '/api/') {
        // Pokušaj izvući iz path-a direktno
        const directPath = route.path.split('/').filter(p => p)[0];
        if (directPath) {
          const finalBasePath = directPath;
          if (!groupedRoutes[finalBasePath]) {
            groupedRoutes[finalBasePath] = [];
          }
          groupedRoutes[finalBasePath].push(route);
          return;
        }
      }
      
      if (!groupedRoutes[basePath]) {
        groupedRoutes[basePath] = [];
      }
      groupedRoutes[basePath].push(route);
    });
    
    // Sortiraj rute unutar svake grupe
    Object.keys(groupedRoutes).forEach(key => {
      groupedRoutes[key].sort((a, b) => {
        if (a.path < b.path) return -1;
        if (a.path > b.path) return 1;
        const methodOrder = { 'GET': 1, 'POST': 2, 'PUT': 3, 'PATCH': 4, 'DELETE': 5 };
        return (methodOrder[a.method] || 99) - (methodOrder[b.method] || 99);
      });
    });
    
    console.log(`[API-REF] Returning response: ${validRoutes.length} valid routes, ${Object.keys(groupedRoutes).length} groups`);
    console.log(`[API-REF] Group keys: ${Object.keys(groupedRoutes).sort().join(', ')}`);
    
    // Provjeri da li se određene rute nalaze u rezultatu
    const checkRoutes = ['chatbot', 'wizard', 'director', 'matchmaking'];
    checkRoutes.forEach(routeName => {
      const found = validRoutes.some(r => r.fullPath.includes(`/api/${routeName}`));
      const inGroups = Object.keys(groupedRoutes).some(key => key === routeName || groupedRoutes[key].some(r => r.fullPath.includes(`/api/${routeName}`)));
      console.log(`[API-REF] Route "/api/${routeName}": found=${found}, inGroups=${inGroups}`);
      if (found && !inGroups) {
        console.log(`[API-REF] WARNING: Route "/api/${routeName}" found in validRoutes but not in groupedRoutes!`);
      }
    });
    
    res.json({
      success: true,
      totalRoutes: validRoutes.length,
      routes: groupedRoutes,
      allRoutes: validRoutes.sort((a, b) => {
        if (a.fullPath < b.fullPath) return -1;
        if (a.fullPath > b.fullPath) return 1;
        const methodOrder = { 'GET': 1, 'POST': 2, 'PUT': 3, 'PATCH': 4, 'DELETE': 5 };
        return (methodOrder[a.method] || 99) - (methodOrder[b.method] || 99);
      })
    });
  } catch (e) {
    console.error('[API-REF] ERROR in api-reference endpoint:', e);
    console.error('[API-REF] Stack trace:', e.stack);
    next(e);
  }
});

/**
 * POST /api/admin/reports/send-monthly-reports
 * Pošalji mjesečne izvještaje svim aktivnim korisnicima (admin only)
 * Body: { year?, month? } (opcionalno - default: prošli mjesec)
 */
r.post('/reports/send-monthly-reports', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { year, month } = req.body;
    
    // Ako je specificirano, pošalji za određeni mjesec
    if (year && month) {
      // Pošalji svim korisnicima za određeni mjesec
      const activeUsers = await prisma.user.findMany({
        where: {
          role: 'PROVIDER',
          subscriptions: {
            some: {
              status: 'ACTIVE'
            }
          }
        },
        select: {
          id: true,
          email: true,
          fullName: true
        }
      });
      
      let sent = 0;
      let failed = 0;
      const errors = [];
      
      for (const user of activeUsers) {
        try {
          const result = await sendMonthlyReport(user.id, parseInt(year), parseInt(month));
          if (result.success) {
            sent++;
          } else {
            failed++;
            errors.push({ userId: user.id, email: user.email, error: result.error });
          }
        } catch (error) {
          failed++;
          errors.push({ userId: user.id, email: user.email, error: error.message });
        }
      }
      
      return res.json({
        success: true,
        message: `Monthly reports sent for ${year}-${month}`,
        sent,
        failed,
        total: activeUsers.length,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined // Prvih 10 grešaka
      });
    }
    
    // Default: pošalji za prošli mjesec (automatski)
    const result = await sendMonthlyReportsToAllUsers();
    
    if (result.success) {
      res.json({
        success: true,
        message: `Monthly reports sent to ${result.sent} users`,
        period: result.period,
        sent: result.sent,
        failed: result.failed,
        total: result.total,
        errors: result.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to send monthly reports'
      });
    }
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/admin/reports/send-monthly-report/:userId
 * Pošalji mjesečni izvještaj određenom korisniku (admin only)
 * Body: { year?, month? } (opcionalno - default: prošli mjesec)
 */
r.post('/reports/send-monthly-report/:userId', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { year, month } = req.body;
    
    // Ako nije specificirano, koristi prošli mjesec
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const reportYear = year || lastMonth.getFullYear();
    const reportMonth = month || (lastMonth.getMonth() + 1);
    
    const result = await sendMonthlyReport(userId, reportYear, reportMonth);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Monthly report sent to ${result.email}`,
        period: result.period
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to send monthly report'
      });
    }
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/admin/user-types-overview
 * Admin verzija user-types-overview - vraća iste podatke kao public endpoint
 * SAMO ADMIN može pristupiti
 */
r.get('/user-types-overview', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    // Koristi istu logiku kao public endpoint
    // Dohvati sve korisnike za statistike (bez osobnih podataka)
    const users = await prisma.user.findMany({
      select: {
        role: true,
        legalStatusId: true,
        providerProfile: {
          select: {
            legalStatusId: true,
            companyName: true,
            kycVerified: true,
            badgeData: true,
            identityEmailVerified: true,
            identityPhoneVerified: true,
            identityDnsVerified: true,
            safetyInsuranceUrl: true,
            licenses: {
              select: {
                isVerified: true,
                licenseType: true
              }
            },
            categories: {
              select: {
                requiresLicense: true
              }
            },
            ratingAvg: true,
            ratingCount: true,
            avgResponseTimeMinutes: true,
            conversionRate: true
          }
        },
        clientVerification: {
          select: {
            companyVerified: true
          }
        },
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            plan: true,
            expiresAt: true
          },
          take: 1
        }
      }
    });

    // Grupiraj po tipovima korisnika
    const userTypes = {
      'Privatni korisnici': {
        description: 'Fizičke osobe koje traže usluge za osobne potrebe',
        count: 0,
        characteristics: []
      },
      'Poslovni korisnici': {
        description: 'Pravne osobe (obrt, d.o.o., j.d.o.o., itd.) koje traže usluge za svoje poslovanje',
        count: 0,
        characteristics: []
      },
      'Pružatelji usluga (Solo)': {
        description: 'Pojedinačni pružatelji usluga bez tima',
        count: 0,
        characteristics: []
      },
      'Pružatelji usluga (Tvrtka)': {
        description: 'Pružatelji usluga koji predstavljaju tvrtku s timom',
        count: 0,
        characteristics: []
      },
      'Verificirani pružatelji': {
        description: 'Pružatelji usluga koji su verificirali svoju tvrtku dokumentima',
        count: 0,
        characteristics: []
      },
      'Licencirani pružatelji': {
        description: 'Pružatelji usluga s verificiranim licencama za djelatnosti koje to zahtijevaju',
        count: 0,
        characteristics: []
      },
      'TRIAL korisnici': {
        description: 'Korisnici na probnom (TRIAL) paketu',
        count: 0,
        characteristics: []
      },
      'Plaćeni paketi': {
        description: 'Korisnici s aktivnom pretplatom (BASIC, PREMIUM, PRO)',
        count: 0,
        characteristics: []
      }
    };

    // Izračunaj statistike
    users.forEach(user => {
      const providerProfile = user.providerProfile;
      const subscription = user.subscriptions[0] || null;
      const clientVerification = user.clientVerification;
      
      // Privatni korisnici
      if (user.role === 'USER' && !user.legalStatusId) {
        userTypes['Privatni korisnici'].count++;
      }
      
      // Poslovni korisnici
      if (user.role === 'USER' && user.legalStatusId) {
        userTypes['Poslovni korisnici'].count++;
      }
      
      // Pružatelji
      if (user.role === 'PROVIDER') {
        if (providerProfile?.companyName) {
          userTypes['Pružatelji usluga (Tvrtka)'].count++;
        } else {
          userTypes['Pružatelji usluga (Solo)'].count++;
        }
        
        // Verificirani
        if (clientVerification?.companyVerified) {
          userTypes['Verificirani pružatelji'].count++;
        }
        
        // Licencirani
        const categoriesRequiringLicense = providerProfile?.categories.filter(cat => cat.requiresLicense) || [];
        const hasVerifiedLicenses = providerProfile?.licenses.some(l => l.isVerified);
        if (categoriesRequiringLicense.length > 0 && hasVerifiedLicenses) {
          userTypes['Licencirani pružatelji'].count++;
        }
      }
      
      // Pretplate
      if (subscription) {
        if (subscription.plan === 'TRIAL') {
          userTypes['TRIAL korisnici'].count++;
        } else {
          userTypes['Plaćeni paketi'].count++;
        }
      }
    });

    // Izračunaj prosječnu reputaciju za pružatelje
    const providers = users.filter(u => u.role === 'PROVIDER' && u.providerProfile);
    const avgRating = providers.length > 0
      ? providers.reduce((sum, u) => sum + (u.providerProfile?.ratingAvg || 0), 0) / providers.length
      : 0;
    const avgResponseTime = providers.length > 0
      ? providers.reduce((sum, u) => sum + (u.providerProfile?.avgResponseTimeMinutes || 0), 0) / providers.length
      : 0;
    const avgConversionRate = providers.length > 0
      ? providers.reduce((sum, u) => sum + (u.providerProfile?.conversionRate || 0), 0) / providers.length
      : 0;

    // Grupiraj po pravnom statusu
    const legalStatusStats = {};
    const legalStatusIds = new Set();
    users.forEach(user => {
      if (user.legalStatusId) legalStatusIds.add(user.legalStatusId);
      if (user.providerProfile?.legalStatusId) legalStatusIds.add(user.providerProfile.legalStatusId);
    });
    
    const legalStatuses = await prisma.legalStatus.findMany({
      where: { id: { in: Array.from(legalStatusIds) } },
      select: { id: true, name: true }
    });
    
    const legalStatusMap = {};
    legalStatuses.forEach(ls => {
      legalStatusMap[ls.id] = ls.name;
    });
    
    users.forEach(user => {
      const legalStatusId = user.legalStatusId || user.providerProfile?.legalStatusId;
      if (legalStatusId && legalStatusMap[legalStatusId]) {
        const statusName = legalStatusMap[legalStatusId];
        legalStatusStats[statusName] = (legalStatusStats[statusName] || 0) + 1;
      }
    });

    // Grupiraj po pretplati
    const subscriptionStats = {
      'Nema pretplate': 0,
      'TRIAL': 0,
      'BASIC': 0,
      'PREMIUM': 0,
      'PRO': 0
    };
    users.forEach(user => {
      const subscription = user.subscriptions[0];
      if (subscription) {
        subscriptionStats[subscription.plan] = (subscriptionStats[subscription.plan] || 0) + 1;
      } else {
        subscriptionStats['Nema pretplate']++;
      }
    });

    res.json({
      userTypes,
      legalStatusStats,
      subscriptionStats,
      reputation: {
        avgRating: Math.round(avgRating * 10) / 10,
        avgResponseTimeMinutes: Math.round(avgResponseTime),
        avgConversionRate: Math.round(avgConversionRate * 100) / 100,
        totalProviders: providers.length
      },
      verification: {
        verified: users.filter(u => u.clientVerification?.companyVerified).length,
        notVerified: users.filter(u => !u.clientVerification?.companyVerified && (u.role === 'PROVIDER' || u.legalStatusId)).length
      },
      licenses: {
        withLicenses: users.filter(u => u.providerProfile?.licenses.length > 0).length,
        verifiedLicenses: users.filter(u => u.providerProfile?.licenses.some(l => l.isVerified)).length,
        pendingVerification: users.filter(u => u.providerProfile?.licenses.some(l => !l.isVerified)).length
      },
      badges: {
        business: {
          total: users.filter(u => {
            const profile = u.providerProfile;
            if (!profile) return false;
            let badgeDataObj = profile.badgeData;
            if (typeof badgeDataObj === 'string') {
              try {
                badgeDataObj = JSON.parse(badgeDataObj);
              } catch (e) {
                badgeDataObj = null;
              }
            }
            return profile.kycVerified || 
                   (badgeDataObj && typeof badgeDataObj === 'object' && badgeDataObj.BUSINESS?.verified);
          }).length,
          providers: users.filter(u => {
            if (u.role !== 'PROVIDER') return false;
            const profile = u.providerProfile;
            if (!profile) return false;
            let badgeDataObj = profile.badgeData;
            if (typeof badgeDataObj === 'string') {
              try {
                badgeDataObj = JSON.parse(badgeDataObj);
              } catch (e) {
                badgeDataObj = null;
              }
            }
            return profile.kycVerified || 
                   (badgeDataObj && typeof badgeDataObj === 'object' && badgeDataObj.BUSINESS?.verified);
          }).length,
          users: users.filter(u => {
            if (u.role !== 'USER') return false;
            const profile = u.providerProfile;
            if (!profile) return false;
            let badgeDataObj = profile.badgeData;
            if (typeof badgeDataObj === 'string') {
              try {
                badgeDataObj = JSON.parse(badgeDataObj);
              } catch (e) {
                badgeDataObj = null;
              }
            }
            return profile.kycVerified || 
                   (badgeDataObj && typeof badgeDataObj === 'object' && badgeDataObj.BUSINESS?.verified);
          }).length,
          description: 'Korisnici s verificiranom tvrtkom (Sudski/Obrtni registar) - uključuje i pružatelje i tvrtke/obrte koji traže usluge'
        },
        identity: {
          total: users.filter(u => {
            const profile = u.providerProfile;
            if (!profile) return false;
            return profile.identityEmailVerified || 
                   profile.identityPhoneVerified || 
                   profile.identityDnsVerified;
          }).length,
          providers: users.filter(u => {
            if (u.role !== 'PROVIDER') return false;
            const profile = u.providerProfile;
            if (!profile) return false;
            return profile.identityEmailVerified || 
                   profile.identityPhoneVerified || 
                   profile.identityDnsVerified;
          }).length,
          users: users.filter(u => {
            if (u.role !== 'USER') return false;
            const profile = u.providerProfile;
            if (!profile) return false;
            return profile.identityEmailVerified || 
                   profile.identityPhoneVerified || 
                   profile.identityDnsVerified;
          }).length,
          email: users.filter(u => u.providerProfile?.identityEmailVerified).length,
          phone: users.filter(u => u.providerProfile?.identityPhoneVerified).length,
          dns: users.filter(u => u.providerProfile?.identityDnsVerified).length,
          description: 'Korisnici s verificiranim identitetom (email/telefon/domena) - uključuje i pružatelje i tvrtke/obrte'
        },
        safety: {
          total: users.filter(u => u.providerProfile?.safetyInsuranceUrl).length,
          providers: users.filter(u => u.role === 'PROVIDER' && u.providerProfile?.safetyInsuranceUrl).length,
          users: users.filter(u => u.role === 'USER' && u.providerProfile?.safetyInsuranceUrl).length,
          description: 'Korisnici s uploadanom policom osiguranja - uključuje i pružatelje i tvrtke/obrte'
        },
        allBadges: {
          total: users.filter(u => {
            const profile = u.providerProfile;
            if (!profile) return false;
            let badgeDataObj = profile.badgeData;
            if (typeof badgeDataObj === 'string') {
              try {
                badgeDataObj = JSON.parse(badgeDataObj);
              } catch (e) {
                badgeDataObj = null;
              }
            }
            const hasBusiness = profile.kycVerified || 
                               (badgeDataObj && typeof badgeDataObj === 'object' && badgeDataObj.BUSINESS?.verified);
            const hasIdentity = profile.identityEmailVerified || 
                               profile.identityPhoneVerified || 
                               profile.identityDnsVerified;
            const hasSafety = !!profile.safetyInsuranceUrl;
            return hasBusiness || hasIdentity || hasSafety;
          }).length,
          providers: users.filter(u => {
            if (u.role !== 'PROVIDER') return false;
            const profile = u.providerProfile;
            if (!profile) return false;
            let badgeDataObj = profile.badgeData;
            if (typeof badgeDataObj === 'string') {
              try {
                badgeDataObj = JSON.parse(badgeDataObj);
              } catch (e) {
                badgeDataObj = null;
              }
            }
            const hasBusiness = profile.kycVerified || 
                               (badgeDataObj && typeof badgeDataObj === 'object' && badgeDataObj.BUSINESS?.verified);
            const hasIdentity = profile.identityEmailVerified || 
                               profile.identityPhoneVerified || 
                               profile.identityDnsVerified;
            const hasSafety = !!profile.safetyInsuranceUrl;
            return hasBusiness || hasIdentity || hasSafety;
          }).length,
          users: users.filter(u => {
            if (u.role !== 'USER') return false;
            const profile = u.providerProfile;
            if (!profile) return false;
            let badgeDataObj = profile.badgeData;
            if (typeof badgeDataObj === 'string') {
              try {
                badgeDataObj = JSON.parse(badgeDataObj);
              } catch (e) {
                badgeDataObj = null;
              }
            }
            const hasBusiness = profile.kycVerified || 
                               (badgeDataObj && typeof badgeDataObj === 'object' && badgeDataObj.BUSINESS?.verified);
            const hasIdentity = profile.identityEmailVerified || 
                               profile.identityPhoneVerified || 
                               profile.identityDnsVerified;
            const hasSafety = !!profile.safetyInsuranceUrl;
            return hasBusiness || hasIdentity || hasSafety;
          }).length,
          description: 'Korisnici s barem jednom značkom - uključuje i pružatelje i tvrtke/obrte koji traže usluge'
        }
      }
    });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/admin/testing/cleanup - Obriši sve test podatke
r.delete('/testing/cleanup', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const result = { deleted: {} };

    // Delete in correct order to avoid foreign key constraint violations
    // 1. Delete TestRunItem first (depends on TestRun and TestItem)
    result.deleted.testRunItems = await prisma.testRunItem.deleteMany({});

    // 2. Delete TestRun (depends on TestPlan and User)
    result.deleted.testRuns = await prisma.testRun.deleteMany({});

    // 3. Delete TestItem (depends on TestPlan)
    result.deleted.testItems = await prisma.testItem.deleteMany({});

    // 4. Delete TestPlan last (parent table)
    result.deleted.testPlans = await prisma.testPlan.deleteMany({});

    res.json({ 
      success: true, 
      message: 'Svi test podaci su uspješno obrisani',
      ...result 
    });
  } catch (e) {
    console.error('[TESTING CLEANUP] Error:', e);
    next(e);
  }
});

// Debug: Verify all routes are registered (including /api-reference)
// This check runs AFTER all routes are registered
// Use process.nextTick to ensure router stack is fully initialized
process.nextTick(() => {
  if (r.stack && r.stack.length > 0) {
    console.log('🔍 Admin router loaded, total routes:', r.stack.length);
    // Check specifically for api-reference
    const apiRefRoute = r.stack.find(layer => 
      layer.route && layer.route.path === '/api-reference'
    );
    if (apiRefRoute) {
      console.log('✅ /api-reference route found in admin router');
    } else {
      console.log('❌ /api-reference route NOT found in admin router!');
      // List all route paths for debugging
      const routePaths = r.stack
        .filter(layer => layer.route)
        .map(layer => layer.route.path)
        .filter(path => path.includes('api-reference') || path.includes('reference'));
      if (routePaths.length > 0) {
        console.log('   Found similar routes:', routePaths);
      }
    }
  }
});

export default r;