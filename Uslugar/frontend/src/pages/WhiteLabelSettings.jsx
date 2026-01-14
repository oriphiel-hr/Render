import React, { useState, useEffect } from 'react';
import { api } from '../api/index.js';

export default function WhiteLabelSettings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      // Check subscription
      const subRes = await api.get('/subscriptions/me');
      setSubscription(subRes.data);

      if (subRes.data.plan !== 'PRO') {
        setMessage('⚠️ White-label je dostupan samo PRO korisnicima.');
        setLoading(false);
        return;
      }

      // Load white-label config
      const res = await api.get('/whitelabel');
      setConfig(res.data);
      setMessage('');
    } catch (error) {
      console.error('Error loading white-label config:', error);
      if (error.response?.status === 403) {
        setMessage('⚠️ White-label je dostupan samo PRO korisnicima. Nadogradite svoju pretplatu.');
      } else {
        setMessage('❌ Greška pri učitavanju postavki.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const updated = await api.put('/whitelabel', config);
      setConfig(updated.data);
      setMessage('✅ Postavke uspješno spremljene!');
    } catch (error) {
      console.error('Error updating white-label config:', error);
      setMessage('❌ Greška pri spremanju postavki.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    try {
      const updated = await api.post('/whitelabel/toggle', { isActive: !config.isActive });
      setConfig(updated.data);
      setMessage(updated.data.isActive ? '✅ White-label aktiviran!' : '⚠️ White-label deaktiviran.');
    } catch (error) {
      console.error('Error toggling white-label:', error);
      setMessage('❌ Greška pri prebacivanju.');
    }
  };

  const handleChange = (field, value) => {
    setConfig({ ...config, [field]: value });
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8 text-center">Učitavanje...</div>;
  }

  if (!subscription || subscription.plan !== 'PRO') {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-6 text-center">
          <h2 className="text-2xl font-bold text-yellow-900 mb-4">
            ⚠️ White-Label Nije Dostupan
          </h2>
          <p className="text-gray-700 mb-4">
            White-label opcija je dostupna samo za PRO pretplatnike.
          </p>
          <p className="text-gray-600 mb-6">
            Vaš trenutni plan: <strong className="text-yellow-700">{subscription?.plan || 'NONE'}</strong>
          </p>
          <a
            href="#pricing"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Nadogradite na PRO →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🎨 White-Label Postavke</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('✅') ? 'bg-green-50 text-green-800' : 
          message.includes('⚠️') ? 'bg-yellow-50 text-yellow-800' : 
          'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Naziv firme/kampanje
          </label>
          <input
            type="text"
            value={config?.companyName || ''}
            onChange={(e) => handleChange('companyName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo URL
          </label>
          <input
            type="url"
            value={config?.logoUrl || ''}
            onChange={(e) => handleChange('logoUrl', e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {config?.logoUrl && (
            <div className="mt-2">
              <img src={config.logoUrl} alt="Logo preview" className="h-16 object-contain" onError={(e) => {e.target.style.display = 'none'}} />
            </div>
          )}
        </div>

        {/* Colors */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Glavna boja
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config?.primaryColor || '#3B82F6'}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config?.primaryColor || ''}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                placeholder="#3B82F6"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sekundarna boja
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config?.secondaryColor || '#64748B'}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config?.secondaryColor || ''}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                placeholder="#64748B"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Akcentna boja
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config?.accentColor || '#10B981'}
                onChange={(e) => handleChange('accentColor', e.target.value)}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config?.accentColor || ''}
                onChange={(e) => handleChange('accentColor', e.target.value)}
                placeholder="#10B981"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Favicon URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Favicon URL
          </label>
          <input
            type="url"
            value={config?.faviconUrl || ''}
            onChange={(e) => handleChange('faviconUrl', e.target.value)}
            placeholder="https://example.com/favicon.ico"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Footer Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Footer tekst
          </label>
          <input
            type="text"
            value={config?.footerText || ''}
            onChange={(e) => handleChange('footerText', e.target.value)}
            placeholder="© 2025 My Company"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Powered By Hidden */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="poweredByHidden"
            checked={config?.poweredByHidden || false}
            onChange={(e) => handleChange('poweredByHidden', e.target.checked)}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="poweredByHidden" className="text-sm font-medium text-gray-700">
            Sakriti "Powered by Uslugar" značku
          </label>
        </div>

        {/* Toggle Active */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className={`px-6 py-2 rounded-lg font-semibold ${
              config?.isActive 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {config?.isActive ? '✅ Aktivno' : '⏸️ Deaktivirano'}
          </button>
          <span className="text-sm text-gray-600">
            {config?.isActive ? 'White-label je aktivno prikazan.' : 'White-label je deaktiviran.'}
          </span>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Spremanje...' : '💾 Spremi postavke'}
          </button>
        </div>
      </form>
    </div>
  );
}

