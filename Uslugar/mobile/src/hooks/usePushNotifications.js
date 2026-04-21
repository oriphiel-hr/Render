import { useEffect, useRef, useState } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import {
  getPushSubscriptions,
  sendTestPushToSelf,
  subscribePushToken,
  unsubscribePushToken
} from '@uslugar/shared';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

export function usePushNotifications({ apiBaseUrl, token, setMessage, handleApiError }) {
  const AUTO_HEAL_COOLDOWN_MS = 30000;
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [expoPushToken, setExpoPushToken] = useState('');
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [isRegisteredOnBackend, setIsRegisteredOnBackend] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [syncingPush, setSyncingPush] = useState(false);
  const [loadingPush, setLoadingPush] = useState(false);
  const lastAutoHealAttemptRef = useRef(0);

  const performAutoHealIfNeeded = async (subscriptions, targetToken = expoPushToken) => {
    if (!targetToken || !apiBaseUrl || !token) return subscriptions;
    const hasCurrentToken = subscriptions.some((item) => item?.endpoint === targetToken);
    if (hasCurrentToken) return subscriptions;

    const now = Date.now();
    if (now - lastAutoHealAttemptRef.current < AUTO_HEAL_COOLDOWN_MS) {
      return subscriptions;
    }
    lastAutoHealAttemptRef.current = now;

    try {
      await subscribePushToken({
        apiBaseUrl,
        token,
        expoPushToken: targetToken
      });
      const retryResult = await getPushSubscriptions({ apiBaseUrl, token });
      const retrySubscriptions = Array.isArray(retryResult?.subscriptions) ? retryResult.subscriptions : [];
      if (retrySubscriptions.some((item) => item?.endpoint === targetToken)) {
        setMessage('Push token je automatski ponovno registriran na backend.');
      }
      return retrySubscriptions;
    } catch (error) {
      await handleApiError?.(error, 'Automatski push retry nije uspio.');
      return subscriptions;
    }
  };

  const refreshPushSubscriptions = async (targetToken = expoPushToken) => {
    if (!apiBaseUrl || !token) return [];
    setSyncingPush(true);
    try {
      const result = await getPushSubscriptions({ apiBaseUrl, token });
      const baseSubscriptions = Array.isArray(result?.subscriptions) ? result.subscriptions : [];
      const subscriptions = await performAutoHealIfNeeded(baseSubscriptions, targetToken);
      setSubscriptionCount(subscriptions.length);
      const hasCurrentToken = targetToken
        ? subscriptions.some((item) => item?.endpoint === targetToken)
        : false;
      setIsRegisteredOnBackend(hasCurrentToken);
      setLastSyncAt(new Date().toISOString());
      return subscriptions;
    } catch (error) {
      await handleApiError?.(error, 'Ne mogu dohvatiti push pretplate.');
      return [];
    } finally {
      setSyncingPush(false);
    }
  };

  const requestPushPermission = async () => {
    if (!Device.isDevice) {
      setMessage('Push radi samo na fizičkom uređaju.');
      return null;
    }

    setLoadingPush(true);
    try {
      const existing = await Notifications.getPermissionsAsync();
      let finalStatus = existing.status;
      if (existing.status !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync();
        finalStatus = requested.status;
      }
      setPermissionStatus(finalStatus);
      if (finalStatus !== 'granted') {
        setMessage('Dozvola za push notifikacije nije odobrena.');
        return null;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ||
        Constants?.easConfig?.projectId;

      const tokenResponse = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : {}
      );
      const expoToken = tokenResponse?.data || '';
      setExpoPushToken(expoToken);
      if (expoToken && apiBaseUrl && token) {
        await subscribePushToken({
          apiBaseUrl,
          token,
          expoPushToken: expoToken
        });
        setIsRegisteredOnBackend(true);
      }
      await refreshPushSubscriptions(expoToken);
      setMessage('Push dozvola odobrena i token je registriran.');
      return expoToken;
    } catch (error) {
      await handleApiError?.(error, 'Greška pri registraciji push notifikacija.');
      setMessage(error?.message || 'Greška pri registraciji push notifikacija.');
      return null;
    } finally {
      setLoadingPush(false);
    }
  };

  const disablePushPermission = async () => {
    if (!expoPushToken || !token) {
      setMessage('Nema aktivnog push tokena za odjavu.');
      return;
    }
    setLoadingPush(true);
    try {
      await unsubscribePushToken({
        apiBaseUrl,
        token,
        expoPushToken
      });
      setExpoPushToken('');
      setIsRegisteredOnBackend(false);
      await refreshPushSubscriptions();
      setMessage('Push token je odjavljen s backenda.');
    } catch (error) {
      await handleApiError?.(error, 'Ne mogu odjaviti push token.');
      setMessage(error?.message || 'Ne mogu odjaviti push token.');
    } finally {
      setLoadingPush(false);
    }
  };

  const sendTestPush = async () => {
    if (!token) {
      setMessage('Potrebna je prijava za test push.');
      return;
    }
    setLoadingPush(true);
    try {
      const response = await sendTestPushToSelf({
        apiBaseUrl,
        token
      });
      const sent = response?.result?.sent ?? 0;
      const failed = response?.result?.failed ?? 0;
      await refreshPushSubscriptions();
      setMessage(`Test push poslan. Uspješno: ${sent}, neuspješno: ${failed}.`);
    } catch (error) {
      await handleApiError?.(error, 'Ne mogu poslati test push.');
      setMessage(error?.message || 'Ne mogu poslati test push.');
    } finally {
      setLoadingPush(false);
    }
  };

  useEffect(() => {
    const bootstrapPushState = async () => {
      if (!apiBaseUrl || !token || !Device.isDevice) return;
      try {
        const existing = await Notifications.getPermissionsAsync();
        setPermissionStatus(existing?.status || 'unknown');
        if (existing?.status !== 'granted') {
          setIsRegisteredOnBackend(false);
          return;
        }
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ||
          Constants?.easConfig?.projectId;
        const tokenResponse = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : {}
        );
        const expoToken = tokenResponse?.data || '';
        if (expoToken) {
          setExpoPushToken(expoToken);
        }
        await refreshPushSubscriptions(expoToken);
      } catch (error) {
        await handleApiError?.(error, 'Ne mogu učitati push stanje nakon prijave.');
      }
    };
    bootstrapPushState();
  }, [apiBaseUrl, token]);

  return {
    permissionStatus,
    expoPushToken,
    subscriptionCount,
    isRegisteredOnBackend,
    lastSyncAt,
    syncingPush,
    loadingPush,
    requestPushPermission,
    disablePushPermission,
    sendTestPush,
    refreshPushSubscriptions
  };
}
