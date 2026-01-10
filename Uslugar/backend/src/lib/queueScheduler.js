/**
 * USLUGAR EXCLUSIVE - In-Process Queue Scheduler
 * 
 * Pokreće se kao dio glavnog servera
 * Provjerava istekle leadove svaki sat
 * Provjerava neaktivne lead purchase-ove svaki sat (automatski refund nakon 48h)
 * Provjerava licence koje istječu svaki dan (notifikacije o isteku)
 */

import cron from 'node-cron'
import { checkExpiredOffers } from './leadQueueManager.js'
import { checkInactiveLeadPurchases } from '../services/lead-service.js'
import { checkExpiringLicenses } from '../services/license-expiry-checker.js'
import { validateAllLicenses } from '../services/license-validator.js'
import { batchAutoVerifyClients } from '../services/auto-verification.js'

import { lockInactiveThreads, reLockExpiredTemporaryUnlocks } from '../services/thread-locking-service.js';
import { checkAndSendSLAReminders } from '../services/sla-reminder-service.js';
import { checkAddonLifecycles, processAutoRenewals, processAddonUpsells } from '../services/addon-lifecycle-service.js';
import { checkAndDowngradeExpiredSubscriptions } from '../routes/subscriptions.js';
import { publishExpiredReviews } from '../services/review-publish-service.js';
import { sendMonthlyReportsToAllUsers } from '../services/monthly-report-service.js';

