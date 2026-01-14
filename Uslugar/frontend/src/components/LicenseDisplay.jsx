import React from 'react';

export default function LicenseDisplay({ licenses }) {
  if (!licenses || licenses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Nema prikazanih licenci.</p>
      </div>
    );
  }

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {licenses.map(license => (
        <div 
          key={license.id} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {license.licenseType}
            </h4>
            <div className="flex flex-col items-end gap-1">
              {license.isVerified && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  ✓ Verificirano
                </span>
              )}
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
          </div>
          
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong className="text-gray-900 dark:text-white">Broj:</strong> {license.licenseNumber}</p>
            <p><strong className="text-gray-900 dark:text-white">Izdano od:</strong> {license.issuingAuthority}</p>
            <p><strong className="text-gray-900 dark:text-white">Datum izdavanja:</strong> {formatDate(license.issuedAt)}</p>
            {license.expiresAt && (
              <p><strong className="text-gray-900 dark:text-white">Datum isteka:</strong> {formatDate(license.expiresAt)}</p>
            )}
          </div>

          {license.documentUrl && (
            <a 
              href={license.documentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm underline"
            >
              📄 Pregledaj dokument
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

