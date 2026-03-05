// Karta leadova (poslova) u tržnici
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

export default function LeadsMap({ leads = [], onLeadClick }) {
  const [positions, setPositions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      const result = {};
      for (const lead of leads) {
        if (lead.latitude != null && lead.longitude != null) {
          result[lead.id] = [lead.latitude, lead.longitude];
        } else if (lead.city) {
          const coords = await geocodeCity(lead.city);
          if (!cancelled && coords) result[lead.id] = coords;
        }
      }
      if (!cancelled) setPositions(result);
      setLoading(false);
    };
    resolve();
    return () => { cancelled = true; };
  }, [leads]);

  const withCoords = leads.filter((l) => positions[l.id]);
  const center =
    withCoords.length > 0
      ? withCoords
          .reduce((acc, l) => {
            const pos = positions[l.id];
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
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">Nema lokacija za prikaz. Leadovi trebaju imati grad.</p>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer center={center} zoom={8} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((lead) => (
          <Marker key={lead.id} position={positions[lead.id]}>
            <Popup>
              <div className="min-w-[200px]">
                <p className="font-semibold text-gray-900">{lead.title}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{lead.description}</p>
                {lead.city && <p className="text-sm text-gray-500">📍 {lead.city}</p>}
                {lead.distanceKm != null && lead.distanceKm !== Infinity && (
                  <p className="text-xs text-blue-600 font-medium">~{lead.distanceKm} km od vas</p>
                )}
                <p className="text-sm font-semibold text-green-600 mt-1">
                  {lead.leadPrice || 10} kredita
                </p>
                <button
                  type="button"
                  onClick={() => onLeadClick && onLeadClick(lead)}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Kupi lead →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
