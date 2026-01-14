// USLUGAR EXCLUSIVE - Subscription Plans Page
import React, { useState, useEffect } from 'react';
import { getSubscriptionPlans, getMySubscription, getCreditHistory, exportCreditsHistoryCSV } from '../api/exclusive';
import api from '../api';
import Toast from '../components/Toast';

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState({});
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });

  useEffect(() => {
    loadData();
    
    // Check if payment was successful and refresh data
    const paymentSuccessful = localStorage.getItem('payment_successful');
    if (paymentSuccessful === 'true') {
      localStorage.removeItem('payment_successful');
      // Force reload to get fresh subscription data
      setTimeout(() => {
        loadData();
      }, 1000);
    }
    
    // Check for trial_expired query parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const trialExpired = urlParams.get('trial_expired');
    if (trialExpired === 'true') {
      // Show special message for trial expired users
      showToast('🎁 Specijalna ponuda: 20% popust na prvu pretplatu!', 'success');
      // Store flag for checkout
      sessionStorage.setItem('trial_expired_discount', 'true');
    }
    
    // Listen for hash changes to refresh data after payment success
    const hashChangeHandler = () => {
      if (window.location.hash === '#subscription') {
        // Refresh subscription data when returning from payment success
        loadData();
      }
    };
    
    window.addEventListener('hashchange', hashChangeHandler);
    
    return () => {
      window.removeEventListener('hashchange', hashChangeHandler);
    };
  }, []);

  const loadData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        getSubscriptionPlans(),
        getMySubscription()
      ]);
      
      console.log('Plans response:', plansRes.data);
      
      // Convert array to object keyed by plan name
      // API returns plans with 'name' field (BASIC, PREMIUM, PRO) from database
      const plansObj = {};
      plansRes.data.forEach(plan => {
        // Use 'name' field (BASIC, PREMIUM, PRO) as key, not displayName
        const key = plan.name; // This is the plan code (BASIC, PREMIUM, PRO)
        plansObj[key] = plan;
        
        // Log discount info for debugging
        if (plan.newUserDiscount) {
          console.log(`Plan ${key} has new user discount:`, plan.newUserDiscount);
        }
        if (plan.trialUpgradeDiscount) {
          console.log(`Plan ${key} has TRIAL upgrade discount:`, plan.trialUpgradeDiscount);
        }
      });
      
      setPlans(plansObj);
      setCurrentSubscription(subRes.data.subscription);
    } catch (err) {
      console.error('Error loading subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 5000);
  };

  const handleSubscribe = async (planKey) => {
    const plan = plans[planKey];

    try {
      setSubscribing(planKey);
      
      // Create Stripe checkout session
      const response = await api.post('/payments/create-checkout', { plan: planKey });
      
      if (response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      }
      
    } catch (err) {
      console.error('Subscription error:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Neuspjelo';
      showToast(errorMsg, 'error');
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-green-100 blur-3xl opacity-40" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-100 blur-3xl opacity-40" />
      <div className="relative max-w-7xl mx-auto px-4 py-8">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Odaberite Vaš Plan</h1>
        <p className="text-xl text-gray-600">Ekskluzivni leadovi bez konkurencije</p>
        <p className="text-lg text-green-600 font-semibold mt-2">1 lead = 1 izvođač | Refund ako klijent ne odgovori</p>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <div className="mb-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-blue-700 mb-1">Trenutna pretplata:</p>
              <p className="text-3xl font-bold text-blue-900">{currentSubscription.plan}</p>
              <p className="text-sm text-blue-600 mt-1">
                Status: <span className="font-semibold">{currentSubscription.status}</span>
              </p>
            </div>
            {currentSubscription.expiresAt && (
              <div className="text-right">
                <p className="text-sm text-blue-700 mb-1">Ističe:</p>
                <p className="text-xl font-semibold text-blue-900">
                  {new Date(currentSubscription.expiresAt).toLocaleDateString('hr-HR')}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {(() => {
                    const days = Math.ceil((new Date(currentSubscription.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
                    return days > 0 ? `${days} dana preostalo` : 'Isteklo';
                  })()}
                </p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-sm text-blue-700 mb-1">Krediti:</p>
              <p className="text-2xl font-bold text-blue-900">{currentSubscription.creditsBalance || 0}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700 mb-1">Ukupno potrošeno:</p>
              <p className="text-2xl font-bold text-blue-900">{currentSubscription.lifetimeCreditsUsed || 0}</p>
            </div>
          </div>

          {currentSubscription.plan === 'TRIAL' && currentSubscription.status !== 'EXPIRED' && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
              <p className="text-sm text-yellow-800">
                🎁 Besplatni TRIAL - Isprobajte sve mogućnosti Uslugar EXCLUSIVE-a!
              </p>
            </div>
          )}

          {currentSubscription.status === 'EXPIRED' && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
              <p className="text-sm text-red-800 font-semibold">
                ⚠️ Vaša pretplata je istekla. Nadogradite pretplatu da nastavite koristiti Uslugar EXCLUSIVE.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {Object.entries(plans).map(([key, plan]) => {
          const isCurrentPlan = currentSubscription?.plan === key;
          const isPopular = plan.popular;
          
          return (
            <div 
              key={key} 
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                isPopular ? 'ring-4 ring-green-500 transform scale-105' : ''
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-semibold">
                  ⭐ NAJPOPULARNIJI
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.displayName || plan.name}</h3>
                
                {/* Price */}
                <div className="mb-6">
                  {plan.trialUpgradeDiscount ? (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-400 line-through">{plan.originalPrice}€</span>
                        <span className="text-5xl font-bold text-green-600">{plan.price}€</span>
                        <span className="text-gray-600">/mjesečno</span>
                      </div>
                      <div className="mt-2">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          🎁 {plan.trialUpgradeDiscount.percent}% popust za upgrade iz TRIAL-a!
                        </span>
                      </div>
                    </div>
                  ) : plan.newUserDiscount ? (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-400 line-through">{plan.originalPrice}€</span>
                        <span className="text-5xl font-bold text-green-600">{plan.price}€</span>
                        <span className="text-gray-600">/mjesečno</span>
                      </div>
                      <div className="mt-2">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          🎉 {plan.newUserDiscount.percent}% popust za nove korisnike!
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-5xl font-bold text-gray-900">{plan.price}€</span>
                      <span className="text-gray-600">/mjesečno</span>
                    </div>
                  )}
                </div>

                {/* Credits */}
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600 text-center">{plan.credits}</p>
                  <p className="text-sm text-gray-600 text-center mt-1">ekskluzivnih leadova</p>
                </div>

                {/* Savings */}
                {plan.savings && (
                  <div className="mb-6 text-center">
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                      💰 {plan.savings}
                    </span>
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Subscribe Button */}
                <button
                  onClick={() => handleSubscribe(key)}
                  disabled={isCurrentPlan || subscribing === key}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    isCurrentPlan 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : subscribing === key
                      ? 'bg-gray-400 text-white cursor-wait'
                      : isPopular
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isCurrentPlan 
                    ? '✓ Trenutni plan'
                    : subscribing === key
                    ? 'Procesiranje...'
                    : plan.trialUpgradeDiscount
                    ? `Pretplati se - ${plan.price}€/mj (${plan.originalPrice}€)`
                    : plan.newUserDiscount
                    ? `Pretplati se - ${plan.price}€/mj (${plan.originalPrice}€)`
                    : `Pretplati se - ${plan.price}€/mj`
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Usporedba Planova</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Basic</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Premium ⭐</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pro</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Ekskluzivni leadovi mjesečno</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">10</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-green-600">25</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">50</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Refund sistem</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ROI statistika</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center">✅</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">AI prioritet u pretrazi</td>
                  <td className="px-6 py-4 text-center">❌</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Premium kvaliteta leadova (80+)</td>
                  <td className="px-6 py-4 text-center">❌</td>
                  <td className="px-6 py-4 text-center">❌</td>
                  <td className="px-6 py-4 text-center">✅</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Podrška</td>
                  <td className="px-6 py-4 text-center text-sm">Email</td>
                  <td className="px-6 py-4 text-center text-sm">Prioritetna</td>
                  <td className="px-6 py-4 text-center text-sm">VIP 24/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ + Quick Links */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Često Postavljana Pitanja</h2>
        
        <div className="space-y-4">
          <details className="bg-white rounded-lg p-4 shadow">
            <summary className="font-semibold text-gray-900 cursor-pointer">Što je ekskluzivan lead?</summary>
            <p className="mt-2 text-gray-700 text-sm">
              Ekskluzivan lead znači da samo <strong>vi</strong> dobivate kontakt klijenta - nema drugih izvođača koji konkuriraju.
              Za razliku od ostalih servisa gdje se jedan lead dijeli između 5-10 providera.
            </p>
          </details>

          <details className="bg-white rounded-lg p-4 shadow">
            <summary className="font-semibold text-gray-900 cursor-pointer">Što ako klijent ne odgovori?</summary>
            <p className="mt-2 text-gray-700 text-sm">
              Jednostavno zatražite <strong>refund</strong> i dobivate sve kredite nazad! Nema rizika.
            </p>
          </details>

          <details className="bg-white rounded-lg p-4 shadow">
            <summary className="font-semibold text-gray-900 cursor-pointer">Koliko košta 1 kredit?</summary>
            <p className="mt-2 text-gray-700 text-sm">
              1 kredit ≈ 10€. Lead može koštati 5-20 kredita ovisno o AI quality score-u.
              Pretplatom ušteđujete 36-47% u odnosu na pay-per-lead model.
            </p>
          </details>

          <details className="bg-white rounded-lg p-4 shadow">
            <summary className="font-semibold text-gray-900 cursor-pointer">Što je quality score?</summary>
            <p className="mt-2 text-gray-700 text-sm">
              Svaki lead ima automatski izračunati score 0-100 na osnovu verifikacije klijenta, budgeta, opisa, urgencije, itd.
              Viši score = kvalitetniji lead = veća šansa za konverziju.
            </p>
          </details>

          <details className="bg-white rounded-lg p-4 shadow">
            <summary className="font-semibold text-gray-900 cursor-pointer">Mogu li otkazati pretplatu?</summary>
            <p className="mt-2 text-gray-700 text-sm">
              Da, možete otkazati bilo kada. Preostali krediti ostaju vam dostupni.
            </p>
          </details>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="#leads" className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow transition-shadow inline-flex items-center justify-between">
            <div>
              <div className="text-gray-900 font-semibold">Dostupni leadovi</div>
              <div className="text-sm text-gray-600">Pregled aktivnih leadova</div>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600">→</span>
          </a>
          <a href="#register-user" className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow transition-shadow inline-flex items-center justify-between">
            <div>
              <div className="text-gray-900 font-semibold">Registriraj se kao Pružatelj</div>
              <div className="text-sm text-gray-600">Započni s EXCLUSIVE leadovima</div>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600">→</span>
          </a>
          <a href="#contact" className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow transition-shadow inline-flex items-center justify-between">
            <div>
              <div className="text-gray-900 font-semibold">Kontakt podrška</div>
              <div className="text-sm text-gray-600">support@uslugar.hr</div>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600">→</span>
          </a>
        </div>
      </div>

      {/* Transaction History Section */}
      <TransactionHistory />

      {/* CTA */}
      <div className="mt-12 text-center">
        <button
          onClick={() => window.location.hash = '#leads'}
          className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 shadow-lg"
        >
          🛒 Pregledaj Dostupne Leadove
        </button>
        <p className="text-sm text-gray-500 mt-4">
          Imate pitanja? Kontaktirajte nas na support@uslugar.hr
        </p>
      </div>
      </div>
    </div>
  );
}

// Transaction History Component with Filtering
function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (showHistory) {
      loadTransactions();
    }
  }, [showHistory, filterType]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const typeFilter = filterType === 'all' ? null : filterType;
      const response = await getCreditHistory(100, typeFilter);
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportTransactions = async () => {
    try {
      const typeFilter = filterType === 'all' ? null : filterType;
      const response = await exportCreditsHistoryCSV(typeFilter);
      
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const filterSuffix = typeFilter ? `-${filterType}` : '';
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `credit-history${filterSuffix}-${dateStr}.csv`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Show success message (could use toast)
      alert('✅ Povijest transakcija izvezena!');
    } catch (err) {
      console.error('Error exporting transactions:', err);
      alert('Greška pri izvozu: ' + (err.response?.data?.error || 'Neuspjelo'));
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      'PURCHASE': 'Kupovina kredita',
      'LEAD_PURCHASE': 'Kupovina leada',
      'REFUND': 'Refund',
      'BONUS': 'Bonus',
      'SUBSCRIPTION': 'Pretplata',
      'ADMIN_ADJUST': 'Admin prilagodba'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      'PURCHASE': 'bg-green-100 text-green-800',
      'LEAD_PURCHASE': 'bg-blue-100 text-blue-800',
      'REFUND': 'bg-orange-100 text-orange-800',
      'BONUS': 'bg-purple-100 text-purple-800',
      'SUBSCRIPTION': 'bg-indigo-100 text-indigo-800',
      'ADMIN_ADJUST': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatAmount = (amount) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${amount}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('hr-HR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Povijest Transakcija</h2>
          <div className="flex gap-2">
            {showHistory && transactions.length > 0 && (
              <button
                onClick={handleExportTransactions}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Izvezi CSV
              </button>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showHistory ? 'Sakrij' : 'Prikaži'}
            </button>
          </div>
        </div>

        {showHistory && (
          <>
            {/* Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtriraj po tipu:
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Svi tipovi</option>
                <option value="PURCHASE">Kupovina kredita</option>
                <option value="LEAD_PURCHASE">Kupovina leada</option>
                <option value="REFUND">Refund</option>
                <option value="BONUS">Bonus</option>
                <option value="SUBSCRIPTION">Pretplata</option>
                <option value="ADMIN_ADJUST">Admin prilagodba</option>
              </select>
            </div>

            {/* Transactions Table */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nema transakcija za prikazati.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Datum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tip
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opis
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Iznos
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stanje nakon
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(tx.type)}`}>
                            {getTypeLabel(tx.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {tx.description || '-'}
                          {tx.relatedJob && (
                            <div className="text-xs text-gray-500 mt-1">
                              Posao: {tx.relatedJob.title}
                            </div>
                          )}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                          tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatAmount(tx.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                          {tx.balance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary */}
            {transactions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Prikazano: <strong>{transactions.length}</strong> transakcija
                    {filterType !== 'all' && ` (tip: ${getTypeLabel(filterType)})`}
                  </span>
                  <span className="text-gray-900 font-semibold">
                    Ukupno stanje: {transactions[0]?.balance || 0} kredita
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

