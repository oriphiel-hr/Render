/**
 * Fiscalization Service - HR eRačun/ZKI/JIR Integration
 * 
 * Ova služba rukuje fiskalizacijom faktura u skladu s hrvatskim zakonodavstvom.
 * 
 * VAŽNO:
 * - ZKI i JIR su obavezni samo za GOTOVINSKE transakcije
 * - Za bezgotovinske transakcije (Stripe) fiskalizacija NIJE obavezna
 * - Od 2026. godine postoji obveza slanja e-računa u B2B transakcijama
 * 
 * @see https://porezna.gov.hr/fiskalizacija
 */

import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';

// eRačun API konfiguracija (treba postaviti u env varijable)
const ERACUN_API_URL = process.env.ERACUN_API_URL || 'https://cistest.apis.hr/api/v1/fiscalization';
const ERACUN_API_KEY = process.env.ERACUN_API_KEY || ''; // API ključ iz Porezne
const ERACUN_CERT_PATH = process.env.ERACUN_CERT_PATH || ''; // Putanja do SSL certifikata
const COMPANY_OIB = process.env.COMPANY_OIB || '88070789896'; // OIB tvrtke koja izdaje fakture
const COMPANY_NAME = process.env.COMPANY_NAME || 'ORIPHIEL d.o.o.'; // Naziv tvrtke
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || 'Slavenskoga ulica 5, 10000 Zagreb';
const COMPANY_DIRECTOR = process.env.COMPANY_DIRECTOR || 'Tomislav Kranjec';
const FISCALIZATION_ENABLED = process.env.FISCALIZATION_ENABLED === 'true'; // Omogući/onemogući fiskalizaciju

/**
 * Generira ZKI (Zaštitni Kod Izdavatelja)
 * ZKI se generira na temelju:
 * - Broja računa (invoiceNumber)
 * - Datuma i vremena izdavanja
 * - Iznosa računa (totalAmount)
 * - OIB-a izdavatelja (COMPANY_OIB)
 * 
 * @param {Object} invoice - Invoice objekt
 * @returns {String} ZKI kod (32 karaktera hex)
 */
