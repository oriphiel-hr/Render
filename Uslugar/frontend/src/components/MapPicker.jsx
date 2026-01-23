import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix za default marker ikone u Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Komponenta za klik na kartu
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

// Komponenta za automatski zoom na lokaciju
function MapCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapPicker({
  initialLatitude = null,
  initialLongitude = null,
  initialCity = null,
  onLocationSelect = () => {},
  showRadius = false,
  radiusKm = 50,
  height = '400px',
  className = '',
  allowClick = true,
  zoom = 13
}) {
  const [position, setPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([45.815399, 15.966568]); // Zagreb default
  const mapRef = useRef(null);

  // Inicijaliziraj poziciju
  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      const pos = [initialLatitude, initialLongitude];
      setPosition(pos);
      setMapCenter(pos);
    } else if (initialCity) {
      // Geocode city ako nema koordinata
      geocodeCity(initialCity);
    }
  }, [initialLatitude, initialLongitude, initialCity]);

  // Geocode city u koordinate
  const geocodeCity = async (city) => {
    if (!city) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ', Hrvatska')}&limit=1`
      );
      const data = await res.json();
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const pos = [lat, lon];
        setPosition(pos);
        setMapCenter(pos);
        onLocationSelect(lat, lon, city);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  // Handler za klik na kartu
  const handleMapClick = (lat, lng) => {
    const pos = [lat, lng];
    setPosition(pos);
    setMapCenter(pos);
    onLocationSelect(lat, lng);
  };

  // Handler za drag marker
  const handleMarkerDrag = (e) => {
    const { lat, lng } = e.target.getLatLng();
    const pos = [lat, lng];
    setPosition(pos);
    onLocationSelect(lat, lng);
  };

  return (
    <div className={`map-picker ${className}`} style={{ height, position: 'relative' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Prikaži marker ako postoji pozicija */}
        {position && (
          <>
            <Marker
              position={position}
              draggable={true}
              eventHandlers={{
                dragend: handleMarkerDrag,
              }}
            />
            
            {/* Prikaži radijus pokrivanja ako je potrebno */}
            {showRadius && radiusKm > 0 && (
              <Circle
                center={position}
                radius={radiusKm * 1000} // Leaflet koristi metre
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.2,
                  weight: 2,
                }}
              />
            )}
          </>
        )}
        
        {/* Handler za klik na kartu */}
        {allowClick && <MapClickHandler onLocationSelect={handleMapClick} />}
        
        {/* Automatski centriraj kartu */}
        <MapCenter center={mapCenter} zoom={zoom} />
      </MapContainer>
      
      {/* Info box */}
      <div className="absolute top-2 left-2 bg-white bg-opacity-90 p-2 rounded shadow text-xs z-10">
        {position ? (
          <div>
            <div><strong>Lat:</strong> {position[0].toFixed(6)}</div>
            <div><strong>Lng:</strong> {position[1].toFixed(6)}</div>
            {showRadius && <div><strong>Radijus:</strong> {radiusKm} km</div>}
          </div>
        ) : (
          <div>Kliknite na kartu ili povucite marker za odabir lokacije</div>
        )}
      </div>
    </div>
  );
}

