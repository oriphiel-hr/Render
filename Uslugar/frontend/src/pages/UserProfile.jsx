import React, { useState, useEffect } from 'react';
import api from '../api';

// Komponenta za spremljene pretrage i job alerts
function SavedSearchesSection() {
  const [savedSearches, setSavedSearches] = useState([]);
  const [jobAlerts, setJobAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSearch, setShowAddSearch] = useState(false);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newSearchName, setNewSearchName] = useState('');
  const [newAlertName, setNewAlertName] = useState('');
  const [newAlertFrequency, setNewAlertFrequency] = useState('DAILY');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [searchesRes, alertsRes] = await Promise.all([
        api.get('/saved-searches').catch(() => ({ data: [] })),
        api.get('/job-alerts').catch(() => ({ data: [] }))
      ]);
      setSavedSearches(searchesRes.data || []);
      setJobAlerts(alertsRes.data || []);
    } catch (err) {
      console.error('Error loading saved searches/alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSearch = async () => {
    if (!newSearchName.trim()) return;
    try {
      await api.post('/saved-searches', {
        name: newSearchName,
        searchQuery: '',
        filters: {}
      });
      setNewSearchName('');
      setShowAddSearch(false);
      loadData();
    } catch (err) {
      alert('Greška pri spremanju pretrage');
    }
  };

  const handleSaveAlert = async () => {
    if (!newAlertName.trim()) return;
    try {
      await api.post('/job-alerts', {
        name: newAlertName,
        searchQuery: '',
        filters: {},
        frequency: newAlertFrequency
      });
      setNewAlertName('');
      setNewAlertFrequency('DAILY');
      setShowAddAlert(false);
      loadData();
    } catch (err) {
      alert('Greška pri kreiranju alerta');
    }
  };

  const handleDeleteSearch = async (id) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovu pretragu?')) return;
    try {
      await api.delete(`/saved-searches/${id}`);
      loadData();
    } catch (err) {
      alert('Greška pri brisanju pretrage');
    }
  };

  const handleDeleteAlert = async (id) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovaj alert?')) return;
    try {
      await api.delete(`/job-alerts/${id}`);
      loadData();
    } catch (err) {
      alert('Greška pri brisanju alerta');
    }
  };

  const handleToggleAlert = async (id, currentStatus) => {
    try {
      await api.put(`/job-alerts/${id}`, {
        isActive: !currentStatus
      });
      loadData();
    } catch (err) {
      alert('Greška pri ažuriranju alerta');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <p className="text-gray-500">Učitavanje...</p>
      </div>
    );
  }

  return (
    <>
      {/* Spremljene pretrage */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-purple-200 pb-2">
            💾 Spremljene pretrage
          </h3>
          <button
            onClick={() => setShowAddSearch(!showAddSearch)}
            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
          >
            {showAddSearch ? '✕' : '+ Dodaj'}
          </button>
        </div>

        {showAddSearch && (
          <div className="mb-4 p-3 bg-white rounded border border-purple-200">
            <input
              type="text"
              className="w-full px-3 py-2 border rounded mb-2"
              placeholder="Naziv pretrage..."
              value={newSearchName}
              onChange={e => setNewSearchName(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveSearch}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
              >
                Spremi
              </button>
              <button
                onClick={() => {
                  setShowAddSearch(false);
                  setNewSearchName('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
              >
                Otkaži
              </button>
            </div>
          </div>
        )}

        {savedSearches.length === 0 ? (
          <p className="text-gray-500 text-sm">Nemate spremljenih pretraga. Spremite pretragu iz tražilice poslova.</p>
        ) : (
          <div className="space-y-2">
            {savedSearches.map(search => (
              <div key={search.id} className="flex items-center justify-between p-3 bg-white rounded border border-purple-200">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{search.name}</p>
                  {search.lastUsedAt && (
                    <p className="text-xs text-gray-500">
                      Zadnji put korišteno: {new Date(search.lastUsedAt).toLocaleDateString('hr-HR')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteSearch(search.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  Obriši
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Alerts */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-orange-200 pb-2">
            🔔 Job Alerts
          </h3>
          <button
            onClick={() => setShowAddAlert(!showAddAlert)}
            className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors"
          >
            {showAddAlert ? '✕' : '+ Dodaj'}
          </button>
        </div>

        {showAddAlert && (
          <div className="mb-4 p-3 bg-white rounded border border-orange-200">
            <input
              type="text"
              className="w-full px-3 py-2 border rounded mb-2"
              placeholder="Naziv alerta..."
              value={newAlertName}
              onChange={e => setNewAlertName(e.target.value)}
            />
            <select
              className="w-full px-3 py-2 border rounded mb-2"
              value={newAlertFrequency}
              onChange={e => setNewAlertFrequency(e.target.value)}
            >
              <option value="DAILY">Svaki dan</option>
              <option value="WEEKLY">Jednom tjedno</option>
              <option value="INSTANT">Odmah</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleSaveAlert}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm"
              >
                Kreiraj
              </button>
              <button
                onClick={() => {
                  setShowAddAlert(false);
                  setNewAlertName('');
                  setNewAlertFrequency('DAILY');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
              >
                Otkaži
              </button>
            </div>
          </div>
        )}

        {jobAlerts.length === 0 ? (
          <p className="text-gray-500 text-sm">Nemate aktivnih job alertova. Kreirajte alert da dobivate email notifikacije za nove poslove.</p>
        ) : (
          <div className="space-y-2">
            {jobAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded border border-orange-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{alert.name}</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      alert.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {alert.isActive ? 'Aktivan' : 'Neaktivan'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Frekvencija: {alert.frequency === 'DAILY' ? 'Svaki dan' : alert.frequency === 'WEEKLY' ? 'Jednom tjedno' : 'Odmah'}
                    {alert.lastSentAt && ` • Zadnji put: ${new Date(alert.lastSentAt).toLocaleDateString('hr-HR')}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleAlert(alert.id, alert.isActive)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      alert.isActive 
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {alert.isActive ? 'Pauziraj' : 'Aktiviraj'}
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                  >
                    Obriši
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function UserProfile({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: ''
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Morate biti prijavljeni da biste pristupili ovom profilu.');
        setLoading(false);
        return;
      }

      // Dohvati korisničke podatke iz tokena ili API-ja
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          city: userData.city || ''
        });
      } else {
        // Ako nema u localStorage, dohvatiti s API-ja
        const response = await api.get('/users/me');
        setUser(response.data);
        setFormData({
          fullName: response.data.fullName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          city: response.data.city || ''
        });
      }
    } catch (err) {
      console.error('Error loading user:', err);
      if (err.response?.status === 401) {
        setError('Vaš login je istekao. Molimo prijavite se ponovno.');
      } else {
        setError(`Greška pri učitavanju profila (${err.response?.status || 'unknown'}): ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await api.put('/users/me', formData);
      
      // Ažuriraj localStorage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setSuccess('Profil je uspješno ažuriran!');
      setEditMode(false);
      
      // Očisti success poruku nakon 3 sekunde
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Greška pri ažuriranju profila.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">⏳</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Učitavanje profila...</h3>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center py-12">
          <div className="text-red-400 text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Greška</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.hash = '#login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Prijava
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Moj profil</h2>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ✏️ Uredi profil
          </button>
        )}
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Osnovni podaci */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              👤 Osnovni podaci
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ime i prezime
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                ) : (
                  <p className="px-4 py-2 bg-white border border-gray-200 rounded-lg">
                    {user?.fullName || 'Nije uneseno'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <p className="px-4 py-2 bg-white border border-gray-200 rounded-lg">
                  {user?.email || 'Nije uneseno'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Email se ne može mijenjati</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+385911234567"
                  />
                ) : (
                  <p className="px-4 py-2 bg-white border border-gray-200 rounded-lg">
                    {user?.phone || 'Nije uneseno'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grad
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Zagreb"
                  />
                ) : (
                  <p className="px-4 py-2 bg-white border border-gray-200 rounded-lg">
                    {user?.city || 'Nije uneseno'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status i role */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              📋 Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uloga
                </label>
                <p className="px-4 py-2 bg-white border border-gray-200 rounded-lg">
                  {user?.role === 'USER' ? '👤 Korisnik usluge' : 
                   user?.role === 'PROVIDER' ? '🏢 Pružatelj usluge' : 
                   user?.role === 'ADMIN' ? '👑 Administrator' : 
                   user?.role || 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status verifikacije
                </label>
                <p className="px-4 py-2 bg-white border border-gray-200 rounded-lg">
                  {user?.isVerified ? (
                    <span className="text-green-600">✓ Verificiran</span>
                  ) : (
                    <span className="text-yellow-600">⏳ Čeka verifikaciju</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Spremljene pretrage i Job Alerts */}
          <SavedSearchesSection />

          {/* Brzi linkovi */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-blue-200 pb-2">
              🔗 Brzi pristup
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.role === 'USER' && (
                <button
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('my-jobs');
                    } else {
                      window.location.hash = '#my-jobs';
                    }
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left flex items-center justify-between"
                >
                  <span className="font-semibold">📋 Moji poslovi</span>
                  <span>→</span>
                </button>
              )}
              
              {user?.role === 'PROVIDER' && (
                <>
                  <button
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('my-jobs');
                      } else {
                        window.location.hash = '#my-jobs';
                      }
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left flex items-center justify-between"
                  >
                    <span className="font-semibold">📋 Moji poslovi</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('my-leads');
                      } else {
                        window.location.hash = '#my-leads';
                      }
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left flex items-center justify-between"
                  >
                    <span className="font-semibold">🎯 Moji leadovi</span>
                    <span>→</span>
                  </button>
                </>
              )}
              
              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('user');
                  } else {
                    window.location.hash = '#user';
                  }
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-left flex items-center justify-between"
              >
                <span className="font-semibold">🏠 Početna</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {editMode && (
          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {saving ? 'Spremanje...' : '💾 Spremi promjene'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setFormData({
                  fullName: user?.fullName || '',
                  email: user?.email || '',
                  phone: user?.phone || '',
                  city: user?.city || ''
                });
                setError('');
                setSuccess('');
              }}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Otkaži
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

