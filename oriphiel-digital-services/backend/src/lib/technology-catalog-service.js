import { industryCostScenarios, technologyCatalogBase } from './technology-catalog.js';

let lastSyncAt = null;
const verificationState = new Map();

function withTimeout(ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timeout) };
}

async function verifySource(url) {
  const startedAt = Date.now();
  const { signal, clear } = withTimeout(6000);
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal });
    clear();
    return {
      ok: response.ok,
      httpStatus: response.status,
      responseTimeMs: Date.now() - startedAt
    };
  } catch (_error) {
    clear();
    return {
      ok: false,
      httpStatus: null,
      responseTimeMs: Date.now() - startedAt
    };
  }
}

export async function refreshTechnologyCatalog() {
  const nowIso = new Date().toISOString();

  await Promise.all(
    technologyCatalogBase.map(async (item) => {
      const result = await verifySource(item.sourceUrl);
      verificationState.set(item.id, {
        lastVerifiedAt: nowIso,
        sourceOk: result.ok,
        sourceHttpStatus: result.httpStatus,
        sourceResponseTimeMs: result.responseTimeMs
      });
    })
  );

  lastSyncAt = nowIso;
  return getTechnologyCatalogSnapshot();
}

export function getTechnologyCatalogSnapshot() {
  const items = technologyCatalogBase.map((item) => {
    const state = verificationState.get(item.id) || {};
    return {
      ...item,
      lastVerifiedAt: state.lastVerifiedAt || null,
      sourceOk: state.sourceOk ?? null,
      sourceHttpStatus: state.sourceHttpStatus ?? null,
      sourceResponseTimeMs: state.sourceResponseTimeMs ?? null
    };
  });

  return {
    lastSyncAt,
    items,
    scenarios: industryCostScenarios
  };
}

