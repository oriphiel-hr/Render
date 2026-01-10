// Feature Ownership Service - Automatska provjera postojećih funkcionalnosti
import { prisma } from '../lib/prisma.js';

/**
 * Provjerava vlasništvo funkcionalnosti za određenu tvrtku
 * @param {String} userId - ID direktora (vlasnika tvrtke)
 * @param {Array<String>} featureKeys - Lista feature key-ova za provjeru
 * @returns {Object} - Objekt s owned i missing feature keys
 */
export async function checkOwnership(userId, featureKeys) {
  if (!featureKeys || featureKeys.length === 0) {
    return { owned: [], missing: [] };
  }

  const ownerships = await prisma.companyFeatureOwnership.findMany({
    where: {
      userId,
      featureKey: { in: featureKeys }
    },
    select: {
      featureKey: true
    }
  });

  const ownedKeys = ownerships.map(o => o.featureKey);
  const missingKeys = featureKeys.filter(key => !ownedKeys.includes(key));

  return {
    owned: ownedKeys,
    missing: missingKeys
  };
}

/**
 * Vraća listu svih funkcionalnosti u vlasništvu tvrtke
 * @param {String} userId - ID direktora (vlasnika tvrtke)
 * @returns {Array} - Lista feature ownership objekata
 */
export async function getOwnedFeatures(userId) {
  const ownerships = await prisma.companyFeatureOwnership.findMany({
    where: { userId },
    include: {
      feature: {
        select: {
          featureKey: true,
          name: true,
          description: true,
          category: true,
          price: true
        }
      }
    },
    orderBy: {
      grantedAt: 'desc'
    }
  });

  return ownerships.map(o => ({
    featureKey: o.featureKey,
    name: o.feature.name,
    description: o.feature.description,
    category: o.feature.category,
    price: o.feature.price,
    grantedAt: o.grantedAt,
    source: o.source,
    notes: o.notes
  }));
}

/**
 * Uspoređuje tražene funkcionalnosti s već otkupljenima i izračunava doplatu
 * @param {String} userId - ID direktora (vlasnika tvrtke)
 * @param {Array<String>} requestedFeatures - Lista traženih feature key-ova
 * @param {Object} featurePrices - Objekt s cijenama po feature key-u (opcionalno)
 * @returns {Object} - Objekt s owned, missing, deltaPrice
 */
export async function determineDelta(userId, requestedFeatures, featurePrices = {}) {
  const { owned, missing } = await checkOwnership(userId, requestedFeatures);

  // Izračunaj cijenu za nove funkcionalnosti
  let deltaPrice = 0;
  if (featurePrices && Object.keys(featurePrices).length > 0) {
    deltaPrice = missing.reduce((total, key) => {
      return total + (featurePrices[key] || 0);
    }, 0);
  }

  return {
    owned,
    missing,
    deltaPrice,
    totalRequested: requestedFeatures.length,
    alreadyOwned: owned.length,
    newFeatures: missing.length
  };
}

/**
 * Dodjeljuje funkcionalnost tvrtki nakon uspješnog plaćanja
 * @param {String} userId - ID direktora (vlasnika tvrtke)
 * @param {String} featureKey - Feature key koji se dodjeljuje
 * @param {Object} options - Opcije za dodjelu
 * @param {String} options.grantedBy - ID admina koji dodjeljuje (opcionalno)
 * @param {String} options.source - Izvor dodjele (npr. "PREMIUM_PLAN", "ADDON_REGION")
 * @param {String} options.notes - Bilješke
 * @returns {Object} - Kreirani ownership objekt
 */
