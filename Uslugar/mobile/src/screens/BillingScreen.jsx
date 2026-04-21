import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { styles } from '../styles';
import TopToast from '../components/TopToast';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('hr-HR');
}

function formatMoneyFromCents(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return `${(Number(value) / 100).toFixed(2)} EUR`;
}

function getSubscriptionStatusLabel(status) {
  const labels = {
    ACTIVE: 'Aktivna',
    PAYMENT_PENDING: 'Plaćanje u tijeku',
    EXPIRED: 'Istekla',
    CANCELLED: 'Otkazana'
  };
  return labels[status] || status || '-';
}

function getInvoiceStatusLabel(status) {
  const labels = {
    DRAFT: 'Nacrt',
    SENT: 'Poslana',
    PAID: 'Plaćena',
    CANCELLED: 'Otkazana',
    STORNED: 'Stornirana'
  };
  return labels[status] || status || '-';
}

function getCreditTypeLabel(type) {
  const labels = {
    PURCHASE: 'Kupovina kredita',
    LEAD_PURCHASE: 'Kupovina leada',
    REFUND: 'Refund',
    BONUS: 'Bonus',
    SUBSCRIPTION: 'Pretplata',
    ADMIN_ADJUST: 'Admin prilagodba'
  };
  return labels[type] || type || '-';
}

const PLAN_COMPARISON_ROWS = [
  { feature: 'Ekskluzivni leadovi mjesečno', BASIC: '10', PREMIUM: '25', PRO: '50' },
  { feature: 'Refund sistem', BASIC: 'Da', PREMIUM: 'Da', PRO: 'Da' },
  { feature: 'ROI statistika', BASIC: 'Da', PREMIUM: 'Da', PRO: 'Da' },
  { feature: 'AI prioritet u pretrazi', BASIC: 'Ne', PREMIUM: 'Da', PRO: 'Da' },
  { feature: 'Premium kvaliteta leadova', BASIC: 'Ne', PREMIUM: 'Ne', PRO: 'Da' }
];

