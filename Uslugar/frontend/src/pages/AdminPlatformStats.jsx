// Admin Platform Statistics - Statistike platforme
import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../api';
import { useDarkMode } from '../contexts/DarkModeContext.jsx';

export default function AdminPlatformStats() {
  const { isDarkMode } = useDarkMode();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
    loadTrends();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/platform-stats');
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri učitavanju statistika');
      console.error('Error loading platform stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTrends = async () => {
    try {
      const response = await api.get('/admin/platform-trends?months=12');
      setTrends(response.data);
    } catch (err) {
      console.error('Error loading trends:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Učitavanje statistika platforme...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-blue-800 dark:text-blue-300">Nema dostupnih podataka</p>
      </div>
    );
  }

  const chartColors = {
    primary: isDarkMode ? '#60a5fa' : '#3b82f6',
    success: isDarkMode ? '#34d399' : '#10b981',
    warning: isDarkMode ? '#fbbf24' : '#f59e0b',
    danger: isDarkMode ? '#f87171' : '#ef4444',
    purple: isDarkMode ? '#a78bfa' : '#8b5cf6',
    gray: isDarkMode ? '#6b7280' : '#9ca3af'
  };

  // Charts data
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        titleColor: isDarkMode ? '#e5e7eb' : '#374151',
        bodyColor: isDarkMode ? '#e5e7eb' : '#374151',
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb'
        }
      },
      x: {
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb'
        }
      }
    }
  };

  // Monthly trends chart
  const monthlyTrendsData = trends ? {
    labels: trends.map(t => t.monthName.substring(0, 7)),
    datasets: [
      {
        label: 'Novi korisnici',
        data: trends.map(t => t.newUsers),
        borderColor: chartColors.primary,
        backgroundColor: `${chartColors.primary}40`,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Novi providere',
        data: trends.map(t => t.newProviders),
        borderColor: chartColors.success,
        backgroundColor: `${chartColors.success}40`,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Novi poslovi',
        data: trends.map(t => t.newJobs),
        borderColor: chartColors.warning,
        backgroundColor: `${chartColors.warning}40`,
        fill: true,
        tension: 0.4
      }
    ]
  } : null;

  // Revenue trend
  const revenueTrendData = trends ? {
    labels: trends.map(t => t.monthName.substring(0, 7)),
    datasets: [{
      label: 'Prihod (EUR)',
      data: trends.map(t => t.revenue),
      borderColor: chartColors.success,
      backgroundColor: `${chartColors.success}40`,
      fill: true,
      tension: 0.4
    }]
  } : null;

  // Lead purchases trend
  const leadsTrendData = trends ? {
    labels: trends.map(t => t.monthName.substring(0, 7)),
    datasets: [
      {
        label: 'Kupljeno leadova',
        data: trends.map(t => t.leadPurchases),
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primary
      },
      {
        label: 'Konvertirano',
        data: trends.map(t => t.convertedLeads),
        borderColor: chartColors.success,
        backgroundColor: chartColors.success
      }
    ]
  } : null;

  // Jobs by category
  const jobsByCategoryData = stats.jobs.byCategory.length > 0 ? {
    labels: stats.jobs.byCategory.map(c => c.categoryName),
    datasets: [{
      label: 'Broj poslova',
      data: stats.jobs.byCategory.map(c => c.count),
      backgroundColor: [
        chartColors.primary,
        chartColors.success,
        chartColors.warning,
        chartColors.purple,
        chartColors.danger,
        chartColors.gray,
        '#10b981',
        '#3b82f6',
        '#f59e0b',
        '#8b5cf6'
      ]
    }]
  } : null;

  // Subscription plans
  const subscriptionsByPlanData = {
    labels: Object.keys(stats.subscriptions.byPlan),
    datasets: [{
      label: 'Broj pretplata',
      data: Object.values(stats.subscriptions.byPlan),
      backgroundColor: [
        chartColors.primary,
        chartColors.success,
        chartColors.warning,
        chartColors.purple
      ]
    }]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Statistike platforme</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sveobuhvatan pregled performansi platforme
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ukupno korisnika</h3>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.users.total + stats.users.providers}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {stats.users.total} korisnika + {stats.users.providers} providera
          </div>
        </div>

        {/* Total Jobs */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ukupno poslova</h3>
            <span className="text-2xl">📋</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.jobs.total}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {stats.jobs.exclusive} ekskluzivnih
          </div>
        </div>

        {/* Total Leads */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Kupljeno leadova</h3>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.leads.totalPurchased}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {stats.leads.converted} konvertirano ({stats.leads.conversionRate}%)
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ukupan prihod</h3>
            <span className="text-2xl">💵</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.leads.estimatedTotalRevenue.toLocaleString()} €
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Od konvertiranih leadova
          </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Subscriptions */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Aktivne pretplate</h4>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.subscriptions.active}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            od {stats.subscriptions.total} ukupno
          </div>
        </div>

        {/* Active Providers */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Aktivni providere</h4>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.users.activeProviders}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            od {stats.users.providers} ukupno
          </div>
        </div>

        {/* Credits Balance */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preostali krediti</h4>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.credits.totalBalance}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.credits.totalSpent} potrošeno
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Prosječna ocjena</h4>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.reviews.averageRating.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.reviews.total} recenzija
          </div>
        </div>
      </div>

      {/* Charts */}
      {trends && monthlyTrendsData && (
        <>
          {/* Monthly Trends Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Mjesečni trendovi - Korisnici i poslovi
            </h3>
            <div className="h-80">
              <Line data={monthlyTrendsData} options={chartOptions} />
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Trend prihoda po mjesecima
            </h3>
            <div className="h-80">
              <Line data={revenueTrendData} options={chartOptions} />
            </div>
          </div>

          {/* Leads Trend */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Kupljeni i konvertirani leadovi
            </h3>
            <div className="h-80">
              <Bar data={leadsTrendData} options={chartOptions} />
            </div>
          </div>
        </>
      )}

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs by Category */}
        {jobsByCategoryData && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Poslovi po kategorijama (Top 10)
            </h3>
            <div className="h-80">
              <Bar data={jobsByCategoryData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Subscriptions by Plan */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pretplate po planovima
          </h3>
          <div className="h-80">
            <Doughnut 
              data={subscriptionsByPlanData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: isDarkMode ? '#e5e7eb' : '#374151',
                      usePointStyle: true
                    }
                  },
                  tooltip: {
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    titleColor: isDarkMode ? '#e5e7eb' : '#374151',
                    bodyColor: isDarkMode ? '#e5e7eb' : '#374151',
                    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                    borderWidth: 1
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Detailed Statistics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status poslova</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">Otvoreni</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full font-semibold">
                {stats.jobs.open}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">U tijeku</span>
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full font-semibold">
                {stats.jobs.inProgress}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">Završeni</span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full font-semibold">
                {stats.jobs.completed}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700 dark:text-gray-300">Ekskluzivni</span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full font-semibold">
                {stats.jobs.exclusive}
              </span>
            </div>
          </div>
        </div>

        {/* Leads Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status leadova</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">Aktivni</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full font-semibold">
                {stats.leads.active}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">Konvertirani</span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full font-semibold">
                {stats.leads.converted}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">Stopa konverzije</span>
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full font-semibold">
                {stats.leads.conversionRate}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700 dark:text-gray-300">Refundirani</span>
              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full font-semibold">
                {stats.leads.refunded}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💰 Financijski sažetak</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ukupan procijenjeni prihod</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.leads.estimatedTotalRevenue.toLocaleString()} €
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Prihod od faktura</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.invoices.revenue.toLocaleString()} €
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Prosječna vrijednost leada</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.leads.converted > 0 
                ? (stats.leads.estimatedTotalRevenue / stats.leads.converted).toFixed(0)
                : 0} €
            </p>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Metrike angažmana</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Chat sobe</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.engagement.totalChatRooms}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Chat poruke</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.engagement.totalChatMessages}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Prosječno poruka/soba</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.engagement.avgMessagesPerRoom}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Verificirani providere</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {stats.verification.verifiedProviders} ({stats.verification.providerVerificationRate}%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

