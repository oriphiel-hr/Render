// Pregledna karta svih tim lokacija + lokacije poslova (leadova)
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

// Koristimo divIcon umjesto CDN slika da izbjegnemo Tracking Prevention u preglednicima (npr. Edge)
const greenIcon = L.divIcon({
  className: 'leaflet-marker-custom',
  html: '<div style="width:100%;height:100%;border-radius:50%;background:#22c55e;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -13]
});

const orangeIcon = L.divIcon({
  className: 'leaflet-marker-custom',
  html: '<div style="width:100%;height:100%;border-radius:50%;background:#f97316;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -13]
});

function geocodeCity(city) {
  if (!city) return Promise.resolve(null);
  return fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent((city || '') + ', Hrvatska')}&limit=1`
  )
    .then((r) => r.json())
    .then((data) => (data?.[0] ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null));
}

export default function TeamLocationsMap({ locations = [], jobs = [] }) {
  const [positions, setPositions] = useState({});
  const [jobPositions, setJobPositions] = useState({});

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

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      const result = {};
      for (const item of jobs) {
        const j = item.job || item;
        const key = j.id;
        if (j.latitude != null && j.longitude != null) {
          result[key] = [parseFloat(j.latitude), parseFloat(j.longitude)];
        } else if (j.city) {
          const coords = await geocodeCity(j.city);
          if (!cancelled && coords) result[key] = coords;
        }
      }
      if (!cancelled) setJobPositions(result);
    };
    resolve();
    return () => { cancelled = true; };
  }, [jobs]);

  const withCoords = locations.filter((l) => positions[l.id]);
  const jobsWithCoords = jobs.filter((item) => {
    const j = item.job || item;
    return jobPositions[j.id];
  });
  const allPoints = [...withCoords.map((l) => positions[l.id]), ...jobsWithCoords.map((item) => jobPositions[(item.job || item).id])];
  const center =
    allPoints.length > 0
      ? allPoints.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]).map((v) => v / allPoints.length)
      : [45.815399, 15.966568];

  if (withCoords.length === 0 && jobsWithCoords.length === 0) return null;

  return (
    <div className="h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-6 relative">
      <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((loc) => {
          const pos = positions[loc.id];
          const radius = (loc.radiusKm || 50) * 1000;
          const isActive = loc.isActive !== false;
          const circleColor = loc.isPrimary ? '#2563eb' : '#0ea5e9';
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
                    color: isActive ? circleColor : '#9ca3af',
                    fillColor: isActive ? circleColor : '#d1d5db',
                    fillOpacity: 0.2,
                    weight: 1,
                    dashArray: loc.isPrimary ? undefined : '4 4'
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
        {jobsWithCoords.map((item) => {
          const j = item.job || item;
          const pos = jobPositions[j.id];
          const statusLabel = item.status === 'converted' ? 'Konvertirano' : 'Primljeno';
          const icon = item.status === 'converted' ? greenIcon : orangeIcon;
          return (
            <Marker key={`job-${j.id}`} position={pos} icon={icon}>
              <Popup>
                <div className="min-w-[180px]">
                  <p className="font-semibold text-gray-900 dark:text-white">{j.title}</p>
                  {j.city && <p className="text-sm text-gray-600 dark:text-gray-400">📍 {j.city}</p>}
                  <p className="text-xs font-medium mt-1 text-green-600">{statusLabel}</p>
                  {j.category?.name && <p className="text-xs text-gray-500 mt-0.5">{j.category.name}</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      {(withCoords.length > 0 || jobsWithCoords.length > 0) && (
        <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 dark:bg-gray-800/90 rounded px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 shadow space-y-0.5">
          <div>🔵 puni krug = primarna tim lokacija</div>
          <div>🔵 isprekidani krug = dodatna tim lokacija</div>
          <div>🟢 pin = konvertirani posao</div>
          <div>🟠 pin = primljeni lead (još nije konvertiran)</div>
        </div>
      )}
    </div>
  );
}
