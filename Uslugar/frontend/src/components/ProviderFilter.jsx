import React from 'react';

export default function ProviderFilter({ filters, setFilters, categories, onReset, onUseMyLocation }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          🔍 Filtriraj pružatelje
        </h2>
        <button
          onClick={onReset}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          Resetiraj filtere
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pretraži
          </label>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Ime, opis, specijalizacije..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kategorija
          </label>
          <select
            value={filters.categoryId || ''}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value || null })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sve kategorije</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* City / Centar pretrage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lokacija / Grad
          </label>
          <input
            type="text"
            value={filters.city || ''}
            onChange={(e) => setFilters({ ...filters, city: e.target.value || null })}
            placeholder="Grad, mjesto..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Min Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minimalna ocjena
          </label>
          <select
            value={filters.minRating || ''}
            onChange={(e) => setFilters({ ...filters, minRating: e.target.value || null })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sve ocjene</option>
            <option value="4">4+ ⭐⭐⭐⭐</option>
            <option value="4.5">4.5+ ⭐⭐⭐⭐½</option>
            <option value="5">5 ⭐⭐⭐⭐⭐</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sortiraj po
          </label>
          <select
            value={filters.sortBy || 'rating'}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="rating">Ocjena ⭐</option>
            <option value="trustSla">Povjerenje + SLA (ocjena + ETA + odgovor) 🎯</option>
            <option value="responseTime">Brzina odgovora (SLA) ⏱️</option>
            <option value="distance">Udaljenost 📍</option>
            <option value="badges">Broj badge-ova 🏅</option>
            <option value="recent">Najnoviji 📅</option>
          </select>
        </div>

        {/* Checkboxes */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.verified === 'true'}
              onChange={(e) => setFilters({ 
                ...filters, 
                verified: e.target.checked ? 'true' : null 
              })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Samo verificirani ✓
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasLicenses === 'true'}
              onChange={(e) => setFilters({ 
                ...filters, 
                hasLicenses: e.target.checked ? 'true' : null 
              })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Samo s licencama 📜
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.isAvailable === 'true'}
              onChange={(e) => setFilters({ 
                ...filters, 
                isAvailable: e.target.checked ? 'true' : null 
              })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Samo dostupni 🟢
            </span>
          </label>

          {filters.sortBy === 'distance' && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => onUseMyLocation && onUseMyLocation()}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                📍 Koristi moju lokaciju
              </button>
            </div>
          )}
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
            <strong>Povjerenje X/7</strong> na karticama broji više signala (npr. SMS, licence, police).
            Filteri <strong>„Samo verificirani”</strong> i <strong>„Samo s licencama”</strong> slijede
            ista API pravila — „verificirani” ovdje znači poslovna provjera <em>ili</em> identitet, ne
            cijelih 7/7.
          </p>
        </div>
      </div>
    </div>
  );
}

