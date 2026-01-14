// USLUGAR EXCLUSIVE - Lead Marketplace
import React, { useState, useEffect } from 'react';
import { getAvailableLeads, purchaseLead, getCreditsBalance, unlockContact } from '../api/exclusive';

export default function LeadMarketplace() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creditsBalance, setCreditsBalance] = useState(0);
  const [filters, setFilters] = useState({
    city: '',
    minBudget: '',
    maxBudget: ''
  });
  const [purchasing, setPurchasing] = useState(null);
  const [unlocking, setUnlocking] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setError('Za pristup ekskluzivnim leadovima potrebno je prijaviti se kao pružatelj usluga.');
      return;
    }
    loadLeads();
    loadCredits();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await getAvailableLeads(filters);
      setLeads(response.data.leads);
    } catch (err) {
      if (err?.response?.status === 401) {
        setError('Nedostaje prijava. Prijavite se ili registrirajte kao pružatelj usluga.');
      } else {
        setError(err.response?.data?.error || 'Greška pri učitavanju leadova');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCredits = async () => {
    try {
      const response = await getCreditsBalance();
      setCreditsBalance(response.data.balance);
    } catch (err) {
      if (err?.response?.status === 401) {
        // already handled by banner above; keep silent
        return;
      }
      console.error('Error loading credits:', err);
    }
  };

  const handlePurchase = async (jobId, leadPrice) => {
    if (creditsBalance < leadPrice) {
      setError(`Nemate dovoljno kredita! Potrebno: ${leadPrice}, Dostupno: ${creditsBalance}`);
      return;
    }

    const confirmed = window.confirm(
      `Kupiti ovaj ekskluzivan lead za ${leadPrice} kredita?\n\nNakon kupovine, morat ćete dodatno platiti 1 kredit da biste vidjeli kontakt klijenta (Pay-per-contact model).`
    );

    if (!confirmed) return;

    try {
      setPurchasing(jobId);
      const response = await purchaseLead(jobId);
      
      alert(`✅ Lead uspješno kupljen!\n\nPreostalo kredita: ${response.data.creditsRemaining}\n\n${response.data.message}`);
      
      // Refresh leadova i kredita
      loadLeads();
      loadCredits();
      
      // Preusmjeri na MyLeads
      window.location.hash = '#my-leads';
      
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Greška pri kupovini leada';
      setError(errorMsg);
    } finally {
      setPurchasing(null);
    }
  };

  const handleUnlockContact = async (jobId) => {
    if (creditsBalance < 1) {
      setError(`Nemate dovoljno kredita! Potrebno: 1 kredit za otključavanje kontakta.`);
      return;
    }

    const confirmed = window.confirm(
      `Otključati kontakt klijenta?\n\nCijena: 1 kredit\n\nNakon otključavanja, vidjet ćete email i telefon klijenta.`
    );

    if (!confirmed) return;

    try {
      setUnlocking(jobId);
      const response = await unlockContact(jobId);
      
      alert(`✅ Kontakt uspješno otključan!\n\nPreostalo kredita: ${response.data.creditsRemaining}\n\n${response.data.message}`);
      
      // Refresh leadova i kredita
      loadLeads();
      loadCredits();
      
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Greška pri otključavanju kontakta';
      setError(errorMsg);
    } finally {
      setUnlocking(null);
    }
  };

  const getQualityBadge = (score) => {
    if (score >= 80) return { text: 'VRHUNSKI', color: 'bg-green-100 text-green-800', icon: '🌟' };
    if (score >= 60) return { text: 'DOBAR', color: 'bg-blue-100 text-blue-800', icon: '✨' };
    if (score >= 40) return { text: 'PROSJEČAN', color: 'bg-yellow-100 text-yellow-800', icon: '⭐' };
    return { text: 'STANDARD', color: 'bg-gray-100 text-gray-800', icon: '📋' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header sa balansam kredita */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ekskluzivni Leadovi</h1>
          <p className="text-gray-600 mt-2">1 lead = 1 izvođač. Bez konkurencije.</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg shadow-lg">
          <div className="text-sm opacity-90">Vaši krediti</div>
          <div className="text-3xl font-bold">{creditsBalance}</div>
          <button 
            onClick={() => window.location.hash = '#subscription'}
            className="mt-2 text-xs bg-white text-green-600 px-3 py-1 rounded hover:bg-green-50"
          >
            Kupi još
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow flex gap-4">
        <input
          type="text"
          placeholder="Grad..."
          value={filters.city}
          onChange={(e) => setFilters({...filters, city: e.target.value})}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Min budget"
          value={filters.minBudget}
          onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
          className="px-4 py-2 border rounded-lg w-32"
        />
        <input
          type="number"
          placeholder="Max budget"
          value={filters.maxBudget}
          onChange={(e) => setFilters({...filters, maxBudget: e.target.value})}
          className="px-4 py-2 border rounded-lg w-32"
        />
        <button
          onClick={loadLeads}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Filtriraj
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm text-red-700">{error}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => { window.location.hash = '#login' }} className="px-3 py-2 bg-red-600 text-white rounded">Prijava</button>
            <button onClick={() => { window.location.hash = '#register-user' }} className="px-3 py-2 bg-white border rounded">Registriraj se kao pružatelj</button>
          </div>
        </div>
      )}

      {/* Leadovi Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Učitavanje ekskluzivnih leadova...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-600">Nema dostupnih leadova trenutno</p>
          <p className="text-sm text-gray-500 mt-2">Provjerite ponovo za nekoliko minuta</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map((lead) => {
            const quality = getQualityBadge(lead.qualityScore || 0);
            const isPurchasing = purchasing === lead.id;
            
            return (
              <div key={lead.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                {/* Quality Badge */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${quality.color}`}>
                    {quality.icon} {quality.text}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {lead.leadPrice || 10} kredita
                  </span>
                </div>

                {/* Lead Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{lead.title}</h3>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {lead.city}
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {lead.budgetMin && lead.budgetMax 
                        ? `${lead.budgetMin}-${lead.budgetMax} EUR`
                        : 'Budget nije definiran'
                      }
                    </div>
                    
                    {lead.urgency && lead.urgency !== 'NORMAL' && (
                      <div className="flex items-center text-red-600 font-semibold">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {lead.urgency === 'HIGH' ? 'Visoka hitnost' : lead.urgency === 'URGENT' ? 'HITNO!' : lead.urgency}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-3">{lead.description}</p>

                  {/* Client Info */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Klijent:</p>
                    <p className="text-sm font-semibold text-gray-900">{lead.user.fullName}</p>
                    {lead.user.clientVerification && (
                      <div className="mt-2 flex gap-2">
                        {lead.user.clientVerification.phoneVerified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">✓ Telefon</span>
                        )}
                        {lead.user.clientVerification.emailVerified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">✓ Email</span>
                        )}
                        {lead.user.clientVerification.companyVerified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">✓ Tvrtka</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* AI Score Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>AI Kvaliteta</span>
                      <span>{lead.qualityScore || 0}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          lead.qualityScore >= 80 ? 'bg-green-500' :
                          lead.qualityScore >= 60 ? 'bg-blue-500' :
                          lead.qualityScore >= 40 ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${lead.qualityScore || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={() => handlePurchase(lead.id, lead.leadPrice || 10)}
                    disabled={isPurchasing || creditsBalance < (lead.leadPrice || 10)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isPurchasing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Kupujem...
                      </>
                    ) : creditsBalance < (lead.leadPrice || 10) ? (
                      <>🔒 Nedovoljno kredita</>
                    ) : (
                      <>🛒 Kupi ekskluzivno ({lead.leadPrice || 10} kredita)</>
                    )}
                  </button>

                  {/* Disclaimer */}
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Ekskluzivan lead - nakon kupovine, otključaj kontakt za 1 dodatni kredit
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">ℹ️ Kako funkcionira Pay-per-contact model?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ <strong>Kupovina leada:</strong> Plaćate za ekskluzivni pristup leadu (vidite naslov, opis, lokaciju)</li>
          <li>✅ <strong>Otključavanje kontakta:</strong> Dodatno 1 kredit za email i telefon klijenta</li>
          <li>✅ <strong>Ekskluzivnost:</strong> Samo vi ćete imati pristup ovom klijentu</li>
          <li>✅ <strong>Refund:</strong> Ako klijent ne odgovori, vraćamo kredite</li>
          <li>✅ <strong>AI Scoring:</strong> Leadovi ocjenjeni prema kvaliteti (0-100)</li>
          <li>✅ <strong>Verificirani klijenti:</strong> Provjereni telefon, email, ID</li>
        </ul>
      </div>
    </div>
  );
}

