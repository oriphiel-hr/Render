import React, { useState, useEffect } from 'react';
import api from '../api';

export default function LicenseManager({ licenses, onUpdate, userId }) {
  const [items, setItems] = useState(licenses || []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    licenseType: '',
    licenseNumber: '',
    issuingAuthority: '',
    issuedAt: '',
    expiresAt: '',
    documentUrl: '',
    notes: ''
  });

  useEffect(() => {
    setItems(licenses || []);
  }, [licenses]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('document', file);
      
      const response = await api.post('/upload/document', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormData(prev => ({
        ...prev,
        documentUrl: response.data.url
      }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Greška pri upload-u dokumenta. Provjerite da li je dokument manji od 10MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddLicense = async (e) => {
    e.preventDefault();
    
    if (!formData.licenseType || !formData.licenseNumber || !formData.issuingAuthority || !formData.issuedAt) {
      alert('Tip licence, broj licence, tijelo koje izdaje i datum izdavanja su obavezni');
      return;
    }

    try {
      const response = await api.post('/providers/licenses', formData);
      setItems(prev => [...prev, response.data.license]);
      setIsAdding(false);
      setFormData({
        licenseType: '',
        licenseNumber: '',
        issuingAuthority: '',
        issuedAt: '',
        expiresAt: '',
        documentUrl: '',
        notes: ''
      });
      if (onUpdate) {
        const updatedLicenses = await api.get('/providers/licenses');
        onUpdate(updatedLicenses.data.licenses);
      }
      alert('Licenca uspješno dodana! Čeka verifikaciju od strane administratora.');
    } catch (error) {
      console.error('Add license error:', error);
      alert(error.response?.data?.error || 'Greška pri dodavanju licence');
    }
  };

  const handleUpdateLicense = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.put(`/providers/licenses/${editingId}`, formData);
      setItems(prev => prev.map(l => l.id === editingId ? response.data.license : l));
      setEditingId(null);
      setFormData({
        licenseType: '',
        licenseNumber: '',
        issuingAuthority: '',
        issuedAt: '',
        expiresAt: '',
        documentUrl: '',
        notes: ''
      });
      setIsAdding(false);
      if (onUpdate) {
        const updatedLicenses = await api.get('/providers/licenses');
        onUpdate(updatedLicenses.data.licenses);
      }
      alert('Licenca uspješno ažurirana!');
    } catch (error) {
      console.error('Update license error:', error);
      alert(error.response?.data?.error || 'Greška pri ažuriranju licence');
    }
  };

  const handleDeleteLicense = async (licenseId) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovu licencu?')) {
      return;
    }

    try {
      await api.delete(`/providers/licenses/${licenseId}`);
      setItems(prev => prev.filter(l => l.id !== licenseId));
      if (onUpdate) {
        const updatedLicenses = await api.get('/providers/licenses');
        onUpdate(updatedLicenses.data.licenses);
      }
      alert('Licenca uspješno obrisana!');
    } catch (error) {
      console.error('Delete license error:', error);
      alert(error.response?.data?.error || 'Greška pri brisanju licence');
    }
  };

  const startEdit = (license) => {
    setEditingId(license.id);
    setFormData({
      licenseType: license.licenseType,
      licenseNumber: license.licenseNumber,
      issuingAuthority: license.issuingAuthority,
      issuedAt: license.issuedAt ? license.issuedAt.split('T')[0] : '',
      expiresAt: license.expiresAt ? license.expiresAt.split('T')[0] : '',
      documentUrl: license.documentUrl || '',
      notes: license.notes || ''
    });
    setIsAdding(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('hr-HR');
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isExpiringSoon = (expiresAt) => {
    if (!expiresAt) return false;
    const daysUntilExpiry = (new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  return (
    <div className="space-y-6">
      {/* Licenses List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📜 Certifikati i licence ({items.length})
        </h3>
        
        {items.length === 0 && (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">Nema dodanih licenci. Dodajte svoju prvu licencu!</p>
          </div>
        )}

        <div className="space-y-4">
          {items.map(license => (
            <div 
              key={license.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {license.licenseType}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      license.isVerified 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {license.isVerified ? '✓ Verificirano' : '⏳ Čeka verifikaciju'}
                    </span>
                    {license.expiresAt && isExpired(license.expiresAt) && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                        ⚠️ Isteklo
                      </span>
                    )}
                    {license.expiresAt && isExpiringSoon(license.expiresAt) && !isExpired(license.expiresAt) && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                        ⚠️ Isteče uskoro
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong className="text-gray-900 dark:text-white">Broj licence:</strong> {license.licenseNumber}</p>
                    <p><strong className="text-gray-900 dark:text-white">Izdano od:</strong> {license.issuingAuthority}</p>
                    <p><strong className="text-gray-900 dark:text-white">Datum izdavanja:</strong> {formatDate(license.issuedAt)}</p>
                    {license.expiresAt && (
                      <p><strong className="text-gray-900 dark:text-white">Datum isteka:</strong> {formatDate(license.expiresAt)}</p>
                    )}
                    {license.notes && (
                      <p><strong className="text-gray-900 dark:text-white">Napomene:</strong> {license.notes}</p>
                    )}
                  </div>
                  {license.documentUrl && (
                    <a 
                      href={license.documentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm underline"
                    >
                      📄 Pregledaj dokument
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  {!license.isVerified && (
                    <>
                      <button
                        onClick={() => startEdit(license)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        ✏️ Uredi
                      </button>
                      <button
                        onClick={() => handleDeleteLicense(license.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                      >
                        🗑️ Obriši
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? '✏️ Uredi licencu' : '➕ Dodaj novu licencu'}
          </h3>
          
          <form onSubmit={editingId ? handleUpdateLicense : handleAddLicense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tip licence <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.licenseType}
                onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Npr. Elektrotehnička licenca"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Broj licence <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Broj licence"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tijelo koje izdaje <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.issuingAuthority}
                  onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Npr. Hrvatska komora inženjera"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Datum izdavanja <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={formData.issuedAt}
                  onChange={(e) => setFormData({ ...formData, issuedAt: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Datum isteka (opcionalno)
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dokument licence (PDF, JPG, PNG)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                disabled={uploading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
              {uploading && <p className="text-sm text-gray-500 mt-1">Upload u tijeku...</p>}
              {formData.documentUrl && (
                <div className="mt-2">
                  <a 
                    href={formData.documentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 underline"
                  >
                    ✓ Dokument uploadan - Pregledaj
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Napomene (opcionalno)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Dodatne napomene o licenci..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50"
              >
                {editingId ? '💾 Spremi promjene' : '➕ Dodaj licencu'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({
                    licenseType: '',
                    licenseNumber: '',
                    issuingAuthority: '',
                    issuedAt: '',
                    expiresAt: '',
                    documentUrl: '',
                    notes: ''
                  });
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700"
              >
                Odustani
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          ➕ Dodaj novu licencu
        </button>
      )}
    </div>
  );
}

