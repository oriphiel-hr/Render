import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { styles } from '../styles';
import ChatRoomsScreen from './ChatRoomsScreen';
import ChatRoomScreen from './ChatRoomScreen';
import BillingScreen from './BillingScreen';
import TopToast from '../components/TopToast';
import BrandHeader from '../components/BrandHeader';
import AdminLiteScreen from './AdminLiteScreen';
import TrustLayerCard from '../components/TrustLayerCard';
import ProductRoadmapTeaser from '../components/ProductRoadmapTeaser';
import ProvidersListScreen from './ProvidersListScreen';

function formatDate(dateInput) {
  if (!dateInput) return '-';
  return new Date(dateInput).toLocaleString('hr-HR');
}

function getPushStatusColor(push) {
  if (!push?.expoPushToken) return '#9ca3af'; // sivo: nema tokena
  return push?.isRegisteredOnBackend ? '#10b981' : '#f59e0b'; // zeleno/narancasto
}

function inferToastType(message) {
  const value = String(message || '').toLowerCase();
  const errorHints = [
    'greška',
    'greska',
    'ne mogu',
    'nije',
    'istekla',
    'error',
    'failed',
    'unauthorized',
    'forbidden'
  ];
  return errorHints.some((hint) => value.includes(hint)) ? 'error' : 'success';
}

