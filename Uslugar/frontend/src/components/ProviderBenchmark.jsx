// Provider Benchmark Component - Usporedba s drugim providerima
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import { getBenchmark } from '../api/exclusive';
import { useDarkMode } from '../contexts/DarkModeContext.jsx';

// Registriraj Chart.js komponente za benchmark grafove
ChartJS.register(
  RadialLinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ProviderBenchmark() {
  const { isDarkMode } = useDarkMode();
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBenchmark();
  }, []);

  const loadBenchmark = async () => {
    try {
      setLoading(true);
      const response = await getBenchmark();
      setBenchmarkData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri učitavanju benchmark podataka');
      console.error('Error loading benchmark:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">Učitavanje usporedbe...</p>
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

  if (!benchmarkData || !benchmarkData.hasData) {
    return (
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-blue-800 dark:text-blue-300 text-sm">{benchmarkData?.message || 'Nedostaju podaci za usporedbu'}</p>
      </div>
    );
  }

  const { providerStats, benchmarks, percentileRanks, tiers, overallPercentile, overallTier, comparison } = benchmarkData;

  const chartColors = {
    primary: isDarkMode ? '#60a5fa' : '#3b82f6',
    success: isDarkMode ? '#34d399' : '#10b981',
    warning: isDarkMode ? '#fbbf24' : '#f59e0b',
    danger: isDarkMode ? '#f87171' : '#ef4444',
    purple: isDarkMode ? '#a78bfa' : '#8b5cf6'
  };

  const getTierLabel = (tier) => {
    switch (tier) {
      case 'TOP_1': return 'Top 1%';
      case 'TOP_10': return 'Top 10%';
      case 'TOP_25': return 'Top 25%';
      case 'AVERAGE': return 'Prosjek';
      case 'BELOW_AVERAGE': return 'Ispod prosjeka';
      default: return tier;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'TOP_1': return 'text-green-600 dark:text-green-400';
      case 'TOP_10': return 'text-green-500 dark:text-green-500';
      case 'TOP_25': return 'text-blue-500 dark:text-blue-400';
      case 'AVERAGE': return 'text-yellow-600 dark:text-yellow-400';
      case 'BELOW_AVERAGE': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTierBgColor = (tier) => {
    switch (tier) {
      case 'TOP_1': return 'bg-green-100 dark:bg-green-900/30';
      case 'TOP_10': return 'bg-green-50 dark:bg-green-900/20';
      case 'TOP_25': return 'bg-blue-50 dark:bg-blue-900/20';
      case 'AVERAGE': return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'BELOW_AVERAGE': return 'bg-red-50 dark:bg-red-900/20';
      default: return 'bg-gray-50 dark:bg-gray-800';
    }
  };

  // Conversion Rate Comparison Chart
  const conversionChartData = {
    labels: ['Vaša vrijednost', 'Prosjek', 'Top 10% prosjek'],
    datasets: [{
      label: 'Stopa konverzije (%)',
      data: [
        comparison.conversionRate.yourValue,
        comparison.conversionRate.average,
        comparison.conversionRate.top10Avg
      ],
      backgroundColor: [
        chartColors.primary,
        chartColors.warning,
        chartColors.success
      ]
    }]
  };

  // ROI Comparison Chart
  const roiChartData = {
    labels: ['Vaš ROI', 'Prosjek', 'Top 10% prosjek'],
    datasets: [{
      label: 'ROI (%)',
      data: [
        comparison.roi.yourValue,
        comparison.roi.average,
        comparison.roi.top10Avg
      ],
      backgroundColor: [
        chartColors.primary,
        chartColors.warning,
        chartColors.success
      ]
    }]
  };

  // Radar Chart - Overall Performance
  const radarChartData = {
    labels: ['Konverzija', 'ROI', 'Prihod', 'Vrijednost leada'],
    datasets: [
      {
        label: 'Vaš performans',
        data: [
          percentileRanks.conversionRate,
          percentileRanks.roi,
          percentileRanks.totalRevenue,
          percentileRanks.avgLeadValue
        ],
        borderColor: chartColors.primary,
        backgroundColor: `${chartColors.primary}40`,
        borderWidth: 2
      },
      {
        label: 'Prosjek (50%)',
        data: [50, 50, 50, 50],
        borderColor: chartColors.warning,
        backgroundColor: `${chartColors.warning}20`,
        borderWidth: 1,
        borderDash: [5, 5]
      }
    ]
  };

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
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb'
        }
      },
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 25,
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb'
        },
        pointLabels: {
          color: isDarkMode ? '#e5e7eb' : '#374151'
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Performance Card */}
      <div className={`p-6 rounded-xl shadow-lg ${getTierBgColor(overallTier)} border-2 ${getTierColor(overallTier).replace('text-', 'border-')}`}>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Vaša ukupna pozicija</h3>
          <div className="text-5xl font-bold mb-2">
            <span className={getTierColor(overallTier)}>{overallPercentile.toFixed(1)}%</span>
          </div>
          <p className={`text-lg font-semibold ${getTierColor(overallTier)}`}>
            {getTierLabel(overallTier)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Usporedba s {benchmarks.totalProviders} providera na platformi
          </p>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Conversion Rate */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Stopa Konverzije</h4>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getTierBgColor(tiers.conversionRate)} ${getTierColor(tiers.conversionRate)}`}>
              {getTierLabel(tiers.conversionRate)}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {providerStats.conversionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {percentileRanks.conversionRate.toFixed(1)}. percentil
          </div>
          <div className="mt-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Prosjek:</span>
              <span className="font-semibold">{comparison.conversionRate.average.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* ROI */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">ROI</h4>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getTierBgColor(tiers.roi)} ${getTierColor(tiers.roi)}`}>
              {getTierLabel(tiers.roi)}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {providerStats.roi >= 0 ? '+' : ''}{providerStats.roi.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {percentileRanks.roi.toFixed(1)}. percentil
          </div>
          <div className="mt-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Prosjek:</span>
              <span className="font-semibold">{comparison.roi.average.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ukupan Prihod</h4>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getTierBgColor(tiers.totalRevenue)} ${getTierColor(tiers.totalRevenue)}`}>
              {getTierLabel(tiers.totalRevenue)}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {providerStats.totalRevenue.toLocaleString()} €
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {percentileRanks.totalRevenue.toFixed(1)}. percentil
          </div>
          <div className="mt-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Prosjek:</span>
              <span className="font-semibold">{comparison.totalRevenue.average.toFixed(0)} €</span>
            </div>
          </div>
        </div>

        {/* Avg Lead Value */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Prosječna Vrijednost</h4>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getTierBgColor(tiers.avgLeadValue)} ${getTierColor(tiers.avgLeadValue)}`}>
              {getTierLabel(tiers.avgLeadValue)}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {providerStats.avgLeadValue.toFixed(0)} €
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {percentileRanks.avgLeadValue.toFixed(1)}. percentil
          </div>
          <div className="mt-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Prosjek:</span>
              <span className="font-semibold">{comparison.avgLeadValue.average.toFixed(0)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Rate Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stopa Konverzije - Usporedba</h3>
          <div className="h-64">
            <Bar data={conversionChartData} options={chartOptions} />
          </div>
        </div>

        {/* ROI Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ROI - Usporedba</h3>
          <div className="h-64">
            <Bar data={roiChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Radar Chart - Overall Performance */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performans profil (percentil rank)</h3>
        <div className="h-96">
          <Radar data={radarChartData} options={chartOptions} />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          Vrijednosti prikazuju vašu poziciju u odnosu na sve providere (0% = najniže, 100% = najviše)
        </p>
      </div>

      {/* Percentile Distribution Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Kako čitati percentile?</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <p className="font-semibold mb-1">Top 1%</p>
            <p>Najbolji {Math.floor(benchmarks.totalProviders * 0.01)} provider na platformi</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Top 10%</p>
            <p>Najbolji {Math.floor(benchmarks.totalProviders * 0.1)} providera na platformi</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Top 25%</p>
            <p>Bolji od {Math.floor(benchmarks.totalProviders * 0.75)} providera</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Prosjek (50%)</p>
            <p>Bolji od pola svih providera na platformi</p>
          </div>
        </div>
      </div>
    </div>
  );
}

