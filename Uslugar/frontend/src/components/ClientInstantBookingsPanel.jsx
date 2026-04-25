import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

/**
 * Klijent: moji odlazni zahtjevi za brzi termin.
 * GET /api/growth/instant-bookings?view=client (potrebno i za pružatelja koji je tražio tuđu uslugu)
 */
export default function ClientInstantBookingsPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setErr('');
    try {
      const { data } = await api.get('/growth/instant-bookings', { params: { view: 'client' } });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Nije moguće učitati zahtjeve');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (id, action) => {
    setBusy(true);
    setErr('');
    try {
      await api.patch(`/growth/instant-bookings/${encodeURIComponent(id)}`, { action });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Akcija nije uspjela');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-slate-500 py-2">Učitavanje vaših brzih termina…</div>
    );
  }

  return (
    <div className="bg-sky-50 border border-sky-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-sky-900 mb-1 border-b border-sky-200 pb-2">
        ⚡ Moji zahtjevi za brzi termin
      </h3>
      <p className="text-sm text-sky-800 mb-3">
        Poslani zahtjevi prema pružateljima (istim API-jem kao u tražilici / profilu). Možete odustati
        ili prihvatiti alternativni termin koji pruži pružatelj.
      </p>
      {err && <p className="text-sm text-red-700 mb-2">{err}</p>}
      {rows.length === 0 ? (
        <p className="text-sm text-slate-600">Nema poslanih zahtjeva.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((b) => (
            <li key={b.id} className="p-3 rounded-lg border border-sky-100 bg-white/90 text-sm">
              <p className="font-medium text-slate-900">
                {b.provider?.fullName || 'Pružatelj'}
                {b.status ? (
                  <span className="ml-2 text-xs font-normal text-slate-500">[{b.status}]</span>
                ) : null}
              </p>
              <p className="text-slate-600">Kategorija: {b.category?.name || '—'}</p>
              <p>
                Termin: {new Date(b.requestedStart).toLocaleString('hr-HR')}
                {b.counterOfferStart ? (
                  <span className="block text-amber-800 mt-1">
                    Alternativa pružatelja: {new Date(b.counterOfferStart).toLocaleString('hr-HR')}
                  </span>
                ) : null}
              </p>
              {b.message ? <p className="text-slate-700 mt-1">„{b.message}”</p> : null}
              <div className="mt-2 flex flex-wrap gap-2">
                {['PENDING', 'SLOT_BOUND', 'COUNTER_PROPOSED'].includes(b.status) && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (confirm('Odustati od ovog zahtjeva?')) patch(b.id, 'cancel');
                    }}
                    className="px-2 py-1 text-xs border border-slate-300 rounded text-slate-800"
                  >
                    Odustani
                  </button>
                )}
                {b.status === 'COUNTER_PROPOSED' && b.counterOfferStart && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => patch(b.id, 'accept_counter')}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded"
                  >
                    Prihvati alternativni termin
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
