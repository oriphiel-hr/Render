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
  const [showFairRuleDetail, setShowFairRuleDetail] = useState(false);
  const [billingInterval, setBillingInterval] = useState('monthly'); // 'monthly' | 'yearly'
  const [pricingStats, setPricingStats] = useState(null); // { providersCount, leadsDeliveredCount }

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
      const body = { plan: planName };
      if (planName !== 'TRIAL' && billingInterval === 'yearly') {
        body.interval = 'yearly';
      }
      const response = await api.post('/payments/create-checkout', body);
      
      if (response.data.url) {
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
    // Dohvati planove, trenutnu pretplatu i javne statistike za trust blok
    Promise.all([
      api.get('/subscriptions/plans'),
      localStorage.getItem('token') ? getMySubscription().catch(() => null) : Promise.resolve(null),
      api.get('/public/pricing-stats').then(r => r.data).catch(() => null)
    ])
      .then(([plansRes, subscriptionRes, stats]) => {
        const rawPlans = Array.isArray(plansRes.data) ? plansRes.data : [];
        const corePlans = rawPlans.filter(p => !p.region && !p.categoryId);

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
            'Mini CRM za leadove (bilješke, sljedeći korak, podsjetnik po leadu)'
          ],
          isPopular: false,
          displayOrder: 0,
          isActive: true,
          savings: 'Besplatno!'
        };
        
        setPlans([trialPlan, ...corePlans]);
        if (subscriptionRes?.data?.subscription) {
          setCurrentSubscription(subscriptionRes.data.subscription);
          setLaunchTrial(!!subscriptionRes.data.launchTrial);
          setLaunchTrialEndsAt(subscriptionRes.data.launchTrialEndsAt || null);
        }
        if (stats && typeof stats.providersCount === 'number') {
          setPricingStats({ providersCount: stats.providersCount, leadsDeliveredCount: stats.leadsDeliveredCount ?? 0 });
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
      <div className="min-h-screen py-12 safe-area-x bg-transparent">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 dark:border-amber-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Učitavanje cjenika...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 safe-area-x">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero */}
        <section className="relative text-center mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-50 dark:from-amber-950/30 dark:via-gray-900 dark:to-amber-950/20 border border-amber-200/60 dark:border-amber-800/50 px-6 py-12 md:py-16 pricing-hero-in">
          <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-300/30 dark:bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white relative">
            Ekskluzivni leadovi.
            <br />
            <span className="text-amber-600 dark:text-amber-400">Jedan izvođač po leadu.</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto relative">
            Bez natjecanja, bez gubljenja vremena. Odaberite plan i počnite primati kvalitetne upite.
          </p>
        </section>

        {/* Trust */}
        <div className="mb-12 text-sm text-gray-600 dark:text-gray-400 pricing-card-in delay-0">
          {/* Na uskim ekranima (max-sm): jedna kratka linija */}
          <div className="sm:hidden text-center">
            <span>
              {pricingStats && pricingStats.providersCount > 0
                ? `${pricingStats.providersCount.toLocaleString('hr-HR')}+ pružatelja`
                : 'Pružatelji nas odabiru'}
              {' · Stripe'}
              {pricingStats && pricingStats.leadsDeliveredCount > 0
                ? ` · ${pricingStats.leadsDeliveredCount.toLocaleString('hr-HR')}+ leadova`
                : ''}
            </span>
          </div>
          {/* Na širem ekranu: puni tekst */}
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👷</span>
              <span>
                {pricingStats && pricingStats.providersCount > 0
                  ? `Preko ${pricingStats.providersCount.toLocaleString('hr-HR')} pružatelja koristi Uslugar`
                  : 'Pružatelji nas odabiru za ekskluzivne leadove'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔒</span>
              <span>Plaćanje sigurno putem Stripe</span>
            </div>
            {pricingStats && pricingStats.leadsDeliveredCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xl">📩</span>
                <span>Preko {pricingStats.leadsDeliveredCount.toLocaleString('hr-HR')} leadova isporučeno</span>
              </div>
            )}
          </div>
        </div>

        {/* Testimonijali */}
        <section className="mb-14">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <blockquote className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-left">
              <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                „Kod mene jedan upit znači jedan posao – ne moram se natjecati s pet drugih majstora. To mi štedi vrijeme i novac.”
              </p>
              <footer className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                — M. K., građevinski majstor, Zagreb
              </footer>
            </blockquote>
            <blockquote className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-left">
              <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                „Refund ako klijent ne odgovori mi je bio presudan. Platim samo za leadove koji stvarno jesu zainteresirani.”
              </p>
              <footer className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                — Pružatelj usluga, Split
              </footer>
            </blockquote>
          </div>
        </section>

        {/* Logotipi / grane – „Koriste nas pružatelji iz…” */}
        <section className="mb-14">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            Koriste nas pružatelji iz raznih grana
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {['Građevina', 'Elektrika', 'Vodoinstalaterstvo', 'IT i dizajn', 'Renovacije'].map((label) => (
              <span
                key={label}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium border border-gray-200 dark:border-gray-700"
              >
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* Usporednica: Uslugar vs. običan model (bez imenovanja konkurenata) */}
        <section className="mb-14 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-800/50 p-6 md:p-8">
          <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white text-center mb-6">
            Zašto ekskluzivni leadovi?
          </h3>
          {/* Tablica na desktopu */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full max-w-3xl mx-auto text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-amber-200 dark:border-amber-800">
                  <th className="py-3 pr-4 font-semibold text-gray-900 dark:text-white">Uslugar</th>
                  <th className="py-3 pl-4 font-semibold text-gray-600 dark:text-gray-400">Model s više ponuda po upitu</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                <tr className="border-b border-amber-100 dark:border-amber-900/50">
                  <td className="py-3 pr-4">1 lead = 1 izvođač</td>
                  <td className="py-3 pl-4">Više izvođača natječe se za isti upit</td>
                </tr>
                <tr className="border-b border-amber-100 dark:border-amber-900/50">
                  <td className="py-3 pr-4">Refund ako klijent ne odgovori</td>
                  <td className="py-3 pl-4">Bez refundiranja</td>
                </tr>
                <tr className="border-b border-amber-100 dark:border-amber-900/50">
                  <td className="py-3 pr-4">Ekskluzivni upit – bez spam poziva za klijenta</td>
                  <td className="py-3 pl-4">Klijent prima više poziva i ponuda</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Jasna mjesečna cijena, bez skrivenih naknada</td>
                  <td className="py-3 pl-4">Često varijabilno ili skrivene naknade</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Na mobilu: stacked kartice umjesto tablice (bez horizontal scrolla) */}
          <div className="md:hidden space-y-4">
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-amber-200/80 dark:border-amber-700/50">
              <p className="text-gray-900 dark:text-white font-semibold">Uslugar</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">1 lead = 1 izvođač · Refund ako klijent ne odgovori · Ekskluzivni upit, bez spam poziva · Jasna mjesečna cijena</p>
            </div>
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-gray-100/80 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 font-semibold">Model s više ponuda po upitu</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Više izvođača natječe se za isti upit · Bez refundiranja · Klijent prima više poziva · Često varijabilno ili skrivene naknade</p>
            </div>
          </div>
        </section>

        {/* Header + info boxes */}
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Odaberite Vaš Plan
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Ekskluzivni leadovi bez konkurencije
          </p>
          <div className="space-y-3 max-w-3xl mx-auto">
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-800 dark:text-green-200 px-6 py-4 rounded-lg">
              <p className="text-lg font-semibold">
                1 lead = 1 izvođač | Refund ako klijent ne odgovori
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-100 px-6 py-4 rounded-lg text-sm md:text-base text-left">
              <p className="font-semibold mb-1">
                🤝 Načelo poštenja za nove kategorije i regije
              </p>
              <p className="mb-1">
                Dok u vašim kategorijama nema dovoljno klijenata, koristite najjači paket (TRIAL / Premium) bez mjesečne naknade.
              </p>
              {showFairRuleDetail && (
                <p className="text-xs md:text-sm text-amber-800 dark:text-amber-200 mt-2 pt-2 border-t border-amber-200 dark:border-amber-700">
                  Čim u zadnjih 90 dana u vašim kategorijama imamo <strong>barem 20 objavljenih poslova</strong> i možemo vam realno isporučiti <strong>najmanje 3–5 leadova mjesečno</strong>, tržište se smatra dovoljno aktivnim i od sljedećeg obračunskog razdoblja prelazite na redovnu cijenu odabranog plana – uz jasnu najavu unaprijed.
                </p>
              )}
              <button
                type="button"
                onClick={() => setShowFairRuleDetail(!showFairRuleDetail)}
                className="mt-2 text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 font-medium text-sm underline focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded"
              >
                {showFairRuleDetail ? 'Manje' : 'Više o načelu poštenja'}
              </button>
            </div>
          </div>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            type="button"
            onClick={() => setBillingInterval('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${billingInterval === 'monthly' ? 'bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            Mjesečno
          </button>
          <button
            type="button"
            onClick={() => setBillingInterval('yearly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${billingInterval === 'yearly' ? 'bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            Godišnje <span className="text-xs opacity-90">(2 mj. besplatno)</span>
          </button>
        </div>

        {/* Current Subscription Info */}
        {currentSubscription && (
          <div className="mb-8 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
              ✓ Vaš aktivni plan: <span className="text-green-700 dark:text-green-300">{currentSubscription.plan}</span>
            </h2>
            {launchTrial && currentSubscription.plan === 'TRIAL' && (
              <p className="text-amber-700 dark:text-amber-300 font-semibold mb-2">
                🚀 Launch TRIAL – besplatno dok u vašim kategorijama nema dovoljno klijenata
              </p>
            )}
            {launchTrialEndsAt && (
              <p className="text-amber-700 dark:text-amber-300 text-sm mb-2">
                Besplatno razdoblje do: <strong>{new Date(launchTrialEndsAt).toLocaleDateString('hr-HR')}</strong> – zatim redovna naplata
              </p>
            )}
            <p className="text-gray-700 dark:text-gray-300">
              Preostalo kredita: <strong className="text-green-700 dark:text-green-300">{currentSubscription.creditsBalance || 0}</strong>
              {currentSubscription.expiresAt && (
                <> | Ističe: <strong>{new Date(currentSubscription.expiresAt).toLocaleDateString('hr-HR')}</strong></>
              )}
            </p>
          </div>
        )}

        {/* Pricing Cards: horizontal scroll na mobilu, grid na md+ */}
        <div className="mb-16 md:grid md:grid-cols-4 md:gap-4 flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible md:pb-0">
          {plans.map((plan, index) => {
            const isCurrentPlan = currentSubscription?.plan === plan.name;
            const isTrial = plan.name === 'TRIAL';
            const isStrongestPaidPlan = plan.name === 'PRO';
            const isFeatured = plan.isPopular && !isCurrentPlan;
            const isMainPlan = plan.name === 'PREMIUM' && !isCurrentPlan;
            const displayPrice = (billingInterval === 'yearly' && !isTrial && plan.price > 0)
              ? plan.price * 10
              : plan.price;
            const isYearlyDisplay = billingInterval === 'yearly' && !isTrial && plan.price > 0;
            
            return (
            <div
              key={plan.id}
              className={`
                pricing-card-in delay-${index}
                flex-shrink-0 w-[280px] md:w-auto snap-center
                rounded-2xl shadow-lg p-6 border-4 relative
                ${isMainPlan 
                  ? 'md:row-span-1 bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-950/30 dark:to-gray-800 border-amber-400 dark:border-amber-500 shadow-xl ring-2 ring-amber-400/60 dark:ring-amber-500/40 md:scale-105 z-10' 
                  : 'bg-white dark:bg-gray-800'
                }
                ${isCurrentPlan 
                  ? 'border-green-500 dark:border-green-600 shadow-2xl' 
                  : !isMainPlan && isFeatured 
                  ? 'border-amber-500 dark:border-amber-500 shadow-xl ring-2 ring-amber-400/50 dark:ring-amber-500/40 md:scale-105 z-10' 
                  : !isMainPlan ? 'border-gray-200 dark:border-gray-600' : ''
                }
              `}
            >
              {/* Ribbon Preporučeno za glavni plan */}
              {isMainPlan && (
                <div className="absolute -top-px left-0 right-0 h-10 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-t-2xl flex items-center justify-center">
                  <span className="text-white font-display font-bold text-sm tracking-wide">Preporučeno</span>
                </div>
              )}
              {isCurrentPlan && !isMainPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 dark:bg-green-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                    ✓ VAŠ PLAN
                  </span>
                </div>
              )}
              
              {plan.isPopular && !isCurrentPlan && !isMainPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-amber-500 dark:bg-amber-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                    ⭐ Najpopularniji
                  </span>
                </div>
              )}
              
              <div className={`text-center mb-6 ${isMainPlan ? 'pt-4' : ''}`}>
                <h3 className={`font-display font-bold text-gray-900 dark:text-white mb-2 ${isMainPlan ? 'text-2xl md:text-3xl' : 'text-2xl'}`}>
                  {plan.displayName}
                </h3>
                <div className={`font-bold mb-1 ${isMainPlan ? 'text-4xl md:text-5xl' : 'text-4xl'} text-amber-600 dark:text-amber-400`}>
                  {displayPrice}€
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {isYearlyDisplay ? 'godišnje' : 'mjesečno'}
                  {isYearlyDisplay && <span className="block text-amber-600 dark:text-amber-400 font-medium">2 mj. besplatno</span>}
                </p>
                {isTrial && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold mt-1">
                    7 dana besplatno!
                  </p>
                )}
                {isStrongestPaidPlan && (
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-300 font-semibold">
                    Launch TRIAL: u novim kategorijama/regijama ovaj plan je privremeno besplatan dok ne dosegnemo dovoljan broj klijenata.
                  </p>
                )}
              </div>

              <ul className={`space-y-4 mb-8 ${isMainPlan ? 'space-y-3' : ''}`}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                    <span className="text-green-500 dark:text-green-400 mr-3 flex-shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.savings && (
                <div className="mb-4 text-center">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {(plan.savings || '').replace(/ÔéČ/g, '€').replace(/\s+EUR\s+/g, ' € ')}
                  </p>
                </div>
              )}

              <button 
                disabled={isCurrentPlan || processing === plan.name}
                onClick={() => !isCurrentPlan && handleSubscribe(plan.name)}
                className={`
                  w-full min-h-[44px] py-3 px-6 rounded-lg font-semibold
                  transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                  motion-reduce:hover:scale-100 motion-reduce:active:scale-100
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${isCurrentPlan
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                    : processing === plan.name
                    ? 'bg-amber-200 dark:bg-amber-700 text-gray-700 dark:text-gray-200 cursor-wait'
                    : isTrial
                    ? 'bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg focus:ring-amber-500'
                    : 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg focus:ring-amber-500 dark:bg-amber-600 dark:hover:bg-amber-700'
                  }
                `}
              >
                {isCurrentPlan ? '✓ Aktivno' : processing === plan.name ? '⏳ Obrađuje se...' : plan.price === 0 ? 'Besplatno' : `Odaberite ${plan.displayName}`}
              </button>
            </div>
            );
          })}
        </div>

        {/* Snažan CTA ispod kartica */}
        <div className="text-center mb-14 py-8 px-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800">
          <p className="font-display text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Nezainteresirani za natjecanje?
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-xl mx-auto">
            Odaberite plan i počnite primati leadove bez konkurencije – jedan upit, jedan izvođač.
          </p>
          <button
            onClick={() => setTab('register-user')}
            className="inline-block min-h-[44px] bg-amber-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-amber-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:bg-amber-600 dark:hover:bg-amber-700"
          >
            Registriraj se kao pružatelj
          </button>
        </div>

        {/* Česta pitanja o naplati */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Česta pitanja o naplati
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Odgovori na pitanja o kreditima, pretplati i cijenama
          </p>
          <ul className="space-y-2 text-left max-w-md mx-auto mb-6">
            <li>
              <button type="button" onClick={() => setTab('faq')} className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded">
                Koliko košta 1 kredit?
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setTab('faq')} className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded">
                Mogu li otkazati pretplatu?
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setTab('faq')} className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded">
                Kako se ažuriraju krediti?
              </button>
            </li>
          </ul>
          <button
            onClick={() => setTab('faq')}
            className="inline-block min-h-[44px] bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700 py-3 px-8 rounded-lg font-semibold hover:bg-amber-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            ❓ Pregledaj sva FAQ pitanja
          </button>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Spremni za ekskluzivne leadove?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Registrirajte se danas i počnite primati kvalitetne leadove
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setTab('register-user')}
              className="inline-block min-h-[44px] bg-amber-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-amber-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              Registriraj se kao pružatelj
            </button>
            <button
              onClick={() => setTab('register-user')}
              className="inline-block min-h-[44px] bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3 px-8 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Registriraj se kao korisnik
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
