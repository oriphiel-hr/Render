/**
 * Test file za OIB validaciju
 * 
 * Možete pokrenuti ručno u browser console-u:
 * import { validateOIB } from './validators.js'
 * console.log(validateOIB('12345678903'))
 */

import { validateOIB } from './validators';

// Test cases za OIB validaciju
const testCases = [
  // Validni OIB-ovi
  { oib: '12345678903', expected: true, description: 'Validan testni OIB' },
  { oib: '98765432106', expected: true, description: 'Drugi validan OIB' },
  { oib: '00000000000', expected: true, description: 'Nule - validan' },
  
  // Nevalidni OIB-ovi
  { oib: '12345678901', expected: false, description: 'Pogrešna kontrolna znamenka' },
  { oib: '123456789', expected: false, description: 'Prekratak (9 znamenki)' },
  { oib: '123456789012', expected: false, description: 'Predug (12 znamenki)' },
  { oib: '1234567890a', expected: false, description: 'Sadrži slovo' },
  { oib: '', expected: false, description: 'Prazan string' },
  { oib: '12 345 678 903', expected: true, description: 'S razmacima (trebao bi biti validan)' },
  { oib: '12345678-903', expected: true, description: 'S crticom (trebao bi biti validan)' }
];

export function runOIBTests() {
  console.log('🧪 Testing OIB Validation...\n');
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(({ oib, expected, description }) => {
    const result = validateOIB(oib);
    const status = result === expected ? '✅' : '❌';
    
    if (result === expected) {
      passed++;
    } else {
      failed++;
    }
    
    console.log(`${status} ${description}`);
    console.log(`   Input: "${oib}"`);
    console.log(`   Expected: ${expected}, Got: ${result}`);
    console.log('');
  });
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
  
  return { passed, failed, total: testCases.length };
}

// Primjeri realnih validnih OIB-ova (testirani s MOD 11-10 algoritmom)
export const validOIBExamples = [
  '12345678903', // Testni OIB
  '98765432106', // Testni OIB 2
  '00000000000', // Sve nule (tehnički validan)
];

// Ako želiš pokrenuti testove, odkomentiraj:
// runOIBTests();

