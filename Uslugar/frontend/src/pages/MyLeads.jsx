// USLUGAR EXCLUSIVE - My Leads Page
import React, { useState, useEffect } from 'react';
import { getMyLeads, markLeadContacted, markLeadConverted, requestRefund, getCreditsBalance, exportMyLeadsCSV, exportCreditsHistoryCSV, unlockContact, getAssignedLeads, updateAssignedLeadStatus, updateLeadPurchaseCrm, getLeadActivities, addLeadNote, addLeadToCompanyQueue, getDirectorLeadQueue } from '../api/exclusive';

const isDocsScreenshotMode = () =>
  typeof window !== 'undefined' && window.location.href.includes('screenshotMode=docs');

const isDocsTeamMember = () => {
  if (!isDocsScreenshotMode()) return false;
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return typeof u?.email === 'string' && u.email.includes('screenshot-tim@');
  } catch {
    return false;
  }
};

function getDocsTeamAssignedQueueMock() {
  return [{
    id: 'docs-tim-assigned-1',
    status: 'ASSIGNED',
    assignedAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    job: {
      title: 'Sanacija krovišta nakon nevremena',
      category: { name: 'Krovopokrivački radovi' },
      user: { fullName: 'Ana Horvat', city: 'Zagreb' },
    },
    director: { companyName: 'Građevina Babić d.o.o.' },
  }];
}

function getDocsTeamLeadsMock() {
  return [{
    id: 'docs-tim-lead-1',
    jobId: 'docs-job-1',
    status: 'ACTIVE',
    contactUnlocked: false,
    creditsSpent: 7,
    createdAt: new Date().toISOString(),
    contactedAt: null,
    convertedAt: null,
    notes: 'Klijent traži izlazak na teren unutar 48h.',
    nextStep: 'Nazvati klijenta i potvrditi termin',
    nextStepAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    job: {
      id: 'docs-job-1',
      title: 'Procjena štete i popravak dimnjaka',
      description: 'Potrebna hitna procjena i sanacija dimnjaka nakon oluje. Pristup krovu osiguran.',
      budgetMin: 1200,
      budgetMax: 2800,
      category: { name: 'Građevinski radovi' },
      user: {
        fullName: 'Ana Horvat',
        city: 'Zagreb',
        email: undefined,
        phone: undefined,
      },
    },
  }];
}