export default function ProtectedShell({
  user,
  loading,
  message,
  activeTab,
  setActiveTab,
  selectedJob,
  setSelectedJob,
  jobs,
  myJobs,
  myOffers,
  loadBaseData,
  openJobDetails,
  jobOffers,
  offerAmount,
  setOfferAmount,
  offerDays,
  setOfferDays,
  offerMessage,
  setOfferMessage,
  handleSubmitOffer,
  chat,
  push,
  billing,
  admin,
  publicProviders = null,
  showProvidersTab = false,
  growth = null,
  handleRefreshProfile,
  handleLogout
}) {
  const isProvider = user.role === 'PROVIDER';
  const isAdmin = user.role === 'ADMIN';

  const [clientInstants, setClientInstants] = useState([]);
  const [instantLoading, setInstantLoading] = useState(false);

  const loadClientInstants = useCallback(async () => {
    if (!growth?.listInstantAsClient) return;
    setInstantLoading(true);
    try {
      const data = await growth.listInstantAsClient();
      setClientInstants(Array.isArray(data) ? data : []);
    } catch {
      setClientInstants([]);
    } finally {
      setInstantLoading(false);
    }
  }, [growth]);

  useEffect(() => {
    if (activeTab === 'profile') {
      push.refreshPushSubscriptions?.();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'profile') {
      loadClientInstants();
    }
  }, [activeTab, loadClientInstants]);

  useEffect(() => {
    if (activeTab === 'providers' && growth?.loadFavorites) {
      growth.loadFavorites();
    }
  }, [activeTab, growth]);

  useEffect(() => {
    if (isAdmin && !['admin', 'billing', 'chat', 'profile'].includes(activeTab)) {
      setActiveTab('admin');
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    if (showProvidersTab === false && activeTab === 'providers') {
      setActiveTab('jobs');
    }
  }, [showProvidersTab, activeTab, setActiveTab]);

  const tabs = isAdmin
    ? [
        { key: 'admin', label: 'Admin Lite' },
        { key: 'billing', label: 'Naplata' },
        { key: 'chat', label: 'Chat' },
        { key: 'profile', label: 'Profil', showPushStatus: true }
      ]
    : isProvider
    ? [
        { key: 'jobs', label: 'Poslovi' },
        ...(showProvidersTab ? [{ key: 'providers', label: 'Pružatelji' }] : []),
        { key: 'my-offers', label: 'Moje ponude' },
        { key: 'billing', label: 'Naplata' },
        { key: 'chat', label: 'Chat' },
        { key: 'profile', label: 'Profil', showPushStatus: true }
      ]
    : [
        { key: 'jobs', label: 'Poslovi' },
        ...(showProvidersTab ? [{ key: 'providers', label: 'Pružatelji' }] : []),
        { key: 'my-jobs', label: 'Moji poslovi' },
        { key: 'billing', label: 'Naplata' },
        { key: 'chat', label: 'Chat' },
        { key: 'profile', label: 'Profil', showPushStatus: true }
      ];

  return (
    <View style={styles.card}>
      <TopToast message={message} type={inferToastType(message)} visible={!!message} />
      <BrandHeader />
      <Text style={styles.subtitle}>MVP shell ({isAdmin ? 'ADMIN' : isProvider ? 'PROVIDER' : 'USER'})</Text>

      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => {
              setActiveTab(tab.key);
              setSelectedJob(null);
            }}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
          >
            <View style={styles.tabLabelRow}>
              <Text style={[styles.tabButtonText, activeTab === tab.key && styles.tabButtonTextActive]}>
                {tab.label}
              </Text>
              {tab.showPushStatus && (
                <Text style={[styles.tabStatusDot, { color: getPushStatusColor(push) }]}>●</Text>
              )}
            </View>
          </Pressable>
        ))}
      </View>
      <View style={styles.pushLegendRow}>
        <Text style={styles.pushLegendText}>
          Push status:
          <Text style={[styles.pushLegendDot, { color: '#9ca3af' }]}> ●</Text> nema tokena
          <Text style={[styles.pushLegendDot, { color: '#f59e0b' }]}> ●</Text> čeka backend
          <Text style={[styles.pushLegendDot, { color: '#10b981' }]}> ●</Text> aktivno
        </Text>
      </View>

      {loading && (
        <View style={styles.loaderInline}>
          <ActivityIndicator />
        </View>
      )}

      {activeTab === 'chat' ? (
        chat.selectedRoom ? (
          <ChatRoomScreen
            room={chat.selectedRoom}
            messages={chat.messages}
            loading={loading}
            sending={chat.sending}
            threadLocked={chat.threadLocked}
            lockReason={chat.lockReason}
            chatInput={chat.chatInput}
            setChatInput={chat.setChatInput}
            onBack={chat.resetRoom}
            onRefresh={() => chat.loadMessages(chat.selectedRoom?.id)}
            onSendMessage={chat.sendMessage}
            onSendImage={chat.pickAndSendImage}
          />
        ) : (
          <ChatRoomsScreen
            rooms={chat.rooms}
            loading={loading}
            onRefresh={chat.loadRooms}
            onOpenRoom={chat.openRoom}
          />
        )
      ) : selectedJob ? (
        <ScrollView style={styles.contentArea}>
          <Text style={styles.sectionTitle}>{selectedJob.title}</Text>
          <Text style={styles.metaText}>{selectedJob.city || 'Grad nije naveden'}</Text>
          <Text style={styles.bodyText}>{selectedJob.description}</Text>
          <Text style={styles.metaText}>Kreirano: {formatDate(selectedJob.createdAt)}</Text>
          <Pressable style={styles.buttonSecondary} onPress={() => setSelectedJob(null)}>
            <Text style={styles.buttonText}>Natrag na listu</Text>
          </Pressable>

          {isProvider && (
            <>
              <Text style={styles.sectionTitle}>Posalji ponudu</Text>
              <TextInput
                style={styles.input}
                value={offerAmount}
                onChangeText={setOfferAmount}
                keyboardType="numeric"
                placeholder="Iznos (EUR)"
              />
              <TextInput
                style={styles.input}
                value={offerDays}
                onChangeText={setOfferDays}
                keyboardType="numeric"
                placeholder="Procjena dana (opcionalno)"
              />
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={offerMessage}
                onChangeText={setOfferMessage}
                placeholder="Poruka ponude"
                multiline
              />
              <Pressable style={styles.button} onPress={handleSubmitOffer} disabled={loading}>
                <Text style={styles.buttonText}>Posalji ponudu</Text>
              </Pressable>

              <Text style={styles.sectionTitle}>Postojece ponude ({jobOffers.length})</Text>
              {jobOffers.map((offer) => (
                <View key={offer.id} style={styles.listItem}>
                  <Text style={styles.listTitle}>{offer.user?.fullName || offer.user?.email || offer.userId}</Text>
                  <Text style={styles.metaText}>
                    {offer.amount} EUR · {offer.status} · score {offer.qualityScore ?? '-'}
                  </Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      ) : activeTab === 'admin' ? (
        <AdminLiteScreen
          admin={admin}
          loading={loading}
        />
      ) : activeTab === 'providers' && showProvidersTab && publicProviders ? (
        <ProvidersListScreen
          providers={publicProviders.providers}
          loading={publicProviders.loading}
          filters={publicProviders.filters}
          setFilters={publicProviders.setFilters}
          searchInput={publicProviders.searchInput}
          setSearchInput={publicProviders.setSearchInput}
          resetFilters={publicProviders.resetFilters}
          onReload={publicProviders.reload}
          growth={growth}
        />
      ) : activeTab === 'jobs' ? (
        <FlatList
          style={styles.contentArea}
          data={jobs}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={loadBaseData}
          ListEmptyComponent={<Text style={styles.emptyText}>Nema poslova za prikaz.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.listItem} onPress={() => openJobDetails(item)}>
              <Text style={styles.listTitle}>{item.title}</Text>
              <Text style={styles.metaText}>
                {item.city || 'Bez grada'} · {item.status} · {item.leadMode || 'EXCLUSIVE'}
              </Text>
            </Pressable>
          )}
        />
      ) : activeTab === 'my-jobs' ? (
        <FlatList
          style={styles.contentArea}
          data={myJobs}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={loadBaseData}
          ListEmptyComponent={<Text style={styles.emptyText}>Nemate jos objavljenih poslova.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.listItem} onPress={() => openJobDetails(item)}>
              <Text style={styles.listTitle}>{item.title}</Text>
              <Text style={styles.metaText}>status {item.status}</Text>
            </Pressable>
          )}
        />
      ) : activeTab === 'my-offers' ? (
        <FlatList
          style={styles.contentArea}
          data={myOffers}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={loadBaseData}
          ListEmptyComponent={<Text style={styles.emptyText}>Nemate jos poslanih ponuda.</Text>}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.listTitle}>{item.job?.title || 'Posao'}</Text>
              <Text style={styles.metaText}>
                {item.amount} EUR · {item.status} · {formatDate(item.createdAt)}
              </Text>
            </View>
          )}
        />
      ) : activeTab === 'billing' ? (
        <BillingScreen
          billing={billing}
          loading={loading}
        />
      ) : (
        <ScrollView style={styles.contentArea}>
          <Text style={styles.label}>Prijavljeni korisnik</Text>
          <View style={styles.profileCard}>
            <Text style={styles.profileName}>{user.fullName || '-'}</Text>
            <Text style={styles.profileMeta}>{user.email || '-'}</Text>
            <View style={styles.row}>
              <Text style={styles.pill}>Uloga: {user.role || '-'}</Text>
              <Text style={styles.pill}>ID: {String(user.id || '-')}</Text>
            </View>
          </View>
          {user.role === 'PROVIDER' && user.providerProfile ? (
            <TrustLayerCard profile={user.providerProfile} user={user} />
          ) : null}
          {growth?.guarantee ? (
            <View style={styles.guaranteeBox}>
              <Text style={styles.guaranteeTitle}>{growth.guarantee.name || 'Uslugar Guarantee'}</Text>
              <Text style={styles.guaranteeText}>{growth.guarantee.summary}</Text>
            </View>
          ) : null}
          {growth?.listInstantAsClient ? (
            <View style={styles.profileCard}>
              <Text style={styles.sectionTitle}>Moji brzi termini (kao klijent)</Text>
              <Text style={styles.metaText}>
                Isti popis kao na webu (User profil) — poslani zahtjevi, uključivo ako ste pružatelj
                tražili tuđu uslugu.
              </Text>
              {instantLoading ? (
                <ActivityIndicator style={{ marginVertical: 8 }} />
              ) : null}
              {clientInstants.length === 0 && !instantLoading ? (
                <Text style={styles.metaText}>Nemate poslanih zahtjeva.</Text>
              ) : null}
              {clientInstants.map((b) => {
                const canCancel = ['PENDING', 'SLOT_BOUND', 'COUNTER_PROPOSED'].includes(b.status);
                const canAcceptAlt = b.status === 'COUNTER_PROPOSED' && b.counterOfferStart;
                return (
                  <View
                    key={b.id}
                    style={{
                      marginTop: 12,
                      paddingTop: 10,
                      borderTopWidth: 1,
                      borderTopColor: '#e5e7eb'
                    }}
                  >
                    <Text style={styles.listTitle}>{b.provider?.fullName || 'Pružatelj'}</Text>
                    <Text style={styles.metaText}>
                      {b.category?.name || 'Kategorija'} · {b.status}
                    </Text>
                    <Text style={styles.metaText}>
                      Termin: {formatDate(b.requestedStart)}
                    </Text>
                    {b.counterOfferStart ? (
                      <Text style={[styles.metaText, { color: '#b45309' }]}>
                        Pružatelj predlaže: {formatDate(b.counterOfferStart)}
                      </Text>
                    ) : null}
                    {b.message ? <Text style={styles.metaText}>„{b.message}”</Text> : null}
                    <View style={styles.row}>
                      {canCancel && growth.patchInstant ? (
                        <Pressable
                          style={[styles.buttonSecondary, { flex: 1, marginRight: 4 }]}
                          onPress={() =>
                            Alert.alert('Odustanak', 'Odustati od ovog zahtjeva?', [
                              { text: 'Ne', style: 'cancel' },
                              {
                                text: 'Da',
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    await growth.patchInstant(b.id, 'cancel');
                                    await loadClientInstants();
                                  } catch (e) {
                                    Alert.alert('Greška', e?.message || 'Nije uspjelo');
                                  }
                                }
                              }
                            ])
                          }
                        >
                          <Text style={styles.buttonText}>Odustani</Text>
                        </Pressable>
                      ) : null}
                      {canAcceptAlt && growth.patchInstant ? (
                        <Pressable
                          style={[styles.button, { flex: 1, marginLeft: 4 }]}
                          onPress={async () => {
                            try {
                              await growth.patchInstant(b.id, 'accept_counter');
                              await loadClientInstants();
                            } catch (e) {
                              Alert.alert('Greška', e?.message || 'Nije uspjelo');
                            }
                          }}
                        >
                          <Text style={styles.buttonText}>Prihvati alternativu</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                );
              })}
              <Pressable
                style={[styles.buttonSecondary, { marginTop: 12 }]}
                onPress={loadClientInstants}
                disabled={instantLoading}
              >
                <Text style={styles.buttonText}>Osvježi brze termine</Text>
              </Pressable>
            </View>
          ) : null}
          <Text style={styles.label}>Kamo Uslugar raste</Text>
          <ProductRoadmapTeaser />
          {typeof __DEV__ !== 'undefined' && __DEV__ ? (
            <>
              <Text style={styles.label}>Sirovi profil (debug)</Text>
              <ScrollView style={styles.profileBox}>
                <Text style={styles.profileText}>{JSON.stringify(user.providerProfile || {}, null, 2)}</Text>
              </ScrollView>
            </>
          ) : null}
          <Pressable style={styles.button} onPress={handleRefreshProfile} disabled={loading}>
            <Text style={styles.buttonText}>Osvjezi profil</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>Push notifikacije (mobile)</Text>
          <View style={styles.profileCard}>
            <View style={styles.row}>
              <Text style={styles.pill}>Status: {push.expoPushToken ? 'token lokalno' : 'bez tokena'}</Text>
              <Text style={styles.pill}>
                Backend: {push.isRegisteredOnBackend ? 'registriran' : 'nije registriran'}
              </Text>
            </View>
            <Text style={styles.metaText}>Dozvola: {push.permissionStatus}</Text>
            <Text style={styles.metaText}>Backend pretplate: {push.subscriptionCount}</Text>
            <Text style={styles.metaText}>
              Zadnja provjera: {push.lastSyncAt ? formatDate(push.lastSyncAt) : '-'}
            </Text>
            {push.syncingPush && (
              <View style={styles.syncRow}>
                <ActivityIndicator size="small" />
                <Text style={styles.metaText}>Sync u tijeku...</Text>
              </View>
            )}
            <Text style={styles.metaText}>
              Registriran token: {push.isRegisteredOnBackend ? 'da' : 'ne'}
            </Text>
            <Text style={styles.metaText}>
              Token: {push.expoPushToken ? `${push.expoPushToken.slice(0, 24)}...` : 'nije registriran'}
            </Text>
            <Pressable
              style={[styles.button, (loading || push.loadingPush) && styles.buttonDisabled]}
              disabled={loading || push.loadingPush}
              onPress={push.requestPushPermission}
            >
              <Text style={styles.buttonText}>Omogući push</Text>
            </Pressable>
            <Pressable
              style={[styles.buttonSecondary, (loading || push.loadingPush) && styles.buttonDisabled]}
              disabled={loading || push.loadingPush || !push.expoPushToken}
              onPress={push.disablePushPermission}
            >
              <Text style={styles.buttonText}>Odjavi push token</Text>
            </Pressable>
            <Pressable
              style={[styles.button, (loading || push.loadingPush) && styles.buttonDisabled]}
              disabled={loading || push.loadingPush || !push.expoPushToken}
              onPress={push.sendTestPush}
            >
              <Text style={styles.buttonText}>Pošalji test push</Text>
            </Pressable>
            <Pressable
              style={[styles.buttonSecondary, (loading || push.loadingPush) && styles.buttonDisabled]}
              disabled={loading || push.loadingPush}
              onPress={push.refreshPushSubscriptions}
            >
              <Text style={styles.buttonText}>Osvježi push status</Text>
            </Pressable>
            <Text style={styles.metaText}>
              Mobile push koristi Expo token i sprema ga na backend kroz push-notifications API.
            </Text>
            <Text style={styles.metaText}>
              Ako backend izgubi token, app pokušava automatski re-subscribe (cooldown 30s).
            </Text>
          </View>
        </ScrollView>
      )}

      <Pressable style={styles.buttonSecondary} onPress={handleLogout}>
        <Text style={styles.buttonText}>Odjava</Text>
      </Pressable>
    </View>
  );
}
