// Mala mapa za prikaz jedne lokacije (posao, pružatelj)
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

export default function LocationMap({ city, latitude, longitude, label, height = '180px' }) {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (latitude != null && longitude != null) {
      setPosition([parseFloat(latitude), parseFloat(longitude)]);
      return;
    }
    if (city) {
      geocodeCity(city).then((coords) => {
        if (!cancelled && coords) setPosition(coords);
      });
    }
    return () => { cancelled = true; };
  }, [city, latitude, longitude]);

  if (!position) return null;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height }}>
      <MapContainer center={position} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          {label && (
            <Popup>
              <span className="font-medium">{label}</span>
            </Popup>
          )}
        </Marker>
      </MapContainer>
    </div>
  );
}
