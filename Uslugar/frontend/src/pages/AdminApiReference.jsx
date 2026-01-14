import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';

const AdminApiReference = () => {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expandedRoutes, setExpandedRoutes] = useState(new Set());
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    loadApiReference();
  }, []);

  const loadApiReference = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/api-reference');
      setApiData(response.data);
    } catch (err) {
      console.error('Error loading API reference:', err);
      if (err.response) {
        // Server responded with error
        if (err.response.status === 404) {
          setError('Endpoint nije pronađen. Provjerite da li je backend server pokrenut i da li je endpoint deployan.');
        } else if (err.response.status === 401 || err.response.status === 403) {
          setError('Nemate pristup. Morate biti ulogirani kao ADMIN.');
        } else {
          setError(err.response?.data?.error || `Greška pri učitavanju API reference (${err.response.status})`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('Backend server nije dostupan. Provjerite da li je server pokrenut.');
      } else {
        // Something else happened
        setError(err.message || 'Greška pri učitavanju API reference');
      }
    } finally {
      setLoading(false);
    }
  };

  const getMethodColor = (method) => {
    const colors = {
      'GET': 'bg-blue-100 text-blue-800 border-blue-300',
      'POST': 'bg-green-100 text-green-800 border-green-300',
      'PUT': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'PATCH': 'bg-orange-100 text-orange-800 border-orange-300',
      'DELETE': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[method] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Izračunaj filtrirane rute koristeći useMemo
  const filteredRoutes = useMemo(() => {
    if (!apiData?.routes) return [];
    return Object.entries(apiData.routes).filter(([group]) => {
      if (selectedGroup && selectedGroup !== group) return false;
      if (!searchTerm) return true;
      const groupRoutes = apiData.routes[group];
      return groupRoutes.some(route => 
        route.fullPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (route.handler && route.handler.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [apiData, selectedGroup, searchTerm]);

  const filteredAllRoutes = useMemo(() => {
    if (!apiData?.allRoutes) return [];
    if (!searchTerm) return [];
    return apiData.allRoutes.filter(route => {
      return route.fullPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
             route.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (route.handler && route.handler.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [apiData, searchTerm]);

  const toggleRoute = (routeKey) => {
    const newExpanded = new Set(expandedRoutes);
    if (newExpanded.has(routeKey)) {
      newExpanded.delete(routeKey);
    } else {
      newExpanded.add(routeKey);
    }
    setExpandedRoutes(newExpanded);
  };

  const handleExpandAll = (checked) => {
    setExpandAll(checked);
    if (checked) {
      // Otvori sve rute (samo one koje su vidljive nakon filtriranja)
      const allRouteKeys = new Set();
      // Dodaj rute iz filtriranih grupa
      filteredRoutes.forEach(([group, routes]) => {
        routes.forEach((route, index) => {
          const routeKey = `${group}-${route.method}-${route.path}-${index}`;
          allRouteKeys.add(routeKey);
        });
      });
      // Dodaj rute iz filtriranih allRoutes (ako postoji search)
      if (searchTerm && filteredAllRoutes.length > 0) {
        filteredAllRoutes.forEach((route, index) => {
          const routeKey = `all-${route.method}-${route.fullPath}-${index}`;
          allRouteKeys.add(routeKey);
        });
      }
      setExpandedRoutes(allRouteKeys);
    } else {
      // Zatvori sve rute
      setExpandedRoutes(new Set());
    }
  };
  
  // Ažuriraj expandAll checkbox na temelju trenutnog stanja expandedRoutes
  useEffect(() => {
    if (!apiData) return;
    
    // Izračunaj sve moguće route keys (vidljive rute)
    const allPossibleKeys = new Set();
    
    // Dodaj rute iz filtriranih grupa
    filteredRoutes.forEach(([group, routes]) => {
      routes.forEach((route, index) => {
        const routeKey = `${group}-${route.method}-${route.path}-${index}`;
        allPossibleKeys.add(routeKey);
      });
    });
    
    // Dodaj rute iz filtriranih allRoutes (ako postoji search)
    if (searchTerm && filteredAllRoutes.length > 0) {
      filteredAllRoutes.forEach((route, index) => {
        const routeKey = `all-${route.method}-${route.fullPath}-${index}`;
        allPossibleKeys.add(routeKey);
      });
    }
    
    // Provjeri da li su sve vidljive rute otvorene
    if (allPossibleKeys.size > 0) {
      const allExpanded = Array.from(allPossibleKeys).every(key => expandedRoutes.has(key));
      setExpandAll(allExpanded);
    } else {
      setExpandAll(false);
    }
  }, [expandedRoutes, filteredRoutes, filteredAllRoutes, searchTerm, apiData]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Učitavanje API reference...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 API Reference</h1>
        <p className="text-gray-600">Kompletan popis svih API endpointa, metoda i parametara</p>
        {apiData && (
          <div className="mt-2 text-sm text-gray-500">
            Ukupno: <strong>{apiData.totalRoutes}</strong> endpointa
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pretraži</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pretraži po path-u, metodi ili handler-u..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtriraj po grupi</label>
            <select
              value={selectedGroup || ''}
              onChange={(e) => setSelectedGroup(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Sve grupe</option>
              {apiData?.routes && Object.keys(apiData.routes).map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="expandAll"
            checked={expandAll}
            onChange={(e) => handleExpandAll(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="expandAll" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
            Otvori/sakrij sve detalje
          </label>
        </div>
      </div>

      {/* Grouped View */}
      <div className="space-y-6">
        {filteredRoutes.map(([group, routes]) => (
          <div key={group} className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">
                /api/{group}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({routes.length} endpointa)
                </span>
              </h2>
            </div>
            <div className="divide-y">
              {routes.map((route, index) => {
                const routeKey = `${group}-${route.method}-${route.path}-${index}`;
                const isExpanded = expandedRoutes.has(routeKey);
                return (
                  <div key={routeKey} className="hover:bg-gray-50 transition">
                    <div
                      className="px-6 py-4 cursor-pointer flex items-center justify-between"
                      onClick={() => toggleRoute(routeKey)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <span className={`px-3 py-1 rounded text-xs font-semibold border ${getMethodColor(route.method)}`}>
                          {route.method}
                        </span>
                        <code className="text-sm font-mono text-gray-900 flex-1">
                          {route.fullPath}
                        </code>
                      </div>
                      <div className="flex items-center gap-4">
                        {route.handler && route.handler !== 'anonymous' && (
                          <span className="text-xs text-gray-500 font-mono">
                            handler: {route.handler}
                          </span>
                        )}
                        <span className="text-gray-400">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-6 py-4 bg-gray-50 border-t">
                        <div className="space-y-2 text-sm">
                          {route.description && (
                            <div className="mb-3 pb-3 border-b">
                              <span className="font-semibold text-gray-700 block mb-1">📝 Opis:</span>
                              <p className="text-gray-700 text-sm leading-relaxed">{route.description}</p>
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-gray-700">Method:</span>
                            <span className="ml-2 text-gray-900">{route.method}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Path:</span>
                            <code className="ml-2 text-gray-900 font-mono">{route.fullPath}</code>
                          </div>
                          {route.params && route.params.length > 0 && (
                            <div>
                              <span className="font-semibold text-gray-700">Parametri:</span>
                              <div className="ml-2 mt-1 flex flex-wrap gap-2">
                                {route.params.map((param, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-mono">
                                    :{param}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {route.security && (
                            <div className="mt-3 pt-3 border-t">
                              <span className="font-semibold text-gray-700 block mb-2">🔒 Sigurnost:</span>
                              <div className="space-y-2">
                                {route.security.authRequired ? (
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                                      Auth Required
                                    </span>
                                    {route.security.roles && route.security.roles.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {route.security.roles.map((role, idx) => (
                                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                                            {role}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                                    Javni endpoint
                                  </span>
                                )}
                                {route.security.additionalChecks && route.security.additionalChecks.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-xs font-semibold text-gray-600 block mb-1">Dodatni uvjeti:</span>
                                    <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                                      {route.security.additionalChecks.map((check, idx) => (
                                        <li key={idx}>{check}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {route.security.businessRules && route.security.businessRules.length > 0 && (
                                  <div className="mt-2 pt-2 border-t">
                                    <span className="text-xs font-semibold text-orange-600 block mb-1">📋 Poslovna ograničenja:</span>
                                    <ul className="list-disc list-inside text-xs text-orange-700 space-y-1">
                                      {route.security.businessRules.map((rule, idx) => (
                                        <li key={idx}>{rule}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {route.handler && route.handler !== 'anonymous' && (
                            <div>
                              <span className="font-semibold text-gray-700">Handler:</span>
                              <code className="ml-2 text-gray-900 font-mono">{route.handler}</code>
                            </div>
                          )}
                          {route.middleware && (
                            <div>
                              <span className="font-semibold text-gray-700">Middleware:</span>
                              <code className="ml-2 text-gray-900 font-mono">{route.middleware}</code>
                            </div>
                          )}
                          {route.trigger && (
                            <div className="mt-3 pt-3 border-t">
                              <span className="font-semibold text-gray-700 block mb-2">🚀 Pokreće:</span>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    route.trigger.type === 'page' ? 'bg-blue-100 text-blue-800' :
                                    route.trigger.type === 'job' ? 'bg-purple-100 text-purple-800' :
                                    route.trigger.type === 'api' ? 'bg-green-100 text-green-800' :
                                    route.trigger.type === 'webhook' ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {route.trigger.type === 'page' ? '📄 Stranica' :
                                     route.trigger.type === 'job' ? '⏰ Job' :
                                     route.trigger.type === 'api' ? '🔗 API' :
                                     route.trigger.type === 'webhook' ? '🔔 Webhook' :
                                     '📝 Ručno'}
                                  </span>
                                </div>
                                {route.trigger.details && route.trigger.details.length > 0 && (
                                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                                    {route.trigger.details.map((detail, idx) => (
                                      <li key={idx}>{detail}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* All Routes View (Flat) */}
      {searchTerm && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Svi rezultati pretrage</h2>
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y">
              {filteredAllRoutes.map((route, index) => {
                const routeKey = `all-${route.method}-${route.fullPath}-${index}`;
                const isExpanded = expandedRoutes.has(routeKey);
                return (
                  <div key={routeKey} className="hover:bg-gray-50 transition">
                    <div
                      className="px-6 py-4 cursor-pointer flex items-center justify-between"
                      onClick={() => toggleRoute(routeKey)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <span className={`px-3 py-1 rounded text-xs font-semibold border ${getMethodColor(route.method)}`}>
                          {route.method}
                        </span>
                        <code className="text-sm font-mono text-gray-900 flex-1">
                          {route.fullPath}
                        </code>
                      </div>
                      <div className="flex items-center gap-4">
                        {route.handler && route.handler !== 'anonymous' && (
                          <span className="text-xs text-gray-500 font-mono">
                            {route.handler}
                          </span>
                        )}
                        <span className="text-gray-400">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-6 py-4 bg-gray-50 border-t">
                        <div className="space-y-2 text-sm">
                          {route.description && (
                            <div className="mb-3 pb-3 border-b">
                              <span className="font-semibold text-gray-700 block mb-1">📝 Opis:</span>
                              <p className="text-gray-700 text-sm leading-relaxed">{route.description}</p>
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-gray-700">Method:</span>
                            <span className="ml-2 text-gray-900">{route.method}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Path:</span>
                            <code className="ml-2 text-gray-900 font-mono">{route.fullPath}</code>
                          </div>
                          {route.params && route.params.length > 0 && (
                            <div>
                              <span className="font-semibold text-gray-700">Parametri:</span>
                              <div className="ml-2 mt-1 flex flex-wrap gap-2">
                                {route.params.map((param, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-mono">
                                    :{param}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {route.security && (
                            <div className="mt-3 pt-3 border-t">
                              <span className="font-semibold text-gray-700 block mb-2">🔒 Sigurnost:</span>
                              <div className="space-y-2">
                                {route.security.authRequired ? (
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                                      Auth Required
                                    </span>
                                    {route.security.roles && route.security.roles.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {route.security.roles.map((role, idx) => (
                                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                                            {role}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                                    Javni endpoint
                                  </span>
                                )}
                                {route.security.additionalChecks && route.security.additionalChecks.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-xs font-semibold text-gray-600 block mb-1">Dodatni uvjeti:</span>
                                    <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                                      {route.security.additionalChecks.map((check, idx) => (
                                        <li key={idx}>{check}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {route.security.businessRules && route.security.businessRules.length > 0 && (
                                  <div className="mt-2 pt-2 border-t">
                                    <span className="text-xs font-semibold text-orange-600 block mb-1">📋 Poslovna ograničenja:</span>
                                    <ul className="list-disc list-inside text-xs text-orange-700 space-y-1">
                                      {route.security.businessRules.map((rule, idx) => (
                                        <li key={idx}>{rule}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {route.handler && route.handler !== 'anonymous' && (
                            <div>
                              <span className="font-semibold text-gray-700">Handler:</span>
                              <code className="ml-2 text-gray-900 font-mono">{route.handler}</code>
                            </div>
                          )}
                          {route.trigger && (
                            <div className="mt-3 pt-3 border-t">
                              <span className="font-semibold text-gray-700 block mb-2">🚀 Pokreće:</span>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    route.trigger.type === 'page' ? 'bg-blue-100 text-blue-800' :
                                    route.trigger.type === 'job' ? 'bg-purple-100 text-purple-800' :
                                    route.trigger.type === 'api' ? 'bg-green-100 text-green-800' :
                                    route.trigger.type === 'webhook' ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {route.trigger.type === 'page' ? '📄 Stranica' :
                                     route.trigger.type === 'job' ? '⏰ Job' :
                                     route.trigger.type === 'api' ? '🔗 API' :
                                     route.trigger.type === 'webhook' ? '🔔 Webhook' :
                                     '📝 Ručno'}
                                  </span>
                                </div>
                                {route.trigger.details && route.trigger.details.length > 0 && (
                                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                                    {route.trigger.details.map((detail, idx) => (
                                      <li key={idx}>{detail}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {apiData && apiData.allRoutes && apiData.allRoutes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Nema pronađenih endpointa
        </div>
      )}
    </div>
  );
};

export default AdminApiReference;


