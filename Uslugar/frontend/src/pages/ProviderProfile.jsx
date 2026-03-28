import React, { useState, useEffect } from 'react';
import api from '../api';
import IdentityBadgeVerification from '../components/IdentityBadgeVerification';
import PortfolioManager from '../components/PortfolioManager';
import PortfolioDisplay from '../components/PortfolioDisplay';
import LicenseManager from '../components/LicenseManager';
import LicenseDisplay from '../components/LicenseDisplay';
import { isProviderBusinessVerified } from '../utils/providerVerification';

const getCategoryIcon = (categoryName) => {
    const iconMap = {
      // Gradnja i renoviranje
      'Gradnja': '🏗️',
      'Renoviranje': '🔨',
      'Keramika': '🧱',
      'Parket': '🪵',
      'Krov': '🏠',
      'Fasada': '🎨',
      'Vodovod': '🚰',
      'Elektrika': '⚡',
      'Grijanje': '🔥',
      'Klima': '❄️',
      'Izolacija': '🧊',
      'Stolarija': '🪟',
      'Vrata': '🚪',
      'Prozori': '🪟',
      'Balkon': '🏡',
      'Terasa': '🌿',
      'Bazen': '🏊',
      'Vrt': '🌱',
      'Ogradni zid': '🧱',
      'Asfalt': '🛣️',
      
      // IT i tehnologija
      'IT usluge': '💻',
      'Web dizajn': '🌐',
      'Programiranje': '👨‍💻',
      'Mreže': '🌐',
      'Sigurnost': '🔒',
      'Cloud': '☁️',
      'Mobilne aplikacije': '📱',
      'E-commerce': '🛒',
      'SEO': '🔍',
      'Digitalni marketing': '📈',
      
      // Obrazovanje
      'Obrazovanje': '📚',
      'Jezici': '🗣️',
      'Muzika': '🎵',
      'Sport': '⚽',
      'Ples': '💃',
      'Slikanje': '🎨',
      'Fotografija': '📸',
      'Kuhanje': '👨‍🍳',
      
      // Zdravlje i ljepota
      'Zdravlje': '🏥',
      'Fizioterapija': '💪',
      'Masage': '💆',
      'Kozmetika': '💄',
      'Nokti': '💅',
      'Kosa': '💇',
      'Tatuaže': '🎨',
      'Fitness': '💪',
      'Joga': '🧘',
      
      // Usluge
      'Čišćenje': '🧽',
      'Pranje': '👕',
      'Dostava': '🚚',
      'Prevoz': '🚗',
      'Taxi': '🚕',
      'Dostava hrane': '🍕',
      'Dostava paketa': '📦',
      'Selidba': '📦',
      'Skladištenje': '🏪',
      
      // Automobili
      'Automobili': '🚗',
      'Servis': '🔧',
      'Dijagnostika': '🔍',
      'Gume': '🛞',
      'Akumulator': '🔋',
      'Auto perionica': '🚿',
      'Auto škola': '🚗',
      
      // Ostalo
      'Pravne usluge': '⚖️',
      'Računovodstvo': '📊',
      'Marketing': '📢',
      'Dizajn': '🎨',
      'Video': '🎬',
      'Organizacija događaja': '🎉',
      'Konzultacije': '💼',
      'Prijenos': '📡',
      
      // Dodatne specifične kategorije
      'Instalacije': '🔧',
      'Popravci': '🔨',
      'Montaža': '⚙️',
      
      // Dodatne kategorije koje se često koriste
      
      // Još dodatnih kategorija
      'Financije': '💰',
      'Osiguranje': '🛡️',
      'Nekretnine': '🏠',
      'Prodaja': '🛒',
      'Kupnja': '🛍️',
      'Najam': '🏠',
      'Turizam': '✈️',
      'Putovanja': '🧳',
      'Hoteli': '🏨',
      'Restorani': '🍽️',
      'Kafići': '☕',
      'Bars': '🍻',
      'Zabava': '🎭',
      'Kazalište': '🎭',
      'Kino': '🎬',
      'Koncerti': '🎵',
      'Festivali': '🎪',
      'Teretana': '🏋️',
      'Tenis': '🎾',
      'Fudbal': '⚽',
      'Košarka': '🏀',
      'Rukomet': '🤾',
      'Vaterpolo': '🤽',
      'Plivanje': '🏊',
      'Trčanje': '🏃',
      'Biciklizam': '🚴',
      'Planinarenje': '🥾',
      'Skijanje': '🎿',
      'Surfing': '🏄',
      'Ribolov': '🎣',
      'Lov': '🏹',
      'Kampiranje': '⛺',
      'Alpinizam': '🧗',
      'Paragliding': '🪂',
      'Padobranstvo': '🪂',
      'Avijacija': '✈️',
      'Helikopter': '🚁',
      'Brod': '⛵',
      'Jahta': '⛵',
      'Motocikl': '🏍️',
      'Skuter': '🛵',
      'Bicikl': '🚲',
      'Električni bicikl': '🚲',
      'Skateboard': '🛹',
      'Rolice': '🛼',
      'Sanke': '🛷',
      'Ski': '🎿',
      'Snowboard': '🏂',
      'Kajak': '🛶',
      'Kanua': '🛶',
      'Rafting': '🛶',
      'Diving': '🤿',
      'Snorkeling': '🤿',
      'Speleologija': '🕳️',
      'Geocaching': '🗺️',
      'Astronomija': '🔭',
      'Dron': '🚁',
      '3D print': '🖨️',
      'Laserski graviranje': '⚡',
      'CNC obrada': '⚙️',
      'Struganje': '🔧',
      'Brušenje': '🔧',
      'Varjenje': '🔥',
      'Limanje': '🔧',
      'Bojanje': '🎨',
      'Tapetiranje': '🎨',
      'Staklo': '🪟',
      'Metal': '⚙️',
      'Drvo': '🪵',
      'Plastika': '🧱',
      'Tekstil': '🧵',
      'Koža': '👜',
      'Papir': '📄',
      'Karton': '📦',
      'Guma': '🛞',
      'Silikon': '🧱',
      'Epoksid': '🧱',
      'Akril': '🎨',
      'Ulje': '🖼️',
      'Tempera': '🎨',
      'Akvarel': '🎨',
      'Pastel': '🎨',
      'Ugljen': '🖤',
      'Kreda': '🖍️',
      'Marker': '🖊️',
      'Olovka': '✏️',
      'Kemijska olovka': '✏️',
      'Kist': '🖌️',
      'Špachtla': '🔧',
      'Valjak': '🔧',
      'Šmirgl': '🔧',
      'Brusilica': '🔧',
      'Bušilica': '🔧',
      'Odvijač': '🔧',
      'Ključ': '🔧',
      'Čekić': '🔨',
      'Kliješta': '🔧',
      'Pila': '🔧',
      'Motorna pila': '🔧',
      'Kompresor': '🔧',
      'Generator': '⚡',
      'Inverter': '⚡',
      'UPS': '⚡',
      'Baterija': '🔋',
      'Solarni panel': '☀️',
      'Vjetroelektrana': '💨',
      'Geotermalna': '🌋',
      'Hidroelektrana': '💧',
      'Nuklearna': '☢️',
      'Nafta': '🛢️',
      'Plin': '🔥',
      'Biomasa': '🌱',
      'Biogas': '💨',
      'Vodik': '💨',
      'Etanol': '🍷',
      'Biodizel': '🛢️',
      'Električna energija': '⚡',
      'Toplinska energija': '🔥',
      'Mehanička energija': '⚙️',
      'Kemijska energija': '🧪',
      'Nuklearna energija': '☢️',
      'Gravitacijska energija': '🌍',
      'Elastična energija': '🔗',
      'Magnetna energija': '🧲',
      'Elektromagnetna energija': '📡',
      'Svjetlosna energija': '💡',
      'Zvučna energija': '🔊',
      'Tlačna energija': '💨',
      'Kinetička energija': '🏃',
      'Potencijalna energija': '⛰️',
      'Termalna energija': '🌡️',
      'Radiantna energija': '☀️',
      
      // Kategorije iz baze podataka
      'Autoelektričar': '🔧',
      'Autolimarija i farbanje': '🎨',
      'Automehaničar': '🔧',
      'Bazenski radovi': '🏊',
      'Bravarski radovi': '🔨',
      'Čišćenje fasada': '🧽',
      'Dezinsekcija i deratizacija': '🐛',
      'Dimnjačar': '🏠',
      'Dizalice i platforme': '🏗️',
      'Električar': '⚡',
      'Električne instalacije': '🔌',
      'Električni paneli': '⚡',
      'LED rasvjeta': '💡',
      'Event usluge': '🎉',
      'Fasader': '🎨',
      'Fotografski servisi': '📸',
      'Frizerske usluge': '💇',
      'Gips-karton': '🧱',
      'Kamenarske usluge': '🗿',
      'Keramičar': '🧱',
      'Fugiranje': '🔧',
      'Kamene ploče': '🗿',
      'Mosaik i dekorativne pločice': '🎨',
      'Klima uređaji': '❄️',
      'Centralna klima': '❄️',
      'Mobilni klima uređaji': '❄️',
      'Servis klima uređaja': '🔧',
      'Kozmetičke usluge': '💄',
      'Krovopokrivač': '🏠',
      'Limarski radovi': '🔧',
      'Masažne usluge': '💆',
      'Moler-Slikar': '🎨',
      'Bojanje zidova': '🎨',
      'Dekorativne tehnike': '🎨',
      'Gletovanje': '🔧',
      'Ograđivanje': '🧱',
      'Parketar': '🔨',
      'Plinoinstalatér': '🔥',
      'Podne obloge': '🔨',
      'Popravak kućanskih aparata': '🔧',
      'Prevodilački servisi': '🗣️',
      'Računalni servisi': '💻',
      'Računovodstvene usluge': '📊',
      'Selidbe': '📦',
      'Šetanje pasa': '🐕',
      'Sigurnosni sustavi': '🔒',
      'Soboslikarski radovi': '🎨',
      'Staklarski radovi': '🪟',
      'Stolar': '🪚',
      'Izrada namještaja': '🪑',
      'Parket i laminat': '🪵',
      'Ugradnja kuhinja': '🍳',
      'Terase i pergole': '🌿',
      'Transport robe': '🚚',
      'Tutorstvo': '📚',
      'Ugradnja rolled': '🪟',
      'Ventilacija': '💨',
      'Veterinarske usluge': '🐕',
      'Video produkcija': '🎬',
      'Vodoinstalater': '🚰',
      'Grijanje vode': '🔥',
      'Kanalizacija': '🚽',
      'Popravak sanitarija': '🚽',
      'Vrtlar': '🌱',
      'Vulkanizer': '🚗',
      'Zidar': '🧱'
    };
    
    
    return iconMap[categoryName] || '🛠️';
  };

