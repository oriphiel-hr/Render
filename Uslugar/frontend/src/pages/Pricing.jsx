import React, { useState, useEffect } from 'react';
import api from '@/api';
import { getMySubscription } from '../api/exclusive';
import Toast from '../components/Toast';

export default function Pricing({ setTab }) {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [launchTrial, setLaunchTrial] = useState(false);
  const [launchTrialEndsAt, setLaunchTrialEndsAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); // Track which plan is being processed
  const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 5000);
  };

  const handleSubscribe = async (planName) => {
    if (!localStorage.getItem('token')) {
      showToast('Molimo prijavite se da biste odabrali plan.', 'warning');
      setTab('login');
      return;
    }

    setProcessing(planName);
    try {
      // Create Stripe checkout session
      const response = await api.post('/payments/create-checkout', { plan: planName });
      
      if (response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        showToast('Greška pri kreiranju sesije za plaćanje.', 'error');
        setProcessing(null);
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Greška pri odabiru paketa.';
      const additionalInfo = error.response?.data?.error === 'Payment system not configured' 
        ? ' Kontaktirajte podršku za aktivaciju plaćanja.' 
        : ' Pokušajte ponovno.';
      showToast(errorMessage + additionalInfo, 'error');
      setProcessing(null);
    }
  };

  useEffect(() => {
    // Dohvati planove i trenutnu pretplatu
    Promise.all([
      api.get('/subscriptions/plans'),
      localStorage.getItem('token') ? getMySubscription().catch(() => null) : Promise.resolve(null)
    ])
      .then(([plansRes, subscriptionRes]) => {
        
        // Add TRIAL plan
        const trialPlan = {
          id: 'trial-plan',
          name: 'TRIAL',
          displayName: 'TRIAL',
          price: 0,
          currency: 'EUR',
          credits: 5,
          features: [
            '5 ekskluzivnih leadova (besplatno)',
            '1 lead = 1 izvođač',
            '7 dana probni period',
            'ROI statistika',
            'Refund ako klijent ne odgovori',
            'Email notifikacije',
            'Mini CRM za leadove'
          ],
          isPopular: false,
          displayOrder: 0,
          isActive: true,
          savings: 'Besplatno!'
        };
        
        setPlans([trialPlan, ...plansRes.data]);
        if (subscriptionRes?.data?.subscription) {
          setCurrentSubscription(subscriptionRes.data.subscription);
          setLaunchTrial(!!subscriptionRes.data.launchTrial);
          setLaunchTrialEndsAt(subscriptionRes.data.launchTrialEndsAt || null);
        }
      })
      .catch(err => {
        console.error('❌ Greška pri učitavanju planova:', err);
        setPlans([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Učitavanje cjenika...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Odaberite Vaš Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Ekskluzivni leadovi bez konkurencije
          </p>
          <div className="space-y-3 max-w-3xl mx-auto">
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg">
              <p className="text-lg font-semibold">
                1 lead = 1 izvođač | Refund ako klijent ne odgovori
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-400 text-blue-800 px-6 py-4 rounded-lg text-sm md:text-base text-left">
              <p className="font-semibold mb-1">
                🤝 Pošteno pravilo za nove kategorije i regije
              </p>
              <p className="mb-1">
                Dok u vašim odabranim kategorijama i regijama <strong>nema dovoljno klijenata</strong>, koristite <strong>najjači paket (TRIAL / Premium funkcionalnosti)</strong> bez plaćanja mjesečne naknade.
              </p>
              <p className="text-xs md:text-sm text-blue-900">
                Konkretno: čim u zadnjih 90 dana u vašim kategorijama imamo <strong>barem 20 objavljenih poslova</strong> i možemo vam realno isporučiti <strong>min. 3–5 leadova mjesečno</strong>, smatramo da je tržište dovoljno aktivno i od sljedećeg obračunskog razdoblja prelazite na redovnu cijenu odabranog plana (uz jasnu najavu unaprijed).
              </p>
            </div>
          </div>
        </div>

        {/* Current Subscription Info */}
        {currentSubscription && (
          <div className="mb-8 bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              ✓ Vaš aktivni plan: <span className="text-green-700">{currentSubscription.plan}</span>
            </h2>
            {launchTrial && currentSubscription.plan === 'TRIAL' && (
              <p className="text-blue-700 font-semibold mb-2">
                🚀 Launch TRIAL – besplatno dok u vašim kategorijama nema dovoljno klijenata
              </p>
            )}
            {launchTrialEndsAt && (
              <p className="text-amber-700 text-sm mb-2">
                Besplatno razdoblje do: <strong>{new Date(launchTrialEndsAt).toLocaleDateString('hr-HR')}</strong> – zatim redovna naplata
              </p>
            )}
            <p className="text-gray-700">
              Preostalo kredita: <strong className="text-green-700">{currentSubscription.creditsBalance || 0}</strong>
              {currentSubscription.expiresAt && (
                <> | Ističe: <strong>{new Date(currentSubscription.expiresAt).toLocaleDateString('hr-HR')}</strong></>
              )}
            </p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-16">
          {plans.map(plan => {
            const isCurrentPlan = currentSubscription?.plan === plan.name;
            const isTrial = plan.name === 'TRIAL';
            const isStrongestPaidPlan = plan.name === 'PRO';
            
            return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg p-6 border-4 ${
                isCurrentPlan 
                  ? 'border-green-500 shadow-2xl' 
                  : plan.isPopular 
                  ? 'border-blue-500 shadow-xl' 
                  : 'border-gray-200'
              } relative`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                    ✓ VAŠ PLAN
                  </span>
                </div>
              )}
              
              {plan.isPopular && !isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
                    ⭐ Najpopularniji
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.displayName}
                </h3>
                <div className={`text-4xl font-bold mb-2 ${
                  isTrial ? 'text-yellow-600' : 'text-blue-600'
                }`}>
                  {plan.price}€
                </div>
                <p className="text-gray-600">mjesečno</p>
                {isTrial && (
                  <p className="text-sm text-yellow-600 font-semibold mt-1">
                    7 dana besplatno!
                  </p>
                )}
                {isStrongestPaidPlan && (
                  <p className="mt-2 text-xs text-blue-700 font-semibold">
                    Launch TRIAL: u novim kategorijama/regijama ovaj plan je privremeno besplatan dok ne dosegnemo dovoljan broj klijenata.
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.savings && (
                <div className="mb-4 text-center">
                  <p className="text-sm font-semibold text-green-600">
                    {plan.savings}
                  </p>
                </div>
              )}

              <button 
                disabled={isCurrentPlan || processing === plan.name}
                onClick={() => !isCurrentPlan && handleSubscribe(plan.name)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  isCurrentPlan
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : processing === plan.name
                    ? 'bg-yellow-300 text-gray-700 cursor-wait'
                    : isTrial
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCurrentPlan ? '✓ Aktivno' : processing === plan.name ? '⏳ Obrađuje se...' : plan.price === 0 ? 'Besplatno' : `Odaberite ${plan.displayName}`}
              </button>
            </div>
            );
          })}
        </div>

        {/* FAQ Link */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Imate pitanja?
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Pogledajte našu FAQ sekciju s odgovorima na najčešća pitanja
          </p>
          <button
            onClick={() => setTab('faq')}
            className="inline-block bg-purple-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            ❓ Pregledaj FAQ
          </button>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Spremni za ekskluzivne leadove?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Registrirajte se danas i počnite primati kvalitetne leadove
          </p>
          <div className="space-x-4">
            <button
              onClick={() => setTab('register-user')}
              className="inline-block bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Registriraj se kao pružatelj
            </button>
            <button
              onClick={() => setTab('register-user')}
              className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Registriraj se kao korisnik
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
