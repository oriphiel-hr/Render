import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext.jsx';
import api from '../api.js';

const Documentation = () => {
  const { isDarkMode } = useDarkMode();
  const [expandedItem, setExpandedItem] = useState(null); // Track which item is expanded
  const [features, setFeatures] = useState([]);
  const [featureDescriptions, setFeatureDescriptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError('Greška pri učitavanju dokumentacije. Molimo pokušajte ponovo.');
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

  // Koristi featureDescriptions iz state-a (iz baze preko API-ja)
  // Nema fallback na hardkodirane podatke - sve mora doći iz baze
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
          <p className="text-sm text-red-500 dark:text-red-400">
            Dokumentacija se učitava iz baze podataka. Provjeri da li je backend pokrenut i da li su podaci seedani.
          </p>
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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          📚 Uslugar - Dokumentacija Funkcionalnosti
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          Kompletna lista svih funkcionalnosti platforme za povezivanje korisnika i pružatelja usluga
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
                      <div 
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => setExpandedItem(isExpanded ? null : itemKey)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${item.deprecated ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-800 dark:text-gray-300'}`}>
                              {item.name}
                            </span>
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
                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.implemented, item.deprecated)}`}>
                          {getStatusText(item.implemented, item.deprecated)}
                        </span>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
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
                                // Format bold text (**text**)
                                if (line.includes('**')) {
                                  const parts = line.split('**');
                                  return (
                                    <div key={idx} className="mb-2">
                                      {parts.map((part, partIdx) => 
                                        partIdx % 2 === 0 ? (
                                          <span key={partIdx}>{part}</span>
                                        ) : (
                                          <strong key={partIdx} className="font-semibold">{part}</strong>
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
