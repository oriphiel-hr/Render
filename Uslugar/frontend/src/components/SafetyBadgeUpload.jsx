import React, { useState } from 'react';
import api from '../api';

export default function SafetyBadgeUpload({ onUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Molimo uploadajte PDF, JPG ili PNG dokument');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Dokument je prevelik (max 10MB)');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Molimo odaberite dokument');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('document', selectedFile);

      await api.post('/kyc/upload-safety-badge', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (onUploaded) onUploaded();
      
      // Reset
      setSelectedFile(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Neuspjelo uploadanje polici osiguranja';
      setError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        disabled={uploading}
        className="w-full text-sm text-gray-600 border border-gray-300 rounded-lg p-2 disabled:bg-gray-100"
      />
      
      {selectedFile && (
        <div className="text-xs text-gray-600">
          Odabran: {selectedFile.name}
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          ⚠️ {error}
        </div>
      )}
      
      <button
        type="button"
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {uploading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            <span>Uploadajem...</span>
          </>
        ) : (
          <span>📤 Uploadaj policu osiguranja</span>
        )}
      </button>
      
      <p className="text-xs text-gray-500">
        Polica osiguranja daje vam dodatnu ✓ Safety značku, što povećava kredibilitet i povjerenje korisnika.
      </p>
    </div>
  );
}

