/**
 * USLUGAR EXCLUSIVE - Cron Job za provjeru isteklih leadova
 * 
 * Pokreće se svaki sat i provjerava:
 * - Istekle ponude (expiresAt < now)
 * - Automatski nudi sljedećem provideru u queueu
 * 
 * Pokretanje:
 * node cron/checkExpiredLeads.js
 * 
 * Ili dodaj u crontab:
 * 0 * * * * /usr/bin/node /path/to/backend/cron/checkExpiredLeads.js
 */

const { checkExpiredOffers } = require('../utils/leadQueueManager')

async function runCronJob() {
  console.log('='=50)
  console.log(`🕐 Cron Job Started: ${new Date().toISOString()}`)
  console.log('='=50)
  
  try {
    await checkExpiredOffers()
    
    console.log('='=50)
    console.log('✅ Cron Job Completed Successfully')
    console.log('='=50)
    
    process.exit(0)
  } catch (error) {
    console.error('='=50)
    console.error('❌ Cron Job Failed:', error)
    console.error('='=50)
    
    process.exit(1)
  }
}

runCronJob()

