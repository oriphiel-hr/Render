import React from 'react';
import { getProviderTrustLayer, getProviderVisualBadges, isProviderBusinessVerified } from '@uslugar/shared';
import { getProviderPublicHeadline, isPublicListingMinimal } from '../utils/providerDisplay';

const ProviderCard = ({ provider, onViewProfile, onContact }) => {
  const businessOk = isProviderBusinessVerified(provider);
  const headline = getProviderPublicHeadline(provider);
  const minimalListing = isPublicListingMinimal(provider);
  const trustLayer = getProviderTrustLayer(provider, provider.user);
  const visualBadges = getProviderVisualBadges(provider, provider.user);
  const renderStars = (rating) => {
    const r = Number(rating) || 0;
    const stars = [];
    const fullStars = Math.floor(r);
    const hasHalfStar = r % 1 !== 0;

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

    const remainingStars = 5 - Math.ceil(r);
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
            {headline.avatarLetter}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {headline.primary}
                {provider.isFeatured && (
                  <span className="ml-2 text-yellow-500 text-sm">⭐ Featured</span>
                )}
              </h3>
              {headline.secondary && (
                <p className="text-sm text-gray-600 mt-0.5">{headline.secondary}</p>
              )}
              {minimalListing && (
                <span
                  className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200"
                  title="Pružatelj je smanjio javno vidljive podatke (bez portfelja i vanjskog weba u tražilici)."
                >
                  Javni prikaz: ograničen
                </span>
              )}
              {/* Badge System */}
              <div className="flex flex-wrap gap-1 mt-1" title="Verified provider — jasni bedževi">
                {visualBadges.map((b) => (
                  <span
                    key={b.id}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      b.ok ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    {b.short}
                    {b.count != null && b.ok ? ` ·${b.count}` : ''}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {businessOk && (
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
              {renderStars(provider.ratingAvg ?? 0)}
              <span className="text-sm text-gray-600 ml-1">
                ({provider.ratingCount ?? 0})
              </span>
            </div>
          </div>
          {/* Trust labels */}
          <div className="flex flex-wrap gap-1 mt-1">
            {businessOk && (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] border border-emerald-200" title="Poslovni status provjeren">
                🟣 Poslovni status provjeren
              </span>
            )}
            {provider.kycVerified && (provider.legalStatus?.code === 'DOO' || provider.legalStatus?.code === 'JDOO') && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] border border-blue-200" title="OIB potvrđen (SudReg)">
                🟢 OIB potvrđen (SudReg)
              </span>
            )}
            {!businessOk && (
              <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-[11px] border border-orange-200" title="Profil u reviziji">
                ⛔ Ograničene javne provjere
              </span>
            )}
            <span
              className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded text-[11px] border border-slate-200"
              title="Broj ispunjenih nezavisnih provjernih signala. Filter „Samo verificirani” u tražilici traži poslovnu provjeru ILI identitet (šire od ovog zbroja ako je npr. samo 1/7)."
            >
              Povjerenje: {trustLayer.verifiedCount}/{trustLayer.totalChecks}
            </span>
          </div>

          {provider.bio && (
            <p className="text-gray-600 mb-3 line-clamp-2">{provider.bio}</p>
          )}

          {Array.isArray(provider.publicServiceLines) && provider.publicServiceLines.length > 0 && (
            <div className="mb-3 space-y-1">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Usluge / suradnje</p>
              <ul className="text-sm text-slate-700 space-y-1">
                {provider.publicServiceLines.map((row, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="font-medium text-slate-800 shrink-0">{row.title}</span>
                    {row.detail ? <span className="text-slate-600">— {row.detail}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
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

          {(provider.etaFirstOfferHint != null || (provider.priceGuides && provider.priceGuides.length > 0)) && (
            <div className="mb-3 text-xs text-slate-600 space-y-1">
              {provider.etaFirstOfferHint != null && (
                <p>
                  <span className="font-semibold text-slate-800">Prva ponuda (procjena):</span> ~{provider.etaFirstOfferHint} min u odabranim kategorijama
                </p>
              )}
              {provider.priceGuides?.length > 0 && (
                <p>
                  <span className="font-semibold text-slate-800">Fiksna cijena (od–do, EUR):</span>{' '}
                  {provider.priceGuides.slice(0, 3).map((g) => `${g.name} ${g.min}–${g.max}`).join(' · ')}
                </p>
              )}
            </div>
          )}

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
            <div className="flex items-center space-x-4 flex-wrap gap-1">
              {provider.distanceKm != null && (
                <span className="font-medium text-blue-600">~{provider.distanceKm} km</span>
              )}
              {(provider.city || provider.user?.city) && (
                <span>📍 {provider.city || provider.user?.city}</span>
              )}
              {provider.experience && (
                <span>📅 {provider.experience} godina iskustva</span>
              )}
              {provider.serviceArea && !provider.city && (
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

          {((provider.latitude != null && provider.longitude != null) || (provider.user?.latitude != null && provider.user?.longitude != null)) && (
            <div className="mb-4">
              <a
                href={`https://www.google.com/maps?q=${provider.latitude ?? provider.user?.latitude},${provider.longitude ?? provider.user?.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                🗺️ Otvori u Google Maps
              </a>
            </div>
          )}
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