export default function BillingScreen({
  billing,
  loading
}) {
  const [openUrlError, setOpenUrlError] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [billingToast, setBillingToast] = useState({ message: '', type: 'info' });
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState('all');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (!openUrlError && !copyMessage && !billingToast.message) return undefined;
    const timer = setTimeout(() => {
      setOpenUrlError('');
      setCopyMessage('');
      setBillingToast({ message: '', type: 'info' });
    }, 3000);
    return () => clearTimeout(timer);
  }, [openUrlError, copyMessage, billingToast.message]);

  useEffect(() => {
    if (!billing.lastCheckoutAt) return undefined;
    const timer = setTimeout(() => {
      billing.loadBillingData?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [billing.lastCheckoutAt]);

  const handleOpenCheckout = async () => {
    if (!billing.checkoutUrl) return;
    setOpenUrlError('');
    try {
      const supported = await Linking.canOpenURL(billing.checkoutUrl);
      if (!supported) {
        setOpenUrlError('Ne mogu otvoriti checkout URL na ovom uređaju.');
        return;
      }
      await Linking.openURL(billing.checkoutUrl);
    } catch (error) {
      setOpenUrlError(error?.message || 'Greška pri otvaranju checkout URL-a.');
    }
  };

  const handleCopyCheckout = async () => {
    if (!billing.checkoutUrl) return;
    setCopyMessage('');
    try {
      await Clipboard.setStringAsync(billing.checkoutUrl);
      setCopyMessage('Checkout URL je kopiran.');
    } catch (error) {
      setCopyMessage(error?.message || 'Ne mogu kopirati checkout URL.');
    }
  };

  const handleDownloadInvoicePdf = async (invoice) => {
    const result = await billing.downloadInvoicePdf(invoice.id, invoice.invoiceNumber);
    if (result?.message) {
      setBillingToast({ message: result.message, type: result.ok ? 'success' : 'error' });
    }
  };

  const handleSendInvoiceEmail = async (invoice) => {
    const result = await billing.sendInvoiceEmail(invoice.id);
    if (result?.message) {
      setBillingToast({ message: result.message, type: result.ok ? 'success' : 'error' });
    }
  };

  if (!billing.canUseBilling) {
    return (
      <View style={styles.profileCard}>
        <Text style={styles.metaText}>Billing je trenutno dostupan za PROVIDER/ADMIN role.</Text>
      </View>
    );
  }

  const filteredInvoices = billing.invoices.filter((invoice) => {
    if (invoiceTypeFilter !== 'all' && invoice.type !== invoiceTypeFilter) return false;
    if (invoiceStatusFilter !== 'all' && invoice.status !== invoiceStatusFilter) return false;
    return true;
  });

  const paidCount = filteredInvoices.filter((item) => item.status === 'PAID').length;
  const pendingCount = filteredInvoices.filter((item) => item.status === 'SENT' || item.status === 'DRAFT').length;
  const showSectionLoading = billing.billingLoading && !loading;

  return (
    <ScrollView style={styles.contentArea}>
      <TopToast
        message={billingToast.message}
        type={billingToast.type}
        visible={!!billingToast.message}
      />
      <Text style={styles.sectionTitle}>Trenutna pretplata</Text>
      <View style={styles.profileCard}>
        {showSectionLoading && <Text style={styles.metaText}>Učitavanje pretplate...</Text>}
        <Text style={styles.metaText}>Plan: {billing.subscription?.plan || '-'}</Text>
        <Text style={styles.metaText}>Status: {getSubscriptionStatusLabel(billing.subscription?.status)}</Text>
        <Text style={styles.metaText}>Krediti: {billing.subscription?.creditsBalance ?? '-'}</Text>
        <Text style={styles.metaText}>Vrijedi do: {formatDate(billing.subscription?.expiresAt)}</Text>
        <Text style={styles.metaText}>Paket: {billing.planDetails?.name || '-'}</Text>
        {billing.subscription?.status === 'PAYMENT_PENDING' && (
          <Text style={styles.metaText}>⏳ Paket se aktivira nakon potvrde Stripe uplate.</Text>
        )}
        {billing.subscription?.status === 'EXPIRED' && (
          <Text style={styles.metaText}>⚠️ Pretplata je istekla, potreban je novi checkout.</Text>
        )}
        {billing.checkoutPending && (
          <Text style={styles.metaText}>⏳ Čeka se povratak iz checkouta i potvrda uplate.</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Dostupni planovi</Text>
      {showSectionLoading && <Text style={styles.metaText}>Učitavanje planova...</Text>}
      {billing.plans.slice(0, 4).map((plan) => (
        <View key={plan.id || plan.name} style={styles.listItem}>
          <Text style={styles.listTitle}>{plan.displayName || plan.name}</Text>
          {(plan.trialUpgradeDiscount || plan.newUserDiscount) ? (
            <>
              <Text style={styles.metaText}>
                Cijena: {plan.price} EUR / mj (prije {plan.originalPrice} EUR)
              </Text>
              <Text style={styles.metaText}>
                {plan.trialUpgradeDiscount
                  ? `🎁 ${plan.trialUpgradeDiscount.percent}% popust za upgrade iz TRIAL-a`
                  : `🎉 ${plan.newUserDiscount?.percent || 20}% popust za nove korisnike`}
              </Text>
            </>
          ) : (
            <Text style={styles.metaText}>Cijena: {plan.price} EUR / mj</Text>
          )}
          <Text style={styles.metaText}>Krediti: {plan.credits ?? '-'} / mj</Text>
          <Pressable
            style={[styles.button, (loading || billing.billingLoading) && styles.buttonDisabled]}
            disabled={loading || billing.billingLoading || billing.subscription?.plan === plan.name}
            onPress={() => billing.startCheckout(plan.name)}
          >
            <Text style={styles.buttonText}>
              {billing.subscription?.plan === plan.name ? 'Trenutni plan' : 'Kreni na checkout'}
            </Text>
          </Pressable>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Usporedba planova</Text>
      {PLAN_COMPARISON_ROWS.map((row) => (
        <View key={row.feature} style={styles.listItem}>
          <Text style={styles.listTitle}>{row.feature}</Text>
          <Text style={styles.metaText}>Basic: {row.BASIC}</Text>
          <Text style={styles.metaText}>Premium: {row.PREMIUM}</Text>
          <Text style={styles.metaText}>Pro: {row.PRO}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Fakture</Text>
      {selectedInvoice && (
        <View style={styles.profileCard}>
          <Text style={styles.sectionTitle}>Detalji fakture</Text>
          <Text style={styles.metaText}>Broj: {selectedInvoice.invoiceNumber || selectedInvoice.id}</Text>
          <Text style={styles.metaText}>Status: {getInvoiceStatusLabel(selectedInvoice.status)}</Text>
          <Text style={styles.metaText}>Tip: {selectedInvoice.type || '-'}</Text>
          <Text style={styles.metaText}>
            Iznos: {formatMoneyFromCents(selectedInvoice.totalAmount ?? selectedInvoice.amount)}
          </Text>
          <Text style={styles.metaText}>Izdano: {formatDate(selectedInvoice.issueDate)}</Text>
          <Text style={styles.metaText}>Rok: {formatDate(selectedInvoice.dueDate)}</Text>
          <Text style={styles.metaText}>
            Plan: {selectedInvoice.subscription?.plan || '-'}
          </Text>
          <Text style={styles.metaText}>
            Lead: {selectedInvoice.leadPurchase?.job?.title || '-'}
          </Text>
          <Pressable
            style={[styles.button, (loading || billing.billingLoading) && styles.buttonDisabled]}
            disabled={loading || billing.billingLoading}
            onPress={() => handleDownloadInvoicePdf(selectedInvoice)}
          >
            <Text style={styles.buttonText}>Preuzmi PDF</Text>
          </Pressable>
          {(selectedInvoice.status === 'DRAFT' || selectedInvoice.status === 'SENT') && (
            <Pressable
              style={[styles.buttonSecondary, (loading || billing.billingLoading) && styles.buttonDisabled]}
              disabled={loading || billing.billingLoading}
              onPress={() => handleSendInvoiceEmail(selectedInvoice)}
            >
              <Text style={styles.buttonText}>Pošalji fakturu emailom</Text>
            </Pressable>
          )}
          <Pressable style={styles.buttonSecondary} onPress={() => setSelectedInvoice(null)}>
            <Text style={styles.buttonText}>Natrag na listu faktura</Text>
          </Pressable>
        </View>
      )}
      {!selectedInvoice && (
        <>
          <View style={styles.row}>
            <Pressable
              style={[styles.pill, invoiceTypeFilter === 'all' && styles.pillActive]}
              onPress={() => setInvoiceTypeFilter('all')}
            >
              <Text>Sve</Text>
            </Pressable>
            <Pressable
              style={[styles.pill, invoiceTypeFilter === 'SUBSCRIPTION' && styles.pillActive]}
              onPress={() => setInvoiceTypeFilter('SUBSCRIPTION')}
            >
              <Text>Pretplate</Text>
            </Pressable>
            <Pressable
              style={[styles.pill, invoiceTypeFilter === 'LEAD_PURCHASE' && styles.pillActive]}
              onPress={() => setInvoiceTypeFilter('LEAD_PURCHASE')}
            >
              <Text>Leadovi</Text>
            </Pressable>
          </View>
          <View style={styles.row}>
            <Pressable
              style={[styles.pill, invoiceStatusFilter === 'all' && styles.pillActive]}
              onPress={() => setInvoiceStatusFilter('all')}
            >
              <Text>Svi statusi</Text>
            </Pressable>
            <Pressable
              style={[styles.pill, invoiceStatusFilter === 'PAID' && styles.pillActive]}
              onPress={() => setInvoiceStatusFilter('PAID')}
            >
              <Text>Plaćene</Text>
            </Pressable>
            <Pressable
              style={[styles.pill, invoiceStatusFilter === 'SENT' && styles.pillActive]}
              onPress={() => setInvoiceStatusFilter('SENT')}
            >
              <Text>Poslane</Text>
            </Pressable>
          </View>
          <View style={styles.profileCard}>
            {showSectionLoading && <Text style={styles.metaText}>Učitavanje faktura...</Text>}
            <Text style={styles.metaText}>Ukupno: {filteredInvoices.length}</Text>
            <Text style={styles.metaText}>Plaćeno: {paidCount}</Text>
            <Text style={styles.metaText}>Na čekanju: {pendingCount}</Text>
          </View>
          {filteredInvoices.length === 0 ? (
            <Text style={styles.emptyText}>Nema faktura za prikaz.</Text>
          ) : (
            filteredInvoices.slice(0, 8).map((invoice) => (
              <View key={invoice.id} style={styles.listItem}>
                <Text style={styles.listTitle}>{invoice.invoiceNumber || invoice.id}</Text>
                <Text style={styles.metaText}>
                  {formatMoneyFromCents(invoice.totalAmount ?? invoice.amount)} · {getInvoiceStatusLabel(invoice.status)}
                </Text>
                <Text style={styles.metaText}>Izdano: {formatDate(invoice.issueDate)}</Text>
                <Text style={styles.metaText}>Rok: {formatDate(invoice.dueDate)}</Text>
                <Pressable
                  style={[styles.buttonSecondary, (loading || billing.billingLoading) && styles.buttonDisabled]}
                  disabled={loading || billing.billingLoading}
                  onPress={() => setSelectedInvoice(invoice)}
                >
                  <Text style={styles.buttonText}>Detalji</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, (loading || billing.billingLoading) && styles.buttonDisabled]}
                  disabled={loading || billing.billingLoading}
                  onPress={() => handleDownloadInvoicePdf(invoice)}
                >
                  <Text style={styles.buttonText}>Preuzmi PDF</Text>
                </Pressable>
                {(invoice.status === 'DRAFT' || invoice.status === 'SENT') && (
                  <Pressable
                    style={[styles.buttonSecondary, (loading || billing.billingLoading) && styles.buttonDisabled]}
                    disabled={loading || billing.billingLoading}
                    onPress={() => handleSendInvoiceEmail(invoice)}
                  >
                    <Text style={styles.buttonText}>Pošalji fakturu emailom</Text>
                  </Pressable>
                )}
              </View>
            ))
          )}
        </>
      )}

      {!!billing.checkoutUrl && (
        <View style={styles.profileCard}>
          <Text style={styles.metaText}>Checkout URL:</Text>
          <Text style={styles.profileText}>{billing.checkoutUrl}</Text>
          <Pressable
            style={[styles.button, (loading || billing.billingLoading) && styles.buttonDisabled]}
            disabled={loading || billing.billingLoading}
            onPress={handleOpenCheckout}
          >
            <Text style={styles.buttonText}>Otvori checkout</Text>
          </Pressable>
          <Pressable
            style={[styles.buttonSecondary, (loading || billing.billingLoading) && styles.buttonDisabled]}
            disabled={loading || billing.billingLoading}
            onPress={handleCopyCheckout}
          >
            <Text style={styles.buttonText}>Kopiraj checkout URL</Text>
          </Pressable>
          {!!openUrlError && <Text style={styles.metaText}>{openUrlError}</Text>}
          {!!copyMessage && <Text style={styles.metaText}>{copyMessage}</Text>}
        </View>
      )}

      <Pressable
        style={[styles.buttonSecondary, (loading || billing.billingLoading) && styles.buttonDisabled]}
        disabled={loading || billing.billingLoading}
        onPress={billing.loadBillingData}
      >
        <Text style={styles.buttonText}>Osvjezi billing</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Povijest kredita</Text>
      {showSectionLoading && <Text style={styles.metaText}>Učitavanje povijesti kredita...</Text>}
      <View style={styles.row}>
        <Pressable
          style={[styles.pill, billing.creditHistoryType === 'all' && styles.pillActive]}
          onPress={() => billing.loadCreditHistory('all')}
        >
          <Text>Sve</Text>
        </Pressable>
        <Pressable
          style={[styles.pill, billing.creditHistoryType === 'SUBSCRIPTION' && styles.pillActive]}
          onPress={() => billing.loadCreditHistory('SUBSCRIPTION')}
        >
          <Text>Pretplate</Text>
        </Pressable>
        <Pressable
          style={[styles.pill, billing.creditHistoryType === 'LEAD_PURCHASE' && styles.pillActive]}
          onPress={() => billing.loadCreditHistory('LEAD_PURCHASE')}
        >
          <Text>Leadovi</Text>
        </Pressable>
      </View>
      {billing.creditHistory.length === 0 ? (
        <Text style={styles.emptyText}>Nema kreditnih transakcija.</Text>
      ) : (
        billing.creditHistory.slice(0, 12).map((tx) => (
          <View key={tx.id} style={styles.listItem}>
            <Text style={styles.listTitle}>{getCreditTypeLabel(tx.type)}</Text>
            <Text style={styles.metaText}>
              Iznos: {tx.amount >= 0 ? '+' : ''}
              {tx.amount} · Balance: {tx.balance}
            </Text>
            <Text style={styles.metaText}>{tx.description || '-'}</Text>
            <Text style={styles.metaText}>{formatDate(tx.createdAt)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
