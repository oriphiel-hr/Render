// Pregledna karta svih tim lokacija
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
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

export default function TeamLocationsMap({ locations = [] }) {
  const [positions, setPositions] = useState({});

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      const result = {};
      for (const loc of locations) {
        if (loc.latitude != null && loc.longitude != null) {
          result[loc.id] = [parseFloat(loc.latitude), parseFloat(loc.longitude)];
        } else if (loc.city) {
          const coords = await geocodeCity(loc.city);
          if (!cancelled && coords) result[loc.id] = coords;
        }
      }
      if (!cancelled) setPositions(result);
    };
    resolve();
    return () => { cancelled = true; };
  }, [locations]);

  const withCoords = locations.filter((l) => positions[l.id]);
  const center =
    withCoords.length > 0
      ? withCoords
          .reduce((acc, l) => {
            const p = positions[l.id];
            return [acc[0] + p[0], acc[1] + p[1]];
          }, [0, 0])
          .map((v) => v / withCoords.length)
      : [45.815399, 15.966568];

  if (withCoords.length === 0) return null;

  return (
    <div className="h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
      <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((loc) => {
          const pos = positions[loc.id];
          const radius = (loc.radiusKm || 50) * 1000;
          const isActive = loc.isActive !== false;
          return (
            <React.Fragment key={loc.id}>
              <Marker position={pos}>
                <Popup>
                  <div className="min-w-[160px]">
                    <p className="font-semibold">{loc.name}</p>
                    <p className="text-sm text-gray-600">📍 {loc.city}</p>
                    <p className="text-xs text-gray-500">Radijus: {loc.radiusKm} km</p>
                    {isActive ? <span className="text-xs text-green-600">Aktivna</span> : <span className="text-xs text-gray-500">Neaktivna</span>}
                  </div>
                </Popup>
              </Marker>
              {loc.latitude != null && loc.longitude != null && radius > 0 && (
                <Circle
                  center={pos}
                  radius={radius}
                  pathOptions={{
                    color: isActive ? '#3b82f6' : '#9ca3af',
                    fillColor: isActive ? '#93c5fd' : '#d1d5db',
                    fillOpacity: 0.2,
                    weight: 1
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
