import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

/**
 * Pružatelj: slobodni termini (slotovi) + dolazni zahtjevi za brzi termin (instant).
 * Van glavnog <form> profila.
 */
export default function ProviderAvailabilityPanel({ categoryOptions = [], onDataChange }) {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const [newCat, setNewCat] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  const [counterId, setCounterId] = useState(null);
  const [counterWhen, setCounterWhen] = useState('');

  const load = useCallback(async () => {
    setErr('');
    try {
      const [s, b] = await Promise.all([
        api.get('/growth/availability-slots'),
        api.get('/growth/instant-bookings')
      ]);
      setSlots(Array.isArray(s.data) ? s.data : []);
      setBookings(Array.isArray(b.data) ? b.data : []);
      onDataChange?.();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Nije moguće učitati podatke');
      setSlots([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [onDataChange]);

  useEffect(() => {
    load();
  }, [load]);

  const localMin = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const addSlot = async (e) => {
    e?.preventDefault();
    if (!newCat || !newStart || !newEnd) {
      setErr('Odaberite kategoriju, početak i kraj.');
      return;
    }
    const s = new Date(newStart);
    const en = new Date(newEnd);
    if (!(en > s)) {
      setErr('Kraj mora biti nakon početka.');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      await api.post('/growth/availability-slots', {
        categoryId: newCat,
        startAt: s.toISOString(),
        endAt: en.toISOString()
      });
      setNewStart('');
      setNewEnd('');
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Greška pri dodavanju slota');
    } finally {
      setBusy(false);
    }
  };

  const delSlot = async (id) => {
    if (!confirm('Obrisati ovaj slobodan termin?')) return;
    setBusy(true);
    setErr('');
    try {
      await api.delete(`/growth/availability-slots/${encodeURIComponent(id)}`);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Brisanje nije uspjelo');
    } finally {
      setBusy(false);
    }
  };

  const patchBooking = async (id, action, extra = {}) => {
    setBusy(true);
    setErr('');
    try {
      await api.patch(`/growth/instant-bookings/${encodeURIComponent(id)}`, { action, ...extra });
      setCounterId(null);
      setCounterWhen('');
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Akcija nije uspjela');
    } finally {
      setBusy(false);
    }
  };

  if (categoryOptions.length === 0) {
    return (
      <div className="mt-8 p-4 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-900">
        Nema kategorija na profilu — uredite profil i dodajte kategoriju da biste unosili slobodne
        termine.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-8 text-center text-slate-500 text-sm">Učitavanje brzih termina…</div>
    );
  }

  return (
    <div className="mt-10 space-y-8 border-t border-slate-200 pt-8">
      <h3 className="text-xl font-bold text-slate-900">📅 Brzi termini (instant) — vaš kalendar u Uslugaru</h3>
      {err && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>
      )}

      <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-5">
        <h4 className="text-lg font-semibold text-teal-900 mb-2">Slobodni slotovi (vidljivi klijentima u tražilici)</h4>
        <p className="text-sm text-teal-800 mb-4">
          Klijent može odabrati slot prilikom zahtjeva za brzi termin za kategoriju s uključenim
          &quot;instant booking&quot; u bazi. Koristite realne intervale (npr. 2h).
        </p>
        <form onSubmit={addSlot} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end mb-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Kategorija</label>
            <select
              className="w-full border rounded-md px-2 py-1.5 text-sm mt-0.5"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
            >
              <option value="">— odaberi —</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Početak</label>
            <input
              type="datetime-local"
              className="w-full border rounded-md px-2 py-1.5 text-sm mt-0.5"
              min={localMin()}
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Kraj</label>
            <input
              type="datetime-local"
              className="w-full border rounded-md px-2 py-1.5 text-sm mt-0.5"
              min={newStart || localMin()}
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="px-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Dodaj slot
          </button>
        </form>
        {slots.length === 0 ? (
          <p className="text-sm text-slate-600">Nema upisanih slobodnih termina.</p>
        ) : (
          <ul className="divide-y divide-teal-100">
            {slots.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span>
                  <strong>{s.category?.name || 'Kategorija'}</strong> ·{' '}
                  {new Date(s.startAt).toLocaleString('hr-HR')} –{' '}
                  {new Date(s.endAt).toLocaleString('hr-HR')}
                </span>
                <button
                  type="button"
                  onClick={() => delSlot(s.id)}
                  disabled={busy}
                  className="text-red-600 text-xs font-medium hover:underline disabled:opacity-50"
                >
                  Obriši
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5">
        <h4 className="text-lg font-semibold text-indigo-900 mb-2">Dolazni zahtjevi (brzi termini)</h4>
        <p className="text-sm text-indigo-800 mb-3">
          Potvrdite, odbijte ili predložite drugi termin. Korisniku se šalje obavijest u sustavu.
        </p>
        {bookings.length === 0 ? (
          <p className="text-sm text-slate-600">Nema otvorenih zahtjeva.</p>
        ) : (
          <ul className="space-y-3">
            {bookings.map((b) => (
              <li key={b.id} className="p-3 rounded-lg border border-indigo-100 bg-white/90 text-sm">
                <div className="flex flex-wrap justify-between gap-1">
                  <div>
                    <span className="font-medium">{b.user?.fullName || 'Korisnik'}</span>
                    {b.user?.phone ? <span className="text-slate-500"> · {b.user.phone}</span> : null}
                    <p className="text-slate-600 mt-0.5">Kategorija: {b.category?.name || '—'}</p>
                    <p>
                      Termin: {new Date(b.requestedStart).toLocaleString('hr-HR')}{' '}
                      {b.status ? (
                        <span className="ml-1 text-xs font-semibold text-slate-500">[{b.status}]</span>
                      ) : null}
                    </p>
                    {b.message ? <p className="text-slate-700 mt-1">„{b.message}”</p> : null}
                  </div>
                </div>
                {['PENDING', 'SLOT_BOUND', 'COUNTER_PROPOSED'].includes(b.status) && (
                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => patchBooking(b.id, 'confirm')}
                      className="px-2 py-1 text-xs font-medium bg-green-600 text-white rounded"
                    >
                      Potvrdi
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        const r = window.prompt('Razlog odbijanja (opcionalno):') || '';
                        patchBooking(b.id, 'decline', { declineReason: r || 'Odbijeno' });
                      }}
                      className="px-2 py-1 text-xs font-medium border border-red-300 text-red-800 rounded"
                    >
                      Odbij
                    </button>
                    {counterId === b.id ? (
                      <span className="flex flex-wrap items-center gap-1">
                        <input
                          type="datetime-local"
                          className="border rounded px-1 py-0.5 text-xs"
                          value={counterWhen}
                          onChange={(e) => setCounterWhen(e.target.value)}
                          min={localMin()}
                        />
                        <button
                          type="button"
                          disabled={busy || !counterWhen}
                          onClick={() =>
                            patchBooking(b.id, 'counter', {
                              counterOfferStart: new Date(counterWhen).toISOString()
                            })
                          }
                          className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
                        >
                          Pošalji alternativu
                        </button>
                        <button
                          type="button"
                          onClick={() => { setCounterId(null); setCounterWhen(''); }}
                          className="text-xs text-slate-500"
                        >
                          Odustani
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => { setCounterId(b.id); setCounterWhen(''); }}
                        className="px-2 py-1 text-xs border border-indigo-300 text-indigo-800 rounded"
                      >
                        Druga ponuda (termin)
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
