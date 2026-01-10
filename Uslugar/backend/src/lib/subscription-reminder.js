// Subscription Expiry Reminder - Send email warnings before subscription expires
import { prisma } from './prisma.js';
import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.SMTP_USER) {
    console.warn('SMTP not configured - email reminders disabled');
    return null;
  }
  
  const port = parseInt(process.env.SMTP_PORT || '587');
  const isSSL = port === 465;
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: isSSL,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const transporter = createTransporter();

// Send expiry reminder email
export async function sendExpiryReminder(subscription, daysLeft, user) {
  if (!transporter) {
    console.log('SMTP not configured, skipping expiry reminder');
    return;
  }

  const isTrial = subscription.plan === 'TRIAL';
  const subject = isTrial 
    ? `🔔 Vaš TRIAL istječe za ${daysLeft} dana!`
    : `🔔 Vaša pretplata istječe za ${daysLeft} dana!`;

  const message = isTrial
    ? `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #4CAF50; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">USLUGAR</h1>
        </div>
        <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0; font-size: 24px;">🎁 Vaš TRIAL istječe za ${daysLeft} dana!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Poštovani/na <strong>${user.fullName}</strong>,</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Vaš besplatni 14-dnevni probni period za Uslugar EXCLUSIVE istječe za <strong>${daysLeft} dana</strong> (${new Date(subscription.expiresAt).toLocaleDateString('hr-HR')}).</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #4CAF50;">
            <h3 style="color: #333; margin-top: 0;">Što ste dobili s TRIAL-om?</h3>
            <ul style="color: #666; font-size: 14px; line-height: 1.8;">
              <li>✅ 8 besplatnih leadova</li>
              <li>✅ Sve Premium funkcionalnosti (AI prioritet, SMS notifikacije, CSV export, napredna analitika)</li>
              <li>✅ 2 kategorije i 1 regija (add-on paketi)</li>
              <li>✅ Ekskluzivni leadovi (1:1, bez konkurencije)</li>
              <li>✅ ROI statistika i refund ako klijent ne odgovori</li>
            </ul>
          </div>
          
          <p style="color: #333; font-size: 16px; font-weight: bold; margin-top: 30px;">Nadogradite na Premium ili Pro plan da nastavite koristiti:</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #4CAF50;">
            <h3 style="color: #059669; margin-top: 0;">⭐ PREMIUM - 89€/mj</h3>
            <p style="font-size: 18px; color: #16a34a; font-weight: bold;">25 leadova mjesečno</p>
            <p style="color: #666; font-size: 14px;">✅ CSV export • SMS notifikacije • AI prioritet • Prioritetna podrška • Napredna analitika</p>
            <p style="margin-top: 10px; color: #dc2626; font-weight: bold;">Ušteda 161€ vs pay-per-lead (36% popust!)</p>
          </div>
          
          <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b;">
            <h3 style="color: #d97706; margin-top: 0;">🚀 PRO - 149€/mj</h3>
            <p style="font-size: 18px; color: #f59e0b; font-weight: bold;">50 leadova mjesečno</p>
            <p style="color: #666; font-size: 14px;">✅ Sve iz Premium + Premium kvaliteta leadova (80+ score) • VIP podrška 24/7 • Featured profil</p>
            <p style="margin-top: 10px; color: #dc2626; font-weight: bold;">Ušteda 351€ vs pay-per-lead (47% popust!)</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://uslugar.oriph.io'}/#subscription" 
               style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: bold;">
              Nadogradi Pretplatu →
            </a>
          </div>
          
          <p style="margin-top: 30px; color: #999; font-size: 14px; line-height: 1.6;">
            Pitanja? Kontaktirajte nas na <a href="mailto:support@uslugar.hr" style="color: #4CAF50; text-decoration: none;">support@uslugar.hr</a>
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Uslugar. Sva prava pridržana.</p>
        </div>
      </body>
      </html>
    `
    : `
      <h2>📅 Vaša pretplata istječe za ${daysLeft} dana!</h2>
      <p>Poštovani <strong>${user.fullName}</strong>,</p>
      <p>Vaša pretplata <strong>${subscription.plan}</strong> istječe za <strong>${daysLeft} dana</strong>.</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Trenutno stanje:</h3>
        <p>Plan: <strong>${subscription.plan}</strong></p>
        <p>Preostalo kredita: <strong>${subscription.creditsBalance || 0}</strong></p>
        <p>Ističe: <strong>${new Date(subscription.expiresAt).toLocaleDateString('hr-HR')}</strong></p>
      </div>
      
      <p><strong>Nadogradite pretplatu da nastavite koristiti Uslugar EXCLUSIVE:</strong></p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://uslugar.oriph.io'}/#subscription" 
           style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: bold;">
          Obnovi Pretplatu →
        </a>
      </div>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Više o paketima: <a href="${process.env.FRONTEND_URL || 'https://uslugar.oriph.io'}/#subscription">Pogledaj planove</a>
      </p>
    `;

  try {
    await transporter.sendMail({
      from: `"Uslugar" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: subject,
      html: message
    });
    
    console.log(`📧 Expiry reminder sent to ${user.email} (${daysLeft} days left)`);
  } catch (error) {
    console.error('Error sending expiry reminder:', error);
  }
}

// Check subscriptions and send reminders
export async function checkExpiringSubscriptions() {
  try {
    const now = new Date();
    const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // Find TRIAL subscriptions expiring in 3 days (specifično za TRIAL)
    const trialExpiringIn3Days = await prisma.subscription.findMany({
      where: {
        plan: 'TRIAL',
        status: 'ACTIVE',
        expiresAt: {
          gte: new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000) - (12 * 60 * 60 * 1000)), // 2.5 dana
          lte: in3Days // 3 dana
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });

    // Find subscriptions expiring in 2 days (non-TRIAL)
    const expiringSoon = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        plan: { not: 'TRIAL' }, // Ne uključi TRIAL (već obrađen gore)
        expiresAt: {
          gte: now,
          lte: in2Days
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });

    // Find subscriptions expiring in 7 days (early warning, non-TRIAL)
    const expiringLater = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        plan: { not: 'TRIAL' }, // Ne uključi TRIAL
        expiresAt: {
          gte: in2Days,
          lte: in7Days
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });

    // Send TRIAL 3-day reminder (only once)
    for (const sub of trialExpiringIn3Days) {
      const daysLeft = Math.ceil((sub.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Provjeri da li je već poslan podsjetnik (izbjegni duplikate)
      const recentNotification = await prisma.notification.findFirst({
        where: {
          userId: sub.user.id,
          type: 'SYSTEM',
          title: {
            contains: 'TRIAL istječe za 3 dana'
          },
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // U zadnja 24h
          }
        }
      });

      if (!recentNotification && daysLeft === 3) {
        await sendExpiryReminder(sub, daysLeft, sub.user);
        
        // Create in-app notification
        await prisma.notification.create({
          data: {
            title: `TRIAL istječe za 3 dana`,
            message: `Vaš besplatni TRIAL period istječe za ${daysLeft} dana (${new Date(sub.expiresAt).toLocaleDateString('hr-HR')}). Nadogradite pretplatu da nastavite koristiti Uslugar EXCLUSIVE sa svim Premium funkcionalnostima!`,
            type: 'SYSTEM',
            userId: sub.user.id
          }
        });
        
        console.log(`📧 TRIAL reminder sent to ${sub.user.email} (${daysLeft} days left)`);
      }
    }

    // Send 2-day warning (non-TRIAL)
    for (const sub of expiringSoon) {
      const daysLeft = Math.ceil((sub.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      await sendExpiryReminder(sub, daysLeft, sub.user);
      
      // Create in-app notification
      await prisma.notification.create({
        data: {
          title: `Pretplata istječe za ${daysLeft} dana`,
          message: `${sub.plan} pretplata istječe ${new Date(sub.expiresAt).toLocaleDateString('hr-HR')}. Obnovite da nastavite koristiti Uslugar EXCLUSIVE.`,
          type: 'SYSTEM',
          userId: sub.user.id
        }
      });
    }

    // Send 7-day early warning (only once, non-TRIAL)
    for (const sub of expiringLater) {
      const daysLeft = Math.ceil((sub.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if already sent notification (to avoid duplicates)
      const recentNotification = await prisma.notification.findFirst({
        where: {
          userId: sub.user.id,
          type: 'SYSTEM',
          title: {
            contains: 'istječe za 7 dana'
          },
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // In last 24h
          }
        }
      });

      if (!recentNotification) {
        await sendExpiryReminder(sub, daysLeft, sub.user);
        
        // Create in-app notification
        await prisma.notification.create({
          data: {
            title: `Pretplata istječe za ${daysLeft} dana`,
            message: `${sub.plan} pretplata istječe ${new Date(sub.expiresAt).toLocaleDateString('hr-HR')}. Nadogradite pretplatu da nastavite koristiti Uslugar EXCLUSIVE.`,
            type: 'SYSTEM',
            userId: sub.user.id
          }
        });
      }
    }

    console.log(`📧 Checked expiring subscriptions: ${trialExpiringIn3Days.length} TRIAL (3 days), ${expiringSoon.length} soon (2 days), ${expiringLater.length} later (7 days)`);
  } catch (error) {
    console.error('Error checking expiring subscriptions:', error);
  }
}

/**
 * Pošalji email pri isteku TRIAL-a s popust linkom
 */
export async function sendTrialExpiredEmail(subscription, user) {
  if (!transporter) {
    console.log('SMTP not configured, skipping trial expired email');
    return;
  }

  // Generiraj popust link - frontend će automatski primijeniti 20% popust
  const discountLink = `${process.env.FRONTEND_URL || 'https://uslugar.oriph.io'}/#subscription?trial_expired=true&user_id=${user.id}`;
  
  const subject = '🎁 Vaš TRIAL je istekao - Specijalna ponuda za vas!';
  
  const message = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: #dc2626; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">USLUGAR</h1>
      </div>
      <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0; font-size: 24px;">⏰ Vaš TRIAL period je istekao</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Poštovani/na <strong>${user.fullName}</strong>,</p>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Vaš besplatni 14-dnevni probni period za Uslugar EXCLUSIVE je istekao (${new Date(subscription.expiresAt).toLocaleDateString('hr-HR')}).</p>
        
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 8px; margin: 30px 0; border: 3px solid #f59e0b; text-align: center;">
          <h3 style="color: #92400e; margin-top: 0; font-size: 22px;">🎁 Specijalna ponuda samo za vas!</h3>
          <p style="font-size: 20px; color: #92400e; font-weight: bold; margin: 15px 0;">20% POPUST na prvu pretplatu!</p>
          <p style="color: #78350f; font-size: 14px; margin: 10px 0;">Kliknite na link ispod da automatski primijenite popust pri nadogradnji.</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #333; margin-top: 0;">Što ste dobili s TRIAL-om?</h3>
          <ul style="color: #666; font-size: 14px; line-height: 1.8;">
            <li>✅ 8 besplatnih leadova</li>
            <li>✅ Sve Premium funkcionalnosti (AI prioritet, SMS notifikacije, CSV export, napredna analitika)</li>
            <li>✅ 2 kategorije i 1 regija (add-on paketi)</li>
            <li>✅ Ekskluzivni leadovi (1:1, bez konkurencije)</li>
            <li>✅ ROI statistika i refund ako klijent ne odgovori</li>
          </ul>
        </div>
        
        <p style="color: #333; font-size: 16px; font-weight: bold; margin-top: 30px;">Nadogradite sada i uštedite 20%:</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #4CAF50;">
          <h3 style="color: #059669; margin-top: 0;">⭐ PREMIUM - 89€/mj</h3>
          <p style="font-size: 18px; color: #16a34a; font-weight: bold;">25 leadova mjesečno</p>
          <p style="color: #666; font-size: 14px;">✅ CSV export • SMS notifikacije • AI prioritet • Prioritetna podrška • Napredna analitika</p>
          <p style="margin-top: 10px; color: #dc2626; font-weight: bold;">S popustom: <span style="text-decoration: line-through;">89€</span> <span style="font-size: 20px; color: #16a34a;">71.20€/mj</span> (20% popust!)</p>
        </div>
        
        <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b;">
          <h3 style="color: #d97706; margin-top: 0;">🚀 PRO - 149€/mj</h3>
          <p style="font-size: 18px; color: #f59e0b; font-weight: bold;">50 leadova mjesečno</p>
          <p style="color: #666; font-size: 14px;">✅ Sve iz Premium + Premium kvaliteta leadova (80+ score) • VIP podrška 24/7 • Featured profil</p>
          <p style="margin-top: 10px; color: #dc2626; font-weight: bold;">S popustom: <span style="text-decoration: line-through;">149€</span> <span style="font-size: 20px; color: #16a34a;">119.20€/mj</span> (20% popust!)</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${discountLink}" 
             style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
            🎁 Nadogradi s 20% Popustom →
          </a>
        </div>
        
        <p style="margin-top: 20px; color: #999; font-size: 12px; text-align: center; line-height: 1.6;">
          ⚠️ Ova ponuda vrijedi ograničeno vrijeme. Kliknite na gumb iznad da automatski primijenite popust pri checkout-u.
        </p>
        
        <p style="margin-top: 30px; color: #999; font-size: 14px; line-height: 1.6;">
          Pitanja? Kontaktirajte nas na <a href="mailto:support@uslugar.hr" style="color: #4CAF50; text-decoration: none;">support@uslugar.hr</a>
        </p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Uslugar. Sva prava pridržana.</p>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Uslugar" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: subject,
      html: message
    });
    
    console.log(`📧 Trial expired email sent to ${user.email} with discount link`);
  } catch (error) {
    console.error('Error sending trial expired email:', error);
  }
}

