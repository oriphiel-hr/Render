// Performance Forecast Component - Predviđanje budućih performansi
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { getForecast } from '../api/exclusive';
import { useDarkMode } from '../contexts/DarkModeContext.jsx';

export default function PerformanceForecast({ months = 3 }) {
  const { isDarkMode } = useDarkMode();
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadForecast();
  }, [months]);

  const loadForecast = async () => {
    try {
      setLoading(true);
      const response = await getForecast(months);
      setForecastData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri učitavanju predviđanja');
      console.error('Error loading forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">Analiziranje podataka za predviđanje...</p>
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

  if (!forecastData || !forecastData.hasEnoughData) {
    return (
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-blue-800 dark:text-blue-300 text-sm">
          {forecastData?.message || 'Nedostaju podaci za predviđanje'}
        </p>
        {forecastData?.historicalData && (
          <p className="text-blue-600 dark:text-blue-400 text-xs mt-2">
            Trenutno imate podatke za {forecastData.historicalData} mjesec/mjeseca. Potrebno je barem 2 mjeseca.
          </p>
        )}
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

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'up': return 'text-green-600 dark:text-green-400';
      case 'down': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Pripremi podatke za grafove
  const historicalLabels = forecastData.historicalData.map(d => 
    `${new Date(d.year, d.month - 1, 1).toLocaleDateString('hr-HR', { month: 'short' })} ${d.year}`
  );
  const forecastLabels = forecastData.forecasts.map(f => f.monthName.substring(0, 7));
  const allLabels = [...historicalLabels, ...forecastLabels];

  // Purchased Leads Chart
  const purchasedChartData = {
    labels: allLabels,
    datasets: [
      {
        label: 'Povijest',
        data: [
          ...forecastData.historicalData.map(d => d.purchased),
          ...new Array(forecastData.forecasts.length).fill(null)
        ],
        borderColor: chartColors.primary,
        backgroundColor: `${chartColors.primary}40`,
        borderWidth: 2,
        fill: false,
        pointRadius: 4
      },
      {
        label: 'Predviđanje',
        data: [
          ...new Array(forecastData.historicalData.length).fill(null),
          ...forecastData.forecasts.map(f => f.purchased)
        ],
        borderColor: chartColors.success,
        backgroundColor: `${chartColors.success}40`,
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 4
      }
    ]
  };

  // Revenue Chart
  const revenueChartData = {
    labels: allLabels,
    datasets: [
      {
        label: 'Povijest (EUR)',
        data: [
          ...forecastData.historicalData.map(d => d.revenue),
          ...new Array(forecastData.forecasts.length).fill(null)
        ],
        borderColor: chartColors.success,
        backgroundColor: `${chartColors.success}40`,
        borderWidth: 2,
        fill: false,
        pointRadius: 4
      },
      {
        label: 'Predviđanje (EUR)',
        data: [
          ...new Array(forecastData.historicalData.length).fill(null),
          ...forecastData.forecasts.map(f => f.revenue)
        ],
        borderColor: chartColors.purple,
        backgroundColor: `${chartColors.purple}40`,
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 4
      }
    ]
  };

  // Conversion Rate Chart
  const conversionChartData = {
    labels: allLabels,
    datasets: [
      {
        label: 'Povijest (%)',
        data: [
          ...forecastData.historicalData.map(d => d.conversionRate),
          ...new Array(forecastData.forecasts.length).fill(null)
        ],
        borderColor: chartColors.warning,
        backgroundColor: `${chartColors.warning}40`,
        borderWidth: 2,
        fill: false,
        pointRadius: 4
      },
      {
        label: 'Predviđanje (%)',
        data: [
          ...new Array(forecastData.historicalData.length).fill(null),
          ...forecastData.forecasts.map(f => f.conversionRate)
        ],
        borderColor: chartColors.danger,
        backgroundColor: `${chartColors.danger}40`,
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 4
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

  return (
    <div className="space-y-6">
      {/* Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Predviđeno kupljeno</h4>
            <span className={`text-lg ${getTrendColor(forecastData.trends.purchased.direction)}`}>
              {getTrendIcon(forecastData.trends.purchased.direction)}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {forecastData.totals.purchased}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            u {forecastData.forecasts.length} mjesec/mjeseci
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Predviđen prihod</h4>
            <span className={`text-lg ${getTrendColor(forecastData.trends.revenue.direction)}`}>
              {getTrendIcon(forecastData.trends.revenue.direction)}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {forecastData.totals.revenue.toLocaleString()} €
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Prosječno: {(forecastData.totals.revenue / forecastData.forecasts.length).toFixed(0)} €/mjesec
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Predviđena konverzija</h4>
            <span className={`text-lg ${getTrendColor(forecastData.trends.conversionRate.direction)}`}>
              {getTrendIcon(forecastData.trends.conversionRate.direction)}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {forecastData.totals.conversionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {forecastData.totals.converted} konvertirano
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Predviđeni ROI</h4>
            <span className={`text-lg ${getTrendColor(forecastData.trends.roi.direction)}`}>
              {getTrendIcon(forecastData.trends.roi.direction)}
            </span>
          </div>
          <div className={`text-2xl font-bold ${forecastData.totals.roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {forecastData.totals.roi >= 0 ? '+' : ''}{forecastData.totals.roi.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Investicija: {forecastData.totals.costEUR} €
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchased Leads Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Kupljeni Leadovi - Predviđanje
          </h3>
          <div className="h-64">
            <Line data={purchasedChartData} options={chartOptions} />
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Prihod - Predviđanje
          </h3>
          <div className="h-64">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Conversion Rate Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Stopa Konverzije - Predviđanje
        </h3>
        <div className="h-64">
          <Line data={conversionChartData} options={chartOptions} />
        </div>
      </div>

      {/* Forecast Details Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Detalji predviđanja
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Mjesec</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Kupljeno</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Konvertirano</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Prihod (EUR)</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Konverzija (%)</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">ROI (%)</th>
              </tr>
            </thead>
            <tbody>
              {forecastData.forecasts.map((forecast, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{forecast.monthName}</td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{forecast.purchased}</td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{forecast.converted}</td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{forecast.revenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{forecast.conversionRate.toFixed(1)}%</td>
                  <td className={`py-3 px-4 text-right font-semibold ${forecast.roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {forecast.roi >= 0 ? '+' : ''}{forecast.roi.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                <td className="py-3 px-4 text-gray-900 dark:text-white">Ukupno</td>
                <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{forecastData.totals.purchased}</td>
                <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{forecastData.totals.converted}</td>
                <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{forecastData.totals.revenue.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{forecastData.totals.conversionRate.toFixed(1)}%</td>
                <td className={`py-3 px-4 text-right ${forecastData.totals.roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {forecastData.totals.roi >= 0 ? '+' : ''}{forecastData.totals.roi.toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Analiza trenda</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold mb-2 text-gray-900 dark:text-white">Kupljeni Leadovi</p>
            <p className="text-gray-700 dark:text-gray-300">
              Trend: <span className={getTrendColor(forecastData.trends.purchased.direction)}>
                {forecastData.trends.purchased.direction === 'up' ? 'Rast' : forecastData.trends.purchased.direction === 'down' ? 'Pad' : 'Stabilan'}
              </span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
              Prosječna stopa rasta: {(forecastData.trends.purchased.growthRate * 100).toFixed(1)}% po mjesecu
            </p>
          </div>
          <div>
            <p className="font-semibold mb-2 text-gray-900 dark:text-white">Prihod</p>
            <p className="text-gray-700 dark:text-gray-300">
              Trend: <span className={getTrendColor(forecastData.trends.revenue.direction)}>
                {forecastData.trends.revenue.direction === 'up' ? 'Rast' : forecastData.trends.revenue.direction === 'down' ? 'Pad' : 'Stabilan'}
              </span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
              Prosječna stopa rasta: {(forecastData.trends.revenue.growthRate * 100).toFixed(1)}% po mjesecu
            </p>
          </div>
          <div>
            <p className="font-semibold mb-2 text-gray-900 dark:text-white">Stopa Konverzije</p>
            <p className="text-gray-700 dark:text-gray-300">
              Trend: <span className={getTrendColor(forecastData.trends.conversionRate.direction)}>
                {forecastData.trends.conversionRate.direction === 'up' ? 'Poboljšanje' : forecastData.trends.conversionRate.direction === 'down' ? 'Pogoršanje' : 'Stabilan'}
              </span>
            </p>
          </div>
          <div>
            <p className="font-semibold mb-2 text-gray-900 dark:text-white">ROI</p>
            <p className="text-gray-700 dark:text-gray-300">
              Trend: <span className={getTrendColor(forecastData.trends.roi.direction)}>
                {forecastData.trends.roi.direction === 'up' ? 'Poboljšanje' : forecastData.trends.roi.direction === 'down' ? 'Pogoršanje' : 'Stabilan'}
              </span>
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            💡 <strong>Napomena:</strong> Predviđanja su temeljena na statističkim modelima (linear regression i exponential smoothing) 
            analizirajući vašu povijest. Rezultati se mogu razlikovati ovisno o promjenama u vašem pristupu kupnji leadova.
          </p>
        </div>
      </div>
    </div>
  );
}

