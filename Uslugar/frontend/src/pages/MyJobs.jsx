import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../App.jsx';
import { createChatRoom } from '../api/chat';
import ChatRoom from '../components/ChatRoom';

export default function MyJobs({ onNavigate }) {
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [offers, setOffers] = useState({});
  const [chatRoom, setChatRoom] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (!token) {
      if (onNavigate) onNavigate('login');
      return;
    }

    // Učitaj korisničke podatke
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setCurrentUserId(userData.id);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }

    loadMyJobs();
  }, [token]);

  const loadMyJobs = async () => {
    try {
      setLoading(true);
      
      // Provjeri role korisnika
      const storedUser = localStorage.getItem('user');
      let userRole = 'USER';
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          userRole = userData.role;
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }

      if (userRole === 'PROVIDER') {
        // Za providera - dohvati poslove na koje je poslao ponudu
        const offersResponse = await api.get('/offers/my-offers');
        const myOffers = offersResponse.data || [];
        
        // Mapiraj ponude u poslove s informacijama o ponudi
        const providerJobs = myOffers.map(offer => ({
          ...offer.job,
          myOffer: {
            id: offer.id,
            status: offer.status,
            message: offer.message,
            price: offer.amount,
            createdAt: offer.createdAt
          }
        }));
        setJobs(providerJobs);
      } else {
        // Za korisnika - dohvati poslove koje je objavio
        const response = await api.get('/jobs', {
          params: {
            myJobs: true // Backend će filtrirati po userId iz tokena
          }
        });
        setJobs(response.data);
      }
    } catch (error) {
      console.error('Error loading my jobs:', error);
      alert('Greška pri učitavanju poslova');
    } finally {
      setLoading(false);
    }
  };

  const loadOffers = async (jobId) => {
    try {
      const response = await api.get(`/offers/job/${jobId}`);
      setOffers(prev => ({ ...prev, [jobId]: response.data }));
    } catch (error) {
      console.error('Error loading offers:', error);
    }
  };

  const acceptOffer = async (offerId, jobId) => {
    if (!confirm('Jeste li sigurni da želite prihvatiti ovu ponudu?')) {
      return;
    }

    try {
      await api.patch(`/offers/${offerId}/accept`);
      alert('Ponuda je prihvaćena! Chat soba je sada dostupna.');
      await loadMyJobs();
      await loadOffers(jobId);
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert('Greška pri prihvaćanju ponude');
    }
  };

  const rejectOffer = async (offerId, jobId) => {
    if (!confirm('Jeste li sigurni da želite odbiti ovu ponudu?')) {
      return;
    }

    try {
      await api.patch(`/offers/${offerId}/reject`);
      alert('Ponuda je odbijena.');
      await loadMyJobs();
      await loadOffers(jobId);
    } catch (error) {
      console.error('Error rejecting offer:', error);
      alert('Greška pri odbijanju ponude');
    }
  };

  const handleViewJobDetails = (job) => {
    setSelectedJob(job);
    if (!offers[job.id]) {
      loadOffers(job.id);
    }
  };

  const handleOpenChat = async (job) => {
    try {
      const jobOffers = offers[job.id] || job.offers || [];
      const acceptedOffer = jobOffers.find(o => o.status === 'ACCEPTED');
      
      if (!acceptedOffer) {
        alert('Chat je dostupan samo za poslove s prihvaćenom ponudom.');
        return;
      }

      // Odredi drugog sudionika
      // Ako je korisnik PROVIDER, drugi sudionik je vlasnik posla (job.userId)
      // Ako je korisnik USER, drugi sudionik je pružatelj koji je poslao prihvaćenu ponudu (acceptedOffer.userId)
      const otherParticipantId = user?.role === 'PROVIDER' ? job.userId : acceptedOffer.userId;

      // Kreiraj ili dohvati chat room
      try {
        const response = await createChatRoom(job.id, otherParticipantId);
        setChatRoom(response.data);
      } catch (err) {
        if (err.response?.status === 403) {
          alert(err.response?.data?.error || 'Nemate pristup chatu za ovaj posao.');
        } else {
          console.error('Error creating chat room:', err);
          alert('Greška pri otvaranju chata');
        }
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      alert('Greška pri otvaranju chata');
    }
  };

  if (chatRoom && currentUserId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg" style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
          <ChatRoom
            room={chatRoom}
            currentUserId={currentUserId}
            onClose={() => {
              setChatRoom(null);
              loadMyJobs(); // Refresh to get updated data
            }}
          />
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Morate se prijaviti</h1>
          <button
            onClick={() => onNavigate && onNavigate('login')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Prijava
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Učitavanje...</div>
      </div>
    );
  }

  const isProvider = user?.role === 'PROVIDER';

  // Za korisnike: statistika, filter i export
  const getJobStatusLabel = (status) => {
    const map = { OPEN: 'Otvoren', IN_PROGRESS: 'U tijeku', COMPLETED: 'Završen', CANCELLED: 'Otkazan' };
    return map[status] || status;
  };

  const stats = !isProvider && jobs.length > 0 ? {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'OPEN').length,
    inProgress: jobs.filter(j => j.status === 'IN_PROGRESS').length,
    completed: jobs.filter(j => j.status === 'COMPLETED').length,
    cancelled: jobs.filter(j => j.status === 'CANCELLED').length,
    totalOffers: jobs.reduce((acc, j) => acc + (j.offers?.length || 0), 0),
  } : null;

  const filteredJobs = !isProvider && statusFilter !== 'ALL'
    ? jobs.filter(j => j.status === statusFilter)
    : jobs;

  const providersWorkedWith = !isProvider && jobs.length > 0
    ? jobs
        .filter(j => (j.status === 'IN_PROGRESS' || j.status === 'COMPLETED') && j.offers?.length)
        .map(j => {
          const accepted = j.offers.find(o => o.status === 'ACCEPTED');
          return accepted?.user ? { jobId: j.id, jobTitle: j.title, providerName: accepted.user.fullName, providerId: accepted.user.id } : null;
        })
        .filter(Boolean)
        .filter((v, i, a) => a.findIndex(x => x.providerId === v.providerId) === i)
    : [];

  const exportMyJobsCsv = () => {
    const rows = filteredJobs.map(j => {
      const accepted = j.offers?.find(o => o.status === 'ACCEPTED');
      const providerName = accepted?.user?.fullName ?? '';
      return [
        j.title || '',
        getJobStatusLabel(j.status),
        j.category?.name || '',
        j.city || '',
        [j.budgetMin, j.budgetMax].filter(Boolean).length ? `${j.budgetMin || ''}-${j.budgetMax || ''} €` : 'Dogovor',
        j.createdAt ? new Date(j.createdAt).toLocaleDateString('hr-HR') : '',
        providerName,
      ];
    });
    const header = ['Naslov', 'Status', 'Kategorija', 'Grad', 'Budžet', 'Datum objave', 'Pružatelj'];
    const csv = [header, ...rows].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `moji-poslovi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </span>
          Moji Poslovi
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isProvider 
            ? 'Pregledajte sve poslove na koje ste poslali ponudu ili koje ste prihvatili'
            : 'Pregledajte sve poslove koje ste objavili, primljene ponude, povijest suradnje s pružateljima i statistiku. Možete filtrirati po statusu i preuzeti listu u CSV.'}
        </p>
      </div>

      {!isProvider && stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ukupno poslova</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Otvoreno</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.open}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">U tijeku</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.inProgress}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Završeno</p>
                <p className="text-xl font-bold text-teal-600 dark:text-teal-400">{stats.completed}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Otkazano</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ukupne ponude</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalOffers}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter po statusu</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Svi</option>
                <option value="OPEN">Otvoreni</option>
                <option value="IN_PROGRESS">U tijeku</option>
                <option value="COMPLETED">Završeni</option>
                <option value="CANCELLED">Otkazani</option>
              </select>
            </div>
            <button
              onClick={exportMyJobsCsv}
              className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              📥 Preuzmi CSV
            </button>
            {providersWorkedWith.length > 0 && (
              <div className="sm:ml-auto flex-1 sm:max-w-md w-full rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Pružatelji s kojima ste surađivali
                </h3>
                <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                  {providersWorkedWith.map(({ jobTitle, providerName }) => (
                    <li key={`${jobTitle}-${providerName}`} className="flex items-baseline gap-1.5">
                      <span className="font-medium text-gray-900 dark:text-white">{providerName}</span>
                      <span>–</span>
                      <span>{jobTitle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {isProvider 
              ? 'Nemate još poslova na koje ste poslali ponudu.'
              : 'Nemate još objavljenih poslova.'}
          </p>
          <button
            onClick={() => onNavigate && onNavigate(isProvider ? 'providers' : 'user')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isProvider ? 'Pretraži poslove' : 'Objavi novi posao'}
          </button>
        </div>
      ) : !isProvider && filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Nema poslova za odabrani filter. Promijenite filter ili objavite novi posao.</p>
          <button onClick={() => setStatusFilter('ALL')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2">Prikaži sve</button>
          <button onClick={() => onNavigate && onNavigate('user')} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Objavi novi posao</button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex">
              <div className="hidden sm:block w-1 shrink-0 rounded-l-xl bg-gradient-to-b from-blue-400 to-blue-600" aria-hidden />
              <div className="flex-1 min-w-0 p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">{job.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{job.description || '—'}</p>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                      {job.city && (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 shrink-0 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                          {job.city}{job.address ? `, ${job.address}` : ''}
                        </span>
                      )}
                      {job.category && (
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-500 dark:bg-blue-600 text-white text-xs font-medium shadow-sm">
                          {job.category.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {job.budgetMin != null && job.budgetMax != null ? `${job.budgetMin} - ${job.budgetMax} €` : 'Dogovor'}
                      </span>
                    </div>
                    {isProvider && job.myOffer && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Vaša ponuda:</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{job.myOffer.message}</p>
                        {job.myOffer.price != null && (
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mt-1">Cijena: {job.myOffer.price} €</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:items-end gap-3 shrink-0">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium text-white shadow-sm ${
                        job.status === 'OPEN' ? 'bg-green-500' :
                        job.status === 'IN_PROGRESS' ? 'bg-amber-500' :
                        job.status === 'COMPLETED' ? 'bg-teal-500' :
                        job.status === 'CANCELLED' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}>
                        {getJobStatusLabel(job.status)}
                      </span>
                      {job.createdAt && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(job.createdAt).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    {isProvider && job.myOffer && (
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                        job.myOffer.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                        job.myOffer.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>
                        {job.myOffer.status === 'ACCEPTED' ? '✓ Ponuda prihvaćena' : job.myOffer.status === 'REJECTED' ? '✗ Odbijeno' : '⏳ Čeka odgovor'}
                      </span>
                    )}
                    {!isProvider && (
                      <button
                        onClick={() => handleViewJobDetails(job)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm"
                      >
                        {selectedJob?.id === job.id ? 'Sakrij detalje' : 'Prikaži detalje'}
                      </button>
                    )}
                  </div>
                </div>

              {!isProvider && selectedJob?.id === job.id && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold mb-3">Primljene ponude ({offers[job.id]?.length ?? job.offers?.length ?? 0})</h4>
                  {((offers[job.id] || job.offers) && (offers[job.id] || job.offers).length > 0) ? (
                    <div className="space-y-3">
                      {(offers[job.id] || job.offers || []).map(offer => (
                        <div key={offer.id} className="bg-gray-50 dark:bg-gray-700/50 rounded p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{offer.user?.fullName ?? 'Pružatelj'}</p>
                              {offer.message != null && <p className="text-sm text-gray-600 dark:text-gray-400">{offer.message}</p>}
                              <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                                {offer.price != null ? `${offer.price} €` : offer.amount != null ? `${offer.amount} €` : 'Cijena po dogovoru'}
                              </p>
                            </div>
                            {job.status === 'OPEN' && offers[job.id] && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => acceptOffer(offer.id, job.id)}
                                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Prihvati
                                </button>
                                <button
                                  onClick={() => rejectOffer(offer.id, job.id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  Odbij
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Još nema primljenih ponuda.</p>
                  )}
                  
                  {/* Chat gumb - ako postoji prihvaćena ponuda */}
                  {(job.status === 'ACCEPTED' || job.status === 'IN_PROGRESS') && (
                    <div className="mt-4 pt-4 border-t">
                      <button
                        onClick={() => handleOpenChat(job)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        💬 Otvori Chat
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Chat gumb za providera - ako je ponuda prihvaćena */}
              {isProvider && job.myOffer?.status === 'ACCEPTED' && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => handleOpenChat(job)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    💬 Otvori Chat
                  </button>
                </div>
              )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

