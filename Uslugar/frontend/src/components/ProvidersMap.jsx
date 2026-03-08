// Karta pružatelja usluga
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

export default function ProvidersMap({ providers = [], onProviderClick }) {
  const [positions, setPositions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      const result = {};
      for (const p of providers) {
        if (p.latitude != null && p.longitude != null) {
          result[p.id] = [p.latitude, p.longitude];
        } else {
          const city = p.city || p.user?.city;
          if (city) {
            const coords = await geocodeCity(city);
            if (!cancelled && coords) result[p.id] = coords;
          }
        }
      }
      if (!cancelled) setPositions(result);
      setLoading(false);
    };
    resolve();
    return () => { cancelled = true; };
  }, [providers]);

  const withCoords = providers.filter((p) => positions[p.id]);
  const center =
    withCoords.length > 0
      ? withCoords
          .reduce((acc, p) => {
            const pos = positions[p.id];
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
        <p className="text-gray-500 dark:text-gray-400">Nema lokacija za prikaz. Pružatelji trebaju imati grad u profilu.</p>
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
        {withCoords.map((p) => (
          <Marker key={p.id} position={positions[p.id]}>
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-gray-900 dark:text-white">{p.user?.fullName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{p.user?.email}</p>
                {(p.city || p.user?.city) && (
                  <p className="text-sm text-gray-500">📍 {p.city || p.user?.city}</p>
                )}
                {p.distanceKm != null && (
                  <p className="text-xs text-blue-600 font-medium">~{p.distanceKm} km od vas</p>
                )}
                <button
                  type="button"
                  onClick={() => onProviderClick && onProviderClick(p)}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Pregledaj profil →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
