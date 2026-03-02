// USLUGAR EXCLUSIVE - My Leads Page
import React, { useState, useEffect } from 'react';
import { getMyLeads, markLeadContacted, markLeadConverted, requestRefund, getCreditsBalance, exportMyLeadsCSV, exportCreditsHistoryCSV, unlockContact, getAssignedLeads, updateAssignedLeadStatus, updateLeadPurchaseCrm } from '../api/exclusive';

export default function MyLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selectedLead, setSelectedLead] = useState(null);
  const [creditsBalance, setCreditsBalance] = useState(0);
  const [unlocking, setUnlocking] = useState(null);
  const [assignedQueue, setAssignedQueue] = useState([]);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [savingCrmId, setSavingCrmId] = useState(null);
  const [crmDraft, setCrmDraft] = useState({});

  useEffect(() => {
    loadLeads();
    loadCredits();
    loadAssignedLeads();
  }, [filter]);

  const loadAssignedLeads = async () => {
    try {
      const res = await getAssignedLeads();
      setAssignedQueue(res.data?.queue || []);
      setIsTeamMember(res.data?.isTeamMember || false);
    } catch (err) {
      setAssignedQueue([]);
      setIsTeamMember(false);
    }
  };

  const loadLeads = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'ALL' ? null : filter;
      const response = await getMyLeads(statusFilter);
      setLeads(response.data.leads);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri učitavanju leadova');
    } finally {
      setLoading(false);
    }
  };

  const loadCredits = async () => {
    try {
      const response = await getCreditsBalance();
      setCreditsBalance(response.data.balance);
    } catch (err) {
      console.error('Error loading credits:', err);
    }
  };

  const handleAssignedStatus = async (queueId, status) => {
    try {
      setUpdatingStatusId(queueId);
      await updateAssignedLeadStatus(queueId, status);
      await loadAssignedLeads();
      alert(status === 'IN_PROGRESS' ? '✅ Lead označen kao "u tijeku".' : '✅ Lead označen kao završen.');
    } catch (err) {
      alert('Greška: ' + (err.response?.data?.error || err.message || 'Neuspjelo'));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleMarkContacted = async (purchaseId) => {
    try {
      await markLeadContacted(purchaseId);
      alert('✅ Lead označen kao kontaktiran!');
      loadLeads();
    } catch (err) {
      alert('Greška: ' + (err.response?.data?.error || 'Neuspjelo'));
    }
  };

  const handleMarkConverted = async (purchaseId) => {
    const revenue = prompt('Unesite prihod od ovog posla (EUR):');
    if (!revenue) return;

    try {
      await markLeadConverted(purchaseId, parseInt(revenue));
      alert('🎉 Čestitamo! Lead konvertiran u posao!');
      loadLeads();
    } catch (err) {
      alert('Greška: ' + (err.response?.data?.error || 'Neuspjelo'));
    }
  };

  const handleUnlockContact = async (jobId, purchaseId) => {
    if (creditsBalance < 1) {
      alert(`Nemate dovoljno kredita! Potrebno: 1 kredit za otključavanje kontakta.`);
      return;
    }

    const confirmed = window.confirm(
      `Otključati kontakt klijenta?\n\nCijena: 1 kredit\n\nNakon otključavanja, vidjet ćete email i telefon klijenta.`
    );

    if (!confirmed) return;

    try {
      setUnlocking(purchaseId);
      const response = await unlockContact(jobId);
      
      alert(`✅ Kontakt uspješno otključan!\n\nPreostalo kredita: ${response.data.creditsRemaining}\n\n${response.data.message}`);
      
      // Refresh leadova i kredita
      loadLeads();
      loadCredits();
      
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Greška pri otključavanju kontakta';
      alert(errorMsg);
    } finally {
      setUnlocking(null);
    }
  };

  const handleRefund = async (purchaseId) => {
    const reason = prompt('Razlog za zahtjev povrata:') || 'Klijent nije odgovorio';
    
    const confirmed = window.confirm(
      `Zatražiti povrat?\n\nUslugar prosljeđuje vaš zahtjev ovlaštenoj platnoj instituciji (Stripe Payments Europe) radi obrade povrata.\nOdluku o povratu donosi platna institucija uz uvid u dokaze.\n\nRazlog: ${reason}`
    );

    if (!confirmed) return;

    try {
      const response = await requestRefund(purchaseId, reason);
      alert(`✅ Zahtjev za povrat je poslan!\n\n${response.data?.message || 'Vaš zahtjev će biti obrađen putem ovlaštene platne institucije u skladu s PSD2 pravilima.'}`);
      loadLeads();
      loadCredits();
    } catch (err) {
      alert('Greška: ' + (err.response?.data?.error || 'Neuspjelo'));
    }
  };

  const getCrmValue = (purchase, field) => {
    if (crmDraft[purchase.id] && crmDraft[purchase.id][field] !== undefined) return crmDraft[purchase.id][field];
    const v = purchase[field];
    if (field === 'nextStepAt' && v) return new Date(v).toISOString().slice(0, 10);
    return v || '';
  };

  const setCrmValue = (purchaseId, field, value) => {
    setCrmDraft(prev => ({ ...prev, [purchaseId]: { ...(prev[purchaseId] || {}), [field]: value } }));
  };

  const handleSaveCrm = async (purchase) => {
    const notes = getCrmValue(purchase, 'notes');
    const nextStep = getCrmValue(purchase, 'nextStep');
    const nextStepAt = getCrmValue(purchase, 'nextStepAt');
    try {
      setSavingCrmId(purchase.id);
      await updateLeadPurchaseCrm(purchase.id, {
        notes: notes || null,
        nextStep: nextStep || null,
        nextStepAt: nextStepAt ? nextStepAt : null
      });
      setCrmDraft(prev => { const next = { ...prev }; delete next[purchase.id]; return next; });
      loadLeads();
    } catch (err) {
      alert('Greška: ' + (err.response?.data?.error || 'Neuspjelo'));
    } finally {
      setSavingCrmId(null);
    }
  };

  const handleExportLeads = async () => {
    try {
      const response = await exportMyLeadsCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'my-leads.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      alert('✅ Leadovi izvezeni!');
    } catch (err) {
      alert('Greška pri izvozu: ' + (err.response?.data?.error || 'Neuspjelo'));
    }
  };

  const handleExportCredits = async () => {
    try {
      const response = await exportCreditsHistoryCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'credit-history.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      alert('✅ Povijest kredita izvezena!');
    } catch (err) {
      alert('Greška pri izvozu: ' + (err.response?.data?.error || 'Neuspjelo'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-100 text-blue-800';
      case 'CONTACTED': return 'bg-yellow-100 text-yellow-800';
      case 'CONVERTED': return 'bg-green-100 text-green-800';
      case 'REFUNDED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Moji Ekskluzivni Leadovi</h1>
          <p className="text-gray-600 mt-2">Upravljajte svojim kupljenim leadovima</p>
        </div>
        
        <div className="text-right flex gap-2 items-center">
          <div className="mr-4">
            <p className="text-sm text-gray-600">Dostupni krediti</p>
            <p className="text-3xl font-bold text-green-600">{creditsBalance}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => window.location.hash = '#leads'}
              className="text-sm text-green-600 hover:underline"
            >
              Kupi još leadova →
            </button>
            <button
              onClick={handleExportLeads}
              className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 border rounded"
            >
              📥 Export CSV
            </button>
            <button
              onClick={handleExportCredits}
              className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 border rounded"
            >
              💰 Export kredita
            </button>
          </div>
        </div>
      </div>

      {/* Leadovi dodijeljeni meni (član tima) */}
      {isTeamMember && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">👥 Leadovi dodijeljeni meni</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Leadovi koje vam je direktor dodijelio; možete označiti "Započinjem rad" ili "Završeno".</p>
          </div>
          <div className="p-6">
            {assignedQueue.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Trenutno nemate dodijeljenih leadova. Direktor vam ih dodjeljuje u internom queueu tvrtke.</p>
            ) : (
              <div className="space-y-4">
                {assignedQueue.map((entry) => (
                  <div key={entry.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{entry.job?.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          📍 {entry.job?.user?.city} · 🏷️ {entry.job?.category?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Klijent: {entry.job?.user?.fullName}
                          {entry.director?.companyName && ` · Tvrtka: ${entry.director.companyName}`}
                        </p>
                        {entry.assignedAt && (
                          <p className="text-xs text-gray-500 mt-1">Dodijeljeno: {new Date(entry.assignedAt).toLocaleString('hr-HR')}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          entry.status === 'ASSIGNED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                          entry.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                        }`}>
                          {entry.status === 'ASSIGNED' ? 'Dodijeljeno' : entry.status === 'IN_PROGRESS' ? 'U tijeku' : 'Završeno'}
                        </span>
                        {entry.status === 'ASSIGNED' && (
                          <button
                            onClick={() => handleAssignedStatus(entry.id, 'IN_PROGRESS')}
                            disabled={updatingStatusId === entry.id}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                          >
                            {updatingStatusId === entry.id ? '...' : 'Započni rad'}
                          </button>
                        )}
                        {(entry.status === 'ASSIGNED' || entry.status === 'IN_PROGRESS') && (
                          <button
                            onClick={() => handleAssignedStatus(entry.id, 'COMPLETED')}
                            disabled={updatingStatusId === entry.id}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                          >
                            {updatingStatusId === entry.id ? '...' : 'Završeno'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex gap-4 text-xs text-gray-500">
                      {entry.startedAt && <span>Započeto: {new Date(entry.startedAt).toLocaleString('hr-HR')}</span>}
                      {entry.completedAt && <span>Završeno: {new Date(entry.completedAt).toLocaleString('hr-HR')}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        {['ALL', 'ACTIVE', 'CONTACTED', 'CONVERTED', 'REFUNDED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 font-semibold transition-colors ${
              filter === status
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {status === 'ALL' ? 'Svi' : status}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Leads List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-600">Nema leadova</p>
          <button
            onClick={() => window.location.hash = '#leads'}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Pregledaj dostupne leadove
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((purchase) => (
            <div key={purchase.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{purchase.job.title}</h3>
                  <p className="text-gray-700 mb-3">{purchase.job.description}</p>
                  
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>📍 {purchase.job.user.city}</span>
                    <span>💰 {purchase.job.budgetMin}-{purchase.job.budgetMax} EUR</span>
                    <span>📅 {new Date(purchase.createdAt).toLocaleDateString('hr-HR')}</span>
                  </div>
                </div>
                
                <span className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusColor(purchase.status)}`}>
                  {purchase.status}
                </span>
              </div>

              {/* Client Contact Info (Pay-per-contact model) */}
              <div className={`mb-4 p-4 border rounded-lg ${
                purchase.contactUnlocked 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <p className={`text-xs font-semibold mb-2 ${
                  purchase.contactUnlocked ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {purchase.contactUnlocked ? '📞 KONTAKT KLIJENTA (EKSKLUZIVNO):' : '🔒 KONTAKT NIJE OTKLJUČAN'}
                </p>
                
                {purchase.contactUnlocked ? (
                  <div className="grid md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Ime:</p>
                      <p className="font-semibold">{purchase.job.user.fullName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email:</p>
                      <p className="font-semibold">{purchase.job.user.email || 'Nije navedeno'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Telefon:</p>
                      <p className="font-semibold">{purchase.job.user.phone || 'Nije navedeno'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Za kontakt klijenta potrebno je otključati:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Ime klijenta: <span className="font-semibold">{purchase.job.user.fullName}</span> (vidljivo)</li>
                        <li>Email i telefon: 🔒 <span className="font-semibold">Otključaj za 1 kredit</span></li>
                      </ul>
                    </div>
                    <button
                      onClick={() => handleUnlockContact(purchase.jobId, purchase.id)}
                      disabled={unlocking === purchase.id || creditsBalance < 1}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {unlocking === purchase.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Otključavam...
                        </>
                      ) : creditsBalance < 1 ? (
                        <>🔒 Nedovoljno kredita (potrebno: 1)</>
                      ) : (
                        <>🔓 Otključaj kontakt (1 kredit)</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Lead Info */}
              <div className="flex gap-4 text-xs text-gray-500 mb-4">
                <span>Potrošeno: {purchase.creditsSpent} kredita</span>
                {purchase.contactedAt && (
                  <span>Kontaktirano: {new Date(purchase.contactedAt).toLocaleDateString('hr-HR')}</span>
                )}
                {purchase.convertedAt && (
                  <span>Konvertirano: {new Date(purchase.convertedAt).toLocaleDateString('hr-HR')}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {purchase.status === 'ACTIVE' && (
                  <>
                    <button
                      onClick={() => handleMarkContacted(purchase.id)}
                      className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold"
                    >
                      📞 Označiti kao kontaktiran
                    </button>
                    <button
                      onClick={() => handleRefund(purchase.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      💬 Zatraži povrat
                    </button>
                  </>
                )}
                
                {purchase.status === 'CONTACTED' && (
                  <>
                    <button
                      onClick={() => handleMarkConverted(purchase.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      ✅ Označiti kao realiziran
                    </button>
                    <p className="text-xs text-gray-500 w-full mt-1">
                      Klijent može potvrditi završetak u „Moji poslovi” → Označi posao kao završen.
                    </p>
                    <button
                      onClick={() => handleRefund(purchase.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      💬 Zatraži povrat
                    </button>
                  </>
                )}
                
                {purchase.status === 'CONVERTED' && (
                  <div className="flex-1 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-center font-semibold">
                    🎉 Uspješno realiziran!
                  </div>
                )}
                
                {purchase.status === 'REFUNDED' && (
                  <div className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
                    Refundirano: {purchase.refundReason}
                  </div>
                )}
              </div>

              {/* Mini CRM: bilješke, sljedeći korak, podsjetnik */}
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📋 Mini CRM</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bilješke</label>
                    <textarea
                      value={getCrmValue(purchase, 'notes')}
                      onChange={(e) => setCrmValue(purchase.id, 'notes', e.target.value)}
                      placeholder="Napomene o leadu, dogovoreno s klijentom..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sljedeći korak</label>
                      <input
                        type="text"
                        value={getCrmValue(purchase, 'nextStep')}
                        onChange={(e) => setCrmValue(purchase.id, 'nextStep', e.target.value)}
                        placeholder="npr. Nazovi u petak"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Podsjetnik (datum)</label>
                      <input
                        type="date"
                        value={getCrmValue(purchase, 'nextStepAt')}
                        onChange={(e) => setCrmValue(purchase.id, 'nextStepAt', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveCrm(purchase)}
                    disabled={savingCrmId === purchase.id}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {savingCrmId === purchase.id ? 'Spremanje...' : 'Spremi'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-blue-600">
            {leads.filter(l => l.status === 'ACTIVE').length}
          </p>
          <p className="text-sm text-gray-600">Aktivni</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {leads.filter(l => l.status === 'CONTACTED').length}
          </p>
          <p className="text-sm text-gray-600">Kontaktirani</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-green-600">
            {leads.filter(l => l.status === 'CONVERTED').length}
          </p>
          <p className="text-sm text-gray-600">Realizirani</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-red-600">
            {leads.filter(l => l.status === 'REFUNDED').length}
          </p>
          <p className="text-sm text-gray-600">Refundirani</p>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">💡 Savjeti za uspjeh</h3>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li>📞 <strong>Kontaktirajte brzo:</strong> Klijenti cijene brzu reakciju - nazovite u roku 1 sata!</li>
          <li>💬 <strong>Budite profesionalni:</strong> Prvi dojam je ključan za konverziju</li>
          <li>📊 <strong>Pratite ROI:</strong> Fokusirajte se na leadove sa visokim quality scorom</li>
          <li>💬 <strong>Zahtjev za povrat:</strong> Ako klijent ne odgovara, zatražite povrat. Uslugar prosljeđuje zahtjev ovlaštenoj platnoj instituciji radi obrade.</li>
        </ul>
      </div>
    </div>
  );
}

