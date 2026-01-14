// Subscription Status Widget - Shows current plan, credits, expiry date
import React, { useState, useEffect } from 'react';
import { getMySubscription } from '../api/exclusive';

export default function SubscriptionStatusWidget() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const response = await getMySubscription();
      setSubscription(response.data.subscription);
    } catch (err) {
      console.error('Error loading subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !subscription) return null;

  const isTrial = subscription.plan === 'TRIAL';
  const isExpired = subscription.status === 'EXPIRED';
  const creditsBalance = subscription.creditsBalance || 0;
  
  // Calculate days remaining
  const daysRemaining = subscription.expiresAt 
    ? Math.ceil((new Date(subscription.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const badgeColor = isExpired ? 'bg-red-500' : isTrial ? 'bg-yellow-500' : 'bg-green-500';
  const statusText = isExpired ? 'Isteklo' : isTrial ? 'TRIAL' : subscription.plan;

  return (
    <div 
      onClick={() => window.location.hash = '#subscription'}
      className="px-4 py-3 bg-white rounded-lg shadow-md border-2 border-gray-200 cursor-pointer hover:shadow-lg transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${badgeColor}`}>
            {statusText}
          </span>
          {daysRemaining !== null && daysRemaining > 0 && (
            <span className="text-xs text-gray-600">
              {daysRemaining}d preostalo
            </span>
          )}
        </div>
        {subscription.expiresAt && (
          <span className="text-xs text-gray-500">
            {new Date(subscription.expiresAt).toLocaleDateString('hr-HR')}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 mb-1">Krediti</p>
          <p className={`text-2xl font-bold ${creditsBalance === 0 ? 'text-red-600' : 'text-green-600'}`}>
            {creditsBalance}
          </p>
        </div>
        
        {isTrial && !isExpired && (
          <div className="text-right">
            <p className="text-xs text-gray-600">Probni period</p>
            <p className="text-sm font-semibold text-yellow-600">
              {daysRemaining > 0 ? `${daysRemaining} dana` : 'Danas isteče'}
            </p>
          </div>
        )}
      </div>

      {isExpired && (
        <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
          ⚠️ Pretplata je istekla. Platite da nastavite koristiti.
        </div>
      )}

      {creditsBalance === 0 && !isExpired && (
        <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
          ⚠️ Nemate kredita. Kupite više.
        </div>
      )}
    </div>
  );
}

