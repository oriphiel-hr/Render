// Admin Documentation - Dokumentacija za administratore
import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext.jsx';
import api from '../api.js';

const AdminDocumentation = () => {
  const { isDarkMode } = useDarkMode();
  const [expandedItem, setExpandedItem] = useState(null); // Track which item is expanded
  const [adminFeatures, setAdminFeatures] = useState([]);
  const [publicFeatures, setPublicFeatures] = useState([]);
  const [featureDescriptions, setFeatureDescriptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Učitaj podatke iz baze - i admin i javne funkcionalnosti
  useEffect(() => {
    const loadAdminDocumentation = async () => {
      try {
        setLoading(true);
        const response = await api.get('/documentation/admin');
        setAdminFeatures(response.data.adminFeatures || []);
        setPublicFeatures(response.data.publicFeatures || []);
        setFeatureDescriptions(response.data.featureDescriptions || {});
        setError(null);
      } catch (err) {
        console.error('Error loading admin documentation:', err);
        setError('Greška pri učitavanju admin dokumentacije. Molimo pokušajte ponovo.');
        // Fallback na prazne podatke
        setAdminFeatures([]);
        setPublicFeatures([]);
        setFeatureDescriptions({});
      } finally {
        setLoading(false);
      }
    };

    loadAdminDocumentation();
  }, []);
  
  // Detaljni opisi funkcionalnosti - sada se učitavaju iz baze preko featureDescriptions state-a
  const _oldFeatureDescriptions = {
    "Upravljanje korisnicima": {
      implemented: true,
      summary: "Upravljanje korisnicima je implementirano.",
      details: `## Implementirano:

### 1. **Admin panel za korisnike**
   - Pregled svih korisnika platforme
   - Filtriranje i pretraživanje korisnika
   - Detalji korisnika (email, telefon, status, verifikacije)
   
### 2. **Upravljanje statusima**
   - Aktivacija/deaktivacija korisnika
   - Promjena uloga (USER, PROVIDER, ADMIN)
   - Reset lozinke od strane admina
   
### 3. **Verifikacije**
   - Pregled statusa verifikacija (email, telefon, ID, company)
   - Ručna verifikacija od strane admina
   - Reset pokušaja verifikacije

### 4. **Statistike korisnika**
   - Broj kreiranih poslova
   - Broj aktivnih pretplata
   - Kreditna bilanca
   - Trust score
`
    },
    "Upravljanje pružateljima": {
      implemented: true,
      summary: "Upravljanje pružateljima je implementirano.",
      details: `## Implementirano:

### 1. **Admin panel za pružatelje**
   - Pregled svih pružatelja usluga
   - Detalji profila (naziv, opis, kategorije)
   - Pregled licenci i certifikata
   
### 2. **Odobravanje pružatelja**
   - Approval status management
   - Aktivacija/deaktivacija profila
   - Featured profil postavke
   
### 3. **ROI statistike**
   - Pregled ROI metrika za svakog pružatelja
   - Conversion rate, revenue, profit
   - Benchmarking s drugim pružateljima
   
### 4. **Upravljanje licencama**
   - Verificiranje licenci
   - Praćenje isteka
   - Notifikacije o isteku licenci
`
    },
    "Statistike platforme": {
      implemented: true,
      summary: "Statistike platforme su implementirane.",
      details: `## Implementirano:

### 1. **Općenite statistike**
   - Ukupni korisnici (korisnici i pružatelji)
   - Ukupni poslovi i leadovi
   - Aktivne pretplate
   - Ukupan prihod platforme
   
### 2. **Mesečne statistike**
   - Trendovi kroz mjesece
   - Novi korisnici po mjesecima
   - Prihod po mjesecima
   - Konverzije i ROI po mjesecima
   
### 3. **Statistike po kategorijama**
   - Najpopularnije kategorije
   - Prihod po kategorijama
   - Konverzije po kategorijama
   
### 4. **Engagement metrike**
   - Aktivni korisnici
   - Broj recenzija
   - Chat aktivnost
   - Notifikacije i interakcije
   
### 5. **API i backend**
   - \`platform-stats-service.js\` - servis za statistike
   - \`/api/admin/platform-stats\` - endpoint za statistike
   - Automatsko ažuriranje statistika
   - Cache mehanizam za performanse
`
    },
    "Grafički prikaz statistika": {
      implemented: true,
      summary: "Grafički prikaz statistika je implementiran.",
      details: `## Implementirano:

### 1. **Instalirane biblioteke**
   - \`chart.js\` - glavna biblioteka za grafove
   - \`react-chartjs-2\` - React wrapper za Chart.js

### 2. **Grafičke komponente u ROI dashboardu**
   
   **Status Breakdown - Doughnut Chart:**
   - Vizualni prikaz statusa leadova (Konvertirani, Kontaktirani, Aktivni, Refundirani)
   - Krugovni graf s bojama za svaki status
   
   **Monthly Revenue & ROI - Line Chart:**
   - Prikaz prihoda i ROI-a kroz mjesece
   - Dvostruki Y-os (lijevo: EUR, desno: %)
   - Kombinirani trend prihoda i ROI-a
   
   **Monthly Leads - Bar Chart:**
   - Grupirani stupčasti graf
   - Kupljeno, Kontaktirano, Konvertirano po mjesecima
   - Boje za razlikovanje metrika
   
   **Conversion Rate - Line Chart:**
   - Trend stope konverzije kroz godinu
   - Linijski graf s ispunom
   
   **Category Revenue - Bar Chart:**
   - Prihod po kategorijama
   - Top 8 kategorija po prihodu
   - Boje za svaku kategoriju

### 3. **Funkcionalnosti**
   - Godišnji seletor: pregled trenutne, prošle ili prethodne godine
   - Dark mode: grafovi prilagođeni dark modu
   - Responzivni dizajn: prilagođeno različitim veličinama ekrana
   - Interaktivni tooltips: detalji pri hoveru
   - Tematske boje: konzistentne boje kroz grafove

### 4. **API integracija**
   - Dodan \`getYearlyReport()\` u \`exclusive.js\`
   - Automatsko učitavanje godišnjeg izvještaja
   - Dinamičko ažuriranje grafova pri promjeni godine

### 5. **Dizajn**
   - Grafovi prilagođeni dashboard temi
   - Spacing i layout optimizirani
   - Dark mode podrška za sve grafove
   - Profesionalni stil s legendama i osima

### 6. **Chart.js konfiguracija**
   - Registrirane sve potrebne komponente (Line, Bar, Doughnut)
   - Custom opcije za tooltips i legende
   - Multiple Y-axes za kombinirane metrike
   - Theme-aware boje (light/dark mode)

### 7. **Dokumentacija**
   - Ažuriran \`Documentation.jsx\` - "Grafički prikaz statistika" označeno kao implementirano

## Korisničko iskustvo:

- Interaktivni grafovi: hover za detalje
- Pregled trendova: linijski grafovi za trendove
- Usporedbe: bar chartovi za usporedbu
- Vizualna razgradnja: doughnut chart za status breakdown
- Dinamički prikaz: seletor godine za pregled različitih perioda

Sve promjene su commitane i pushane. Pružatelji usluga sada imaju grafički prikaz ROI statistika s interaktivnim grafovima koji olakšavaju analizu i donošenje odluka.
`
    },
    "Upravljanje kategorijama": {
      implemented: true,
      summary: "Upravljanje kategorijama je implementirano.",
      details: `## Implementirano:

### 1. **CRUD operacije**
   - Kreiranje novih kategorija
   - Ažuriranje postojećih kategorija
   - Brisanje kategorija
   - Pregled svih kategorija
   
### 2. **Hijerarhijska struktura**
   - Parent-child odnos kategorija
   - Podkategorije i glavne kategorije
   - Rekurzivno prikazivanje strukture
   
### 3. **Dodatna polja**
   - NKD kodovi djelatnosti
   - Opisi kategorija
   - Emoji ikone
   - Oznake za licencirane djelatnosti
   
### 4. **Upravljanje**
   - Aktivacija/deaktivacija kategorija
   - Display order (poredak prikaza)
   - Filtering i search
`
    }
  };

  // Admin features - sada se učitavaju iz baze preko features state-a
  const _oldAdminFeatures = [
    {
      category: "Upravljanje Korisnicima i Pružateljima",
      items: [
        { name: "Upravljanje korisnicima", implemented: true },
        { name: "Upravljanje pružateljima", implemented: true },
        { name: "Upravljanje kategorijama", implemented: true },
        { name: "Upravljanje pravnim statusima", implemented: true }
      ]
    },
    {
      category: "Upravljanje Sadržajem",
      items: [
        { name: "Upravljanje poslovima", implemented: true },
        { name: "Upravljanje ponudama", implemented: true },
        { name: "Admin upravljanje recenzijama", implemented: true },
        { name: "Upravljanje notifikacijama", implemented: true },
        { name: "Upravljanje chat sobama", implemented: true },
        { name: "Moderacija sadržaja", implemented: true }
      ]
    },
    {
      category: "Upravljanje Pretplatama i Transakcijama",
      items: [
        { name: "Upravljanje pretplatama", implemented: true },
        { name: "Upravljanje transakcijama kredita", implemented: true },
        { name: "Admin odobravanje refund-a", implemented: true },
        { name: "Admin upravljanje queue sustavom", implemented: true },
        { name: "Upravljanje ROI statistikama", implemented: true }
      ]
    },
    {
      category: "Verifikacije i Licence",
      items: [
        { name: "Upravljanje licencama", implemented: true },
        { name: "Verificiranje licenci od strane admina", implemented: true },
        { name: "Upravljanje verifikacijama klijenata", implemented: true },
        { name: "Dokumenti za verifikaciju", implemented: true },
        { name: "Admin reset SMS pokušaja", implemented: true }
      ]
    },
    {
      category: "Statistike i Analitika",
      items: [
        { name: "Statistike platforme", implemented: true },
        { name: "KYC Metrike", implemented: true },
        { name: "Provider Approvals", implemented: true }
      ]
    }
  ];

  const getStatusColor = (implemented, deprecated = false) => {
    if (deprecated) return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
    return implemented
      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600';
  };

  const getStatusText = (implemented, deprecated = false) => {
    if (deprecated) return '⚠️ NE KORISTI SE';
    return implemented ? '✓ Implementirano' : '✗ Nije implementirano';
  };

  const getImplementationStats = () => {
    const allFeatures = [...adminFeatures, ...publicFeatures];
    if (!allFeatures || allFeatures.length === 0) {
      return { totalItems: 0, implementedItems: 0, percentage: 0 };
    }
    const totalItems = allFeatures.reduce(
      (sum, category) => sum + category.items.length, 0
    );
    const implementedItems = allFeatures.reduce(
      (sum, category) => sum + category.items.filter(item => item.implemented).length, 0
    );
    const percentage = totalItems > 0 ? Math.round((implementedItems / totalItems) * 100) : 0;
    
    return { totalItems, implementedItems, percentage };
  };

  const stats = getImplementationStats();

  // Loading state
  if (loading) {
    return (
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isDarkMode ? 'dark' : ''}`}>
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Učitavanje admin dokumentacije...
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isDarkMode ? 'dark' : ''}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-2">Greška pri učitavanju dokumentacije</h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <p className="text-sm text-red-500 dark:text-red-400">
            Dokumentacija se učitava iz baze podataka. Provjeri da li je backend pokrenut i da li su podaci seedani.
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if ((!adminFeatures || adminFeatures.length === 0) && (!publicFeatures || publicFeatures.length === 0)) {
    return (
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isDarkMode ? 'dark' : ''}`}>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Nema dostupnih podataka</h2>
          <p className="text-yellow-600 dark:text-yellow-300 mb-4">
            Dokumentacija još nije dodana u bazu podataka.
          </p>
          <p className="text-sm text-yellow-500 dark:text-yellow-400">
            Pokreni seed dokumentacije: <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">npm run seed:documentation</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isDarkMode ? 'dark' : ''}`}>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🔐 Uslugar - Admin Dokumentacija
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          Kompletna lista svih admin funkcionalnosti platforme
        </p>
        
        {/* Statistike implementacije */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Status Implementacije</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.implementedItems}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Implementirane funkcionalnosti</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">{stats.totalItems - stats.implementedItems}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Nije implementirano</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.percentage}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Završeno</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin funkcionalnosti - PRVO */}
      {adminFeatures && adminFeatures.length > 0 && (
        <div className="mb-12">
          <div className="mb-6 pb-4 border-b-4 border-red-500 dark:border-red-600">
            <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 flex items-center gap-3">
              <span className="bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-lg">🔐 ADMIN</span>
              <span className="text-gray-600 dark:text-gray-400 text-xl">Funkcionalnosti</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Admin-only funkcionalnosti - dostupne samo administratorima platforme
            </p>
          </div>
          <div className="space-y-8">
            {adminFeatures.map((category, categoryIndex) => (
              <div 
                key={`admin-${categoryIndex}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-red-500"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {category.category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.items.map((item, itemIndex) => {
                    const itemKey = `admin-${categoryIndex}-${itemIndex}`;
                    const isExpanded = expandedItem === itemKey;
                    const description = featureDescriptions[item.name] || {
                      implemented: item.implemented,
                      summary: item.implemented ? `${item.name} je implementirano.` : `${item.name} nije implementirano.`,
                      details: item.implemented 
                        ? `## Implementirano:\n\n${item.name} je funkcionalnost koja je implementirana i dostupna u admin panelu.` 
                        : `## Nije implementirano:\n\n${item.name} je funkcionalnost koja trenutno nije implementirana.`
                    };

                    return (
                      <div
                        key={itemIndex}
                        className={`p-4 rounded-lg border-2 ${getStatusColor(item.implemented, item.deprecated)} transition-all`}
                      >
                        <div 
                          className="flex items-start justify-between cursor-pointer"
                          onClick={() => setExpandedItem(isExpanded ? null : itemKey)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-semibold mb-1 ${item.deprecated ? 'line-through' : ''}`}>
                                {item.name}
                              </h3>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {isExpanded ? '▼' : '▶'}
                              </span>
                            </div>
                            {description.summary && !isExpanded && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {description.summary}
                              </p>
                            )}
                          </div>
                          <span className="ml-2 text-sm font-medium">
                            {getStatusText(item.implemented, item.deprecated)}
                          </span>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600 space-y-6">
                            {/* Regular details */}
                            {description.details && (
                              <div className="prose dark:prose-invert max-w-none text-sm">
                                <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                                  {description.details.split('\n').map((line, idx) => {
                                    // Format markdown-style headers
                                    if (line.startsWith('## ')) {
                                      return (
                                        <h4 key={idx} className="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-white">
                                          {line.replace('## ', '')}
                                        </h4>
                                      );
                                    }
                                    if (line.startsWith('### ')) {
                                      return (
                                        <h5 key={idx} className="text-base font-semibold mt-3 mb-2 text-gray-800 dark:text-gray-200">
                                          {line.replace('### ', '')}
                                        </h5>
                                      );
                                    }
                                    // Format bullet points
                                    if (line.trim().startsWith('- ')) {
                                      return (
                                        <div key={idx} className="ml-4 mb-1 text-gray-700 dark:text-gray-300">
                                          • {line.trim().substring(2)}
                                        </div>
                                      );
                                    }
                                    // Format code blocks (inline)
                                    if (line.includes('`')) {
                                      const parts = line.split('`');
                                      return (
                                        <div key={idx} className="mb-2">
                                          {parts.map((part, partIdx) => 
                                            partIdx % 2 === 0 ? (
                                              <span key={partIdx}>{part}</span>
                                            ) : (
                                              <code key={partIdx} className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">
                                                {part}
                                              </code>
                                            )
                                          )}
                                        </div>
                                      );
                                    }
                                    // Regular paragraphs
                                    if (line.trim()) {
                                      return (
                                        <p key={idx} className="mb-2 text-gray-700 dark:text-gray-300">
                                          {line}
                                        </p>
                                      );
                                    }
                                    return <br key={idx} />;
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Technical Details - Only for admin */}
                            {description.technicalDetails && (
                              <div className="mt-6 pt-6 border-t-2 border-indigo-300 dark:border-indigo-700">
                                <h4 className="text-lg font-bold mb-3 text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                                  🔧 Tehnički Detalji
                                  <span className="text-xs font-normal bg-indigo-100 dark:bg-indigo-900 px-2 py-1 rounded">
                                    ADMIN ONLY
                                  </span>
                                </h4>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                                  <div className="prose dark:prose-invert max-w-none text-sm">
                                    <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                                      {description.technicalDetails.split('\n').map((line, idx) => {
                                        // Format markdown-style headers
                                        if (line.startsWith('## ')) {
                                          return (
                                            <h5 key={idx} className="text-base font-bold mt-3 mb-2 text-gray-900 dark:text-white">
                                              {line.replace('## ', '')}
                                            </h5>
                                          );
                                        }
                                        // Format markdown-style subheaders
                                        if (line.startsWith('### ')) {
                                          return (
                                            <h6 key={idx} className="text-sm font-semibold mt-2 mb-1 text-gray-800 dark:text-gray-200">
                                              {line.replace('### ', '')}
                                            </h6>
                                          );
                                        }
                                        // Format code blocks
                                        if (line.trim().startsWith('`') && line.trim().endsWith('`')) {
                                          return (
                                            <code key={idx} className="bg-indigo-100 dark:bg-indigo-900 px-2 py-1 rounded text-xs font-mono text-indigo-800 dark:text-indigo-200 block my-1">
                                              {line.replace(/`/g, '')}
                                            </code>
                                          );
                                        }
                                        // Format lists
                                        if (line.trim().startsWith('- ')) {
                                          return (
                                            <div key={idx} className="ml-4 mb-1 text-gray-700 dark:text-gray-300">
                                              • {line.trim().substring(2)}
                                            </div>
                                          );
                                        }
                                        // Regular paragraphs
                                        if (line.trim()) {
                                          return (
                                            <p key={idx} className="mb-2 text-gray-700 dark:text-gray-300">
                                              {line}
                                            </p>
                                          );
                                        }
                                        return <br key={idx} />;
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Javne funkcionalnosti - DRUGO */}
      {publicFeatures && publicFeatures.length > 0 && (
        <div className="mt-16">
          <div className="mb-6 pb-4 border-b-4 border-blue-500 dark:border-blue-600">
            <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-3">
              <span className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-lg">🌐 OPĆE</span>
              <span className="text-gray-600 dark:text-gray-400 text-xl">Funkcionalnosti</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Javne funkcionalnosti - dostupne svim korisnicima platforme (s prikazom tehničkih detalja za admin)
            </p>
          </div>
          <div className="space-y-8">
            {publicFeatures.map((category, categoryIndex) => (
              <div 
                key={`public-${categoryIndex}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {category.category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.items.map((item, itemIndex) => {
                    const itemKey = `public-${categoryIndex}-${itemIndex}`;
                    const isExpanded = expandedItem === itemKey;
                const description = featureDescriptions[item.name] || {
                  implemented: item.implemented,
                  summary: item.implemented ? `${item.name} je implementirano.` : `${item.name} nije implementirano.`,
                  details: item.implemented 
                    ? `## Implementirano:\n\n${item.name} je funkcionalnost koja je implementirana i dostupna u admin panelu.` 
                    : `## Nije implementirano:\n\n${item.name} je funkcionalnost koja trenutno nije implementirana.`
                };

                return (
                  <div
                    key={itemIndex}
                    className={`p-4 rounded-lg border-2 ${getStatusColor(item.implemented, item.deprecated)} transition-all`}
                  >
                    <div 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => setExpandedItem(isExpanded ? null : itemKey)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold mb-1 ${item.deprecated ? 'line-through' : ''}`}>
                            {item.name}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        </div>
                        {description.summary && !isExpanded && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {description.summary}
                          </p>
                        )}
                      </div>
                      <span className="ml-2 text-sm font-medium">
                        {getStatusText(item.implemented, item.deprecated)}
                      </span>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600 space-y-6">
                        {/* Regular details */}
                        {description.details && (
                          <div className="prose dark:prose-invert max-w-none text-sm">
                            <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                              {description.details.split('\n').map((line, idx) => {
                                // Format markdown-style headers
                                if (line.startsWith('## ')) {
                                  return (
                                    <h4 key={idx} className="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-white">
                                      {line.replace('## ', '')}
                                    </h4>
                                  );
                                }
                                if (line.startsWith('### ')) {
                                  return (
                                    <h5 key={idx} className="text-base font-semibold mt-3 mb-2 text-gray-800 dark:text-gray-200">
                                      {line.replace('### ', '')}
                                    </h5>
                                  );
                                }
                                // Format bullet points
                                if (line.trim().startsWith('- ')) {
                                  return (
                                    <div key={idx} className="ml-4 mb-1 text-gray-700 dark:text-gray-300">
                                      • {line.trim().substring(2)}
                                    </div>
                                  );
                                }
                                // Format code blocks (inline)
                                if (line.includes('`')) {
                                  const parts = line.split('`');
                                  return (
                                    <div key={idx} className="mb-2">
                                      {parts.map((part, partIdx) => 
                                        partIdx % 2 === 0 ? (
                                          <span key={partIdx}>{part}</span>
                                        ) : (
                                          <code key={partIdx} className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">
                                            {part}
                                          </code>
                                        )
                                      )}
                                    </div>
                                  );
                                }
                                // Regular paragraphs
                                if (line.trim()) {
                                  return (
                                    <p key={idx} className="mb-2 text-gray-700 dark:text-gray-300">
                                      {line}
                                    </p>
                                  );
                                }
                                return <br key={idx} />;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Technical Details - Only for admin */}
                        {description.technicalDetails && (
                          <div className="mt-6 pt-6 border-t-2 border-indigo-300 dark:border-indigo-700">
                            <h4 className="text-lg font-bold mb-3 text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                              🔧 Tehnički Detalji
                              <span className="text-xs font-normal bg-indigo-100 dark:bg-indigo-900 px-2 py-1 rounded">
                                ADMIN ONLY
                              </span>
                            </h4>
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                              <div className="prose dark:prose-invert max-w-none text-sm">
                                <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                                  {description.technicalDetails.split('\n').map((line, idx) => {
                                    // Format markdown-style headers
                                    if (line.startsWith('## ')) {
                                      return (
                                        <h5 key={idx} className="text-base font-bold mt-3 mb-2 text-gray-900 dark:text-white">
                                          {line.replace('## ', '')}
                                        </h5>
                                      );
                                    }
                                    // Format markdown-style subheaders
                                    if (line.startsWith('### ')) {
                                      return (
                                        <h6 key={idx} className="text-sm font-semibold mt-2 mb-1 text-gray-800 dark:text-gray-200">
                                          {line.replace('### ', '')}
                                        </h6>
                                      );
                                    }
                                    // Format code blocks
                                    if (line.trim().startsWith('`') && line.trim().endsWith('`')) {
                                      return (
                                        <code key={idx} className="bg-indigo-100 dark:bg-indigo-900 px-2 py-1 rounded text-xs font-mono text-indigo-800 dark:text-indigo-200 block my-1">
                                          {line.replace(/`/g, '')}
                                        </code>
                                      );
                                    }
                                    // Format lists
                                    if (line.trim().startsWith('- ')) {
                                      return (
                                        <div key={idx} className="ml-4 mb-1 text-gray-700 dark:text-gray-300">
                                          • {line.trim().substring(2)}
                                        </div>
                                      );
                                    }
                                    // Regular paragraphs
                                    if (line.trim()) {
                                      return (
                                        <p key={idx} className="mb-2 text-gray-700 dark:text-gray-300">
                                          {line}
                                        </p>
                                      );
                                    }
                                    return <br key={idx} />;
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Napomena */}
      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
          ℹ️ Napomena
        </h3>
        <p className="text-blue-800 dark:text-blue-300 text-sm">
          Ova dokumentacija je dostupna samo administratorima platforme. 
          Funkcionalnosti su organizirane po kategorijama radi lakšeg pronalaska.
          <br />
          <strong>Admin funkcionalnosti</strong> su prikazane prvo, zatim <strong>Opće (javne) funkcionalnosti</strong> s prikazom tehničkih detalja za admin.
        </p>
      </div>
    </div>
  );
};

export default AdminDocumentation;

