import React from 'react';

const ProviderCard = ({ provider, onViewProfile, onContact }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">★</span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">☆</span>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      );
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-600">
            {provider.user.fullName.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {provider.user.fullName}
                {provider.isFeatured && (
                  <span className="ml-2 text-yellow-500 text-sm">⭐ Featured</span>
                )}
              </h3>
              {/* Badge System */}
              <div className="flex flex-wrap gap-1 mt-1">
                {provider.kycVerified && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs border border-green-300" title="Business Značka - Potvrđeno u javnim registrima">
                    ✓ Business
                  </span>
                )}
                {(provider.identityEmailVerified || provider.identityPhoneVerified || provider.identityDnsVerified) && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs border border-purple-300" title="Identity Značka - Identitet verificiran">
                    ✓ Identity
                  </span>
                )}
                {provider.safetyInsuranceUrl && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs border border-yellow-300" title="Safety Značka - Polica osiguranja">
                    ✓ Safety
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {renderStars(provider.ratingAvg)}
              <span className="text-sm text-gray-600 ml-1">
                ({provider.ratingCount})
              </span>
            </div>
          </div>
          {/* Trust labels */}
          <div className="flex flex-wrap gap-1 mt-1">
            {provider.kycVerified && (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] border border-emerald-200" title="Poslovni status provjeren">
                🟣 Poslovni status provjeren
              </span>
            )}
            {provider.kycVerified && (provider.legalStatus?.code === 'DOO' || provider.legalStatus?.code === 'JDOO') && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] border border-blue-200" title="OIB potvrđen (SudReg)">
                🟢 OIB potvrđen (SudReg)
              </span>
            )}
            {!provider.kycVerified && (
              <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-[11px] border border-orange-200" title="Profil u reviziji">
                ⛔ Profil u reviziji
              </span>
            )}
          </div>

          {provider.bio && (
            <p className="text-gray-600 mb-3 line-clamp-2">{provider.bio}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            {provider.categories?.map(category => (
              <span
                key={category.id}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {category.name}
              </span>
            ))}
          </div>

          {provider.specialties && provider.specialties.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {provider.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              {provider.experience && (
                <span>📅 {provider.experience} godina iskustva</span>
              )}
              {provider.serviceArea && (
                <span>📍 {provider.serviceArea}</span>
              )}
            </div>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-1 ${
                provider.isAvailable ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              {provider.isAvailable ? 'Dostupan' : 'Nedostupan'}
            </div>
          </div>

          {provider.website && (
            <div className="mb-4">
              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 hover:underline underline-offset-2 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors"
                title="Otvori web stranicu u novoj kartici"
              >
                <span className="text-base">🌐</span>
                <span className="truncate max-w-[220px]">{provider.website.replace(/^https?:\/\//, '')}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-80">
                  <path d="M12.293 2.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L14 5.414V13a1 1 0 11-2 0V5.414L9.707 7.707A1 1 0 018.293 6.293l4-4z" />
                  <path d="M3 9a2 2 0 012-2h3a1 1 0 010 2H5v6h10v-3a1 1 0 112 0v3a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </a>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={() => onViewProfile(provider)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Pregledaj profil
            </button>
            <button
              onClick={() => onContact(provider)}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Kontaktiraj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
