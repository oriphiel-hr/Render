import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COMPETITIVE_FOCUS_AREAS, NINETY_DAY_ROADMAP } from '@uslugar/shared';

export default function ProductRoadmapTeaser() {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <Pressable onPress={() => setOpen(true)} style={s.collapsed}>
        <Text style={s.collapsedText}>Kamo Uslugar raste (roadmap) — klikni za detalje</Text>
        <Text style={s.chev}>▾</Text>
      </Pressable>
    );
  }
  return (
    <View style={s.box}>
      <Pressable onPress={() => setOpen(false)} style={s.collapseHeader}>
        <Text style={s.title}>Kamo Uslugar raste</Text>
        <Text style={s.chevUp}>▴</Text>
      </Pressable>
      <Text style={s.intro}>
        U webu i ovdje isti su smjerovi: trust, instant booking, garancija, SLA, zadržavanje,
        standardizirani paketi. Ovo nije mali oglasnik — ovo su koraci ispred konkurencije.
      </Text>
      {COMPETITIVE_FOCUS_AREAS.map((b) => (
        <View key={b.title} style={s.block}>
          <Text style={b.mustHave ? s.blockTitleH : s.blockTitle}>
            {b.title}
            {b.mustHave ? ' (najutjecajnije)' : ''}
          </Text>
          {b.bullets.map((line, i) => (
            <Text key={i} style={s.bullet}>
              – {line}
            </Text>
          ))}
        </View>
      ))}
      <View style={s.phasesBox}>
        <Text style={s.phasesTitle}>{NINETY_DAY_ROADMAP.title}</Text>
        {NINETY_DAY_ROADMAP.phases.map((ph) => (
          <Text key={ph.label} style={s.phaseLine}>
            {ph.label}: {ph.text}
          </Text>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  collapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderColor: '#0ea5e9',
    borderRadius: 10,
    backgroundColor: '#e0f2fe',
    marginBottom: 10
  },
  collapsedText: { flex: 1, fontSize: 13, color: '#0c4a6e', fontWeight: '600' },
  chev: { fontSize: 18, color: '#0369a1' },
  chevUp: { fontSize: 18, color: '#0f172a' },
  box: { marginBottom: 8 },
  collapseHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  title: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  intro: { fontSize: 12, color: '#475569', marginBottom: 10, lineHeight: 18 },
  block: { marginBottom: 10, borderWidth: 1, borderColor: '#bae6fd', backgroundColor: '#f0f9ff', borderRadius: 10, padding: 10 },
  blockTitle: { fontSize: 14, fontWeight: '700', color: '#0c4a6e', marginBottom: 4 },
  blockTitleH: { fontSize: 14, fontWeight: '700', color: '#9f1239', marginBottom: 4 },
  bullet: { fontSize: 12, color: '#1e3a4d', lineHeight: 18 },
  phasesBox: { borderWidth: 1, borderColor: '#6ee7b7', backgroundColor: '#ecfdf5', borderRadius: 10, padding: 10, marginTop: 4 },
  phasesTitle: { fontSize: 14, fontWeight: '700', color: '#065f46', marginBottom: 6 },
  phaseLine: { fontSize: 12, color: '#064e3b', marginBottom: 4, lineHeight: 18 }
});
