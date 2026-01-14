// USLUGAR EXCLUSIVE - ROI Dashboard s grafičkim prikazom
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { getROIDashboard, getMonthlyStats, getYearlyReport } from '../api/exclusive';
import { useDarkMode } from '../contexts/DarkModeContext.jsx';
import ProviderBenchmark from '../components/ProviderBenchmark.jsx';
import PerformanceForecast from '../components/PerformanceForecast.jsx';

// Registriraj Chart.js komponente
ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ROIDashboard() {
  const { isDarkMode } = useDarkMode();
  const [dashboard, setDashboard] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [yearlyReport, setYearlyReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadDashboard();
    loadMonthlyStats();
    loadYearlyReport(selectedYear);
  }, [selectedYear]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await getROIDashboard();
      setDashboard(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri učitavanju dashboard-a');
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyStats = async () => {
    try {
      const now = new Date();
      const response = await getMonthlyStats(now.getFullYear(), now.getMonth() + 1);
      setMonthlyStats(response.data);
    } catch (err) {
      console.error('Error loading monthly stats:', err);
    }
  };

  const loadYearlyReport = async (year) => {
    try {
      const response = await getYearlyReport(year);
      setYearlyReport(response.data);
    } catch (err) {
      console.error('Error loading yearly report:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Učitavanje ROI statistike...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const roi = dashboard.roi;
  const subscription = dashboard.subscription;
  const insights = dashboard.insights || [];

  // Pripremi podatke za grafove
  const chartColors = {
    primary: isDarkMode ? '#60a5fa' : '#3b82f6',
    success: isDarkMode ? '#34d399' : '#10b981',
    warning: isDarkMode ? '#fbbf24' : '#f59e0b',
    danger: isDarkMode ? '#f87171' : '#ef4444',
    purple: isDarkMode ? '#a78bfa' : '#8b5cf6',
    gray: isDarkMode ? '#6b7280' : '#9ca3af'
  };

  // Status Breakdown Doughnut Chart
  const statusBreakdownData = {
    labels: ['Konvertirani', 'Kontaktirani', 'Aktivni', 'Refundirani'],
    datasets: [{
      data: [
        dashboard.statusBreakdown?.CONVERTED || 0,
        dashboard.statusBreakdown?.CONTACTED || 0,
        dashboard.statusBreakdown?.ACTIVE || 0,
        dashboard.statusBreakdown?.REFUNDED || 0
      ],
      backgroundColor: [
        chartColors.success,
        chartColors.warning,
        chartColors.primary,
        chartColors.danger
      ],
      borderWidth: 2,
      borderColor: isDarkMode ? '#1f2937' : '#ffffff'
    }]
  };

  // Mjesečni prihod i ROI trend (ako postoje podaci)
  const monthlyRevenueData = yearlyReport?.monthlyBreakdown ? {
    labels: yearlyReport.monthlyBreakdown.map(m => m.monthName.substring(0, 3)),
    datasets: [
      {
        label: 'Prihod (EUR)',
        data: yearlyReport.monthlyBreakdown.map(m => m.stats.estimatedRevenue),
        borderColor: chartColors.success,
        backgroundColor: `${chartColors.success}40`,
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'ROI (%)',
        data: yearlyReport.monthlyBreakdown.map(m => m.stats.roi),
        borderColor: chartColors.primary,
        backgroundColor: `${chartColors.primary}40`,
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  } : null;

  // Leadovi po mjesecima
  const monthlyLeadsData = yearlyReport?.monthlyBreakdown ? {
    labels: yearlyReport.monthlyBreakdown.map(m => m.monthName.substring(0, 3)),
    datasets: [
      {
        label: 'Kupljeno',
        data: yearlyReport.monthlyBreakdown.map(m => m.stats.totalPurchased),
        backgroundColor: chartColors.primary
      },
      {
        label: 'Kontaktirano',
        data: yearlyReport.monthlyBreakdown.map(m => m.stats.totalContacted),
        backgroundColor: chartColors.warning
      },
      {
        label: 'Konvertirano',
        data: yearlyReport.monthlyBreakdown.map(m => m.stats.totalConverted),
        backgroundColor: chartColors.success
      }
    ]
  } : null;

  // Kategorije prihod
  const categoryRevenueData = yearlyReport?.categoryStats && yearlyReport.categoryStats.length > 0 ? {
    labels: yearlyReport.categoryStats.slice(0, 8).map(c => c.category),
    datasets: [{
      label: 'Prihod po kategorijama (EUR)',
      data: yearlyReport.categoryStats.slice(0, 8).map(c => c.totalRevenue),
      backgroundColor: [
        chartColors.primary,
        chartColors.success,
        chartColors.warning,
        chartColors.purple,
        chartColors.danger,
        chartColors.gray,
        '#10b981',
        '#3b82f6'
      ]
    }]
  } : null;

  // Konverzija po mjesecima
  const conversionRateData = yearlyReport?.monthlyBreakdown ? {
    labels: yearlyReport.monthlyBreakdown.map(m => m.monthName.substring(0, 3)),
    datasets: [{
      label: 'Stopa konverzije (%)',
      data: yearlyReport.monthlyBreakdown.map(m => m.stats.conversionRate),
      borderColor: chartColors.success,
      backgroundColor: `${chartColors.success}40`,
      fill: true,
      tension: 0.4
    }]
  } : null;

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
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        },
        grid: {
          drawOnChartArea: false
        }
      },
      x: {
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
          usePointStyle: true,
          padding: 15
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
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ROI Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Statistika profitabilnosti vaših ekskluzivnih leadova</p>
      </div>

      {/* Year Selector */}
      {yearlyReport && (
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Godina:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      )}

      {/* Insights (AI preporuke) */}
      {insights.length > 0 && (
        <div className="mb-8 space-y-3">
          {insights.map((insight, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300' :
                insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-300' :
                insight.type === 'alert' ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300' :
                'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-300'
              }`}
            >
              <p className="text-sm font-medium">{insight.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Purchased */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ukupno Kupljeno</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{roi.totalLeadsPurchased}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">leadova</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Stopa Konverzije</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{roi.conversionRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{roi.totalLeadsConverted} od {roi.totalLeadsPurchased}</p>
        </div>

        {/* ROI */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">ROI (Povrat)</p>
          <p className={`text-3xl font-bold ${roi.roi >= 100 ? 'text-green-600 dark:text-green-400' : roi.roi >= 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
            {roi.roi >= 0 ? '+' : ''}{roi.roi.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{roi.totalRevenue.toLocaleString()} EUR prihod</p>
        </div>

        {/* Avg Lead Value */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Prosječna Vrijednost</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{roi.avgLeadValue.toFixed(0)} €</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">po konvertiranom leadu</p>
        </div>
      </div>

      {/* Grafički prikaz statistika */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Breakdown - Doughnut Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Leadova</h3>
          <div className="h-64">
            <Doughnut data={statusBreakdownData} options={doughnutOptions} />
          </div>
        </div>

        {/* Subscription Info */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Vaša Pretplata</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-bold">{subscription.plan}</span>
            </div>
            <div className="flex justify-between">
              <span>Preostali krediti:</span>
              <span className="font-bold text-2xl">{subscription.creditsBalance}</span>
            </div>
            <div className="flex justify-between">
              <span>Ukupno potrošeno:</span>
              <span>{subscription.lifetimeCreditsUsed}</span>
            </div>
            <div className="flex justify-between">
              <span>Ukupno konvertirano:</span>
              <span>{subscription.lifetimeLeadsConverted}</span>
            </div>
          </div>
          <button
            onClick={() => window.location.hash = '#subscription'}
            className="mt-4 w-full bg-white text-green-600 font-semibold py-2 px-4 rounded-lg hover:bg-green-50"
          >
            Nadogradi Plan
          </button>
        </div>
      </div>

      {/* Trend grafovi - ako postoje podaci */}
      {yearlyReport && yearlyReport.monthlyBreakdown && yearlyReport.monthlyBreakdown.length > 0 && (
        <>
          {/* Prihod i ROI kroz mjesece */}
          {monthlyRevenueData && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Prihod i ROI kroz {selectedYear}. godinu
              </h3>
              <div className="h-80">
                <Line data={monthlyRevenueData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Leadovi po mjesecima */}
          {monthlyLeadsData && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Leadovi po mjesecima ({selectedYear})
              </h3>
              <div className="h-80">
                <Bar data={monthlyLeadsData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Stopa konverzije */}
          {conversionRateData && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Stopa konverzije kroz {selectedYear}. godinu
              </h3>
              <div className="h-80">
                <Line data={conversionRateData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Prihod po kategorijama */}
          {categoryRevenueData && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Prihod po kategorijama ({selectedYear})
              </h3>
              <div className="h-80">
                <Bar data={categoryRevenueData} options={chartOptions} />
              </div>
            </div>
          )}
        </>
      )}

      {/* Recent Leads */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nedavni Leadovi</h3>
        {dashboard.recentLeads && dashboard.recentLeads.length > 0 ? (
          <div className="space-y-3">
            {dashboard.recentLeads.map((purchase) => (
              <div key={purchase.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{purchase.job.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{purchase.job.category.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {new Date(purchase.createdAt).toLocaleDateString('hr-HR')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    purchase.status === 'CONVERTED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    purchase.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    purchase.status === 'REFUNDED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {purchase.status}
                  </span>
                  {purchase.job.budgetMax && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">do {purchase.job.budgetMax}€</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Još nema kupljenih leadova</p>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📊 Kako čitati ROI?</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <p className="font-semibold mb-1">Conversion Rate (Stopa konverzije)</p>
            <p>Postotak kupljenih leadova koji su realizirani u posao.</p>
            <p className="text-green-600 dark:text-green-400 mt-1">✅ Dobar: 40%+</p>
          </div>
          <div>
            <p className="font-semibold mb-1">ROI (Return on Investment)</p>
            <p>Povrat ulaganja - koliko ste zaradili u odnosu na potrošene kredite.</p>
            <p className="text-green-600 dark:text-green-400 mt-1">✅ Dobar: 150%+</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Avg Lead Value</p>
            <p>Prosječna zarada po konvertiranom leadu.</p>
            <p className="text-green-600 dark:text-green-400 mt-1">✅ Cilj: 500€+</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Credits Balance</p>
            <p>Broj preostalih kredita za kupovinu novih leadova.</p>
            <p className="text-yellow-600 dark:text-yellow-400 mt-1">⚠️ Nadopunite ako je &lt;5</p>
          </div>
        </div>
      </div>

      {/* Provider Benchmark Section */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🏆 Usporedba s drugim providerima</h2>
        <ProviderBenchmark />
      </div>

      {/* Performance Forecast Section */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🔮 Predviđanje budućih performansi</h2>
        <PerformanceForecast months={3} />
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 justify-center flex-wrap">
        <button
          onClick={() => window.location.hash = '#leads'}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
        >
          🛒 Pregledaj Leadove
        </button>
        <button
          onClick={() => window.location.hash = '#my-leads'}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          📋 Moji Leadovi
        </button>
        <button
          onClick={loadDashboard}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
        >
          🔄 Osvježi
        </button>
      </div>
    </div>
  );
}
