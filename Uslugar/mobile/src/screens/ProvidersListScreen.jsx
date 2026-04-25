import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';
import { getProviderTrustLayer, TRUST_CHECK_TOTAL } from '@uslugar/shared';
import { styles } from '../styles';

function SortPills({ value, onChange }) {
  const options = [
    { key: 'rating', label: 'Ocjena' },
    { key: 'responseTime', label: 'SLA' },
    { key: 'badges', label: 'Badge' },
    { key: 'recent', label: 'Novo' }
  ];
  return (
    <View style={styles.sortPillRow}>
      {options.map((o) => (
        <Pressable
          key={o.key}
          onPress={() => onChange(o.key)}
          style={[styles.sortPill, value === o.key && styles.sortPillActive]}
        >
          <Text style={[styles.sortPillText, value === o.key && styles.sortPillTextActive]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function ProvidersListScreen({
  providers,
  loading,
  filters,
  setFilters,
  searchInput,
  setSearchInput,
  resetFilters,
  onReload,
  growth
}) {
  const ListHeader = (
    <View>
      <Text style={styles.label}>Pretraga (isti API kao web)</Text>
      <TextInput
        style={styles.input}
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Ime, opis, specijalizacije…"
        placeholderTextColor="#9ca3af"
      />
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Samo „verificirani” (kao web filter)</Text>
        <Switch
          value={filters.verified}
          onValueChange={(v) => setFilters((f) => ({ ...f, verified: v }))}
        />
      </View>
      <Text style={styles.hintText}>
        Isto kao „Samo verificirani ✓” na webu: uključuje poslovnu provjeru ili identitet. Broj
        Povjerenje/{TRUST_CHECK_TOTAL} širji je (SMS, licence, police…).
      </Text>
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Ima provjerenu licencu</Text>
        <Switch
          value={filters.hasLicenses}
          onValueChange={(v) => setFilters((f) => ({ ...f, hasLicenses: v }))}
        />
      </View>
      <Text style={styles.label}>Sortiranje</Text>
      <SortPills value={filters.sortBy} onChange={(sortBy) => setFilters((f) => ({ ...f, sortBy }))} />
      <Pressable style={styles.buttonSecondary} onPress={resetFilters}>
        <Text style={styles.buttonText}>Resetiraj filtere</Text>
      </Pressable>
      {loading && (
        <View style={styles.inlineLoader}>
          <ActivityIndicator />
          <Text style={styles.metaText}>Učitavam pružatelje…</Text>
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={providers}
      keyExtractor={(item) => String(item.id || item.userId || item.user?.id)}
      style={styles.providersList}
      contentContainerStyle={styles.providersListContent}
      ListHeaderComponent={ListHeader}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onReload} />}
      ListEmptyComponent={
        !loading ? <Text style={styles.emptyText}>Nema pružatelja za zadane filtere.</Text> : null
      }
      renderItem={({ item }) => {
        const layer = getProviderTrustLayer(item, item.user);
        return (
          <View style={styles.listItem}>
            <Text style={styles.listTitle}>{item.user?.fullName || 'Pružatelj'}</Text>
            <Text style={styles.metaText}>
              {item.city || item.user?.city || 'Lokacija n/a'} · Ocjena {(item.ratingAvg ?? 0).toFixed(1)} (
              {item.ratingCount ?? 0})
            </Text>
            <Text style={styles.trustLine}>
              Povjerenje: {layer.verifiedCount}/{layer.totalChecks}
            </Text>
            {item.etaFirstOfferHint != null && (
              <Text style={styles.metaText}>Prva ponuda ~{item.etaFirstOfferHint} min (procjena kategorije)</Text>
            )}
            {item.priceGuides?.length > 0 && (
              <Text style={styles.metaText} numberOfLines={2}>
                Cijena (od–do):{' '}
                {item.priceGuides
                  .slice(0, 2)
                  .map((g) => `${g.name} ${g.min}–${g.max}€`)
                  .join(' · ')}
              </Text>
            )}
            {item.avgResponseTimeMinutes > 0 && (
              <Text style={styles.metaText}>
                Odgovor u ~{Math.round(item.avgResponseTimeMinutes)} min (prosjek)
              </Text>
            )}
            {growth && item.user?.id ? (
              <View style={styles.row}>
                <Pressable
                  style={styles.pill}
                  onPress={() => growth.toggleFavorite(item.user.id)}
                >
                  <Text style={styles.pill}>
                    {growth.isFavorite(item.user.id) ? '★ U favoritima' : '☆ Favorit'}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.pill}
                  onPress={() => {
                    const cat = item.categories?.find((c) => c.supportsInstantBooking);
                    if (!cat) {
                      Alert.alert('Trenutni termin', 'Nema kategorije s uključenim brzim terminom za ovog pružatelja.');
                      return;
                    }
                    const start = new Date();
                    start.setDate(start.getDate() + 1);
                    start.setHours(10, 0, 0, 0);
                    growth.submitInstant({
                      providerId: item.user.id,
                      categoryId: cat.id,
                      requestedStartIso: start.toISOString(),
                      message: 'Zatraženo iz mobilne tražilice'
                    });
                  }}
                >
                  <Text style={styles.pill}>Brzi termin</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        );
      }}
    />
  );
}