export async function grantFeature(userId, featureKey, options = {}) {
  const { grantedBy = null, source = null, notes = null } = options;

  // Provjeri da li feature postoji u katalogu
  const feature = await prisma.featureCatalog.findUnique({
    where: { featureKey }
  });

  if (!feature) {
    throw new Error(`Feature '${featureKey}' ne postoji u katalogu`);
  }

  // Provjeri da li tvrtka već posjeduje ovu funkcionalnost
  const existing = await prisma.companyFeatureOwnership.findUnique({
    where: {
      userId_featureKey: {
        userId,
        featureKey
      }
    }
  });

  if (existing) {
    // Ažuriraj postojeći ownership
    const updated = await prisma.companyFeatureOwnership.update({
      where: { id: existing.id },
      data: {
        grantedAt: new Date(),
        grantedBy,
        source,
        notes
      },
      include: {
        feature: true
      }
    });

    // Dodaj u povijest
    await prisma.featureOwnershipHistory.create({
      data: {
        ownershipId: updated.id,
        action: 'RENEWED',
        occurredAt: new Date(),
        actor: grantedBy,
        reason: 'Feature renewed',
        metadata: { source, notes }
      }
    });

    return updated;
  }

  // Kreiraj novi ownership
  const ownership = await prisma.companyFeatureOwnership.create({
    data: {
      userId,
      featureKey,
      grantedBy,
      source,
      notes
    },
    include: {
      feature: true
    }
  });

  // Dodaj u povijest
  await prisma.featureOwnershipHistory.create({
    data: {
      ownershipId: ownership.id,
      action: 'GRANTED',
      occurredAt: new Date(),
      actor: grantedBy,
      reason: 'Feature granted',
      metadata: { source, notes }
    }
  });

  return ownership;
}

/**
 * Dodjeljuje više funkcionalnosti odjednom
 * @param {String} userId - ID direktora (vlasnika tvrtke)
 * @param {Array<String>} featureKeys - Lista feature key-ova
 * @param {Object} options - Opcije za dodjelu
 * @returns {Array} - Lista kreiranih ownership objekata
 */
export async function grantFeatures(userId, featureKeys, options = {}) {
  const results = [];

  for (const featureKey of featureKeys) {
    try {
      const ownership = await grantFeature(userId, featureKey, options);
      results.push(ownership);
    } catch (error) {
      console.error(`[FEATURE-OWNERSHIP] Greška pri dodjeli feature '${featureKey}':`, error.message);
      // Nastavi s ostalim feature-ima
    }
  }

  return results;
}

/**
 * Oduzima funkcionalnost tvrtki
 * @param {String} userId - ID direktora (vlasnika tvrtke)
 * @param {String} featureKey - Feature key koji se oduzima
 * @param {String} reason - Razlog oduzimanja
 * @param {String} actorId - ID korisnika/admina koji oduzima
 * @returns {Object} - Obrisani ownership objekt
 */
export async function revokeFeature(userId, featureKey, reason, actorId) {
  const ownership = await prisma.companyFeatureOwnership.findUnique({
    where: {
      userId_featureKey: {
        userId,
        featureKey
      }
    }
  });

  if (!ownership) {
    throw new Error(`Tvrtka ne posjeduje feature '${featureKey}'`);
  }

  // Dodaj u povijest prije brisanja
  await prisma.featureOwnershipHistory.create({
    data: {
      ownershipId: ownership.id,
      action: 'REVOKED',
      occurredAt: new Date(),
      actor: actorId,
      reason,
      metadata: { featureKey }
    }
  });

  // Obriši ownership
  await prisma.companyFeatureOwnership.delete({
    where: { id: ownership.id }
  });

  return ownership;
}

/**
 * Provjerava da li tvrtka posjeduje određenu funkcionalnost
 * @param {String} userId - ID direktora (vlasnika tvrtke)
 * @param {String} featureKey - Feature key za provjeru
 * @returns {Boolean} - true ako posjeduje, false ako ne
 */
export async function hasFeature(userId, featureKey) {
  const ownership = await prisma.companyFeatureOwnership.findUnique({
    where: {
      userId_featureKey: {
        userId,
        featureKey
      }
    }
  });

  return !!ownership;
}

/**
 * Vraća katalog svih dostupnih funkcionalnosti s owned statusom
 * @param {String} userId - ID direktora (vlasnika tvrtke)
 * @returns {Array} - Lista feature objekata s owned statusom
 */
export async function getAvailableFeatures(userId) {
  const [features, ownedFeatures] = await Promise.all([
    prisma.featureCatalog.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    }),
    prisma.companyFeatureOwnership.findMany({
      where: { userId },
      select: { featureKey: true }
    })
  ]);

  const ownedKeys = new Set(ownedFeatures.map(o => o.featureKey));

  return features.map(feature => ({
    ...feature,
    owned: ownedKeys.has(feature.featureKey)
  }));
}

