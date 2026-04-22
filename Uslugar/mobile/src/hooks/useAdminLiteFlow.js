import { useEffect, useState } from 'react';
import {
  blockAdminUser,
  approveAdminLeadRefund,
  getAdminBlockedUsers,
  getAdminPaymentWatch,
  getAdminPendingProviders,
  getAdminPendingRefunds,
  rejectAdminLeadRefund,
  sendAdminPaymentReminder,
  unblockAdminUser,
  setAdminProviderApproval
} from '@uslugar/shared';

export function useAdminLiteFlow({
  apiBaseUrl,
  token,
  user,
  setLoading,
  setMessage,
  handleApiError
}) {
  const [paymentWatch, setPaymentWatch] = useState(null);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  const canUseAdminLite = user?.role === 'ADMIN';

  const loadAdminLiteData = async () => {
    if (!canUseAdminLite || !token) return;
    setAdminLoading(true);
    setLoading(true);
    try {
      const [watch, providers, refunds, blocked] = await Promise.all([
        getAdminPaymentWatch({ apiBaseUrl, token }),
        getAdminPendingProviders({ apiBaseUrl, token }),
        getAdminPendingRefunds({ apiBaseUrl, token }),
        getAdminBlockedUsers({ apiBaseUrl, token })
      ]);
      setPaymentWatch(watch || null);
      setPendingProviders(Array.isArray(providers) ? providers : []);
      const leadRefunds = refunds?.refunds?.leadPurchases || [];
      setPendingRefunds(Array.isArray(leadRefunds) ? leadRefunds : []);
      setBlockedUsers(Array.isArray(blocked?.users) ? blocked.users : []);
    } catch (error) {
      await handleApiError(error, 'Ne mogu ucitati Admin Lite podatke.');
    } finally {
      setLoading(false);
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (canUseAdminLite && token) {
      loadAdminLiteData();
    }
  }, [token, user?.role]);

  const remindPayment = async (invoiceId) => {
    if (!invoiceId) return;
    setLoading(true);
    try {
      const result = await sendAdminPaymentReminder({ apiBaseUrl, token, invoiceId });
      setMessage(result?.message || 'Podsjetnik za uplatu je poslan.');
    } catch (error) {
      await handleApiError(error, 'Ne mogu poslati podsjetnik.');
    } finally {
      setLoading(false);
    }
  };

  const updateProviderApproval = async ({ providerId, status, notes = '' }) => {
    if (!providerId || !status) return;
    setLoading(true);
    try {
      const result = await setAdminProviderApproval({ apiBaseUrl, token, providerId, status, notes });
      setMessage(result?.message || `Provider status je promijenjen na ${status}.`);
      await loadAdminLiteData();
    } catch (error) {
      await handleApiError(error, 'Ne mogu promijeniti status providera.');
    } finally {
      setLoading(false);
    }
  };

  const approveRefund = async (purchaseId) => {
    if (!purchaseId) return;
    setLoading(true);
    try {
      const result = await approveAdminLeadRefund({
        apiBaseUrl,
        token,
        purchaseId,
        adminNotes: 'Approved via Admin Lite'
      });
      setMessage(result?.message || 'Refund je odobren.');
      await loadAdminLiteData();
    } catch (error) {
      await handleApiError(error, 'Ne mogu odobriti refund.');
    } finally {
      setLoading(false);
    }
  };

  const rejectRefund = async (purchaseId) => {
    if (!purchaseId) return;
    setLoading(true);
    try {
      const result = await rejectAdminLeadRefund({
        apiBaseUrl,
        token,
        purchaseId,
        reason: 'Rejected via Admin Lite'
      });
      setMessage(result?.message || 'Refund je odbijen.');
      await loadAdminLiteData();
    } catch (error) {
      await handleApiError(error, 'Ne mogu odbiti refund.');
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const result = await blockAdminUser({
        apiBaseUrl,
        token,
        userId,
        reason: 'Blokirano preko Admin Lite mobilne aplikacije.'
      });
      setMessage(result?.message || 'Korisnik je blokiran.');
      await loadAdminLiteData();
    } catch (error) {
      await handleApiError(error, 'Ne mogu blokirati korisnika.');
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const result = await unblockAdminUser({ apiBaseUrl, token, userId });
      setMessage(result?.message || 'Korisnik je odblokiran.');
      await loadAdminLiteData();
    } catch (error) {
      await handleApiError(error, 'Ne mogu odblokirati korisnika.');
    } finally {
      setLoading(false);
    }
  };

  return {
    canUseAdminLite,
    paymentWatch,
    pendingProviders,
    pendingRefunds,
    blockedUsers,
    adminLoading,
    loadAdminLiteData,
    remindPayment,
    updateProviderApproval,
    approveRefund,
    rejectRefund,
    blockUser,
    unblockUser
  };
}
