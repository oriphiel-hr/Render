// Team Locations Management - GEO-DYNAMIC
import React, { useState, useEffect } from 'react';
import { getTeamLocations, createTeamLocation, updateTeamLocation, deleteTeamLocation, toggleTeamLocationActive } from '../api/exclusive';
import api from '../api';

export default function TeamLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    latitude: '',
    longitude: '',
    address: '',
    postalCode: '',
    radiusKm: 50,
    isActive: true,
    isPrimary: false,
    notes: ''
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const res = await getTeamLocations();
      setLocations(res.data);
    } catch (err) {
      console.error('Error loading locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateTeamLocation(editing.id, formData);
      } else {
        await createTeamLocation(formData);
      }
      await loadLocations();
      resetForm();
    } catch (err) {
      alert('Greška: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Obrisati ovu lokaciju?')) return;
    try {
      await deleteTeamLocation(id);
      await loadLocations();
    } catch (err) {
      alert('Greška: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleTeamLocationActive(id);
      await loadLocations();
    } catch (err) {
      alert('Greška: ' + (err.response?.data?.error || err.message));
    }
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({
      name: '',
      city: '',
      latitude: '',
      longitude: '',
      address: '',
      postalCode: '',
      radiusKm: 50,
      isActive: true,
      isPrimary: false,
      notes: ''
    });
  };

  const startEdit = (loc) => {
    setEditing(loc);
    setFormData({
      name: loc.name || '',
      city: loc.city || '',
      latitude: loc.latitude?.toString() || '',
      longitude: loc.longitude?.toString() || '',
      address: loc.address || '',
      postalCode: loc.postalCode || '',
      radiusKm: loc.radiusKm || 50,
      isActive: loc.isActive ?? true,
      isPrimary: loc.isPrimary ?? false,
      notes: loc.notes || ''
    });
    setShowForm(true);
  };

  // Auto-fill GPS from city (simple geocoding via API)
  const geocodeCity = async (city) => {
    if (!city) return;
    try {
      // Use OpenStreetMap Nominatim (free, no API key needed)
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ', Hrvatska')}&limit=1`);
      const data = await res.json();
      if (data && data[0]) {
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(data[0].lat).toFixed(6),
          longitude: parseFloat(data[0].lon).toFixed(6)
        }));
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📍 Tim Lokacije</h1>
          <p className="text-gray-600 mt-2">Definiraj više lokacija i radijuse pokrivanja za mobilne timove</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          + Nova lokacija
        </button>
      </div>

      {/* Info Box */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Kako funkcionira?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ <strong>Radijus pokrivanja:</strong> Definiraj koliko km od lokacije prihvaćaš leadove</li>
          <li>✅ <strong>Više lokacija:</strong> Dodaj više timova (npr. Zagreb, Split, Osijek)</li>
          <li>✅ <strong>Aktivacija/Deaktivacija:</strong> Privremeno pauziraj regije dok tim nije tamo</li>
          <li>✅ <strong>Geo-inteligentni leadovi:</strong> Sustav šalje samo leadove u radijusu aktivnih lokacija</li>
        </ul>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{editing ? 'Uredi lokaciju' : 'Nova lokacija'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Naziv lokacije *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="npr. Tim A - Dalmacija, Sjedište Zagreb"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Grad *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={e => {
                    setFormData({ ...formData, city: e.target.value });
                    if (!formData.latitude) geocodeCity(e.target.value);
                  }}
                  placeholder="Zagreb"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Latitude (GPS)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="45.815399"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Longitude (GPS)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="15.966568"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Adresa (opcionalno)</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Poštanski broj</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Radijus pokrivanja (km) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="500"
                  value={formData.radiusKm}
                  onChange={e => setFormData({ ...formData, radiusKm: parseInt(e.target.value) || 50 })}
                  className="w-full border rounded px-3 py-2"
                />
                <div className="text-xs text-gray-500 mt-1">Npr. 80 km - leadovi unutar tog radijusa će biti prikazani</div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Napomene (opcionalno)</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="npr. Tim je ovdje do kraja ožujka"
                className="w-full border rounded px-3 py-2"
                rows="2"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span className="text-sm">Aktivna lokacija</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={e => setFormData({ ...formData, isPrimary: e.target.checked })}
                />
                <span className="text-sm">Glavna lokacija (administrativno sjedište)</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                {editing ? 'Spremi izmjene' : 'Dodaj lokaciju'}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
                Odustani
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Locations List */}
      {loading ? (
        <div className="text-center py-8">Učitavanje...</div>
      ) : locations.length === 0 ? (
        <div className="text-center py-8 bg-white border rounded-lg">
          <p className="text-gray-600">Nema dodanih lokacija. Dodaj prvu lokaciju da sustav zna gdje si.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map(loc => (
            <div key={loc.id} className="bg-white border rounded-lg p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{loc.name}</h3>
                    {loc.isPrimary && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Glavna</span>}
                    {loc.isActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Aktivna</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Neaktivna</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    📍 {loc.city}
                    {loc.address && `, ${loc.address}`}
                  </div>
                  {loc.latitude && loc.longitude && (
                    <div className="text-xs text-gray-500 mt-1">
                      GPS: {parseFloat(loc.latitude).toFixed(4)}, {parseFloat(loc.longitude).toFixed(4)}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Radijus:</span>
                  <span className="font-semibold">{loc.radiusKm} km</span>
                </div>
                {loc.notes && (
                  <div className="text-gray-600">
                    <span className="font-medium">Napomena:</span> {loc.notes}
                  </div>
                )}
                {loc.lastActiveAt && (
                  <div className="text-xs text-gray-500">
                    Aktivna od: {new Date(loc.lastActiveAt).toLocaleDateString('hr-HR')}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Leadovi: {loc.leadsReceived} primljeno, {loc.leadsAccepted} prihvaćeno, {loc.leadsConverted} konvertirano
                </div>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => startEdit(loc)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                >
                  Uredi
                </button>
                <button
                  onClick={() => handleToggleActive(loc.id)}
                  className={`px-3 py-1 rounded text-sm ${loc.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                >
                  {loc.isActive ? 'Pauziraj' : 'Aktiviraj'}
                </button>
                <button
                  onClick={() => handleDelete(loc.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                >
                  Obriši
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

