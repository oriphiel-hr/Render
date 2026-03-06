import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext.jsx';
import api from '../api.js';
import { GUIDE_KORISNIK, GUIDE_PRUVATELJ, GUIDE_TIM_CLAN } from '../data/guideContent.js';

/** Vraća ulogu za dokumentaciju: 'korisnik' | 'pružatelj' | null (neprijavljen) */
function getDocumentationRole() {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return null;
  try {
    const userData = JSON.parse(storedUser);
    if (userData.role === 'PROVIDER' || userData.role === 'ADMIN') return 'pružatelj';
    if (userData.role === 'USER' && userData.legalStatusId) return 'pružatelj';
    if (userData.role === 'USER') return 'korisnik';
    return null;
  } catch {
    return null;
  }
}

/** Vraća info o potvrdi za prijavljenog korisnika (iz localStorage). */
function getVerificationInfo() {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return { emailVerified: null, isProvider: false };
  try {
    const userData = JSON.parse(storedUser);
    const isProvider = userData.role === 'PROVIDER' || userData.role === 'ADMIN' || (userData.role === 'USER' && !!userData.legalStatusId);
    return {
      emailVerified: userData.isVerified === true,
      isProvider,
    };
  } catch {
    return { emailVerified: null, isProvider: false };
  }
}

