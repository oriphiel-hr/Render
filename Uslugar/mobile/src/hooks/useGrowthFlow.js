import { useCallback, useEffect, useState } from 'react';
import {
  addGrowthFavorite,
  createDispute,
  createInstantBookingRequest,
  getGrowthDisputes,
  getGrowthFavorites,
  getInstantBookingRequests,
  patchInstantBookingRequest,
  getPublicGuarantee,
  getSeasonalReminders,
  removeGrowthFavorite
} from '@uslugar/shared';

export function useGrowthFlow({ apiBaseUrl, token, handleApiError, setMessage }) {
  const [guarantee, setGuarantee] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [reminders, setReminders] = useState([]);

  const loadPublic = useCallback(async () => {
    if (!apiBaseUrl) return;
    try {
      const g = await getPublicGuarantee({ apiBaseUrl });
      setGuarantee(g || null);
    } catch {
      setGuarantee(null);
    }
  }, [apiBaseUrl]);

  const loadFavorites = useCallback(async () => {
    if (!apiBaseUrl || !token) return;
    try {
      const data = await getGrowthFavorites({ apiBaseUrl, token });
      setFavorites(Array.isArray(data) ? data : []);
    } catch (e) {
      await handleApiError(e, 'Favoriti nisu učitani.');
    }
  }, [apiBaseUrl, token, handleApiError]);

  const loadReminders = useCallback(async () => {
    if (!apiBaseUrl || !token) return;
    try {
      const data = await getSeasonalReminders({ apiBaseUrl, token });
      setReminders(Array.isArray(data) ? data : []);
    } catch (e) {
      await handleApiError(e, 'Podsjetnici nisu učitani.');
    }
  }, [apiBaseUrl, token, handleApiError]);

  useEffect(() => {
    loadPublic();
  }, [loadPublic]);

  const toggleFavorite = async (providerId) => {
    if (!providerId) return;
    setMessage('');
    try {
      const existing = favorites.some((f) => f.providerId === providerId);
      if (existing) {
        await removeGrowthFavorite({ apiBaseUrl, token, providerId });
        setMessage('Uklonjeno iz omiljenih.');
      } else {
        await addGrowthFavorite({ apiBaseUrl, token, providerId });
        setMessage('Spremljeno u omiljene pružatelje.');
      }
      await loadFavorites();
    } catch (e) {
      await handleApiError(e, 'Favorit nije spremljen.');
    }
  };

  const isFavorite = (providerId) => favorites.some((f) => f.providerId === providerId);

  const submitInstant = async ({ providerId, categoryId, requestedStartIso, message }) => {
    if (!providerId || !categoryId) return;
    setMessage('');
    try {
      await createInstantBookingRequest({
        apiBaseUrl,
        token,
        providerId,
        categoryId,
        requestedStart: requestedStartIso,
        message
      });
      setMessage('Zahtjev za brzi termin poslan. Pružatelj će dobiti obavijest.');
    } catch (e) {
      await handleApiError(e, 'Trenutna rezervacija nije poslana.');
    }
  };

  const submitDispute = async ({ title, description, jobId }) => {
    if (!title || !description) return;
    try {
      await createDispute({ apiBaseUrl, token, title, description, jobId });
      setMessage('Spor otvoren. Tim će vam se javiti.');
    } catch (e) {
      await handleApiError(e, 'Spor nije otvoren.');
    }
  };

  return {
    guarantee,
    favorites,
    reminders,
    loadFavorites,
    loadReminders,
    loadPublic,
    toggleFavorite,
    isFavorite,
    submitInstant,
    submitDispute,
    listDisputes: () => getGrowthDisputes({ apiBaseUrl, token }),
    /** Dolazni instant (PROVIDER) ili odlazni (USER) — isto kao default GET */
    listInstant: () => getInstantBookingRequests({ apiBaseUrl, token }),
    /** Moji poslani zahtjevi kao klijent (i za PROVIDER — paralela s web UserProfile) */
    listInstantAsClient: () => getInstantBookingRequests({ apiBaseUrl, token, view: 'client' }),
    patchInstant: (id, action, extra) =>
      patchInstantBookingRequest({ apiBaseUrl, token, id, action, ...extra })
  };
}
