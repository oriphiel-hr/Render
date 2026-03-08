// Karta statistika po regijama - Admin
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

export default function AdminRegionsMap({ regions = [] }) {
  const [positions, setPositions] = useState({});

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      const result = {};
      for (const r of regions) {
        if (r.city) {
          const coords = await geocodeCity(r.city);
          if (!cancelled && coords) result[r.city] = coords;
        }
      }
      if (!cancelled) setPositions(result);
    };
    resolve();
    return () => { cancelled = true; };
  }, [regions]);

  const withCoords = regions.filter((r) => positions[r.city]);
  const center =
    withCoords.length > 0
      ? withCoords
          .reduce(
            (acc, r) => {
              const p = positions[r.city];
              return [acc[0] + p[0], acc[1] + p[1]];
            },
            [0, 0]
          )
          .map((v) => v / withCoords.length)
      : [45.815399, 15.966568];

  if (withCoords.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">Nema podataka po regijama za prikaz na karti</p>
      </div>
    );
  }

  return (
    <div className="h-80 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((r) => (
          <Marker key={r.city} position={positions[r.city]}>
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-gray-900">{r.city}</p>
                <p className="text-sm text-blue-600 mt-1">👥 Pružatelji: {r.providersCount}</p>
                <p className="text-sm text-green-600">📋 Poslovi: {r.jobsCount}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
