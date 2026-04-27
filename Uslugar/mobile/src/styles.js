import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f3ee',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fffaf2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 24
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0ea5e9'
  },
  brandMarkText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 20
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827'
  },
  brandSubtitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: '#059669',
    fontWeight: '700'
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    color: '#374151',
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16
  },
  multilineInput: {
    minHeight: 90
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827'
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 6,
    fontSize: 16,
    color: '#4b5563'
  },
  bootstrapText: {
    marginTop: 12,
    color: '#4b5563'
  },
  profileBox: {
    marginTop: 8,
    maxHeight: 260,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10
  },
  profileText: {
    color: '#111827',
    fontSize: 12
  },
  profileCard: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f9fafb'
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  profileMeta: {
    marginTop: 2,
    color: '#4b5563'
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#e5e7eb'
  },
  tabButtonActive: {
    backgroundColor: '#0ea5e9'
  },
  tabButtonText: {
    color: '#1f2937',
    fontSize: 12,
    fontWeight: '600'
  },
  tabButtonTextActive: {
    color: '#fff'
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  tabStatusDot: {
    fontSize: 10,
    lineHeight: 12
  },
  pushLegendRow: {
    marginTop: 8,
    marginBottom: 2
  },
  pushLegendText: {
    fontSize: 11,
    color: '#6b7280'
  },
  pushLegendDot: {
    fontSize: 11
  },
  contentArea: {
    marginTop: 12,
    maxHeight: 360
  },
  listItem: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827'
  },
  metaText: {
    marginTop: 2,
    fontSize: 12,
    color: '#4b5563'
  },
  bodyText: {
    marginTop: 8,
    color: '#111827'
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  emptyText: {
    padding: 12,
    color: '#6b7280'
  },
  loaderInline: {
    marginTop: 10
  },
  syncRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  chatList: {
    marginTop: 10,
    maxHeight: 260
  },
  chatBubble: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#f9fafb'
  },
  warningBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    padding: 8
  },
  warningText: {
    color: '#92400e',
    fontSize: 12
  },
  button: {
    marginTop: 16,
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  buttonSecondary: {
    marginTop: 14,
    backgroundColor: '#0f766e',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  message: {
    marginTop: 12,
    color: '#111827'
  },
  linkButton: {
    marginTop: 10,
    alignSelf: 'flex-start'
  },
  linkButtonText: {
    color: '#0369a1',
    fontWeight: '600'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 16
  },
  modalCard: {
    maxHeight: '80%',
    borderRadius: 14,
    backgroundColor: '#fffaf2',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10
  },
  modalBody: {
    maxHeight: 320
  },
  modalText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 10
  },
  pill: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    color: '#1f2937',
    fontSize: 12
  },
  pillActive: {
    backgroundColor: '#ccfbf1'
  },
  toastSuccess: {
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4'
  },
  toastError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2'
  },
  topToast: {
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  topToastSuccess: {
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4'
  },
  topToastError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2'
  },
  topToastText: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '600'
  },
  sortPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6
  },
  sortPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  sortPillActive: {
    backgroundColor: '#ccfbf1',
    borderColor: '#0f766e'
  },
  sortPillText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  sortPillTextActive: { color: '#0f172a' },
  filterRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  filterLabel: { flex: 1, fontSize: 13, color: '#374151' },
  hintText: { fontSize: 11, color: '#6b7280', marginTop: 4, lineHeight: 16 },
  inlineLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10
  },
  trustLine: { fontSize: 12, color: '#0d9488', fontWeight: '700', marginTop: 4 },
  providersList: {
    marginTop: 8,
    maxHeight: 480,
    width: '100%'
  },
  providersListContent: { paddingBottom: 24 },
  guaranteeBox: {
    marginTop: 8,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d'
  },
  guaranteeTitle: { fontSize: 15, fontWeight: '800', color: '#78350f' },
  guaranteeText: { fontSize: 12, color: '#92400e', marginTop: 4, lineHeight: 18 }
});
