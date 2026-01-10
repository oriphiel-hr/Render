import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const r = Router();

/**
 * GET /api/public/user-types-overview
 * Općeniti pregled tipova korisnika - statistike bez osobnih podataka
 */
r.get('/user-types-overview', async (req, res, next) => {
  try {
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
          email: users.filter(u => u.providerProfile?.identityEmailVerified).length,
          phone: users.filter(u => u.providerProfile?.identityPhoneVerified).length,
          dns: users.filter(u => u.providerProfile?.identityDnsVerified).length,
          description: 'Korisnici s verificiranim identitetom (email/telefon/domena) - uključuje i pružatelje i tvrtke/obrte'
        },
        safety: {
          total: users.filter(u => u.providerProfile?.safetyInsuranceUrl).length,
          description: 'Korisnici s uploadanom policom osiguranja - uključuje i pružatelje i tvrtke/obrte'
        }
        // allBadges ne vraćamo u public endpoint - samo admin
      }
    });
  } catch (e) {
    next(e);
  }
});

export default r;

