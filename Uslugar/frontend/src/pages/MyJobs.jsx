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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Moji Poslovi</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isProvider 
            ? 'Pregledajte sve poslove na koje ste poslali ponudu ili koje ste prihvatili'
            : 'Pregledajte sve poslove koje ste objavili, primljene ponude, povijest suradnje s pružateljima i statistiku. Možete filtrirati po statusu i preuzeti listu u CSV.'}
        </p>
      </div>

      {!isProvider && stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Ukupno poslova</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Otvoreno</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.open}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">U tijeku</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Završeno</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.completed}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Ukupno ponuda</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOffers}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 flex flex-col justify-center">
              <button
                onClick={exportMyJobsCsv}
                className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                📥 Preuzmi CSV
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filter po statusu:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2"
            >
              <option value="ALL">Svi</option>
              <option value="OPEN">Otvoreni</option>
              <option value="IN_PROGRESS">U tijeku</option>
              <option value="COMPLETED">Završeni</option>
              <option value="CANCELLED">Otkazani</option>
            </select>
          </div>
          {providersWorkedWith.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">👥 Pružatelji s kojima ste surađivali</h2>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {providersWorkedWith.map(({ jobTitle, providerName }) => (
                  <li key={`${jobTitle}-${providerName}`}>• <strong>{providerName}</strong> – {jobTitle}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">
            {isProvider 
              ? 'Nemate još poslova na koje ste poslali ponudu.'
              : 'Nemate još objavljenih poslova.'}
          </p>
          <button
            onClick={() => onNavigate && onNavigate(isProvider ? 'providers' : 'user')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isProvider ? 'Pretraži poslove' : 'Objavi novi posao'}
          </button>
        </div>
      ) : !isProvider && filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Nema poslova za odabrani filter. Promijenite filter ili objavite novi posao.</p>
          <button onClick={() => setStatusFilter('ALL')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2">Prikaži sve</button>
          <button onClick={() => onNavigate && onNavigate('user')} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Objavi novi posao</button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-gray-600 mb-2">{job.description}</p>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    <span>📍 {job.city}</span>
                    {job.category && <span>🏷️ {job.category.name}</span>}
                    <span>💰 {job.budgetMin && job.budgetMax ? `${job.budgetMin}-${job.budgetMax} €` : 'Dogovor'}</span>
                    <span className={`px-2 py-1 rounded ${
                      job.status === 'OPEN' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      job.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                      job.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getJobStatusLabel(job.status)}
                    </span>
                    {isProvider && job.myOffer && (
                      <span className={`px-2 py-1 rounded ${
                        job.myOffer.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        job.myOffer.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {job.myOffer.status === 'ACCEPTED' ? '✓ Ponuda prihvaćena' :
                         job.myOffer.status === 'REJECTED' ? '✗ Ponuda odbijena' :
                         '⏳ Čeka odgovor'}
                      </span>
                    )}
                  </div>
                  {isProvider && job.myOffer && (
                    <div className="mt-2 p-3 bg-blue-50 rounded">
                      <p className="text-sm font-semibold text-blue-900">Vaša ponuda:</p>
                      <p className="text-sm text-blue-700">{job.myOffer.message}</p>
                      {job.myOffer.price && (
                        <p className="text-sm font-semibold text-blue-900 mt-1">
                          Cijena: {job.myOffer.price} €
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {!isProvider && (
                  <button
                    onClick={() => handleViewJobDetails(job)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {selectedJob?.id === job.id ? 'Sakrij detalje' : 'Prikaži detalje'}
                  </button>
                )}
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
          ))}
        </div>
      )}
    </div>
  );
}