/**
 * Provjeri i pošalji email-ove za istekle TRIAL pretplate
 */
export async function checkExpiredTrials() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    // Pronađi TRIAL pretplate koje su istekle danas (u zadnja 24h)
    const expiredTrials = await prisma.subscription.findMany({
      where: {
        plan: 'TRIAL',
        status: {
          in: ['ACTIVE', 'EXPIRED']
        },
        expiresAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });

    for (const subscription of expiredTrials) {
      // Provjeri da li je već poslan email (izbjegni duplikate)
      const recentNotification = await prisma.notification.findFirst({
        where: {
          userId: subscription.user.id,
          type: 'SYSTEM',
          title: {
            contains: 'TRIAL je istekao'
          },
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // U zadnja 24h
          }
        }
      });

      if (!recentNotification) {
        await sendTrialExpiredEmail(subscription, subscription.user);
        
        // Kreiraj in-app notifikaciju
        await prisma.notification.create({
          data: {
            title: 'TRIAL je istekao - Specijalna ponuda!',
            message: `Vaš besplatni TRIAL period je istekao. Nadogradite sada i uštedite 20% na prvu pretplatu!`,
            type: 'SYSTEM',
            userId: subscription.user.id
          }
        });
        
        console.log(`📧 Trial expired email sent to ${subscription.user.email}`);
      }
    }

    console.log(`📧 Checked expired TRIAL subscriptions: ${expiredTrials.length} found`);
    return { checked: expiredTrials.length };
  } catch (error) {
    console.error('Error checking expired TRIAL subscriptions:', error);
    throw error;
  }
}

