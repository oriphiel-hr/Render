import React, { useState, useEffect } from 'react';
import api from '../api';

export default function DirectorDashboard() {
  const [team, setTeam] = useState(null);
  const [finances, setFinances] = useState(null);
  const [decisions, setDecisions] = useState(null);
  const [isDirector, setIsDirector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('team'); // 'team', 'finances', 'decisions', 'lead-queue'
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [leadQueue, setLeadQueue] = useState(null);
  const [selectedQueueId, setSelectedQueueId] = useState(null);
  const [assignToMemberId, setAssignToMemberId] = useState('');

  useEffect(() => {
    checkDirectorStatus();
  }, []);

  useEffect(() => {
    if (isDirector) {
      loadData();
    }
  }, [isDirector, activeTab]);

  const loadLeadQueue = async () => {
    try {
      const response = await api.get('/director/lead-queue');
      setLeadQueue(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri učitavanju lead queuea');
    }
  };

  const checkDirectorStatus = async () => {
    try {
      const response = await api.get('/providers/me');
      setIsDirector(response.data.isDirector || false);
      if (!response.data.isDirector && response.data.companyName) {
        // Korisnik može postati direktor
        setIsDirector(false);
      }
    } catch (err) {
      console.error('Error checking director status:', err);
      setError('Greška pri provjeri statusa direktora');
    } finally {
      setLoading(false);
    }
  };

  const becomeDirector = async () => {
    try {
      await api.post('/director/become-director');
      setIsDirector(true);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri postavljanju direktora');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'team') {
        const response = await api.get('/director/team');
        setTeam(response.data);
      } else if (activeTab === 'finances') {
        const response = await api.get('/director/finances');
        setFinances(response.data);
      } else       if (activeTab === 'decisions') {
        const response = await api.get('/director/decisions');
        setDecisions(response.data);
      } else if (activeTab === 'lead-queue') {
        await loadLeadQueue();
      }
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.error || 'Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const addTeamMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail) return;

    try {
      // Prvo pronađi korisnika po emailu
      const usersResponse = await api.get(`/users?email=${newMemberEmail}`);
      if (!usersResponse.data || usersResponse.data.length === 0) {
        setError('Korisnik s tim emailom nije pronađen');
        return;
      }

      const user = usersResponse.data[0];
      if (user.role !== 'PROVIDER') {
        setError('Korisnik mora biti PROVIDER');
        return;
      }

      await api.post('/director/team/add', { userId: user.id });
      setNewMemberEmail('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri dodavanju člana tima');
    }
  };

  const removeTeamMember = async (memberId) => {
    if (!confirm('Jeste li sigurni da želite ukloniti ovog člana iz tima?')) {
      return;
    }

    try {
      await api.delete(`/director/team/${memberId}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri uklanjanju člana tima');
    }
  };

  const handleManualAssign = async (queueId, teamMemberId) => {
    try {
      await api.post(`/director/lead-queue/${queueId}/assign`, { teamMemberId });
      await loadLeadQueue();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri dodjeli leada');
    }
  };

  const handleAutoAssign = async (queueId) => {
    try {
      await api.post(`/director/lead-queue/${queueId}/auto-assign`);
      await loadLeadQueue();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri automatskoj dodjeli leada');
    }
  };

  const handleDeclineLead = async (queueId, reason) => {
    if (!confirm('Jeste li sigurni da želite odbiti ovaj lead?')) {
      return;
    }

    try {
      await api.post(`/director/lead-queue/${queueId}/decline`, { reason });
      await loadLeadQueue();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri odbijanju leada');
    }
  };

  if (loading && !isDirector) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (!isDirector) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Postanite Direktor</h2>
          <p className="text-gray-600 mb-6">
            Kao direktor možete upravljati timovima, financijama i ključnim odlukama tvrtke.
          </p>
          <button
            onClick={becomeDirector}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Postani Direktor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Direktor Dashboard</h1>
        <p className="text-gray-600">Upravljajte timovima, financijama i ključnim odlukama tvrtke</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('team')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'team'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            👥 Tim
          </button>
          <button
            onClick={() => setActiveTab('finances')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'finances'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            💰 Financije
          </button>
          <button
            onClick={() => setActiveTab('decisions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'decisions'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ⚖️ Odluke
          </button>
          <button
            onClick={() => setActiveTab('lead-queue')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'lead-queue'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📋 Interni Lead Queue
          </button>
        </nav>
      </div>

      {/* Team Tab */}
      {activeTab === 'team' && team && (
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Dodaj Člana Tima</h2>
            <form onSubmit={addTeamMember} className="flex gap-4">
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Email korisnika (PROVIDER)"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Dodaj
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Članovi Tima</h2>
            {team.teamMembers.length === 0 ? (
              <p className="text-gray-500">Nemate članova tima</p>
            ) : (
              <div className="space-y-4">
                {team.teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.fullName}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      {member.phone && (
                        <p className="text-sm text-gray-600">{member.phone}</p>
                      )}
                      <div className="mt-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          member.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {member.isAvailable ? 'Dostupan' : 'Nedostupan'}
                        </span>
                      </div>
                      {member.categories.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">
                            Kategorije: {member.categories.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeTeamMember(member.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Ukloni
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Finances Tab */}
      {activeTab === 'finances' && finances && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ukupno Potrošeno</h3>
              <p className="text-3xl font-bold text-indigo-600">
                {finances.summary.totalSpent.toFixed(2)} €
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ukupno Leadova</h3>
              <p className="text-3xl font-bold text-indigo-600">{finances.summary.totalLeads}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Veličina Tima</h3>
              <p className="text-3xl font-bold text-indigo-600">{finances.summary.teamSize}</p>
            </div>
          </div>

          {finances.subscription && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pretplata</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="text-lg font-semibold">{finances.subscription.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold">{finances.subscription.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Krediti</p>
                  <p className="text-lg font-semibold">{finances.subscription.creditsBalance}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Istječe</p>
                  <p className="text-lg font-semibold">
                    {finances.subscription.expiresAt
                      ? new Date(finances.subscription.expiresAt).toLocaleDateString('hr-HR')
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nedavne Fakture</h3>
            <div className="space-y-2">
              {[...finances.invoices.director, ...finances.invoices.team]
                .slice(0, 10)
                .map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(invoice.createdAt).toLocaleDateString('hr-HR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{(invoice.totalAmount / 100).toFixed(2)} €</p>
                      <p className={`text-sm ${
                        invoice.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {invoice.status}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Decisions Tab */}
      {activeTab === 'decisions' && decisions && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ponude koje čekaju ({decisions.summary.pendingOffersCount})
              </h3>
              {decisions.pendingOffers.length === 0 ? (
                <p className="text-gray-500">Nema ponuda koje čekaju na odobrenje</p>
              ) : (
                <div className="space-y-3">
                  {decisions.pendingOffers.map((offer) => (
                    <div
                      key={offer.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <p className="font-semibold">{offer.job.title}</p>
                      <p className="text-sm text-gray-600">
                        Od: {offer.user.fullName} ({offer.user.email})
                      </p>
                      <p className="text-sm text-gray-600">Iznos: {offer.amount} €</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Leadovi koje čekaju ({decisions.summary.pendingLeadsCount})
              </h3>
              {decisions.pendingLeads.length === 0 ? (
                <p className="text-gray-500">Nema leadova koji čekaju na odobrenje</p>
              ) : (
                <div className="space-y-3">
                  {decisions.pendingLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <p className="font-semibold">{lead.job.title}</p>
                      <p className="text-sm text-gray-600">
                        Od: {lead.provider.user.fullName} ({lead.provider.user.email})
                      </p>
                      <p className="text-sm text-gray-600">
                        Budžet: {lead.job.budgetMax} €
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lead Queue Tab */}
      {activeTab === 'lead-queue' && leadQueue && (
        <div className="space-y-6">
          {/* Statistike */}
          {leadQueue.stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-2xl font-bold text-yellow-600">{leadQueue.stats.pending}</div>
                <div className="text-sm text-gray-600">Čeka dodjelu</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-2xl font-bold text-blue-600">{leadQueue.stats.assigned}</div>
                <div className="text-sm text-gray-600">Dodijeljeno</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-2xl font-bold text-indigo-600">{leadQueue.stats.inProgress}</div>
                <div className="text-sm text-gray-600">U tijeku</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-2xl font-bold text-green-600">{leadQueue.stats.completed}</div>
                <div className="text-sm text-gray-600">Završeno</div>
              </div>
            </div>
          )}

          {/* Lista leadova */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Leadovi u Queueu</h2>
            {leadQueue.queue.length === 0 ? (
              <p className="text-gray-500">Nema leadova u queueu</p>
            ) : (
              <div className="space-y-4">
                {leadQueue.queue.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{entry.job.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{entry.job.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {entry.job.category.name}
                          </span>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            {entry.job.user.city}
                          </span>
                          {entry.job.budgetMax && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              Do {entry.job.budgetMax} €
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>Klijent: {entry.job.user.fullName} ({entry.job.user.email})</p>
                          <p>Pozicija u queueu: {entry.position}</p>
                          {entry.assignedTo && (
                            <p className="text-indigo-600">
                              Dodijeljeno: {entry.assignedTo.user.fullName} ({entry.assignedTo.user.email})
                            </p>
                          )}
                          {entry.assignmentType && (
                            <p className="text-xs text-gray-500">
                              Tip dodjele: {entry.assignmentType === 'MANUAL' ? 'Ručna' : 'Automatska'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          entry.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          entry.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                          entry.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-800' :
                          entry.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {entry.status === 'PENDING' ? 'Čeka dodjelu' :
                           entry.status === 'ASSIGNED' ? 'Dodijeljeno' :
                           entry.status === 'IN_PROGRESS' ? 'U tijeku' :
                           entry.status === 'COMPLETED' ? 'Završeno' :
                           'Odbijeno'}
                        </span>
                      </div>
                    </div>

                    {entry.status === 'PENDING' && team && team.teamMembers.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleAutoAssign(entry.id)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                          >
                            🤖 Auto-assign
                          </button>
                          <select
                            value={assignToMemberId}
                            onChange={(e) => {
                              setAssignToMemberId(e.target.value);
                              if (e.target.value) {
                                handleManualAssign(entry.id, e.target.value);
                                setAssignToMemberId('');
                              }
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Odaberi tim člana...</option>
                            {team.teamMembers.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.fullName} ({member.email})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              const reason = prompt('Razlog odbijanja:');
                              if (reason) {
                                handleDeclineLead(entry.id, reason);
                              }
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                          >
                            ❌ Odbij
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

