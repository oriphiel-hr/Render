import React, { useState } from 'react';
import api from '../api';

export default function PortfolioManager({ portfolio, onUpdate, userId }) {
  const [items, setItems] = useState(portfolio?.items || []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [],
    category: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    client: ''
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await api.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const imageUrls = response.data.images.map(img => img.url);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Greška pri upload-u slika. Provjerite da li su slike manje od 5MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!formData.title || formData.images.length === 0) {
      alert('Naslov i barem jedna slika su obavezni');
      return;
    }

    try {
      const response = await api.post('/providers/portfolio', formData);
      setItems(response.data.portfolio.items);
      setIsAdding(false);
      setFormData({
        title: '',
        description: '',
        images: [],
        category: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        client: ''
      });
      if (onUpdate) onUpdate(response.data.portfolio);
      alert('Portfolio rad uspješno dodan!');
    } catch (error) {
      console.error('Add portfolio error:', error);
      alert(error.response?.data?.error || 'Greška pri dodavanju portfolio rada');
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.put(`/providers/portfolio/${editingId}`, formData);
      setItems(response.data.portfolio.items);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        images: [],
        category: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        client: ''
      });
      if (onUpdate) onUpdate(response.data.portfolio);
      alert('Portfolio rad uspješno ažuriran!');
    } catch (error) {
      console.error('Update portfolio error:', error);
      alert(error.response?.data?.error || 'Greška pri ažuriranju portfolio rada');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovaj portfolio rad?')) {
      return;
    }

    try {
      const response = await api.delete(`/providers/portfolio/${itemId}`);
      setItems(response.data.portfolio.items);
      if (onUpdate) onUpdate(response.data.portfolio);
      alert('Portfolio rad uspješno obrisan!');
    } catch (error) {
      console.error('Delete portfolio error:', error);
      alert(error.response?.data?.error || 'Greška pri brisanju portfolio rada');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description || '',
      images: item.images || [],
      category: item.category || '',
      date: item.date || new Date().toISOString().split('T')[0],
      location: item.location || '',
      client: item.client || ''
    });
    setIsAdding(true);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Items List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📸 Portfolio radovi ({items.length})
        </h3>
        
        {items.length === 0 && (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">Nema portfolio radova. Dodajte svoj prvi rad!</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
              {item.images && item.images.length > 0 && (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.images[0]} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      +{item.images.length - 1}
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{item.description}</p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {item.category && <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">{item.category}</span>}
                  {item.date && <span>📅 {new Date(item.date).toLocaleDateString('hr-HR')}</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    ✏️ Uredi
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="flex-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                  >
                    🗑️ Obriši
                  </button>
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
            {editingId ? '✏️ Uredi portfolio rad' : '➕ Dodaj novi portfolio rad'}
          </h3>
          
          <form onSubmit={editingId ? handleUpdateItem : handleAddItem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Naslov rada <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Npr. Renovacija kupaonice"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Opis rada
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Opisite detalje projekta..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slike <span className="text-red-600">*</span>
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
              {uploading && <p className="text-sm text-gray-500 mt-1">Upload u tijeku...</p>}
              
              {formData.images.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative">
                      <img src={url} alt={`Slika ${index + 1}`} className="w-full h-20 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategorija
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Npr. Građevina"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Datum
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lokacija
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Npr. Zagreb"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Klijent (opcionalno)
                </label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ime klijenta"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50"
              >
                {editingId ? '💾 Spremi promjene' : '➕ Dodaj rad'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({
                    title: '',
                    description: '',
                    images: [],
                    category: '',
                    date: new Date().toISOString().split('T')[0],
                    location: '',
                    client: ''
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
          ➕ Dodaj novi portfolio rad
        </button>
      )}
    </div>
  );
}