/**
 * Pošalji email podsjetnik za neaktivne korisnike (>14 dana)
 */
export async function sendInactivityReminderEmail(user, daysInactive) {
  if (!transporter) {
    console.log('SMTP not configured, skipping inactivity reminder');
    return;
  }

  const subject = '👋 Niste bili aktivni neko vrijeme - Vratite se na Uslugar!';
  
  const message = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: #3B82F6; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">USLUGAR</h1>
      </div>
      <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0; font-size: 24px;">👋 Niste bili aktivni ${daysInactive} dana</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Poštovani/na <strong>${user.fullName}</strong>,</p>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Primijetili smo da niste bili aktivni na Uslugar platformi već <strong>${daysInactive} dana</strong>.</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #3B82F6;">
          <h3 style="color: #333; margin-top: 0;">Što možete raditi na Uslugar-u?</h3>
          <ul style="color: #666; font-size: 14px; line-height: 1.8;">
            <li>✅ Pregledajte nove ekskluzivne leadove u vašoj kategoriji</li>
            <li>✅ Kontaktirajte klijente i pošaljite profesionalne ponude</li>
            <li>✅ Pratite svoju ROI statistiku i konverzije</li>
            <li>✅ Upravljajte svojim profilom i dodajte portfolio</li>
            <li>✅ Komunicirajte s klijentima putem chat-a</li>
          </ul>
        </div>
        
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 8px; margin: 30px 0; border: 3px solid #f59e0b; text-align: center;">
          <h3 style="color: #92400e; margin-top: 0; font-size: 22px;">💡 Ne propustite nove prilike!</h3>
          <p style="color: #78350f; font-size: 14px; margin: 10px 0;">Novi leadovi se dodaju svakodnevno. Vratite se i pronađite svoj sljedeći posao!</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://uslugar.oriph.io'}/#dashboard" 
             style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
            🚀 Otvori Dashboard →
          </a>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <h3 style="color: #333; margin-top: 0; font-size: 18px;">Potrebna pomoć?</h3>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Ako imate pitanja ili trebate pomoć, kontaktirajte nas na <a href="mailto:support@uslugar.hr" style="color: #3B82F6; text-decoration: none;">support@uslugar.hr</a>
          </p>
        </div>
        
        <p style="margin-top: 30px; color: #999; font-size: 12px; text-align: center; line-height: 1.6;">
          Ako ne želite više primati ove email-ove, možete se odjaviti u postavkama profila.
        </p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Uslugar. Sva prava pridržana.</p>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Uslugar" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: subject,
      html: message
    });
    
    console.log(`📧 Inactivity reminder sent to ${user.email} (${daysInactive} days inactive)`);
  } catch (error) {
    console.error('Error sending inactivity reminder:', error);
  }
}

