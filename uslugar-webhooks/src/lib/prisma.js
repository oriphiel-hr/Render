require('./prismaEnvBootstrap');

const { PrismaClient } = require('@prisma/client');
const { metaEnvPrefix } = require('./metaEnv');
const { normalizeRenderDatabaseUrl } = require('./databaseUrl');

const logLevel =
  process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'];

const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log: logLevel
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

/** @type {Map<string, import('@prisma/client').PrismaClient>} */
const prismaByProfile = new Map();

/**
 * Zadana baza (DATABASE_URL u schema.prisma). Za profil: META_<PROFIL>_DATABASE_URL ako je postavljen, inače fallback na zadanu.
 *
 * @param {string | undefined} profile npr. instant-game iz META_WEBHOOK_PROFILES
 */
function getPrismaForProfile(profile) {
  if (!profile) return prisma;
  const rawUrl = process.env[`${metaEnvPrefix(profile)}_DATABASE_URL`];
  if (!rawUrl) return prisma;
  const url = normalizeRenderDatabaseUrl(rawUrl) || rawUrl;
  let client = prismaByProfile.get(profile);
  if (!client) {
    client = new PrismaClient({
      datasources: { db: { url } },
      log: logLevel
    });
    prismaByProfile.set(profile, client);
  }
  return client;
}

module.exports = { prisma, getPrismaForProfile };
