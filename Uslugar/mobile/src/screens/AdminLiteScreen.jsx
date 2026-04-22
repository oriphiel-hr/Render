import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from '../styles';

function centsToEur(cents) {
  const value = Number(cents || 0) / 100;
  return `${value.toFixed(2)} EUR`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('hr-HR');
}

export default function AdminLiteScreen({
  admin,
  loading
}) {
  if (!admin?.canUseAdminLite) {
    return (
      <View style={styles.profileCard}>
        <Text style={styles.metaText}>Admin Lite je dostupan samo ADMIN korisnicima.</Text>
      </View>
    );
  }

  const kpis = admin.paymentWatch?.kpis || {};
  const lists = admin.paymentWatch?.lists || {};

  return (
    <ScrollView style={styles.contentArea}>
      <Text style={styles.sectionTitle}>Admin Lite - naplata i hitne akcije</Text>
      {(loading || admin.adminLoading) && <Text style={styles.metaText}>Ucitavanje admin podataka...</Text>}

      <View style={styles.listItem}>
        <Text style={styles.listTitle}>Naplata overview</Text>
        <Text style={styles.metaText}>Placeno danas: {centsToEur(kpis.paidTodayAmountCents)}</Text>
        <Text style={styles.metaText}>Placeno 7 dana: {centsToEur(kpis.paid7dAmountCents)}</Text>
        <Text style={styles.metaText}>Neplacene fakture: {kpis.unpaidInvoicesCount ?? 0}</Text>
        <Text style={styles.metaText}>Overdue fakture: {kpis.overdueInvoicesCount ?? 0}</Text>
        <Text style={styles.metaText}>Pretplate PAYMENT_PENDING: {kpis.paymentPendingCount ?? 0}</Text>
        <Text style={styles.metaText}>PAYMENT_PENDING {'>'} 30 min: {kpis.paymentPendingStuckCount ?? 0}</Text>
      </View>

      <Text style={styles.sectionTitle}>Overdue fakture</Text>
      {(lists.overdueInvoices || []).slice(0, 10).map((invoice) => (
        <View key={invoice.id} style={styles.listItem}>
          <Text style={styles.listTitle}>{invoice.invoiceNumber || invoice.id}</Text>
          <Text style={styles.metaText}>{invoice.user?.fullName || invoice.user?.email || invoice.userId}</Text>
          <Text style={styles.metaText}>Iznos: {centsToEur(invoice.totalAmount)}</Text>
          <Text style={styles.metaText}>Dospijece: {formatDate(invoice.dueDate)}</Text>
          <Text style={styles.metaText}>Status: {invoice.status}</Text>
          <Pressable style={styles.button} onPress={() => admin.remindPayment(invoice.id)}>
            <Text style={styles.buttonText}>Posalji podsjetnik</Text>
          </Pressable>
          <Pressable style={styles.buttonSecondary} onPress={() => admin.blockUser(invoice.userId)}>
            <Text style={styles.buttonText}>Blokiraj korisnika</Text>
          </Pressable>
        </View>
      ))}
      {!(lists.overdueInvoices || []).length && <Text style={styles.emptyText}>Nema overdue faktura.</Text>}

      <Text style={styles.sectionTitle}>Provideri koji cekaju odobrenje</Text>
      {(admin.pendingProviders || []).slice(0, 10).map((provider) => (
        <View key={provider.id} style={styles.listItem}>
          <Text style={styles.listTitle}>{provider.user?.fullName || provider.user?.email || provider.userId}</Text>
          <Text style={styles.metaText}>{provider.user?.email}</Text>
          <Text style={styles.metaText}>Status: {provider.approvalStatus || 'WAITING_FOR_APPROVAL'}</Text>
          <View style={styles.row}>
            <Pressable
              style={styles.button}
              onPress={() => admin.updateProviderApproval({ providerId: provider.id, status: 'APPROVED' })}
            >
              <Text style={styles.buttonText}>Approve</Text>
            </Pressable>
            <Pressable
              style={styles.buttonSecondary}
              onPress={() => admin.updateProviderApproval({ providerId: provider.id, status: 'REJECTED', notes: 'Rejected via Admin Lite' })}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </Pressable>
            <Pressable style={styles.buttonSecondary} onPress={() => admin.blockUser(provider.userId)}>
              <Text style={styles.buttonText}>Blokiraj korisnika</Text>
            </Pressable>
          </View>
        </View>
      ))}
      {!(admin.pendingProviders || []).length && <Text style={styles.emptyText}>Nema providera na cekanju.</Text>}

      <Text style={styles.sectionTitle}>Refund zahtjevi</Text>
      {(admin.pendingRefunds || []).slice(0, 10).map((item) => (
        <View key={item.id} style={styles.listItem}>
          <Text style={styles.listTitle}>{item.provider?.fullName || item.provider?.email || item.provider?.id}</Text>
          <Text style={styles.metaText}>Lead: {item.job?.title || item.job?.id || '-'}</Text>
          <Text style={styles.metaText}>Kredita: {item.creditsSpent ?? 0}</Text>
          <Text style={styles.metaText}>Razlog: {item.refundReason || '-'}</Text>
          <Text style={styles.metaText}>Zatrazeno: {formatDate(item.refundRequestedAt)}</Text>
          <View style={styles.row}>
            <Pressable style={styles.button} onPress={() => admin.approveRefund(item.purchaseId || item.id)}>
              <Text style={styles.buttonText}>Odobri refund</Text>
            </Pressable>
            <Pressable style={styles.buttonSecondary} onPress={() => admin.rejectRefund(item.purchaseId || item.id)}>
              <Text style={styles.buttonText}>Odbij refund</Text>
            </Pressable>
            <Pressable style={styles.buttonSecondary} onPress={() => admin.blockUser(item.provider?.id)}>
              <Text style={styles.buttonText}>Blokiraj izvođaca</Text>
            </Pressable>
          </View>
        </View>
      ))}
      {!(admin.pendingRefunds || []).length && <Text style={styles.emptyText}>Nema refund zahtjeva na cekanju.</Text>}

      <Text style={styles.sectionTitle}>Blokirani korisnici</Text>
      {(admin.blockedUsers || []).slice(0, 10).map((blocked) => (
        <View key={blocked.id} style={styles.listItem}>
          <Text style={styles.listTitle}>{blocked.fullName || blocked.email || blocked.id}</Text>
          <Text style={styles.metaText}>{blocked.email || '-'}</Text>
          <Text style={styles.metaText}>Uloga: {blocked.role || '-'}</Text>
          <Text style={styles.metaText}>Blokiran: {formatDate(blocked.blockedAt)}</Text>
          <Text style={styles.metaText}>Razlog: {blocked.blockedReason || '-'}</Text>
          <Pressable style={styles.button} onPress={() => admin.unblockUser(blocked.id)}>
            <Text style={styles.buttonText}>Odblokiraj korisnika</Text>
          </Pressable>
        </View>
      ))}
      {!(admin.blockedUsers || []).length && <Text style={styles.emptyText}>Nema blokiranih korisnika.</Text>}
    </ScrollView>
  );
}
