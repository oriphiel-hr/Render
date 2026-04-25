import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DISPUTE_WORKFLOW_PHASES } from '@uslugar/shared';
import api from '../api';
import { useAuth } from '../App.jsx';

function localDatetimeLocalMin() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

/**
 * Favorit, brzi termin (instant) i prijava spora — isti API kao mobilna aplikacija.
 */
export default function ProviderGrowthPanel({ provider, providerUserId, currentUserId }) {
  const { token } = useAuth();
  const [fav, setFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [dTitle, setDTitle] = useState('');
  const [dDesc, setDDesc] = useState('');
  const [dJob, setDJob] = useState('');
  const [dBusy, setDBusy] = useState(false);
  const [catId, setCatId] = useState('');
  const [start, setStart] = useState('');
  const [msg, setMsg] = useState('');
  const [insBusy, setInsBusy] = useState(false);
  const [banner, setBanner] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');

  const instantCats = useMemo(
    () => (provider?.categories || []).filter((c) => c.supportsInstantBooking),
    [provider]
  );

  const loadFav = useCallback(async () => {
    if (!token || !providerUserId) return;
    try {
      const { data } = await api.get('/growth/favorites');
      const list = Array.isArray(data) ? data : [];
      setFav(list.some((r) => r.providerId === providerUserId));
    } catch {
      setFav(false);
    }
  }, [token, providerUserId]);

  useEffect(() => {
    loadFav();
  }, [loadFav]);

  useEffect(() => {
    if (!catId || !providerUserId) {
      setAvailableSlots([]);
      setSelectedSlotId('');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/growth/availability-slots/public', {
          params: { providerId: providerUserId, categoryId: catId }
        });
        if (!cancelled) {
          setAvailableSlots(Array.isArray(data) ? data : []);
          setSelectedSlotId('');
        }
      } catch {
        if (!cancelled) setAvailableSlots([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [catId, providerUserId]);

  const toggleFav = async () => {
    if (!token) {
      setBanner('Prijavite se (Moj račun) da koristite favorite.');
      return;
    }
    if (currentUserId === providerUserId) return;
    setFavLoading(true);
    setBanner('');
    try {
      if (fav) {
        await api.delete(`/growth/favorites/${encodeURIComponent(providerUserId)}`);
        setFav(false);
      } else {
        await api.post('/growth/favorites', { providerId: providerUserId });
        setFav(true);
      }
    } catch (e) {
      setBanner(e?.response?.data?.error || 'Neuspjeh.');
    } finally {
      setFavLoading(false);
    }
  };

  const submitInstant = async (e) => {
    e.preventDefault();
    if (!token) {
      setBanner('Prijavite se za brzi termin.');
      return;
    }
    if (!catId || !start) {
      setBanner('Odaberite kategoriju i termin.');
      return;
    }
    setInsBusy(true);
    setBanner('');
    try {
      await api.post('/growth/instant-bookings', {
        providerId: providerUserId,
        categoryId: catId,
        requestedStart: new Date(start).toISOString(),
        message: msg || undefined,
        slotId: selectedSlotId || undefined
      });
      setBanner('Zahtjev poslan. Pružatelj će dobiti obavijest u sustavu (uz potvrdu slota ako je odabran).');
      setMsg('');
    } catch (e) {
      setBanner(e?.response?.data?.error || 'Neuspjeh.');
    } finally {
      setInsBusy(false);
    }
  };

  const submitDispute = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!dTitle.trim() || !dDesc.trim()) {
      setBanner('Naslov i opis su obavezni.');
      return;
    }
    setDBusy(true);
    setBanner('');
    try {
      await api.post('/growth/disputes', {
        title: dTitle.trim(),
        description: dDesc.trim(),
        jobId: dJob.trim() || undefined
      });
      setShowDispute(false);
      setDTitle('');
      setDDesc('');
      setDJob('');
      setBanner('Prijava zaprimljena. Tim pregledava upit (Uslugar Guarantee / medijacija).');
    } catch (e) {
      setBanner(e?.response?.data?.error || 'Neuspjeh.');
    } finally {
      setDBusy(false);
    }
  };

  if (!provider) return null;
  const isSelf = currentUserId && String(currentUserId) === String(providerUserId);
  const canClient = token && !isSelf;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 space-y-4">
      <h3 className="text-base font-semibold text-slate-900">Kao korisnik Uslugara</h3>
      <p className="text-xs text-slate-600">
        Favorit, brzi termin (kategorije koje to dopuštaju) i službena prijava spora — usklađeno s
        istim API-jem kao u aplikaciji.
      </p>
      {banner ? (
        <p className="text-sm text-slate-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">{banner}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {canClient ? (
          <button
            type="button"
            disabled={favLoading}
            onClick={toggleFav}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50"
          >
            {fav ? '★ U favoritima' : '☆ Spremi u favorite'}
          </button>
        ) : null}
        {canClient ? (
          <button
            type="button"
            onClick={() => {
              setShowDispute(true);
              setBanner('');
            }}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100"
          >
            Prijavi problem / spor
          </button>
        ) : null}
        {!token ? <p className="text-sm text-slate-600 w-full">Prijavite se da biste koristili ove mogućnosti.</p> : null}
        {token && isSelf ? (
          <p className="text-sm text-slate-500 w-full">Ovo su akcije za klijente — ne prikazujemo na vlastitom profilu.</p>
        ) : null}
      </div>
      {canClient && instantCats.length > 0 ? (
        <form onSubmit={submitInstant} className="space-y-2 border-t border-slate-200 pt-3">
          <p className="text-sm font-medium text-slate-800">Brzi termin</p>
          <p className="text-xs text-slate-500">
            Samo kategorije označene u sustavu za instant booking. Pružatelj nakon toga javlja
            u aplikaciji/četu.
          </p>
          <select
            className="w-full border rounded px-2 py-1.5 text-sm"
            value={catId}
            onChange={(e) => setCatId(e.target.value)}
            required
          >
            <option value="">— kategorija —</option>
            {instantCats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            className="w-full border rounded px-2 py-1.5 text-sm"
            value={start}
            min={localDatetimeLocalMin()}
            onChange={(e) => setStart(e.target.value)}
            required
          />
          <textarea
            className="w-full border rounded px-2 py-1.5 text-sm"
            rows={2}
            placeholder="Kratka poruka (opcionalno)"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
          />
          <button
            type="submit"
            disabled={insBusy}
            className="px-3 py-1.5 bg-sky-600 text-white rounded text-sm font-medium disabled:opacity-50"
          >
            {insBusy ? 'Slanje…' : 'Zatraži termin'}
          </button>
        </form>
      ) : null}
      {canClient && instantCats.length === 0 ? (
        <p className="text-xs text-slate-500 border-t border-slate-200 pt-2">
          Brzi termin nije dostupan: nijedna od kategorija ovog pružatelja nema u adminu uključen
          „instant“ (ili pružatelj nije u takvoj kategoriji).
        </p>
      ) : null}

      {showDispute ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={submitDispute}
            className="bg-white rounded-lg max-w-md w-full p-4 shadow-xl space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <h4 className="font-semibold text-slate-900">Prijava spora / problema (Uslugar Guarantee)</h4>
            <p className="text-xs text-slate-600">
              Ovo otvara službeni zapis. To nije chat s pružateljem; tim vidi sadržaj. Tipičan tijek:
            </p>
            <ol className="text-xs text-slate-600 list-decimal list-inside space-y-0.5 my-2">
              {DISPUTE_WORKFLOW_PHASES.map((ph) => (
                <li key={ph.key}>
                  <span className="font-medium text-slate-800">{ph.label}:</span> {ph.hint}
                </li>
              ))}
            </ol>
            <input
              className="w-full border rounded px-2 py-1.5 text-sm"
              placeholder="Kratki naslov"
              value={dTitle}
              onChange={(e) => setDTitle(e.target.value)}
            />
            <textarea
              className="w-full border rounded px-2 py-1.5 text-sm"
              rows={4}
              placeholder="Detaljan opis"
              value={dDesc}
              onChange={(e) => setDDesc(e.target.value)}
            />
            <input
              className="w-full border rounded px-2 py-1.5 text-sm"
              placeholder="ID posla (ako ga imate, opcionalno)"
              value={dJob}
              onChange={(e) => setDJob(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="px-3 py-1.5 text-sm"
                onClick={() => setShowDispute(false)}
              >
                Odustani
              </button>
              <button
                type="submit"
                disabled={dBusy}
                className="px-3 py-1.5 bg-rose-600 text-white rounded text-sm disabled:opacity-50"
              >
                {dBusy ? 'Slanje…' : 'Pošalji'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
