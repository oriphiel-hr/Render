// Karta poslova - prikazuje poslove na karti (direktor: lead queue, klijent: moji poslovi)
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function geocodeCity(city) {
  if (!city) return Promise.resolve(null);
  return fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent((city || '') + ', Hrvatska')}&limit=1`
  )
    .then((r) => r.json())
    .then((data) => (data?.[0] ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null));
}

const STATUS_LABELS = {
  OPEN: 'Otvoren',
  IN_PROGRESS: 'U tijeku',
  COMPLETED: 'Završen',
  CANCELLED: 'Otkazan',
  PENDING: 'Čeka',
  ASSIGNED: 'Dodijeljeno',
  PONUDA: 'Ponuda čeka',
  LEAD: 'Lead čeka'
};

export default function JobsMap({ jobs = [], onJobClick, showStatus = true }) {
  const [positions, setPositions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      const result = {};
      for (const job of jobs) {
        const j = job.job || job;
        if (j.latitude != null && j.longitude != null) {
          result[j.id] = [j.latitude, j.longitude];
        } else if (j.city) {
          const coords = await geocodeCity(j.city);
          if (!cancelled && coords) result[j.id] = coords;
        }
      }
      if (!cancelled) setPositions(result);
      setLoading(false);
    };
    resolve();
    return () => { cancelled = true; };
  }, [jobs]);

  const withCoords = jobs.filter((j) => {
    const job = j.job || j;
    return positions[job.id];
  });

  const center =
    withCoords.length > 0
      ? withCoords
          .reduce((acc, j) => {
            const job = j.job || j;
            const pos = positions[job.id];
            return [acc[0] + pos[0], acc[1] + pos[1]];
          }, [0, 0])
          .map((v) => v / withCoords.length)
      : [45.815399, 15.966568];

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500">Učitavanje karte...</div>
    );
  }

  if (withCoords.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">Nema poslova s lokacijom za prikaz. Poslovi trebaju imati grad.</p>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <MapContainer center={center} zoom={8} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((entry) => {
          const job = entry.job || entry;
          const status = entry.status ?? job.status;
          const code = entry.leadLabel || entry.code || null;
          return (
            <Marker key={job.id} position={positions[job.id]}>
              <Popup>
                <div className="min-w-[220px]">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {code ? `${code} — ${job.title}` : job.title}
                  </p>
                  {job.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{job.description}</p>
                  )}
                  {job.city && <p className="text-sm text-gray-500 mt-1">📍 {job.city}</p>}
                  {showStatus && status && (
                    <p className="text-xs font-medium mt-2 text-indigo-600">
                      {STATUS_LABELS[status] || status}
                    </p>
                  )}
                  {job.category?.name && (
                    <p className="text-xs text-gray-500 mt-1">{job.category.name}</p>
                  )}
                  {job.user && (
                    <p className="text-xs text-gray-500">Klijent: {job.user.fullName}</p>
                  )}
                  {onJobClick && (
                    <button
                      type="button"
                      onClick={() => onJobClick(entry)}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Detalji →
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
