import React, { useState, useEffect } from 'react';
import api from '../api';

export default function UserTypesOverview({ isAdmin = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Ako je admin, koristi admin endpoint; inače public endpoint
      const endpoint = isAdmin ? '/admin/user-types-overview' : '/public/user-types-overview';
      const response = await api.get(endpoint);
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading user types:', err);
      setError(err.response?.data?.error || 'Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Učitavanje podataka...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          👥 Tipovi Korisnika na Platformi
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          Pregled različitih vrsta korisnika, njihovih karakteristika i statusa na Uslugar platformi
        </p>
        <a
          href="#user-types-flowcharts"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = 'user-types-flowcharts';
            if (window.location.pathname.startsWith('/admin/')) {
              window.location.replace('/#user-types-flowcharts');
            }
          }}
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md"
        >
          📊 Pregled Dijagrama Procesa
        </a>
      </div>

      {/* Tipovi korisnika - grupirano */}
      {data.userTypes && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tipovi Korisnika</h2>
        
        {/* Grupa 1: Korisnici usluga */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            Korisnici usluga
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['Privatni korisnici', 'Poslovni korisnici'].map((type) => {
              const info = data.userTypes[type];
              if (!info) return null;
              return (
                <div key={type} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{type}</h4>
                    {isAdmin && <span className="text-3xl font-bold text-green-600 dark:text-green-400">{info.count}</span>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{info.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grupa 2: Pružatelji usluga */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="text-2xl">🏢</span>
            Pružatelji usluga
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Pružatelji usluga (Solo)', 'Pružatelji usluga (Tvrtka)', 'Verificirani pružatelji', 'Licencirani pružatelji'].map((type) => {
              const info = data.userTypes[type];
              if (!info) return null;
              return (
                <div key={type} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{type}</h4>
                    {isAdmin && <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{info.count}</span>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{info.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grupa 3: Pretplate */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="text-2xl">💳</span>
            Pretplate
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['TRIAL korisnici', 'Plaćeni paketi'].map((type) => {
              const info = data.userTypes[type];
              if (!info) return null;
              return (
                <div key={type} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{type}</h4>
                    {isAdmin && <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{info.count}</span>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{info.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Pravni statusi */}
      {data.legalStatusStats && Object.keys(data.legalStatusStats).length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Raspodjela po Pravnom Statusu</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(data.legalStatusStats).map(([status, count]) => (
                <div key={status} className="text-center">
                  {isAdmin && <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{count}</div>}
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pretplate */}
      {data.subscriptionStats && (
        <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Raspodjela po Pretplati</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(data.subscriptionStats).map(([plan, count]) => (
              <div key={plan} className="text-center">
                {isAdmin && <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{count}</div>}
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{plan}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Verifikacija */}
      {data.verification && (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Status Verifikacije Tvrtki</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Verificirane tvrtke</h3>
              {isAdmin && (
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {data.verification.verified}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tvrtke koje su potvrdile svoj identitet dokumentima (OIB, sudski registar)
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nije verificirano</h3>
              {isAdmin && (
                <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {data.verification.notVerified}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tvrtke koje još nisu potvrdile svoj identitet dokumentima
            </p>
          </div>
        </div>
      </div>
      )}

      {/* Licence */}
      {data.licenses && (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Status Licence</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">S licencama</h3>
              {isAdmin && (
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {data.licenses.withLicenses}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pružatelji koji su učitali licence za svoje djelatnosti
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Verificirane licence</h3>
              {isAdmin && (
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {data.licenses.verifiedLicenses}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Licence koje su verificirane od strane administratora
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Čeka verifikaciju</h3>
              {isAdmin && (
                <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {data.licenses.pendingVerification}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Licence koje čekaju na verifikaciju od strane administratora
            </p>
          </div>
        </div>
      </div>
      )}

      {/* Značke */}
      {data.badges && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Značke Pružatelja</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* BUSINESS Badge */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">🏢</span>
                  Business Badge
                </h3>
                {isAdmin && (
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {data.badges.business.total}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {data.badges.business.description}
              </p>
              {isAdmin && data.badges.business.providers !== undefined && (
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>🏢 Pružatelji: {data.badges.business.providers}</div>
                  <div>👥 Korisnici (tvrtke/obrti): {data.badges.business.users}</div>
                </div>
              )}
            </div>

            {/* IDENTITY Badge */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">🆔</span>
                  Identity Badge
                </h3>
                {isAdmin && (
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {data.badges.identity.total}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {data.badges.identity.description}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                {isAdmin && data.badges.identity.providers !== undefined && (
                  <>
                    <div>🏢 Pružatelji: {data.badges.identity.providers}</div>
                    <div>👥 Korisnici (tvrtke/obrti): {data.badges.identity.users}</div>
                  </>
                )}
                {isAdmin && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div>📧 Email: {data.badges.identity.email}</div>
                    <div>📱 Telefon: {data.badges.identity.phone}</div>
                    <div>🌐 DNS: {data.badges.identity.dns}</div>
                  </div>
                )}
              </div>
            </div>

            {/* SAFETY Badge */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">🛡️</span>
                  Safety Badge
                </h3>
                {isAdmin && (
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {data.badges.safety.total}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {data.badges.safety.description}
              </p>
              {isAdmin && data.badges.safety.providers !== undefined && (
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>🏢 Pružatelji: {data.badges.safety.providers}</div>
                  <div>👥 Korisnici (tvrtke/obrti): {data.badges.safety.users}</div>
                </div>
              )}
            </div>

            {/* All Badges Summary - SAMO ADMIN */}
            {isAdmin && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg shadow-md p-6 border-2 border-indigo-200 dark:border-indigo-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    Ukupno
                  </h3>
                  <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {data.badges.allBadges.total}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {data.badges.allBadges.description}
                </p>
                {data.badges.allBadges.providers !== undefined && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <div>🏢 Pružatelji: {data.badges.allBadges.providers}</div>
                    <div>👥 Korisnici (tvrtke/obrti): {data.badges.allBadges.users}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reputacija */}
      {data.reputation && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reputacija Pružatelja</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                {isAdmin && (
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    {data.reputation.avgRating.toFixed(1)} ⭐
                  </div>
                )}
                <div className="text-sm text-gray-600 dark:text-gray-400">Prosječna ocjena</div>
              </div>
              <div className="text-center">
                {isAdmin && (
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    {data.reputation.avgResponseTimeMinutes} min
                  </div>
                )}
                <div className="text-sm text-gray-600 dark:text-gray-400">Prosječno vrijeme odgovora</div>
              </div>
              <div className="text-center">
                {isAdmin && (
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    {data.reputation.avgConversionRate.toFixed(1)}%
                  </div>
                )}
                <div className="text-sm text-gray-600 dark:text-gray-400">Prosječna stopa konverzije</div>
              </div>
              <div className="text-center">
                {isAdmin && (
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    {data.reputation.totalProviders}
                  </div>
                )}
                <div className="text-sm text-gray-600 dark:text-gray-400">Ukupno pružatelja</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informacije */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          ℹ️ O podacima
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Ova stranica prikazuje općenite statistike o tipovima korisnika na platformi. 
          Ne prikazuju se osobni podaci korisnika, već samo agregirane informacije koje pomažu 
          razumjeti strukturu korisničke baze i različite vrste korisnika koji koriste Uslugar platformu.
        </p>
      </div>
    </div>
  );
}

