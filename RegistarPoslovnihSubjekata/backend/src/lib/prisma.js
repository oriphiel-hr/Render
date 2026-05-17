const { PrismaClient } = require('@prisma/client');

/** @type {PrismaClient | null} */
let prisma = null;

function isDatabaseConfigured() {
  return Boolean(String(process.env.DATABASE_URL || '').trim());
}

function getPrisma() {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL nije postavljen — baza nije dostupna.');
  }
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

module.exports = { getPrisma, isDatabaseConfigured, disconnectPrisma };
