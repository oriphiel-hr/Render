// Credits Balance Widget with Subscription Status - USLUGAR EXCLUSIVE
import React, { useState, useEffect } from 'react';
import { getCreditsBalance, getMySubscription } from '../api/exclusive';

export default function CreditsWidget() {
  const [balance, setBalance] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [shouldRetry, setShouldRetry] = useState(true);

  useEffect(() => {
    // Provjeri da li je korisnik prijavljen
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    loadBalance();
    
    // Refresh every 30 seconds only if we should retry
    const interval = setInterval(() => {
      if (shouldRetry) {
        loadBalance();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [shouldRetry]);

  const loadBalance = async () => {
    try {
      const [creditsRes, subscriptionRes] = await Promise.all([
        getCreditsBalance(),
        getMySubscription()
      ]);
      
      setBalance(creditsRes.data);
      setSubscription(subscriptionRes.data.subscription);
      setLoading(false);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error loading credits:', err);
      // Ako je 401, možda korisnik nije prijavljen ili token je istekao
      if (err.response?.status === 401) {
        // Ne prikazuj widget ako korisnik nije autentificiran
        setBalance(null);
        setSubscription(null);
        setRetryCount(prev => prev + 1);
        
        // Stop retrying after 3 consecutive 401 errors
        if (retryCount >= 2) {
          setShouldRetry(false);
        }
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-2 bg-gray-100 rounded-lg animate-pulse">
        <div className="h-4 w-16 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (!balance && !subscription) return null;

  const isLow = balance && balance.balance < 5;
  const isExpired = subscription?.status === 'EXPIRED';
  const isTrial = subscription?.plan === 'TRIAL';
  const creditsBalance = balance?.balance || subscription?.creditsBalance || 0;
  
  // Calculate days remaining
  const daysRemaining = subscription?.expiresAt 
    ? Math.ceil((new Date(subscription.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  // Badge color
  const badgeColor = isExpired ? 'bg-red-500' : isTrial ? 'bg-yellow-500' : 'bg-green-500';
  const statusText = isExpired ? 'Isteklo' : isTrial ? 'TRIAL' : subscription?.plan || '';

  return (
    <div 
      onClick={() => window.location.hash = '#subscription'}
      className={`px-4 py-3 rounded-lg cursor-pointer transition-all hover:shadow-lg border-2 ${
        isExpired 
          ? 'bg-gradient-to-r from-red-500 to-red-600 border-red-700' 
          : isLow
          ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-700'
          : 'bg-gradient-to-r from-green-500 to-green-600 border-green-700'
      } text-white`}
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${badgeColor}`}>
              {statusText}
            </span>
            {daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7 && (
              <span className="text-xs opacity-80">
                {daysRemaining}d
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs opacity-90">Krediti</p>
              <p className="text-xl font-bold">{creditsBalance}</p>
            </div>
          </div>
        </div>
        
        {(isLow || isExpired) && (
          <span className="text-xs bg-white text-red-600 px-2 py-1 rounded whitespace-nowrap">
            {isExpired ? 'Platite!' : 'Nisko!'}
          </span>
        )}
      </div>
    </div>
  );
}

