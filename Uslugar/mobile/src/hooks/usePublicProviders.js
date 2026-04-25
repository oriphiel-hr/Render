import { useCallback, useEffect, useState } from 'react';
import { getPublicProviders } from '@uslugar/shared';

const defaultFilters = {
  search: '',
  verified: false,
  hasLicenses: false,
  sortBy: 'rating'
};

export function usePublicProviders({ apiBaseUrl, token, active, handleApiError }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(() => ({ ...defaultFilters }));
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async () => {
    if (!apiBaseUrl || !active) {
      return;
    }
    setLoading(true);
    try {
      const params = { sortBy: filters.sortBy || 'rating' };
      if (searchInput.trim()) params.search = searchInput.trim();
      if (filters.verified) params.verified = 'true';
      if (filters.hasLicenses) params.hasLicenses = 'true';
      const data = await getPublicProviders({ apiBaseUrl, token, params });
      setProviders(Array.isArray(data) ? data : []);
    } catch (error) {
      setProviders([]);
      await handleApiError(error, 'Ne mogu učitati pružatelje.');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, token, active, filters.verified, filters.hasLicenses, filters.sortBy, searchInput, handleApiError]);

  useEffect(() => {
    if (!active || !apiBaseUrl) return;
    const t = setTimeout(() => {
      load();
    }, 450);
    return () => clearTimeout(t);
  }, [load, active, apiBaseUrl]);

  const resetFilters = useCallback(() => {
    setFilters({ ...defaultFilters });
    setSearchInput('');
  }, []);

  return {
    providers,
    loading,
    filters,
    setFilters,
    searchInput,
    setSearchInput,
    resetFilters,
    reload: load
  };
}
