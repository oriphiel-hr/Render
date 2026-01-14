import { useState, useEffect } from 'react';
import api from '../api';

export function useLegalStatuses() {
  const [legalStatuses, setLegalStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLegalStatuses = async () => {
      try {
        const response = await api.get('/legal-statuses');
        setLegalStatuses(response.data);
      } catch (err) {
        console.error('Failed to fetch legal statuses:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLegalStatuses();
  }, []);

  return { legalStatuses, loading, error };
}