export function startQueueScheduler() {
  console.log('⏰ Starting Queue Scheduler...')
  
  // Pokreni svaki sat (0 minuta svaki sat)
  cron.schedule('0 * * * *', async () => {
    console.log(`\n${'='.repeat(50)}`)
    console.log(`⏰ Scheduled Check: ${new Date().toISOString()}`)
    console.log('='.repeat(50))
    
    try {
      // Provjeri istekle ponude u queueu
      await checkExpiredOffers()
      
      // Provjeri neaktivne lead purchase-ove (automatski refund nakon 48h)
      await checkInactiveLeadPurchases()
      
      // Provjeri i pošalji SLA podsjetnike
      const remindersSent = await checkAndSendSLAReminders()
      if (remindersSent > 0) {
        console.log(`✅ Sent ${remindersSent} SLA reminders`)
      }
      
      // Provjeri add-on lifecycle (status, isteci, grace period)
      const addonCheck = await checkAddonLifecycles()
      if (addonCheck.updated > 0) {
        console.log(`✅ Updated ${addonCheck.updated} add-ons (${addonCheck.expired} expired, ${addonCheck.graceStarted} grace started)`)
      }
      
      // Obradi auto-renewale
      const renewals = await processAutoRenewals()
      if (renewals.renewed > 0) {
        console.log(`✅ Auto-renewed ${renewals.renewed} add-ons`)
      }
      
      // Provjeri i pošalji upsell ponude za add-one koji ističu
      const upsells = await processAddonUpsells()
      if (upsells.upsellsSent > 0) {
        console.log(`✅ Sent ${upsells.upsellsSent} add-on upsell offers`)
      }
      
      // Provjeri i downgrade-uj istekle subscription-e na BASIC (uključujući TRIAL)
      const downgradeCheck = await checkAndDowngradeExpiredSubscriptions()
      if (downgradeCheck.downgraded > 0) {
        console.log(`✅ Downgraded ${downgradeCheck.downgraded} expired subscriptions to BASIC`)
      }
      
      // Provjeri i objavi review-e čiji je rok istekao (reciprocal delay)
      const reviewPublish = await publishExpiredReviews()
      if (reviewPublish.published > 0) {
        console.log(`✅ Published ${reviewPublish.published} expired reviews`)
      }
      
      console.log('✅ Scheduled check completed')
    } catch (error) {
      console.error('❌ Scheduled check failed:', error)
    }
    
    console.log('='.repeat(50) + '\n')
  })
  
  // Provjeri licence koje istječu svaki dan u 9:00
  cron.schedule('0 9 * * *', async () => {
    console.log(`\n${'='.repeat(50)}`)
    console.log(`⏰ License Expiry Check: ${new Date().toISOString()}`)
    console.log('='.repeat(50))
    
    try {
      await checkExpiringLicenses()
      console.log('✅ License expiry check completed')
    } catch (error) {
      console.error('❌ License expiry check failed:', error)
    }
    
    console.log('='.repeat(50) + '\n')
  })
  
  // Pošalji mjesečne izvještaje svim korisnicima - 1. dan u mjesecu u 9:00
  cron.schedule('0 9 1 * *', async () => {
    console.log(`\n${'='.repeat(50)}`)
    console.log(`⏰ Monthly Report Sending: ${new Date().toISOString()}`)
    console.log('='.repeat(50))
    
    try {
      const result = await sendMonthlyReportsToAllUsers()
      if (result.success) {
        console.log(`✅ Monthly reports sent: ${result.sent}/${result.total} (${result.failed} failed)`)
        if (result.errors && result.errors.length > 0) {
          console.log(`⚠️ Errors:`, result.errors.slice(0, 5)) // Prikaži prvih 5 grešaka
        }
      } else {
        console.error(`❌ Monthly reports failed: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Monthly report sending failed:', error)
    }
    
    console.log('='.repeat(50) + '\n')
  })
  
  // Provjeri valjanost licenci svaki dan u 10:00 (1h nakon expiry check-a)
  cron.schedule('0 10 * * *', async () => {
    console.log(`\n${'='.repeat(50)}`)
    console.log(`⏰ License Validity Check: ${new Date().toISOString()}`)
    console.log('='.repeat(50))
    
    try {
      await validateAllLicenses()
      console.log('✅ License validity check completed')
    } catch (error) {
      console.error('❌ License validity check failed:', error)
    }
    
    console.log('='.repeat(50) + '\n')
  })
  
  // Batch automatska verifikacija klijenata svaki dan u 11:00
  cron.schedule('0 11 * * *', async () => {
    console.log(`\n${'='.repeat(50)}`)
    console.log(`⏰ Batch Auto Verification: ${new Date().toISOString()}`)
    console.log('='.repeat(50))
    
    try {
      const result = await batchAutoVerifyClients()
      console.log(`✅ Batch auto-verification completed: ${result.verified}/${result.total} verified, ${result.errors} errors`)
    } catch (error) {
      console.error('❌ Batch auto-verification failed:', error)
    }
    
    console.log('='.repeat(50) + '\n')
  })
  
  // Također pokreni svake 15 minuta za hitne poslove
  cron.schedule('*/15 * * * *', async () => {
    // Samo log svake 15 min, za monitoring
    console.log(`⏰ Queue Monitor: ${new Date().toISOString()} - System running`)
  })
  
  // Thread locking scheduler - provjerava neaktivne threadove svaki dan u 2:00
  cron.schedule('0 2 * * *', async () => {
    console.log(`\n${'='.repeat(50)}`)
    console.log(`🔒 Thread Locking Check: ${new Date().toISOString()}`)
    console.log('='.repeat(50))
    
    try {
      // Zaključaj neaktivne threadove (90 dana neaktivnosti)
      const lockedCount = await lockInactiveThreads(90);
      if (lockedCount > 0) {
        console.log(`✅ Locked ${lockedCount} inactive threads`);
      }
      
      // Provjeri i ponovno zaključaj threadove čije je privremeno otključavanje isteklo
      const reLockedCount = await reLockExpiredTemporaryUnlocks();
      if (reLockedCount > 0) {
        console.log(`✅ Re-locked ${reLockedCount} threads after temporary unlock expired`);
      }
      
      console.log('✅ Thread locking check completed')
    } catch (error) {
      console.error('❌ Thread locking check failed:', error)
    }
    
    console.log('='.repeat(50) + '\n')
  })
  
  // Inactivity reminders - provjerava neaktivne korisnike svaki dan u 8:00
  cron.schedule('0 8 * * *', async () => {
    console.log(`\n${'='.repeat(50)}`)
    console.log(`📧 Inactivity Reminders Check: ${new Date().toISOString()}`)
    console.log('='.repeat(50))
    
    try {
      const { checkInactiveUsers } = await import('./subscription-reminder.js');
      const result = await checkInactiveUsers();
      if (result.remindersSent > 0) {
        console.log(`✅ Sent ${result.remindersSent} inactivity reminders`);
      }
      console.log(`✅ Inactivity check completed: ${result.checked} checked, ${result.remindersSent} sent, ${result.skipped} skipped`)
    } catch (error) {
      console.error('❌ Inactivity check failed:', error)
    }
    
    console.log('='.repeat(50) + '\n')
  })

  console.log('✅ Queue Scheduler started successfully')
  console.log('   - Expired offers check: Every hour at :00')
  console.log('   - Inactive lead purchases check (48h auto-refund): Every hour at :00')
  console.log('   - SLA reminders check: Every hour at :00')
  console.log('   - Add-on lifecycle check: Every hour at :00')
  console.log('   - Add-on auto-renewal: Every hour at :00')
  console.log('   - Add-on upsell offers: Every hour at :00')
  console.log('   - Expired subscriptions downgrade (TRIAL→BASIC): Every hour at :00')
  console.log('   - Review publish (reciprocal delay): Every hour at :00')
  console.log('   - Monthly reports: 1st of month at 09:00')
  console.log('   - License expiry check: Daily at 09:00')
  console.log('   - License validity check: Daily at 10:00')
  console.log('   - Batch auto-verification: Daily at 11:00')
  console.log('   - Thread locking check: Daily at 02:00')
  console.log('   - Inactivity reminders (>14 days): Daily at 08:00')
  console.log('   - Monitor heartbeat: Every 15 minutes')
}

