import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * Hook for managing push notifications
 */
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [vapidPublicKey, setVapidPublicKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if push notifications are supported
  useEffect(() => {
    if (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    ) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      setLoading(false);
    }
  }, []);

  // Get VAPID public key from server
  useEffect(() => {
    if (!isSupported) return;

    axios
      .get(`${API_URL}/api/push-notifications/vapid-public-key`)
      .then((response) => {
        setVapidPublicKey(response.data.publicKey);
      })
      .catch((err) => {
        console.error('Error getting VAPID key:', err);
        setError('Push notifications not configured on server');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isSupported]);

  // Check existing subscription
  useEffect(() => {
    if (!isSupported || !vapidPublicKey) return;

    checkSubscription();
  }, [isSupported, vapidPublicKey]);

  const checkSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      
      if (sub) {
        setSubscription(sub);
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError('Error checking subscription status');
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported || !vapidPublicKey) {
      setError('Push notifications not supported or not configured');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Notification permission denied');
        setLoading(false);
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await registration.update();

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // Send subscription to server
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/push-notifications/subscribe`,
        { subscription },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSubscription(subscription);
      setIsSubscribed(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error subscribing to push:', err);
      setError(err.response?.data?.error || 'Error subscribing to push notifications');
      setLoading(false);
      return false;
    }
  }, [isSupported, vapidPublicKey]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!subscription) return false;

    try {
      setLoading(true);
      setError(null);

      // Unsubscribe from push manager
      await subscription.unsubscribe();

      // Remove from server
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/push-notifications/unsubscribe`,
        { endpoint: subscription.endpoint },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSubscription(null);
      setIsSubscribed(false);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error unsubscribing from push:', err);
      setError(err.response?.data?.error || 'Error unsubscribing from push notifications');
      setLoading(false);
      return false;
    }
  }, [subscription]);

  return {
    isSupported,
    isSubscribed,
    subscription,
    loading,
    error,
    subscribe,
    unsubscribe,
    checkSubscription
  };
}

/**
 * Convert VAPID public key from base64 URL to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

