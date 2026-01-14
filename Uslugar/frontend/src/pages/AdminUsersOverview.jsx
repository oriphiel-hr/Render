import React, { useState, useEffect } from 'react';
import api from '../api';

export default function AdminUsersOverview() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    verificationStatus: '',
    licenseStatus: '',
    subscriptionPlan: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users-overview');
      setUsers(response.data.users);
      setStats(response.data.stats);
      setError(null);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err.response?.data?.error || 'Greška pri učitavanju korisnika');
    } finally {
      setLoading(false);
    }
  };

  const getVerificationBadge = (verified) => {
    if (verified) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">✓ Verificirano</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">✗ Nije verificirano</span>;
  };

  const getLicenseBadge = (status) => {
    const badges = {
      'Sve licence OK': 'bg-green-100 text-green-800',
      'Nedostaju licence': 'bg-yellow-100 text-yellow-800',
      'Čeka verifikaciju': 'bg-blue-100 text-blue-800',
      'Nema licence': 'bg-red-100 text-red-800',
      'Nije potrebno': 'bg-gray-100 text-gray-800'
    };
    const className = badges[status] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>{status}</span>;
  };

  const getSubscriptionBadge = (plan, status) => {
    if (!plan) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Nema pretplate</span>;
    }
    if (plan === 'TRIAL') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">TRIAL</span>;
    }
    const colors = {
      'BASIC': 'bg-blue-100 text-blue-800',
      'PREMIUM': 'bg-purple-100 text-purple-800',
      'PRO': 'bg-indigo-100 text-indigo-800'
    };
    const className = colors[plan] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>{plan}</span>;
  };

  const getRoleBadge = (role) => {
    const badges = {
      'USER': 'bg-gray-100 text-gray-800',
      'PROVIDER': 'bg-blue-100 text-blue-800',
      'ADMIN': 'bg-red-100 text-red-800'
    };
    const className = badges[role] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>{role}</span>;
  };

  // Filtriraj korisnike
  const filteredUsers = users.filter(user => {
    if (filters.role && user.role !== filters.role) return false;
    if (filters.verificationStatus) {
      if (filters.verificationStatus === 'verified' && !user.companyVerified) return false;
      if (filters.verificationStatus === 'not-verified' && user.companyVerified) return false;
    }
    if (filters.licenseStatus && !user.licenseStatus.includes(filters.licenseStatus)) return false;
    if (filters.subscriptionPlan && user.subscriptionPlan !== filters.subscriptionPlan) return false;
    return true;
  });

  // Sortiraj korisnike
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'createdAt') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Učitavanje korisnika...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pregled Korisnika</h1>
        <p className="text-gray-600">Detaljni pregled svih korisnika s informacijama o pravnom statusu, verifikaciji, licencama i pretplati</p>
      </div>

      {/* Statistike */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Ukupno korisnika</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.providers}</div>
            <div className="text-sm text-gray-600">Pružatelji</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.businessUsers}</div>
            <div className="text-sm text-gray-600">Poslovni korisnici</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            <div className="text-sm text-gray-600">Verificirani</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-indigo-600">{stats.withLicenses}</div>
            <div className="text-sm text-gray-600">S licencama</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.withSubscription}</div>
            <div className="text-sm text-gray-600">S pretplatom</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.trial}</div>
            <div className="text-sm text-gray-600">TRIAL</div>
          </div>
        </div>
      )}

      {/* Filteri */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Uloga</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Sve uloge</option>
              <option value="USER">Korisnik</option>
              <option value="PROVIDER">Pružatelj</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verifikacija</label>
            <select
              value={filters.verificationStatus}
              onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Svi statusi</option>
              <option value="verified">Verificirani</option>
              <option value="not-verified">Nije verificirano</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Licence</label>
            <select
              value={filters.licenseStatus}
              onChange={(e) => setFilters({ ...filters, licenseStatus: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Svi statusi</option>
              <option value="OK">Sve licence OK</option>
              <option value="Nedostaju">Nedostaju licence</option>
              <option value="Čeka">Čeka verifikaciju</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pretplata</label>
            <select
              value={filters.subscriptionPlan}
              onChange={(e) => setFilters({ ...filters, subscriptionPlan: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Svi planovi</option>
              <option value="TRIAL">TRIAL</option>
              <option value="BASIC">BASIC</option>
              <option value="PREMIUM">PREMIUM</option>
              <option value="PRO">PRO</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tablica */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('fullName')}
                >
                  Ime {sortBy === 'fullName' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uloga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pravni status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tvrtka
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verifikacija
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Licence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pretplata
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  Registriran {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-xs text-gray-500">{user.userType}</div>
                    {user.userRoleDetail && (
                      <div className="text-xs text-blue-600 font-medium">{user.userRoleDetail}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    {user.phoneVerified && (
                      <div className="text-xs text-green-600">✓ Telefon verificiran</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.legalStatus}</div>
                    {user.taxId && (
                      <div className="text-xs text-gray-500">OIB: {user.taxId}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.companyName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getVerificationBadge(user.companyVerified)}
                    {user.verificationStatus !== 'N/A' && (
                      <div className="text-xs text-gray-500 mt-1">{user.verificationStatus}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getLicenseBadge(user.licenseStatus)}
                    {user.licensesCount > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {user.verifiedLicensesCount}/{user.licensesCount} verificirano
                        {user.categoriesRequiringLicense > 0 && (
                          <span className="ml-1">({user.categoriesRequiringLicense} kategorija zahtijeva)</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSubscriptionBadge(user.subscriptionPlan, user.subscriptionStatus)}
                    {user.subscriptionExpiresAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Istječe: {new Date(user.subscriptionExpiresAt).toLocaleDateString('hr-HR')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('hr-HR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nema korisnika koji odgovaraju filterima
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Prikazano: {sortedUsers.length} od {users.length} korisnika
      </div>
    </div>
  );
}

