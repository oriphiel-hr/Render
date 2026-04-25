import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getProviderTrustLayer } from '@uslugar/shared';

export default function TrustLayerCard({ profile, user }) {
  const layer = useMemo(() => (profile ? getProviderTrustLayer(profile, user) : null), [profile, user]);
  if (!layer) return null;
  return (
    <View style={s.box}>
      <Text style={s.heading}>Što je jasno provjereno (Uslugar)</Text>
      <Text style={s.headline}>{layer.headline}</Text>
      <Text style={s.subline}>{layer.subline}</Text>
      <Text style={s.count}>
        {layer.verifiedCount} od {layer.totalChecks} signala trenutno ispunjeno
      </Text>
      {layer.items.map((row) => (
        <View key={row.id} style={s.row}>
          <Text style={s.check}>{row.ok ? '☑' : '☐'}</Text>
          <View style={s.rowText}>
            <Text style={s.label}>{row.label}</Text>
            {row.hint ? <Text style={s.hint}>{row.hint}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  heading: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  headline: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginTop: 6 },
  subline: { fontSize: 13, color: '#475569', marginTop: 4 },
  count: { fontSize: 12, color: '#64748b', marginTop: 6, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  check: { fontSize: 16, color: '#0f172a', width: 22, textAlign: 'center' },
  rowText: { flex: 1 },
  label: { fontSize: 13, color: '#1e293b' },
  hint: { fontSize: 11, color: '#64748b', marginTop: 2 }
});
