import React, { useState, useEffect } from 'react';
import { getCategoryIcon } from '../data/categoryIcons.js';
import api from '../api.js';

const JobCard = ({ job, onViewDetails, onMakeOffer }) => {
  const [isProvider, setIsProvider] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setIsProvider(userData.role === 'PROVIDER' || (userData.role === 'USER' && userData.legalStatusId));
      } catch (e) {
        setIsProvider(false);
      }
    }
  }, []);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'URGENT': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'NORMAL': return 'bg-blue-500 text-white';
      case 'LOW': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getJobSizeStyle = (size) => {
    switch (size) {
      case 'SMALL': return 'bg-green-500 text-white';
      case 'MEDIUM': return 'bg-amber-500 text-white';
      case 'LARGE': return 'bg-orange-500 text-white';
      case 'EXTRA_LARGE': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const urgencyLabels = { URGENT: 'Hitno', HIGH: 'Visoka', NORMAL: 'Redovno', LOW: 'Niska' };
  const sizeLabels = { SMALL: 'Mali', MEDIUM: 'Srednji', LARGE: 'Veliki', EXTRA_LARGE: 'Vrlo velik' };

  // Normaliziraj URL slike (string ili objekt s .url); relativne putanje pretvori u apsolutne
  // Stari URL-ovi koriste /uploads/ – prepisujemo u /api/upload/ jer backend služi slike preko API rute
  const toAbsoluteUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    let u = url;
    if (!u.startsWith('http')) {
      const base = (api.defaults && api.defaults.baseURL) ? api.defaults.baseURL.replace(/\/api\/?$/, '') : '';
      u = base ? `${base}${u.startsWith('/') ? u : '/' + u}` : u;
    }
    // Ako je stari format .../uploads/filename, prepiši u .../api/upload/filename
    if (u.includes('/uploads/')) {
      u = u.replace(/\/uploads\/([^/?#]+)/, '/api/upload/$1');
    }
    return u;
  };
  const imageList = Array.isArray(job.images) ? job.images : [];
  const imageUrls = imageList
    .map((item) => (typeof item === 'string' ? item : item && item.url))
    .filter(Boolean)
    .map(toAbsoluteUrl)
    .filter(Boolean);

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex hover:shadow-md transition-shadow">
      <div className="hidden sm:block w-1 shrink-0 rounded-l-xl bg-gradient-to-b from-blue-400 to-blue-600" aria-hidden />
      <div className="flex-1 min-w-0 p-5 flex flex-col">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white pr-2">{job.title}</h3>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {job.urgency && (
              <span title="Hitnost posla" className={`px-2.5 py-0.5 rounded-lg text-xs font-medium ${getUrgencyStyle(job.urgency)}`}>
                Hitnost: {urgencyLabels[job.urgency] || job.urgency}
              </span>
            )}
            {job.jobSize && (
              <span title="Veličina posla" className={`px-2.5 py-0.5 rounded-lg text-xs font-medium ${getJobSizeStyle(job.jobSize)}`}>
                Veličina: {sizeLabels[job.jobSize] || job.jobSize}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{job.description || '—'}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          {job.category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500 dark:bg-blue-600 text-white text-xs font-medium">
              {getCategoryIcon(job.category)}
              <span>{job.category.name}</span>
            </span>
          )}
          {job.city && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 shrink-0 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {job.city}
            </span>
          )}
        </div>

        {imageUrls.length > 0 && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imageUrls.slice(0, 3).map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-100 dark:bg-gray-700"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>');
                  }}
                />
              ))}
              {imageUrls.length > 3 && (
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs flex-shrink-0">
                  +{imageUrls.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="font-semibold text-green-600 dark:text-green-400">
            {job.budgetMin != null && job.budgetMax != null
              ? `${formatPrice(job.budgetMin)} – ${formatPrice(job.budgetMax)}`
              : job.budgetMin != null
                ? `Od ${formatPrice(job.budgetMin)}`
                : job.budgetMax != null
                  ? `Do ${formatPrice(job.budgetMax)}`
                  : 'Cijena po dogovoru'}
          </span>
          <span>{(job.offers?.length || 0)} ponuda</span>
          {job.deadline && (
            <span>Rok: {new Date(job.deadline).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onViewDetails(job)}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            Pregledaj detalje
          </button>
          {isProvider && job.status === 'OPEN' && (
            <button
              onClick={() => onMakeOffer(job)}
              className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              Pošalji ponudu
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default JobCard;