export default function ProviderProfile({ onSuccess, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    specialties: '',
    experience: '',
    website: '',
    categories: []
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      try {
        response = await api.get('/providers/me');
      } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 403) {
          response = await api.post('/providers/fix-profile');
        } else {
          throw err;
        }
      }
      
      const profileData = response.data;
      setProfile(profileData);
      setFormData({
        bio: profileData.bio || '',
        specialties: profileData.specialties || '',
        experience: profileData.experience || '',
        website: profileData.website || '',
        categories: profileData.categories || []
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.error || 'Greška pri učitavanju profila.');
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
    
    try {
      await api.put('/providers/me', formData);
      setSuccess('Profil je uspješno ažuriran!');
      setEditMode(false);
      await loadProfile();
      if (onSuccess) onSuccess();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Greška pri ažuriranju profila.');
    }
  };

  const handleProfileUpdated = () => {
    loadProfile();
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

  if (error && !profile) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center py-12">
          <div className="text-red-400 text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Greška</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => onNavigate && onNavigate('user')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Povratak
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Moj profil pružatelja</h2>
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
          {/* Profesionalni podaci */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              💼 Profesionalni podaci
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  O meni / Biografija
                </label>
                {editMode ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Opišite svoje iskustvo i usluge..."
                  />
                ) : (
                  <p className="px-4 py-3 bg-white border border-gray-200 rounded-lg">
                    {profile.bio || 'Nije uneseno'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specijalizacije
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Popravak cijevi, Instalacija bojlera..."
                  />
                ) : (
                  <p className="px-4 py-3 bg-white border border-gray-200 rounded-lg">
                    {profile.specialties || 'Nije uneseno'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Godine iskustva
                  </label>
                  {editMode ? (
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      min={0}
                      max={50}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-white border border-gray-200 rounded-lg">
                      {profile.experience || 'Nije uneseno'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  {editMode ? (
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  ) : (
                    <p className="px-4 py-3 bg-white border border-gray-200 rounded-lg">
                      {profile.website ? (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {profile.website}
                        </a>
                      ) : 'Nije uneseno'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Verifikacije */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 border-b pb-2">
              🆔 Status Verifikacije
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Email</span>
                  <span className="text-xl">{profile.identityEmailVerified ? '✅' : '❌'}</span>
                </div>
                {profile.identityEmailVerifiedAt && (
                  <p className="text-xs text-gray-500">
                    {new Date(profile.identityEmailVerifiedAt).toLocaleDateString('hr-HR')}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Telefon</span>
                  <span className="text-xl">{profile.identityPhoneVerified || profile.user?.phoneVerifiedAt ? '✅' : '❌'}</span>
                </div>
                {(profile.identityPhoneVerifiedAt || profile.user?.phoneVerifiedAt) && (
                  <p className="text-xs text-gray-500">
                    {new Date(profile.identityPhoneVerifiedAt || profile.user.phoneVerifiedAt).toLocaleDateString('hr-HR')}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">DNS</span>
                  <span className="text-xl">{profile.identityDnsVerified ? '✅' : '❌'}</span>
                </div>
                {profile.identityDnsVerifiedAt && (
                  <p className="text-xs text-gray-500">
                    {new Date(profile.identityDnsVerifiedAt).toLocaleDateString('hr-HR')}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tvrtka/Obrt</span>
                  <span className="text-xl">{isProviderBusinessVerified(profile) ? '✅' : '❌'}</span>
                </div>
                {(profile.badgeData?.BUSINESS?.date || profile.kycVerifiedAt) && (
                  <p className="text-xs text-gray-500">
                    {new Date(profile.badgeData?.BUSINESS?.date || profile.kycVerifiedAt).toLocaleDateString('hr-HR')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Značke */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 border-b pb-2">
              🏅 Značke
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {profile.identityEmailVerified && (
                <div className="bg-white rounded-lg p-4 border border-purple-200 text-center">
                  <div className="text-3xl mb-2">📧</div>
                  <p className="text-sm font-medium">Email Značka</p>
                </div>
              )}
              
              {(profile.identityPhoneVerified || profile.user?.phoneVerifiedAt) && (
                <div className="bg-white rounded-lg p-4 border border-purple-200 text-center">
                  <div className="text-3xl mb-2">📱</div>
                  <p className="text-sm font-medium">Telefon Značka</p>
                </div>
              )}
              
              {profile.identityDnsVerified && (
                <div className="bg-white rounded-lg p-4 border border-purple-200 text-center">
                  <div className="text-3xl mb-2">🌐</div>
                  <p className="text-sm font-medium">DNS Značka</p>
                </div>
              )}
              
              {isProviderBusinessVerified(profile) && (
                <div className="bg-white rounded-lg p-4 border border-purple-200 text-center">
                  <div className="text-3xl mb-2">🏢</div>
                  <p className="text-sm font-medium">Tvrtka/Obrt Značka</p>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio radova */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-4 border-b pb-2">
              📸 Portfolio radova
            </h3>
            {editMode ? (
              <PortfolioManager 
                portfolio={profile.portfolio} 
                onUpdate={(updatedPortfolio) => {
                  setProfile(prev => ({ ...prev, portfolio: updatedPortfolio }));
                  handleProfileUpdated();
                }}
                userId={profile.userId}
              />
            ) : (
              <PortfolioDisplay portfolio={profile.portfolio} />
            )}
          </div>

          {/* Certifikati i licence */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 border-b pb-2">
              📜 Certifikati i licence
            </h3>
            {editMode ? (
              <LicenseManager 
                licenses={profile.licenses || []} 
                onUpdate={async (updatedLicenses) => {
                  // Reload profile to get updated licenses
                  handleProfileUpdated();
                }}
                userId={profile.userId}
              />
            ) : (
              <LicenseDisplay licenses={(profile.licenses || []).filter(l => l.isVerified)} />
            )}
          </div>

          {/* Identity Badge Verifikacija */}
          {!editMode && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-4 border-b pb-2">
                🆔 Identity Značka Verifikacija
              </h3>
              <IdentityBadgeVerification profile={profile} onUpdated={handleProfileUpdated} />
            </div>
          )}
        </div>

        {editMode && (
          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              💾 Spremi promjene
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setFormData({
                  bio: profile.bio || '',
                  specialties: profile.specialties || '',
                  experience: profile.experience || '',
                  website: profile.website || '',
                  categories: profile.categories || []
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