const Documentation = ({ setTab }) => {
  const { isDarkMode } = useDarkMode();
  const [expandedItem, setExpandedItem] = useState(null);
  const [features, setFeatures] = useState([]);
  const [featureDescriptions, setFeatureDescriptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGuideRole, setSelectedGuideRole] = useState(null);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [failedGuideImages, setFailedGuideImages] = useState(() => new Set());

  const docRole = getDocumentationRole();
  const verificationInfo = getVerificationInfo();
  const effectiveGuideRole = (docRole === 'pružatelj' && isTeamMember) ? 'tim_clan' : (docRole ?? selectedGuideRole);
  const guideSteps = effectiveGuideRole === 'pružatelj' ? GUIDE_PRUVATELJ
    : effectiveGuideRole === 'tim_clan' ? GUIDE_TIM_CLAN
    : effectiveGuideRole === 'korisnik' ? GUIDE_KORISNIK
    : null;
  const needsEmailVerification = docRole && verificationInfo.emailVerified === false;
  const showBeforeYouStart = guideSteps && docRole && needsEmailVerification;
  const showProviderProfileTip = guideSteps && effectiveGuideRole === 'pružatelj' && docRole && verificationInfo.emailVerified === true;

  // Za pružatelje provjeri jesu li član tima (direktor ih je dodao) – prikaži vodič za član tima
  useEffect(() => {
    if (docRole !== 'pružatelj') return;
    let cancelled = false;
    api.get('/providers/me')
      .then((res) => {
        if (cancelled) return;
        const p = res.data;
        setIsTeamMember(!!p?.companyId && !p?.isDirector);
      })
      .catch(() => {
        if (!cancelled) setIsTeamMember(false);
      });
    return () => { cancelled = true; };
  }, [docRole]);

  // Učitaj podatke iz baze
  useEffect(() => {
    const loadDocumentation = async () => {
      try {
        setLoading(true);
        const response = await api.get('/documentation');
        setFeatures(response.data.features);
        setFeatureDescriptions(response.data.featureDescriptions);
        setError(null);
      } catch (err) {
        console.error('Error loading documentation:', err);
        const errorData = err.response?.data?.error;
        if (errorData) {
          // Ako backend vraća detaljnu grešku
          setError(`${errorData.message || 'Greška pri učitavanju dokumentacije'}\n\n${errorData.hint ? `💡 ${errorData.hint}` : ''}`);
        } else {
          setError('Greška pri učitavanju dokumentacije. Molimo pokušajte ponovo.');
        }
        // Fallback na prazne podatke
        setFeatures([]);
        setFeatureDescriptions({});
      } finally {
        setLoading(false);
      }
    };

    loadDocumentation();
  }, []);

  // Podaci se učitavaju iz baze preko API-ja
  // Hardkodirani podaci su potpuno uklonjeni

  const getStatusColor = (implemented, deprecated) => {
    if (deprecated) return 'text-orange-600 bg-orange-100';
    return implemented ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getStatusText = (implemented, deprecated) => {
    if (deprecated) return '⚠️ NE KORISTI SE';
    return implemented ? '✓ Implementirano' : '✗ Nije implementirano';
  };

  /** Puni opis kao tekstačke upute: manje naslova i listi, više tekućeg teksta */
  const renderDetailsContent = (details) => {
    if (!details || !details.trim()) return null;
    return details.split('\n').map((line, idx) => {
      if (line.startsWith('## ')) {
        return (
          <p key={idx} className="font-semibold text-gray-900 dark:text-white mt-4 mb-1 first:mt-0">
            {line.replace('## ', '')}
          </p>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <p key={idx} className="font-medium text-gray-800 dark:text-gray-200 mt-3 mb-1">
            {line.replace('### ', '')}
          </p>
        );
      }
      if (line.trim().startsWith('- ')) {
        return (
          <p key={idx} className="mb-2 text-gray-700 dark:text-gray-300">
            {line.trim().substring(2)}
          </p>
        );
      }
      if (line.includes('`')) {
        const parts = line.split('`');
        return (
          <p key={idx} className="mb-2 text-gray-700 dark:text-gray-300">
            {parts.map((part, partIdx) =>
              partIdx % 2 === 0 ? (
                <span key={partIdx}>{part}</span>
              ) : (
                <code key={partIdx} className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">
                  {part}
                </code>
              )
            )}
          </p>
        );
      }
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={idx} className="mb-2 text-gray-700 dark:text-gray-300">
            {parts.map((part, partIdx) =>
              partIdx % 2 === 0 ? (
                <span key={partIdx}>{part}</span>
              ) : (
                <strong key={partIdx} className="font-semibold">{part}</strong>
              )
            )}
          </p>
        );
      }
      if (line.trim()) {
        return (
          <p key={idx} className="mb-2 text-gray-700 dark:text-gray-300">
            {line}
          </p>
        );
      }
      return <br key={idx} />;
    });
  };

  const getImplementationStats = () => {
    if (!features || features.length === 0) {
      return { totalItems: 0, implementedItems: 0, percentage: 0 };
    }
    const totalItems = features.reduce((sum, category) => sum + category.items.length, 0);
    const implementedItems = features.reduce((sum, category) => 
      sum + category.items.filter(item => item.implemented).length, 0
    );
    const percentage = totalItems > 0 ? Math.round((implementedItems / totalItems) * 100) : 0;
    
    return { totalItems, implementedItems, percentage };
  };

  const stats = getImplementationStats();

  const descriptionsToUse = featureDescriptions;

  if (loading) {
    return (
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isDarkMode ? 'dark' : ''}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Učitavanje dokumentacije...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isDarkMode ? 'dark' : ''}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-2">Greška pri učitavanju dokumentacije</h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <div className="text-sm text-red-500 dark:text-red-400 space-y-2">
            <p>Dokumentacija se učitava iz baze podataka.</p>
            <p><strong>Mogući uzroci:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Backend nije pokrenut - provjeri da li API odgovara</li>
              <li>Migracije nisu primijenjene - pokreni: <code className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">npx prisma migrate deploy</code></li>
              <li>Podaci nisu seedani - pokreni: <code className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">npm run seed:documentation</code></li>
              <li>Baza podataka nije dostupna - provjeri DATABASE_URL</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  // Ako nema podataka nakon učitavanja, prikaži poruku
  if (!loading && (!features || features.length === 0)) {
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
      {/* Vodiči – prikazuje se samo vodič za ulogu korisnika */}
      <section className="mb-12" aria-labelledby="guide-heading">
        <h1 id="guide-heading" className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📖 Vodič
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Korak-po-korak upute za korištenje Uslugara. Prikazuje se samo vodič za vašu ulogu.
        </p>

        {!effectiveGuideRole ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setSelectedGuideRole('korisnik')}
              className="p-6 rounded-xl border-2 border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/20 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-left transition-colors"
            >
              <span className="text-2xl block mb-2">👤</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Ja sam korisnik</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tražim majstora / želim objaviti posao</p>
            </button>
            <button
              type="button"
              onClick={() => setSelectedGuideRole('pružatelj')}
              className="p-6 rounded-xl border-2 border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/20 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-left transition-colors"
            >
              <span className="text-2xl block mb-2">🔧</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Ja sam pružatelj</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Majstor / želim primati leadove i slati ponude</p>
            </button>
            <button
              type="button"
              onClick={() => setSelectedGuideRole('tim_clan')}
              className="p-6 rounded-xl border-2 border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/20 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-left transition-colors"
            >
              <span className="text-2xl block mb-2">👥</span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Ja sam član tima</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Radim za direktora / leadovi mi se dodjeljuju</p>
            </button>
          </div>
        ) : null}

        {guideSteps ? (
          <div className="space-y-10">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              📷 Ilustracije (screenshotovi) u vodiču bit će dodane; trenutno se prikazuju placeholderi dok ne budu dostupne prave slike.
            </p>
            {docRole && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Prijavljeni ste kao <strong>{effectiveGuideRole === 'korisnik' ? 'korisnik usluge' : effectiveGuideRole === 'tim_clan' ? 'član tima' : 'pružatelj usluge'}</strong>. Prikazuje se odgovarajući vodič.
              </p>
            )}
            {effectiveGuideRole === 'pružatelj' && (
              <div className="mb-6 p-4 rounded-lg border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-800/50">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Što možete raditi:</span> pregledavati i kupovati leadove, slati ponude, dopisivati se u chatu, upravljati pretplatom i kreditima, pratiti ROI te verifikaciju profila. Koraci ispod vode kroz sve to.
                </p>
              </div>
            )}
            {!docRole && effectiveGuideRole && (
              <button
                type="button"
                onClick={() => setSelectedGuideRole(null)}
                className="text-sm text-amber-700 dark:text-amber-400 hover:underline"
              >
                ← Odaberi drugu ulogu
              </button>
            )}

            {showBeforeYouStart && setTab && (
              <div className="mb-8 p-6 rounded-xl border-2 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20">
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-2">
                  ⚠️ Prije nego nastaviš
                </h3>
                <p className="text-amber-800 dark:text-amber-300 mb-4">
                  Vaš email još nije potvrđen. Provjerite poštu i kliknite na link u mailu koji smo Vam poslali. Dok to ne napravite, neke opcije možda neće biti dostupne.
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
                  Nisi primio mail? Možeš zatražiti novi link za potvrdu.
                </p>
                <button
                  type="button"
                  onClick={() => setTab('verify')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                >
                  Otvori stranicu za potvrdu emaila
                </button>
              </div>
            )}

            {showProviderProfileTip && setTab && (
              <div className="mb-6 p-4 rounded-lg border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-800/50">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Profil i dokumenti:</span> Ako još trebaš potvrditi profil ili predati dokumente za verifikaciju, otvori{' '}
                  <button
                    type="button"
                    onClick={() => setTab('provider-profile')}
                    className="text-amber-700 dark:text-amber-400 font-medium hover:underline"
                  >
                    Moj profil
                  </button>
                  {' '}u izborniku.
                </p>
              </div>
            )}

            {docRole && verificationInfo.emailVerified === true && !showBeforeYouStart && (
              <div className="mb-6 p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <p className="text-sm text-green-800 dark:text-green-300">
                  ✓ Vaš email je potvrđen. Možete koristiti vodič ispod.
                </p>
              </div>
            )}

            {guideSteps.map((item) => (
              <article
                key={item.step}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white text-sm font-bold">
                      {item.step}
                    </span>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{item.title}</h2>
                  </div>
                  <div className="grid md:grid-cols-1 gap-4">
                    <div className="space-y-3">
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white">Vaš korak:</span>{' '}
                        {item.userAction}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white">Rezultat:</span>{' '}
                        {item.appResult}
                      </p>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
                      {failedGuideImages.has(item.image) ? (
                        <div className="w-full flex flex-col items-center justify-center py-16 px-4 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                          <span className="text-4xl mb-2" aria-hidden>📷</span>
                          <p className="text-sm font-medium">Screenshot uskoro</p>
                          <p className="text-xs mt-1">Zamijenit će se stvarnim snimkom zaslona</p>
                        </div>
                      ) : (
                        <img
                          src={item.image}
                          alt={`Screenshot: ${item.title}`}
                          className="w-full h-auto object-contain max-h-[420px]"
                          loading="lazy"
                          onError={() => setFailedGuideImages((prev) => new Set(prev).add(item.image))}
                        />
                      )}
                    </div>
                    {item.puniOpis && (
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Puni opis (korak po korak)</h3>
                        <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300">
                          {renderDetailsContent(item.puniOpis)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <hr className="border-gray-200 dark:border-gray-700 my-10" />

      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          📚 Status funkcionalnosti
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Pregled implementiranih i planiranih funkcionalnosti platforme
        </p>
        <p className="text-sm text-amber-800 dark:text-amber-300 mb-6 max-w-2xl mx-auto">
          Dolje je cijela lista kategorija – i za korisnike i za pružatelje. Stavke poput kredita, pretplate i refunda odnose se na pružatelje usluga; kao korisnik usluge (naručitelj) ne plaćate kredite – objavljivanje poslova je besplatno.
        </p>
        
        {/* Statistike implementacije */}
        <div className="bg-gradient-to-r from-stone-50 to-amber-50 dark:from-stone-900/50 dark:to-amber-900/20 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Status implementacije</h3>
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

      {/* Kategorije funkcionalnosti */}
      <div className="space-y-8">
        {features.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{category.category}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.items.map((item, itemIndex) => {
                  const itemKey = `${categoryIndex}-${itemIndex}`;
                  const isExpanded = expandedItem === itemKey;
                  const description = descriptionsToUse[item.name] || {
                    implemented: item.implemented,
                    summary: item.implemented ? `${item.name} je implementirano.` : `${item.name} nije implementirano.`,
                    details: item.implemented 
                      ? `## Implementirano:\n\n${item.name} je funkcionalnost koja je implementirana i dostupna na platformi.` 
                      : `## Nije implementirano:\n\n${item.name} je funkcionalnost koja trenutno nije implementirana.`
                  };

                  return (
                    <div
                      key={itemIndex}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        item.implemented 
                          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      } ${item.deprecated ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className={`font-medium ${item.deprecated ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-800 dark:text-gray-300'}`}>
                            {item.name}
                          </span>
                          {description.summary && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {description.summary}
                            </p>
                          )}
                        </div>
                        <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.implemented, item.deprecated)}`}>
                          {getStatusText(item.implemented, item.deprecated)}
                        </span>
                      </div>
                      {description.details ? (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => setExpandedItem(isExpanded ? null : itemKey)}
                            className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 rounded"
                          >
                            {isExpanded
                              ? 'Zatvori puni opis'
                              : 'Pročitaj puni opis: kako funkcionira, prednosti, kada koristiti i tehnički detalji'}
                          </button>
                        </div>
                      ) : null}

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                          <div className="prose dark:prose-invert max-w-none text-sm">
                            {renderDetailsContent(description.details)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer informacije */}
      <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">O Uslugar Platformi</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Uslugar je sveobuhvatna platforma za povezivanje korisnika koji traže usluge s kvalificiranim pružateljima usluga. 
          Platforma omogućuje jednostavno objavljivanje poslova, slanje ponuda, komunikaciju i ocjenjivanje usluga.
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Posljednje ažuriranje: {new Date().toLocaleDateString('hr-HR')}
        </div>
      </div>
    </div>
  );
};

export default Documentation;