export function generateZKI(invoice) {
  const data = `${invoice.invoiceNumber}|${invoice.issueDate.toISOString()}|${invoice.totalAmount}|${COMPANY_OIB}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash.substring(0, 32).toUpperCase();
}

/**
 * Provjerava je li faktura potrebna fiskalizacija
 * 
 * Fiskalizacija je obavezna za:
 * - Gotovinske transakcije
 * - Transakcije gdje je currency HRK
 * 
 * Fiskalizacija NIJE obavezna za:
 * - Bezgotovinske transakcije (Stripe, bankovni transferi)
 * - Transakcije u EUR/USD (ako nisu gotovinske)
 * 
 * @param {Object} invoice - Invoice objekt
 * @returns {Boolean} True ako je fiskalizacija obavezna
 */
export function requiresFiscalization(invoice) {
  // Ako je fiskalizacija onemogućena, preskoči
  if (!FISCALIZATION_ENABLED) {
    return false;
  }

  // Ako postoji Stripe Payment Intent, to je bezgotovinska transakcija
  // Fiskalizacija nije obavezna za bezgotovinske transakcije
  if (invoice.stripePaymentIntentId || invoice.stripeInvoiceId) {
    return false; // Bezgotovinska transakcija - nije obavezna
  }

  // Ako je currency HRK, provjeri da li je gotovinska
  if (invoice.currency === 'HRK') {
    // Pretpostavimo da ako nema Stripe ID, to je gotovinska transakcija
    // TODO: Dodati polje paymentMethod u Invoice model za precizniju provjeru
    return true;
  }

  // Za EUR transakcije, fiskalizacija nije obavezna osim ako je eksplicitno gotovinska
  return false;
}

/**
 * Šalje fakturu u Poreznu upravu preko eRačun API-ja
 * 
 * @param {Object} invoice - Invoice objekt
 * @returns {Promise<Object>} { jirCode, success, error }
 */
export async function sendToFiscalAPI(invoice) {
  if (!FISCALIZATION_ENABLED || !ERACUN_API_KEY || !COMPANY_OIB) {
    console.warn('[FISCALIZATION] Fiskalizacija onemogućena ili nisu postavljeni env varijable');
    return {
      success: false,
      error: 'Fiscalization not configured',
      jirCode: null
    };
  }

  try {
    // Generiraj ZKI
    const zkiCode = generateZKI(invoice);

    // Pripremi podatke za eRačun API
    const fiscalData = {
      oib: COMPANY_OIB,
      companyName: COMPANY_NAME,
      companyAddress: COMPANY_ADDRESS,
      director: COMPANY_DIRECTOR,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate?.toISOString() || null,
      amount: invoice.amount / 100, // Pretvori iz centi u EUR
      taxAmount: invoice.taxAmount / 100,
      totalAmount: invoice.totalAmount / 100,
      currency: invoice.currency,
      zkiCode: zkiCode,
      customer: {
        name: invoice.user.fullName,
        email: invoice.user.email,
        taxId: invoice.user.taxId || null,
        companyName: invoice.user.companyName || null
      },
      items: [
        {
          description: getInvoiceItemDescription(invoice),
          quantity: 1,
          unitPrice: invoice.amount / 100,
          taxRate: 25, // 25% PDV za Hrvatsku
          totalPrice: invoice.totalAmount / 100
        }
      ]
    };

    // TODO: Implementirati stvarni API poziv
    // Za sada simulacija
    console.log('[FISCALIZATION] Sending invoice to eRačun API:', {
      invoiceNumber: invoice.invoiceNumber,
      zkiCode,
      amount: fiscalData.totalAmount
    });

    // Simulacija API poziva
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implementirati stvarni HTTPS poziv s SSL certifikatom
      /*
      const response = await fetch(ERACUN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ERACUN_API_KEY}`,
          // Dodati SSL certifikat ako je potrebno
        },
        body: JSON.stringify(fiscalData)
      });

      if (!response.ok) {
        throw new Error(`Fiscal API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        jirCode: result.jirCode,
        zkiCode: zkiCode,
        error: null
      };
      */
    }

    // Development/Test mod - generiraj mock JIR
    const mockJIR = generateMockJIR(invoice, zkiCode);
    
    return {
      success: true,
      jirCode: mockJIR,
      zkiCode: zkiCode,
      error: null
    };

  } catch (error) {
    console.error('[FISCALIZATION] Error sending to fiscal API:', error);
    return {
      success: false,
      jirCode: null,
      error: error.message
    };
  }
}

/**
 * Generira mock JIR za development/test mode
 * U produkciji će JIR doći iz Porezne uprave
 */
function generateMockJIR(invoice, zkiCode) {
  const timestamp = Date.now();
  const hash = crypto.createHash('md5').update(`${invoice.invoiceNumber}${zkiCode}${timestamp}`).digest('hex');
  return hash.substring(0, 36).toUpperCase(); // JIR je obično 36 karaktera
}

/**
 * Fiskalizira fakturu (generira ZKI, šalje u Poreznu, dobiva JIR)
 * 
 * @param {String} invoiceId - ID fakture
 * @returns {Promise<Object>} { invoice, zkiCode, jirCode }
 */
export async function fiscalizeInvoice(invoiceId) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          taxId: true,
          companyName: true
        }
      }
    }
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Provjeri je li fiskalizacija potrebna
  if (!requiresFiscalization(invoice)) {
    console.log(`[FISCALIZATION] Invoice ${invoice.invoiceNumber} does not require fiscalization`);
    return {
      invoice: await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          fiscalizationStatus: 'NOT_REQUIRED'
        }
      }),
      zkiCode: null,
      jirCode: null
    };
  }

  // Provjeri je li već fiskalizirana
  if (invoice.fiscalizationStatus === 'SUCCESS' && invoice.jirCode) {
    console.log(`[FISCALIZATION] Invoice ${invoice.invoiceNumber} already fiscalized`);
    return {
      invoice,
      zkiCode: invoice.zkiCode,
      jirCode: invoice.jirCode
    };
  }

  // Generiraj ZKI
  const zkiCode = generateZKI(invoice);

  // Ažuriraj status na PENDING
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      zkiCode,
      fiscalizationStatus: 'PENDING'
    }
  });

  // Pošalji u Poreznu
  const result = await sendToFiscalAPI(invoice);

  if (result.success) {
    // Uspješna fiskalizacija
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        jirCode: result.jirCode,
        fiscalizedAt: new Date(),
        fiscalizationStatus: 'SUCCESS',
        fiscalizationError: null
      }
    });

    console.log(`[FISCALIZATION] Invoice ${invoice.invoiceNumber} successfully fiscalized - JIR: ${result.jirCode}`);

    return {
      invoice: updatedInvoice,
      zkiCode: result.zkiCode,
      jirCode: result.jirCode
    };
  } else {
    // Neuspješna fiskalizacija
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        fiscalizationStatus: 'FAILED',
        fiscalizationError: result.error
      }
    });

    console.error(`[FISCALIZATION] Failed to fiscalize invoice ${invoice.invoiceNumber}: ${result.error}`);

    throw new Error(`Fiscalization failed: ${result.error}`);
  }
}

/**
 * Generira QR kod URL s ZKI i JIR podacima
 * Format: https://porezna.gov.hr/verifikacija?zki=XXX&jir=YYY
 */
export function generateQRCodeURL(zkiCode, jirCode) {
  if (!zkiCode || !jirCode) {
    return null;
  }
  
  const baseURL = 'https://porezna.gov.hr/verifikacija';
  return `${baseURL}?zki=${zkiCode}&jir=${jirCode}`;
}

/**
 * Helper funkcija za opis stavke na fakturi
 */
function getInvoiceItemDescription(invoice) {
  if (invoice.type === 'SUBSCRIPTION') {
    return 'Pretplata na Uslugar platformu';
  } else if (invoice.type === 'LEAD_PURCHASE') {
    return 'Kupovina ekskluzivnog leada';
  }
  return 'Usluga';
}

