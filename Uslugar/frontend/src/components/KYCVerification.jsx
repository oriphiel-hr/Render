import React, { useState, useEffect } from 'react';
import api from '../api';
import Toast from './Toast';

/**
 * KYC Verification Component
 * 
 * Komponenta za upload Rješenja Porezne uprave i verifikaciju pružatelja usluga.
 * Implementira GDPR-uskladičenu provjeru identiteta za freelancere/samostalne djelatnike.
 */
export default function KYCVerification({ providerProfile, onUpdate }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [publicConsent, setPublicConsent] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });

  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/kyc/status');
      setStatus(response.data);
    } catch (err) {
      console.error('Error loading KYC status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Provjeri tip fajla
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Molimo uploadajte PDF, JPG ili PNG dokument', 'error');
      return;
    }

    // Provjeri veličinu (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Dokument je prevelik (max 10MB)', 'error');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast('Molimo odaberite dokument', 'error');
      return;
    }

    if (!publicConsent) {
      showToast('Morate potvrditi da dopuštate prikaz podataka na profilu', 'error');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('publicConsent', publicConsent);

      const response = await api.post('/kyc/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showToast(response.data.message, 'success');
      setSelectedFile(null);
      await loadKYCStatus();
      
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Neuspjelo uploadanje dokumenta';
      showToast(errorMsg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleConsentToggle = async (value) => {
    try {
      await api.post('/kyc/update-consent', { publicConsent: value });
      setPublicConsent(value);
      showToast('Izjava je ažurirana', 'success');
    } catch (err) {
      console.error('Consent update error:', err);
      showToast('Greška pri ažuriranju izjave', 'error');
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast({ ...toast, isVisible: false }), 5000);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          KYC-lite Verifikacija
        </h2>
        <p className="text-sm text-gray-600">
          Provjerljivost bez kršenja propisa - Upload Rješenja Porezne uprave o upisu u RPO
        </p>
      </div>

      {/* Status */}
      {status?.kycVerified ? (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-green-800">
                ✓ Verificiran
              </h3>
              <p className="text-sm text-green-600">
                Vaša identitet je verificiran {status.data?.kycVerifiedAt ? new Date(status.data.kycVerifiedAt).toLocaleDateString('hr-HR') : ''}
              </p>
            </div>
          </div>
        </div>
      ) : status?.kycDocumentUploaded ? (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-yellow-800">
                ⏳ Čeka odobrenje
              </h3>
              <p className="text-sm text-yellow-600">
                Dokument je uploadan i čeka admin verifikaciju. Status će biti ažuriran nakon provjere.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Upload Form */}
      {!status?.kycVerified && (
        <>
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rješenje Porezne uprave (PDF, JPG, PNG) *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 0 0-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="kyc-document" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Odaberite dokument</span>
                    <input
                      id="kyc-document"
                      name="kyc-document"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">ili povucite ovdje</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, JPG ili PNG (max 10MB)
                </p>
              </div>
            </div>
            {selectedFile && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  Odabran: {selectedFile.name}
                </p>
              </div>
            )}
          </div>

          {/* Public Consent */}
          <div className="mb-6">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={publicConsent}
                onChange={(e) => setPublicConsent(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Dopuštam prikaz osnovnih podataka na mom javnom profilu (OIB, registarski broj).
                <br />
                <span className="text-xs text-gray-500">
                  (Pravna osnova: privola korisnika - GDPR članak 6. stavak 1. točka a)
                </span>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !publicConsent}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              uploading || !selectedFile || !publicConsent
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Uploadanje...' : 'Uploadaj dokument'}
          </button>
        </>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Što je ovo?</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>Automatski OCR traži ključne fraze u dokumentu</li>
          <li>Validira OIB (algoritamska kontrolna znamenka)</li>
          <li>Provjerava podudarnost imena iz dokumenta i profila</li>
          <li>Značka "Verificiran" na profilu + datum zadnje provjere</li>
          <li>Javni efekt provjerljivosti u skladu sa zakonom</li>
        </ul>
      </div>
    </div>
  );
}

