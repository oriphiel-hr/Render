// Karta članova tima - prikazuje lokacije na karti
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
  return fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent((city || '') + ', Hrvatska')}&limit=1`
  )
    .then((r) => r.json())
    .then((data) => (data?.[0] ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null));
}

export default function TeamMap({ members = [] }) {
  const [positions, setPositions] = useState({}); // memberId -> [lat, lng]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      const result = {};
      for (const m of members) {
        if (m.latitude != null && m.longitude != null) {
          result[m.id] = [m.latitude, m.longitude];
        } else if (m.city) {
          const coords = await geocodeCity(m.city);
          if (!cancelled && coords) result[m.id] = coords;
        }
      }
      if (!cancelled) {
        setPositions(result);
      }
      setLoading(false);
    };
    resolve();
    return () => { cancelled = true; };
  }, [members]);

  const withCoords = members.filter((m) => positions[m.id]);
  const center = withCoords.length > 0
    ? withCoords.reduce(
        (acc, m) => {
          const p = positions[m.id];
          return [acc[0] + p[0], acc[1] + p[1]];
        },
        [0, 0]
      ).map((v) => v / withCoords.length)
    : [45.815399, 15.966568];

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500">
        Učitavanje karte...
      </div>
    );
  }

  if (withCoords.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">
          Nema lokacija za prikaz. Dodajte grad u profilu člana ili u Lokacije timova.
        </p>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((m) => (
          <Marker key={m.id} position={positions[m.id]}>
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-gray-900">{m.fullName}</p>
                <p className="text-sm text-gray-600">{m.email}</p>
                {m.city && <p className="text-sm text-gray-500">📍 {m.city}</p>}
                <p className="text-xs mt-2">
                  <span className={m.isAvailable ? 'text-green-600' : 'text-red-600'}>
                    {m.isAvailable ? 'Dostupan' : 'Nedostupan'}
                  </span>
                  {' · '}
                  {m.activeJobsCount ?? 0} aktivnih poslova
                </p>
                {m.categories?.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{m.categories.join(', ')}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
