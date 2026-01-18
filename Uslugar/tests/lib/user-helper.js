/**
 * Helper funkcije za odabir korisnika iz test-data.json
 */

/**
 * Pronađi korisnika prema tipu i strategiji
 * @param {Object} testData - test-data.json objekt
 * @param {string} userType - Tip korisnika ('client', 'provider', 'admin', 'providerCompany')
 * @param {Object} options - Opcije za odabir
 * @param {string} options.strategy - Strategija odabira: 'first' (default), 'specific' (zahtijeva index), 'random'
 * @param {number} options.index - Index korisnika ako je strategy='specific' (0 = glavni, 1 = client1, 2 = client2, itd.)
 * @param {boolean} options.preferMain - Preferiraj glavnog korisnika (client, provider, admin) ako postoji
 * @returns {Object|null} Korisnik objekt ili null ako nije pronađen
 */
export function getUser(testData, userType, options = {}) {
  const {
    strategy = 'first',
    index = null,
    preferMain = true
  } = options;

  if (!testData || !testData.users) {
    console.warn(`[USER HELPER] testData.users ne postoji`);
    return null;
  }

  // Ako strategija je 'specific' i preferMain je true, prvo provjeri glavnog korisnika
  if (strategy === 'specific' && preferMain && index === 0) {
    const mainUser = testData.users[userType];
    if (mainUser && mainUser.email) {
      console.log(`[USER HELPER] Using main user: ${userType}`);
      return mainUser;
    }
  }

  // Pronađi sve korisnike određenog tipa
  const matchingUsers = [];
  
  // Dodaj glavnog korisnika ako postoji (client, provider, admin, providerCompany)
  if (preferMain && testData.users[userType]) {
    matchingUsers.push({ key: userType, user: testData.users[userType], index: 0 });
  }
  
  // Dodaj edge case korisnike odmah nakon osnovnog
  const edgeCaseUsers = [];
  if (userType === 'client' && testData.users['clientInvalid']) {
    edgeCaseUsers.push({ key: 'clientInvalid', user: testData.users['clientInvalid'], index: 1 });
  }
  if (userType === 'provider') {
    if (testData.users['providerNoLicense']) {
      edgeCaseUsers.push({ key: 'providerNoLicense', user: testData.users['providerNoLicense'], index: 1 });
    }
    if (testData.users['providerNoKYC']) {
      edgeCaseUsers.push({ key: 'providerNoKYC', user: testData.users['providerNoKYC'], index: 2 });
    }
    if (testData.users['providerDirector']) {
      edgeCaseUsers.push({ key: 'providerDirector', user: testData.users['providerDirector'], index: 3 });
    }
    if (testData.users['providerTeamMember']) {
      edgeCaseUsers.push({ key: 'providerTeamMember', user: testData.users['providerTeamMember'], index: 4 });
    }
  }
  
  // Pronađi numerirane korisnike (client1, client2, provider1, provider2, itd.)
  const userKeys = Object.keys(testData.users);
  const numberedUsers = userKeys
    .filter(key => {
      if (key === userType) return false; // Već dodan
      if (key === 'providerCompany' && userType === 'provider') return false; // providerCompany je poseban tip
      if (key === 'clientInvalid' && userType === 'client') return false; // Već dodan kao edge case
      if (key === 'providerNoLicense' && userType === 'provider') return false; // Već dodan kao edge case
      if (key === 'providerNoKYC' && userType === 'provider') return false; // Već dodan kao edge case
      
      // Provjeri da li key počinje s userType i ima broj (npr. client1, client2)
      const pattern = new RegExp(`^${userType}\\d+$`);
      return pattern.test(key);
    })
    .sort((a, b) => {
      // Sortiraj po broju: client1, client2, client3, ...
      const numA = parseInt(a.match(/\d+/)?.[0] || '999');
      const numB = parseInt(b.match(/\d+/)?.[0] || '999');
      return numA - numB;
    })
    .map((key, idx) => ({
      key,
      user: testData.users[key],
      index: preferMain ? idx + 1 + edgeCaseUsers.length : idx + edgeCaseUsers.length // Index 0 je rezerviran za glavnog korisnika, zatim edge case korisnici
    }));

  // Dodaj edge case korisnike prije numeriranih
  matchingUsers.push(...edgeCaseUsers);
  matchingUsers.push(...numberedUsers);

  if (matchingUsers.length === 0) {
    console.warn(`[USER HELPER] Nema pronađenih korisnika tipa: ${userType}`);
    return null;
  }

  console.log(`[USER HELPER] Pronađeno ${matchingUsers.length} korisnika tipa ${userType}:`, 
    matchingUsers.map(u => `${u.key} (index ${u.index})`).join(', '));

  // Odaberi korisnika prema strategiji
  let selectedUser = null;

  switch (strategy) {
    case 'first':
      // Vrati prvog dostupnog korisnika
      selectedUser = matchingUsers[0];
      console.log(`[USER HELPER] Using first user: ${selectedUser.key}`);
      break;

    case 'specific':
      // Vrati korisnika na određenom indexu
      if (index === null || index === undefined) {
        console.warn(`[USER HELPER] Strategy 'specific' zahtijeva index. Koristim 'first' umjesto toga.`);
        selectedUser = matchingUsers[0];
      } else {
        selectedUser = matchingUsers.find(u => u.index === index);
        if (!selectedUser) {
          console.warn(`[USER HELPER] Korisnik na indexu ${index} ne postoji. Koristim 'first' umjesto toga.`);
          selectedUser = matchingUsers[0];
        } else {
          console.log(`[USER HELPER] Using specific user at index ${index}: ${selectedUser.key}`);
        }
      }
      break;

    case 'random':
      // Vrati nasumičnog korisnika
      const randomIndex = Math.floor(Math.random() * matchingUsers.length);
      selectedUser = matchingUsers[randomIndex];
      console.log(`[USER HELPER] Using random user: ${selectedUser.key}`);
      break;

    default:
      console.warn(`[USER HELPER] Nepoznata strategija: ${strategy}. Koristim 'first' umjesto toga.`);
      selectedUser = matchingUsers[0];
  }

  if (!selectedUser || !selectedUser.user) {
    console.error(`[USER HELPER] Odabrani korisnik je null ili undefined`);
    return null;
  }

  // Validiraj da korisnik ima osnovne podatke
  if (!selectedUser.user.email) {
    console.warn(`[USER HELPER] Korisnik ${selectedUser.key} nema email adresu`);
    return null;
  }

  return selectedUser.user;
}

/**
 * Pronađi više korisnika određenog tipa
 * @param {Object} testData - test-data.json objekt
 * @param {string} userType - Tip korisnika
 * @param {number} count - Broj korisnika koji treba pronaći
 * @returns {Array<Object>} Niz korisnika
 */
export function getUsers(testData, userType, count = 1) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = getUser(testData, userType, { strategy: 'specific', index: i });
    if (user) {
      users.push(user);
    }
  }
  return users;
}

/**
 * Pronađi korisnika po email adresi
 * @param {Object} testData - test-data.json objekt
 * @param {string} email - Email adresa
 * @returns {Object|null} Korisnik objekt ili null
 */
export function getUserByEmail(testData, email) {
  if (!testData || !testData.users) {
    return null;
  }

  const userKeys = Object.keys(testData.users);
  for (const key of userKeys) {
    const user = testData.users[key];
    if (user && user.email === email) {
      console.log(`[USER HELPER] Pronađen korisnik po emailu: ${key}`);
      return user;
    }
  }

  console.warn(`[USER HELPER] Korisnik s emailom ${email} nije pronađen`);
  return null;
}

