/**
 * Cijena leada: fiksni iznos + postotak vrijednosti posla (prema budžetu u oglasu).
 * Jedan model – transparentno prije kupnje.
 * Konfiguracija preko env varijabli (opcionalno).
 */

const LEAD_PRICE_FIXED_EUR = Number(process.env.LEAD_PRICE_FIXED_EUR) || 4;
const LEAD_PRICE_PERCENT = Number(process.env.LEAD_PRICE_PERCENT) || 2;
const DEFAULT_JOB_VALUE_EUR = Number(process.env.DEFAULT_JOB_VALUE_EUR) || 500;
/** 1 kredit = ovoliko EUR (za pretvorbu ukupne naknade u kredite) */
const CREDIT_VALUE_EUR = Number(process.env.CREDIT_VALUE_EUR) || 10;
/** Maksimalna naknada po leadu u EUR (cap); 0 = bez capa */
const LEAD_PRICE_MAX_EUR = Number(process.env.LEAD_PRICE_MAX_EUR) || 0;
/** Minimalna naknada u kreditima (min 1) */
const LEAD_PRICE_MIN_CREDITS = Math.max(1, Math.floor(LEAD_PRICE_FIXED_EUR / CREDIT_VALUE_EUR));

/**
 * Vrijednost posla u EUR iz budžeta (za postotak).
 * Koristi prosjek min–max ako su oba, inače max, min ili default.
 */
function getJobValueEUR(job) {
  const min = job?.budgetMin != null ? Number(job.budgetMin) : null;
  const max = job?.budgetMax != null ? Number(job.budgetMax) : null;
  if (min != null && max != null) {
    return Math.round((min + max) / 2);
  }
  if (max != null) return max;
  if (min != null) return min;
  return DEFAULT_JOB_VALUE_EUR;
}

/**
 * Izračunaj cijenu leada za posao (fiksno + postotak).
 * @param {Object} job - Job s budgetMin, budgetMax (opcionalno)
 * @returns {{ leadPriceCredits: number, fixedEUR: number, percentEUR: number, jobValueEUR: number, totalEUR: number, percent: number }}
 */
export function getLeadPriceForJob(job) {
  const jobValueEUR = getJobValueEUR(job);
  const fixedEUR = LEAD_PRICE_FIXED_EUR;
  const percent = LEAD_PRICE_PERCENT;
  let percentEUR = Math.round((jobValueEUR * percent / 100) * 100) / 100;
  let totalEUR = fixedEUR + percentEUR;
  if (LEAD_PRICE_MAX_EUR > 0 && totalEUR > LEAD_PRICE_MAX_EUR) {
    totalEUR = LEAD_PRICE_MAX_EUR;
    percentEUR = totalEUR - fixedEUR;
  }
  const leadPriceCredits = Math.max(
    LEAD_PRICE_MIN_CREDITS,
    Math.round(totalEUR / CREDIT_VALUE_EUR)
  );
  return {
    leadPriceCredits,
    fixedEUR,
    percentEUR: Math.round(percentEUR * 100) / 100,
    jobValueEUR,
    totalEUR: Math.round(totalEUR * 100) / 100,
    percent
  };
}

/** Konfiguracija formule za prikaz na frontendu (npr. "4 EUR + 2% vrijednosti posla") */
export function getLeadPricingFormula() {
  return {
    fixedEUR: LEAD_PRICE_FIXED_EUR,
    percent: LEAD_PRICE_PERCENT,
    creditValueEUR: CREDIT_VALUE_EUR,
    defaultJobValueEUR: DEFAULT_JOB_VALUE_EUR,
    maxEUR: LEAD_PRICE_MAX_EUR || null
  };
}