export default function MyLeads({ isDirector = false }) {
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
  const [activitiesByPurchase, setActivitiesByPurchase] = useState({});
  const [activitiesLoadingId, setActivitiesLoadingId] = useState(null);
  const [newNote, setNewNote] = useState({});
  const [addingToQueueId, setAddingToQueueId] = useState(null);
  const [inQueueJobIds, setInQueueJobIds] = useState(new Set());

  useEffect(() => {
    loadLeads();
    loadCredits();
    loadAssignedLeads();
  }, [filter]);

  useEffect(() => {
    if (isDirector) {
      getDirectorLeadQueue()
        .then((res) => {
          const queue = res.data?.queue || [];
          const ids = new Set(queue.map((e) => e.jobId));
          setInQueueJobIds(ids);
        })
        .catch(() => setInQueueJobIds(new Set()));
    }
  }, [isDirector]);

  const loadAssignedLeads = async () => {
    try {
      const res = await getAssignedLeads();
      const queue = res.data?.queue || [];
      const teamMember = res.data?.isTeamMember || false;
      if (queue.length === 0 && !teamMember && isDocsTeamMember()) {
        setAssignedQueue(getDocsTeamAssignedQueueMock());
        setIsTeamMember(true);
        return;
      }
      setAssignedQueue(queue);
      setIsTeamMember(teamMember);
    } catch (err) {
      if (isDocsTeamMember()) {
        setAssignedQueue(getDocsTeamAssignedQueueMock());
        setIsTeamMember(true);
      } else {
        setAssignedQueue([]);
        setIsTeamMember(false);
      }
    }
  };

  const loadLeads = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'ALL' ? null : filter;
      const response = await getMyLeads(statusFilter);
      const apiLeads = response.data?.leads || [];
      if (apiLeads.length === 0 && isDocsTeamMember()) {
        setLeads(getDocsTeamLeadsMock());
      } else {
        setLeads(apiLeads);
      }
    } catch (err) {
      if (isDocsTeamMember()) {
        setLeads(getDocsTeamLeadsMock());
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
    const existingNotes = purchase.notes || '';
    const inputNotesRaw = getCrmValue(purchase, 'notes');
    const inputNotes = (inputNotesRaw || '').trim();
    const nextStep = getCrmValue(purchase, 'nextStep');
    const nextStepAt = getCrmValue(purchase, 'nextStepAt');

    // Ako nema nove bilješke, ne diramo notes (sažetak ostaje kakav je)
    let finalNotes = existingNotes;
    if (inputNotes) {
      const now = new Date();
      const dateLabel = now.toLocaleString('hr-HR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Ako korisnik već ručno vidi stari tekst i doda novi na kraj, samo ga pošaljemo
      if (!existingNotes) {
        finalNotes = `[${dateLabel}] ${inputNotes}`;
      } else if (inputNotes.startsWith(existingNotes)) {
        // Već sadrži staru povijest, ne dupliramo
        finalNotes = inputNotes;
      } else {
        // Korisnik je upisao novu bilješku, dodaj je na kraj sa datumom
        finalNotes = `${existingNotes}\n[${dateLabel}] ${inputNotes}`;
      }
    }

    try {
      setSavingCrmId(purchase.id);
      await updateLeadPurchaseCrm(purchase.id, {
        notes: finalNotes || null,
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

  const loadActivitiesForPurchase = async (purchaseId) => {
    try {
      setActivitiesLoadingId(purchaseId);
      const res = await getLeadActivities(purchaseId);
      setActivitiesByPurchase(prev => ({ ...prev, [purchaseId]: res.data.activities || [] }));
    } catch (err) {
      console.error('Error loading lead activities', err);
    } finally {
      setActivitiesLoadingId(null);
    }
  };

  const handleAddToQueue = async (jobId) => {
    if (!jobId) return;
    try {
      setAddingToQueueId(jobId);
      await addLeadToCompanyQueue(jobId);
      setInQueueJobIds((prev) => new Set([...prev, jobId]));
      alert('✅ Lead dodan u interni red čekanja. Možete ga dodijeliti članu tima u nadzornoj ploči direktora → Interni red leadova.');
    } catch (err) {
      alert('Greška: ' + (err.response?.data?.message || err.response?.data?.error || 'Neuspjelo'));
    } finally {
      setAddingToQueueId(null);
    }
  };

  const handleAddNote = async (purchase) => {
    const message = (newNote[purchase.id] || '').trim();
    if (!message) return;
    try {
      setActivitiesLoadingId(purchase.id);
      const res = await addLeadNote(purchase.id, message, 'Bilješka');
      setActivitiesByPurchase(prev => ({
        ...prev,
        [purchase.id]: [res.data.activity, ...(prev[purchase.id] || [])]
      }));
      setNewNote(prev => ({ ...prev, [purchase.id]: '' }));
    } catch (err) {
      alert('Greška pri spremanju bilješke: ' + (err.response?.data?.error || 'Neuspjelo'));
    } finally {
      setActivitiesLoadingId(null);
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
          {leads.map((purchase) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let reminderBadge = null;
            if (purchase.nextStepAt) {
              const reminderDate = new Date(purchase.nextStepAt);
              const cmp = new Date(reminderDate);
              cmp.setHours(0, 0, 0, 0);
              if (cmp.getTime() === today.getTime()) {
                reminderBadge = { type: 'today', label: '📅 Danas podsjetnik' };
              } else if (cmp.getTime() < today.getTime() && purchase.status !== 'CONVERTED' && purchase.status !== 'REFUNDED') {
                reminderBadge = { type: 'overdue', label: '⏰ Podsjetnik prošao' };
              }
            }
            return (
            <div key={purchase.id} className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow ${reminderBadge?.type === 'overdue' ? 'border border-amber-400' : ''}`}>
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
                
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusColor(purchase.status)}`}>
                    {purchase.status}
                  </span>
                  {reminderBadge && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      reminderBadge.type === 'today'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {reminderBadge.label}
                    </span>
                  )}
                </div>
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

              {/* Direktor: dodaj u interni queue */}
              {isDirector && (purchase.jobId || purchase.job?.id) && !inQueueJobIds.has(purchase.jobId || purchase.job?.id) && (
                <div className="mb-4">
                  <button
                    onClick={() => handleAddToQueue(purchase.jobId || purchase.job?.id)}
                    disabled={addingToQueueId === (purchase.jobId || purchase.job?.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {addingToQueueId === (purchase.jobId || purchase.job?.id) ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Dodavanje...
                      </>
                    ) : (
                      <>📋 Dodaj u interni queue</>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Dodaj lead u interni red čekanja tvrtke da ga možete dodijeliti članu tima u nadzornoj ploči direktora.
                  </p>
                </div>
              )}
              {isDirector && (purchase.jobId || purchase.job?.id) && inQueueJobIds.has(purchase.jobId || purchase.job?.id) && (
                <div className="mb-4 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
                  ✓ Lead je u internom redu čekanja. Dodijelite ga članu tima u nadzornoj ploči direktora → Interni red leadova.
                </div>
              )}

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

              {/* Timeline aktivnosti */}
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">🕒 Aktivnosti</h4>
                  <button
                    type="button"
                    onClick={() => loadActivitiesForPurchase(purchase.id)}
                    disabled={activitiesLoadingId === purchase.id}
                    className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                  >
                    {activitiesLoadingId === purchase.id ? 'Učitavanje...' : 'Osvježi'}
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote[purchase.id] || ''}
                      onChange={(e) => setNewNote(prev => ({ ...prev, [purchase.id]: e.target.value }))}
                      placeholder="Dodaj novu bilješku..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddNote(purchase)}
                      disabled={activitiesLoadingId === purchase.id}
                      className="px-3 py-2 bg-gray-800 text-white rounded-lg text-xs font-medium hover:bg-gray-900 disabled:opacity-50"
                    >
                      Spremi bilješku
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto text-xs text-gray-700 dark:text-gray-300 divide-y divide-gray-200 dark:divide-gray-700">
                    {(activitiesByPurchase[purchase.id] || []).length === 0 ? (
                      <p className="py-2 text-gray-400">Još nema aktivnosti.</p>
                    ) : (
                      (activitiesByPurchase[purchase.id] || []).map((act) => (
                        <div key={act.id} className="py-2 flex gap-2">
                          <span className="text-[11px] text-gray-500 whitespace-nowrap">
                            {new Date(act.createdAt).toLocaleString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div>
                            <div className="font-medium">
                              {act.isSystem ? '🛠️ ' : '📝 '}
                              {act.label || (act.isSystem ? 'Sistemska aktivnost' : 'Bilješka')}
                            </div>
                            <div className="text-gray-700 dark:text-gray-200">
                              {act.message}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
          })}
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

