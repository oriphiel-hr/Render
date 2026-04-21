import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  createCheckoutSession,
  getCreditHistory,
  getCurrentSubscription,
  getInvoices,
  normalizeApiBaseUrl,
  getSubscriptionPlans,
  sendInvoiceByEmail
} from '@uslugar/shared';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export function useBillingFlow({
  apiBaseUrl,
  token,
  user,
  setLoading,
  setMessage,
  handleApiError
}) {
  const [billingLoading, setBillingLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [creditHistory, setCreditHistory] = useState([]);
  const [creditHistoryType, setCreditHistoryType] = useState('all');
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [lastCheckoutAt, setLastCheckoutAt] = useState(null);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const appStateRef = useRef(AppState.currentState);

  const canUseBilling = user?.role === 'PROVIDER' || user?.role === 'ADMIN';

  const loadBillingData = async () => {
    if (!token || !canUseBilling) return;
    setBillingLoading(true);
    setLoading(true);
    try {
      const [subRes, plansRes, invoicesRes, creditRes] = await Promise.all([
        getCurrentSubscription({ apiBaseUrl, token }),
        getSubscriptionPlans({ apiBaseUrl, token }),
        getInvoices({ apiBaseUrl, token }),
        getCreditHistory({
          apiBaseUrl,
          token,
          limit: 50,
          type: creditHistoryType
        })
      ]);
      setSubscription(subRes?.subscription || null);
      setPlanDetails(subRes?.planDetails || null);
      setPlans(Array.isArray(plansRes) ? plansRes : []);
      setInvoices(Array.isArray(invoicesRes?.invoices) ? invoicesRes.invoices : []);
      setCreditHistory(Array.isArray(creditRes?.transactions) ? creditRes.transactions : []);
    } catch (error) {
      await handleApiError(error, 'Ne mogu ucitati billing podatke.');
    } finally {
      setLoading(false);
      setBillingLoading(false);
    }
  };

  const loadCreditHistory = async (nextType = creditHistoryType) => {
    if (!token || !canUseBilling) return;
    setBillingLoading(true);
    try {
      const response = await getCreditHistory({
        apiBaseUrl,
        token,
        limit: 100,
        type: nextType
      });
      setCreditHistoryType(nextType);
      setCreditHistory(Array.isArray(response?.transactions) ? response.transactions : []);
    } catch (error) {
      await handleApiError(error, 'Ne mogu učitati povijest kredita.');
    } finally {
      setBillingLoading(false);
    }
  };

  useEffect(() => {
    if (token && canUseBilling) {
      loadBillingData();
    }
  }, [token, user?.role]);

  const startCheckout = async (planName) => {
    if (!planName) return;
    setBillingLoading(true);
    setLoading(true);
    try {
      const result = await createCheckoutSession({
        apiBaseUrl,
        token,
        plan: planName,
        interval: 'month'
      });
      setCheckoutUrl(result?.url || '');
      setLastCheckoutAt(new Date().toISOString());
      setCheckoutPending(true);
      setMessage(result?.url ? 'Checkout link je spreman.' : 'Checkout kreiran bez URL-a.');
    } catch (error) {
      await handleApiError(error, 'Ne mogu kreirati checkout.');
    } finally {
      setLoading(false);
      setBillingLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !canUseBilling) return undefined;
    const sub = AppState.addEventListener('change', (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;
      const returnedToForeground = (prev === 'background' || prev === 'inactive') && nextState === 'active';
      if (!returnedToForeground) return;
      if (!checkoutPending || !lastCheckoutAt) return;
      const elapsedMs = Date.now() - new Date(lastCheckoutAt).getTime();
      if (elapsedMs <= 15 * 60 * 1000) {
        loadBillingData();
      } else {
        setCheckoutPending(false);
      }
    });
    return () => sub.remove();
  }, [token, canUseBilling, checkoutPending, lastCheckoutAt, creditHistoryType]);

  useEffect(() => {
    if (!checkoutPending) return;
    if (!subscription) return;
    if (subscription.status === 'ACTIVE' || subscription.status === 'CANCELLED' || subscription.status === 'EXPIRED') {
      setCheckoutPending(false);
    }
  }, [checkoutPending, subscription?.status]);

  const sendInvoiceEmail = async (invoiceId) => {
    if (!invoiceId) return;
    setBillingLoading(true);
    try {
      await sendInvoiceByEmail({ apiBaseUrl, token, invoiceId });
      setMessage('Faktura je poslana na email.');
      await loadBillingData();
      return { ok: true, message: 'Faktura je poslana na email.' };
    } catch (error) {
      await handleApiError(error, 'Ne mogu poslati fakturu emailom.');
      return { ok: false, message: error?.message || 'Ne mogu poslati fakturu emailom.' };
    } finally {
      setBillingLoading(false);
    }
  };

  const downloadInvoicePdf = async (invoiceId, invoiceNumber) => {
    if (!invoiceId || !apiBaseUrl || !token) return;
    setBillingLoading(true);
    try {
      const base = normalizeApiBaseUrl(apiBaseUrl);
      const fileName = `faktura-${invoiceNumber || invoiceId}.pdf`;
      const destination = `${FileSystem.cacheDirectory}${fileName}`;
      const result = await FileSystem.downloadAsync(
        `${base}/api/invoices/${invoiceId}/pdf`,
        destination,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(result.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Faktura PDF'
        });
        return { ok: true, message: 'PDF je otvoren za dijeljenje.' };
      } else {
        setMessage(`PDF spremljen: ${result.uri}`);
        return { ok: true, message: `PDF spremljen: ${result.uri}` };
      }
    } catch (error) {
      await handleApiError(error, 'Ne mogu preuzeti PDF fakture.');
      return { ok: false, message: error?.message || 'Ne mogu preuzeti PDF fakture.' };
    } finally {
      setBillingLoading(false);
    }
  };

  return {
    canUseBilling,
    billingLoading,
    subscription,
    planDetails,
    plans,
    invoices,
    creditHistory,
    creditHistoryType,
    checkoutUrl,
    lastCheckoutAt,
    checkoutPending,
    loadBillingData,
    startCheckout,
    sendInvoiceEmail,
    downloadInvoicePdf,
    loadCreditHistory
  };
}