/**
 * Provjeri i pošalji podsjetnike za neaktivne korisnike (>14 dana)
 */
export async function checkInactiveUsers() {
  try {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 dana unazad
    
    // Pronađi korisnike koji nisu bili aktivni >14 dana
    // Koristimo kombinaciju: updatedAt iz User modela + zadnje aktivnosti (login, lead purchase, chat, offers)
    const inactiveUsers = await prisma.user.findMany({
      where: {
        role: 'PROVIDER', // Samo providere
        updatedAt: {
          lt: cutoffDate // Nisu ažurirani u zadnja 14 dana
        },
        // Ne uključi korisnike koji su se registrirali u zadnja 14 dana (novi korisnici)
        createdAt: {
          lt: cutoffDate
        }
      },
      include: {
        subscription: {
          select: {
            plan: true,
            status: true
          }
        },
        trialEngagement: {
          select: {
            lastActivityAt: true,
            lastLoginAt: true
          }
        }
      }
    });

    let remindersSent = 0;
    let skippedCount = 0;

    for (const user of inactiveUsers) {
      try {
        // Provjeri zadnju aktivnost iz različitih izvora
        let lastActivity = user.updatedAt;
        
        // Provjeri TrialEngagement ako postoji
        if (user.trialEngagement?.lastActivityAt) {
          const trialActivity = new Date(user.trialEngagement.lastActivityAt);
          if (trialActivity > lastActivity) {
            lastActivity = trialActivity;
          }
        }
        
        if (user.trialEngagement?.lastLoginAt) {
          const trialLogin = new Date(user.trialEngagement.lastLoginAt);
          if (trialLogin > lastActivity) {
            lastActivity = trialLogin;
          }
        }
        
        // Provjeri zadnji login iz LeadPurchase, ChatMessage, Offer, itd.
        const [lastLeadPurchase, lastChatMessage, lastOffer] = await Promise.all([
          prisma.leadPurchase.findFirst({
            where: { providerId: user.id },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true }
          }),
          prisma.chatMessage.findFirst({
            where: { senderId: user.id },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true }
          }),
          prisma.offer.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true }
          })
        ]);
        
        // Pronađi najnoviju aktivnost
        const activities = [
          lastActivity,
          lastLeadPurchase?.createdAt,
          lastChatMessage?.createdAt,
          lastOffer?.createdAt
        ].filter(Boolean).map(d => new Date(d));
        
        const mostRecentActivity = activities.length > 0 
          ? new Date(Math.max(...activities.map(d => d.getTime())))
          : user.updatedAt;
        
        // Provjeri da li je stvarno neaktivan >14 dana
        const daysInactive = Math.floor((now.getTime() - mostRecentActivity.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysInactive < 14) {
          continue; // Nije neaktivan dovoljno dugo
        }
        
        // Provjeri da li je već poslan podsjetnik (izbjegni duplikate)
        const recentNotification = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            type: 'SYSTEM',
            title: {
              contains: 'Neaktivnost'
            },
            createdAt: {
              gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // U zadnja 7 dana
            }
          }
        });

        if (!recentNotification) {
          await sendInactivityReminderEmail(user, daysInactive);
          
          // Kreiraj in-app notifikaciju
          await prisma.notification.create({
            data: {
              title: `Niste bili aktivni ${daysInactive} dana`,
              message: `Niste bili aktivni na Uslugar platformi već ${daysInactive} dana. Vratite se i pronađite nove prilike!`,
              type: 'SYSTEM',
              userId: user.id
            }
          });
          
          remindersSent++;
          console.log(`📧 Inactivity reminder sent to ${user.email} (${daysInactive} days inactive)`);
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`[INACTIVITY] Error processing user ${user.id}:`, error);
        skippedCount++;
      }
    }

    console.log(`📧 Checked inactive users: ${remindersSent} reminders sent, ${skippedCount} skipped`);
    return { 
      checked: inactiveUsers.length,
      remindersSent,
      skipped: skippedCount
    };
  } catch (error) {
    console.error('Error checking inactive users:', error);
    throw error;
  }
}

