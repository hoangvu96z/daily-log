import { StyleSheet, Appearance } from 'react-native';
import { useJournalStore } from './memory/store';
import { palette } from './theme/palette';

const lightPalette = {
  background: '#f6faff',
  slate: '#ffffff',
  primary: '#031f41',
  secondary: '#586158',
  tertiary: '#002425',
  onSurface: '#001e2e',
  onSurfaceVariant: '#44474e',
  outline: '#c4c6cf',
  outlineVariant: '#e1e3eb',
  primaryContainer: '#dff0ff',
  secondaryContainer: '#dce5d9',
  white: '#FFFFFF',
  black: '#000000',
  glow: 'rgba(3, 31, 65, 0.1)',
  red: '#ba1a1a',

  green: '#031f41',
  greenSoft: '#dff0ff',
  ink: '#001e2e',
  muted: '#44474e',
  paper: '#f6faff',
  cream: '#ffffff',
  mint: '#eaf5ff',
  blue: '#485f84',
  line: '#c4c6cf',
  coral: '#002425',
};

const darkPalette = {
  background: '#0B132B',
  slate: '#1C2541',
  primary: '#5BC0BE',
  secondary: '#4A607C',
  tertiary: '#924B29',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#dbe1ff',
  outline: 'rgba(255, 255, 255, 0.1)',
  outlineVariant: 'rgba(255, 255, 255, 0.2)',
  primaryContainer: 'rgba(91, 192, 190, 0.15)',
  secondaryContainer: 'rgba(74, 96, 124, 0.15)',
  white: '#FFFFFF',
  black: '#000000',
  glow: 'rgba(91, 192, 190, 0.4)',
  red: '#BA1A1A',

  green: '#5BC0BE',
  greenSoft: 'rgba(91, 192, 190, 0.15)',
  ink: '#FFFFFF',
  muted: '#dbe1ff',
  paper: '#0B132B',
  cream: 'rgba(28, 37, 65, 0.7)',
  mint: 'rgba(91, 192, 190, 0.08)',
  blue: '#4A607C',
  line: 'rgba(255, 255, 255, 0.08)',
  coral: '#924B29',
};

// === LIGHT STYLE SHEET ===
const lightStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: lightPalette.background,
  },
  phone: {
    flex: 1,
    backgroundColor: lightPalette.background,
  },
  loadingBanner: {
    backgroundColor: lightPalette.primaryContainer,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    right: 16,
    top: 12,
    zIndex: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: lightPalette.primary,
  },
  loadingText: {
    color: lightPalette.primary,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  screenContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  screenTitle: {
    color: lightPalette.primary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.02,
  },
  screenSubtitle: {
    color: lightPalette.onSurfaceVariant,
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(3, 31, 65, 0.08)',
    borderTopColor: 'rgba(3, 31, 65, 0.12)',
    shadowColor: 'rgba(29, 53, 87, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardKicker: {
    color: lightPalette.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  heroTitle: {
    color: lightPalette.onSurface,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
    marginTop: 10,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  eventChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(3, 31, 65, 0.06)',
    borderColor: 'rgba(3, 31, 65, 0.12)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(3, 31, 65, 0.1)',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  eventChipText: {
    color: lightPalette.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: lightPalette.primary,
    borderRadius: 16,
    flex: 1,
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: lightPalette.white,
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: lightPalette.outline,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 15,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: lightPalette.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  privacyStrip: {
    alignItems: 'center',
    backgroundColor: 'rgba(3, 31, 65, 0.05)',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(3, 31, 65, 0.08)',
  },
  privacyText: {
    color: lightPalette.onSurfaceVariant,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  tabBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    height: 84,
    left: 0,
    paddingHorizontal: 10,
    position: 'absolute',
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  tabItemBeforeFab: {
    marginRight: 34,
  },
  tabItemAfterFab: {
    marginLeft: 34,
  },
  activeDot: {
    backgroundColor: lightPalette.primary,
    borderRadius: 3,
    height: 6,
    marginBottom: 2,
    width: 6,
  },
  tabLabel: {
    color: lightPalette.outline,
    fontSize: 11,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: lightPalette.primary,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: lightPalette.primary,
    borderColor: lightPalette.background,
    borderRadius: 34,
    borderWidth: 5,
    bottom: 48,
    height: 68,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -34,
    position: 'absolute',
    width: 68,
    shadowColor: 'rgba(29, 53, 87, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  dayHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dateNav: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(3, 31, 65, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconButtonSpacer: {
    height: 44,
    width: 44,
  },
  timeline: {
    gap: 0,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(3, 31, 65, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  emptyTitle: {
    color: lightPalette.primary,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 12,
  },
  emptyText: {
    color: lightPalette.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    textAlign: 'center',
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 14,
  },
  timelineRail: {
    alignItems: 'center',
    width: 54,
  },
  timeText: {
    color: lightPalette.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  railDot: {
    backgroundColor: lightPalette.primary,
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  railLine: {
    backgroundColor: 'rgba(3, 31, 65, 0.12)',
    flex: 1,
    minHeight: 128,
    width: 2,
  },
  entryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(3, 31, 65, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    marginBottom: 20,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: 'rgba(29, 53, 87, 0.03)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  suggestedCard: {
    borderColor: lightPalette.primary,
    borderStyle: 'dashed',
    opacity: 0.85,
  },
  entryTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  entryTime: {
    color: lightPalette.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  moodChip: {
    backgroundColor: lightPalette.primaryContainer,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  moodText: {
    color: lightPalette.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  suggestedLabel: {
    color: lightPalette.tertiary,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 'auto',
  },
  entryText: {
    color: lightPalette.onSurface,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: lightPalette.secondaryContainer,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    height: 96,
    justifyContent: 'center',
    marginTop: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  imagePlaceholderLarge: {
    height: 190,
  },
  imagePlaceholderText: {
    color: lightPalette.primary,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  miniActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  miniPrimary: {
    backgroundColor: lightPalette.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  miniPrimaryText: {
    color: lightPalette.white,
    fontSize: 13,
    fontWeight: '800',
  },
  miniSecondary: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  miniSecondaryText: {
    color: lightPalette.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  yearAgoCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(3, 31, 65, 0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: 'rgba(29, 53, 87, 0.03)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  yearAgoText: {
    flex: 1,
  },
  sectionKicker: {
    color: lightPalette.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  yearAgoTitle: {
    color: lightPalette.onSurface,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 29,
    marginTop: 6,
  },
  stackThumbs: {
    height: 74,
    width: 98,
  },
  stackThumb: {
    borderColor: lightPalette.white,
    borderRadius: 12,
    borderWidth: 3,
    height: 58,
    position: 'absolute',
    width: 58,
  },
  stackThumbOffset: {
    left: 20,
    top: 8,
  },
  stackThumbLast: {
    left: 40,
    top: 16,
  },
  sectionTitle: {
    color: lightPalette.primary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  reelCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(3, 31, 65, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    padding: 12,
  },
  videoThumb: {
    alignItems: 'center',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    justifyContent: 'center',
    width: 104,
    backgroundColor: lightPalette.secondaryContainer,
  },
  reelMeta: {
    flex: 1,
  },
  reelTitle: {
    color: lightPalette.onSurface,
    fontSize: 16,
    fontWeight: '800',
  },
  reelDate: {
    color: lightPalette.onSurfaceVariant,
    fontSize: 13,
    marginTop: 4,
  },
  countChip: {
    backgroundColor: lightPalette.primaryContainer,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  countChipText: {
    color: lightPalette.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(3, 31, 65, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    padding: 12,
  },
  settingsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
  },
  settingsIcon: {
    alignItems: 'center',
    backgroundColor: lightPalette.primaryContainer,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  settingsIconDanger: {
    backgroundColor: 'rgba(186, 26, 26, 0.1)',
  },
  settingsTextBox: {
    flex: 1,
  },
  settingsTitle: {
    color: lightPalette.onSurface,
    fontSize: 15,
    fontWeight: '800',
  },
  settingsSubtitle: {
    color: lightPalette.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  dangerText: {
    color: lightPalette.red,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  footerLinks: {
    gap: 10,
    paddingBottom: 20,
  },
  footerLink: {
    color: lightPalette.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  modalScrim: {
    backgroundColor: 'rgba(3, 31, 65, 0.35)',
    flex: 1,
  },
  sheet: {
    backgroundColor: lightPalette.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    bottom: 0,
    left: 0,
    minHeight: '55%',
    padding: 22,
    position: 'absolute',
    right: 0,
    borderWidth: 1,
    borderColor: 'rgba(3, 31, 65, 0.08)',
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    height: 4,
    marginBottom: 20,
    width: 46,
  },
  sheetTitle: {
    color: lightPalette.primary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.02,
  },
  sheetAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(3, 31, 65, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    padding: 16,
  },
  sheetIcon: {
    alignItems: 'center',
    backgroundColor: lightPalette.primaryContainer,
    borderRadius: 16,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  sheetActionText: {
    flex: 1,
  },
  sheetActionTitle: {
    color: lightPalette.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  sheetActionSubtitle: {
    color: lightPalette.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  composerRoot: {
    backgroundColor: lightPalette.background,
    flex: 1,
  },
  composerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  composerTitle: {
    color: lightPalette.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  composerContent: {
    padding: 22,
    paddingBottom: 110,
  },
  addPhotoBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderColor: 'rgba(3, 31, 65, 0.2)',
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    gap: 8,
    height: 170,
    justifyContent: 'center',
  },
  addPhotoText: {
    color: lightPalette.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  metaBox: {
    alignItems: 'center',
    backgroundColor: lightPalette.primaryContainer,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(3, 31, 65, 0.1)',
  },
  metaText: {
    color: lightPalette.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  fieldLabel: {
    color: lightPalette.primary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 24,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  moodOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(3, 31, 65, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  moodOptionSelected: {
    backgroundColor: lightPalette.primaryContainer,
    borderColor: lightPalette.primary,
  },
  moodEmoji: {
    fontSize: 20,
  },
  moodOptionText: {
    color: lightPalette.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '800',
  },
  moodOptionTextSelected: {
    color: lightPalette.primary,
  },
  noteInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(3, 31, 65, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    color: lightPalette.onSurface,
    fontSize: 15,
    minHeight: 118,
    padding: 14,
    textAlignVertical: 'top',
  },
  aiCard: {
    backgroundColor: lightPalette.primaryContainer,
    borderColor: 'rgba(3, 31, 65, 0.15)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 18,
    padding: 16,
  },
  aiHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginBottom: 9,
  },
  aiTitle: {
    color: lightPalette.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  aiText: {
    color: lightPalette.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 22,
  },
  composerFooter: {
    backgroundColor: lightPalette.background,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: 18,
    position: 'absolute',
    right: 0,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: lightPalette.primary,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: lightPalette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  saveButtonText: {
    color: lightPalette.white,
    fontSize: 16,
    fontWeight: '800',
  },
  dialogScrim: {
    alignItems: 'center',
    backgroundColor: 'rgba(3, 31, 65, 0.35)',
    flex: 1,
    justifyContent: 'center',
    padding: 22,
  },
  dialogCard: {
    backgroundColor: lightPalette.slate,
    borderRadius: 24,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  dialogTitle: {
    color: lightPalette.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  dialogText: {
    color: lightPalette.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  confirmInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    color: lightPalette.onSurface,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 14,
    padding: 12,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  dialogSecondary: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  dialogSecondaryText: {
    color: lightPalette.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  dialogDanger: {
    backgroundColor: lightPalette.red,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  dialogDangerText: {
    color: lightPalette.white,
    fontSize: 14,
    fontWeight: '800',
  },
  calendarEventList: {
    maxHeight: 280,
    marginTop: 16,
  },
  calendarEventListContent: {
    gap: 10,
  },
  calendarEventRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderColor: 'rgba(3, 31, 65, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  calendarEventIcon: {
    alignItems: 'center',
    backgroundColor: lightPalette.primaryContainer,
    borderRadius: 14,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  calendarEventTextBox: {
    flex: 1,
  },
  calendarEventTitle: {
    color: lightPalette.onSurface,
    fontSize: 15,
    fontWeight: '800',
  },
  calendarEventMeta: {
    color: lightPalette.onSurfaceVariant,
    fontSize: 12,
    marginTop: 3,
  },
  themeOptionList: {
    gap: 10,
    marginBottom: 16,
    marginTop: 16,
  },
  themeOption: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
    borderColor: 'rgba(3, 31, 65, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  themeOptionActive: {
    backgroundColor: lightPalette.primaryContainer,
    borderColor: lightPalette.primary,
  },
  themeOptionText: {
    color: lightPalette.onSurface,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  moodCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    marginTop: 16,
  },
  moodDayCell: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    width: '30.7%',
  },
  moodDayName: {
    color: lightPalette.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  moodDateText: {
    color: lightPalette.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },
  moodDotLarge: {
    backgroundColor: lightPalette.primary,
    borderRadius: 13,
    height: 26,
    marginTop: 10,
    width: 26,
  },
  moodCellText: {
    color: lightPalette.primary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  moodCountText: {
    color: lightPalette.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },
  luminousBlob1: { opacity: 0 } as any,
  luminousBlob2: { opacity: 0 } as any,
  luminousBlob3: { opacity: 0 } as any,
});

// === DARK STYLE SHEET ===
const darkStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: darkPalette.background,
  },
  phone: {
    flex: 1,
    backgroundColor: darkPalette.background,
  },
  loadingBanner: {
    backgroundColor: darkPalette.primaryContainer,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    right: 16,
    top: 12,
    zIndex: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkPalette.primary,
  },
  loadingText: {
    color: darkPalette.primary,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  screenContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  screenTitle: {
    color: darkPalette.white,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.02,
  },
  screenSubtitle: {
    color: darkPalette.onSurfaceVariant,
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  heroCard: {
    backgroundColor: 'rgba(28, 37, 65, 0.7)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardKicker: {
    color: darkPalette.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  heroTitle: {
    color: darkPalette.white,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
    marginTop: 10,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  eventChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(91, 192, 190, 0.12)',
    borderColor: 'rgba(91, 192, 190, 0.25)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(91, 192, 190, 0.2)',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  eventChipText: {
    color: darkPalette.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: darkPalette.secondary,
    borderRadius: 16,
    flex: 1,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  primaryButtonText: {
    color: darkPalette.white,
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 15,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: darkPalette.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  privacyStrip: {
    alignItems: 'center',
    backgroundColor: 'rgba(91, 192, 190, 0.08)',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(91, 192, 190, 0.15)',
  },
  privacyText: {
    color: darkPalette.onSurfaceVariant,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  tabBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(11, 19, 43, 0.92)',
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    height: 84,
    left: 0,
    paddingHorizontal: 10,
    position: 'absolute',
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  tabItemBeforeFab: {
    marginRight: 34,
  },
  tabItemAfterFab: {
    marginLeft: 34,
  },
  activeDot: {
    backgroundColor: darkPalette.primary,
    borderRadius: 3,
    height: 6,
    marginBottom: 2,
    width: 6,
    shadowColor: darkPalette.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  tabLabel: {
    color: '#9fa7a1',
    fontSize: 11,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: darkPalette.primary,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: darkPalette.primary,
    borderColor: darkPalette.background,
    borderRadius: 34,
    borderWidth: 5,
    bottom: 48,
    height: 68,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -34,
    position: 'absolute',
    width: 68,
    shadowColor: darkPalette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  dayHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dateNav: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(28, 37, 65, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconButtonSpacer: {
    height: 44,
    width: 44,
  },
  timeline: {
    gap: 0,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: 'rgba(28, 37, 65, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  emptyTitle: {
    color: darkPalette.white,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 12,
  },
  emptyText: {
    color: darkPalette.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    textAlign: 'center',
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 14,
  },
  timelineRail: {
    alignItems: 'center',
    width: 54,
  },
  timeText: {
    color: darkPalette.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  railDot: {
    backgroundColor: darkPalette.primary,
    borderRadius: 6,
    height: 12,
    width: 12,
    shadowColor: darkPalette.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  railLine: {
    backgroundColor: 'rgba(91, 192, 190, 0.25)',
    flex: 1,
    minHeight: 128,
    width: 2,
  },
  entryCard: {
    backgroundColor: 'rgba(28, 37, 65, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    marginBottom: 20,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  suggestedCard: {
    borderColor: darkPalette.primary,
    borderStyle: 'dashed',
    opacity: 0.7,
  },
  entryTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  entryTime: {
    color: darkPalette.white,
    fontSize: 13,
    fontWeight: '800',
  },
  moodChip: {
    backgroundColor: 'rgba(91, 192, 190, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  moodText: {
    color: darkPalette.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  suggestedLabel: {
    color: darkPalette.tertiary,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 'auto',
  },
  entryText: {
    color: darkPalette.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: darkPalette.secondary,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    height: 96,
    justifyContent: 'center',
    marginTop: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  imagePlaceholderLarge: {
    height: 190,
  },
  imagePlaceholderText: {
    color: darkPalette.white,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  miniActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  miniPrimary: {
    backgroundColor: darkPalette.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  miniPrimaryText: {
    color: darkPalette.slate,
    fontSize: 13,
    fontWeight: '800',
  },
  miniSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  miniSecondaryText: {
    color: darkPalette.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  yearAgoCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(28, 37, 65, 0.7)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  yearAgoText: {
    flex: 1,
  },
  sectionKicker: {
    color: darkPalette.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  yearAgoTitle: {
    color: darkPalette.white,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 29,
    marginTop: 6,
  },
  stackThumbs: {
    height: 74,
    width: 98,
  },
  stackThumb: {
    borderColor: darkPalette.slate,
    borderRadius: 12,
    borderWidth: 3,
    height: 58,
    position: 'absolute',
    width: 58,
  },
  stackThumbOffset: {
    left: 20,
    top: 8,
  },
  stackThumbLast: {
    left: 40,
    top: 16,
  },
  sectionTitle: {
    color: darkPalette.white,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  reelCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(28, 37, 65, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    padding: 12,
  },
  videoThumb: {
    alignItems: 'center',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    justifyContent: 'center',
    width: 104,
    backgroundColor: darkPalette.secondary,
  },
  reelMeta: {
    flex: 1,
  },
  reelTitle: {
    color: darkPalette.white,
    fontSize: 16,
    fontWeight: '800',
  },
  reelDate: {
    color: darkPalette.onSurfaceVariant,
    fontSize: 13,
    marginTop: 4,
  },
  countChip: {
    backgroundColor: 'rgba(91, 192, 190, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  countChipText: {
    color: darkPalette.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  settingsCard: {
    backgroundColor: 'rgba(28, 37, 65, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    padding: 12,
  },
  settingsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  settingsIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(91, 192, 190, 0.12)',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  settingsIconDanger: {
    backgroundColor: 'rgba(186, 26, 26, 0.15)',
  },
  settingsTextBox: {
    flex: 1,
  },
  settingsTitle: {
    color: darkPalette.white,
    fontSize: 15,
    fontWeight: '800',
  },
  settingsSubtitle: {
    color: darkPalette.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  dangerText: {
    color: '#ff8888',
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  footerLinks: {
    gap: 10,
    paddingBottom: 20,
  },
  footerLink: {
    color: darkPalette.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  modalScrim: {
    backgroundColor: 'rgba(11, 19, 43, 0.65)',
    flex: 1,
  },
  sheet: {
    backgroundColor: darkPalette.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    bottom: 0,
    left: 0,
    minHeight: '55%',
    padding: 22,
    position: 'absolute',
    right: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    height: 4,
    marginBottom: 20,
    width: 46,
  },
  sheetTitle: {
    color: darkPalette.white,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.02,
  },
  sheetAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(28, 37, 65, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    padding: 16,
  },
  sheetIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(91, 192, 190, 0.12)',
    borderRadius: 16,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  sheetActionText: {
    flex: 1,
  },
  sheetActionTitle: {
    color: darkPalette.white,
    fontSize: 16,
    fontWeight: '800',
  },
  sheetActionSubtitle: {
    color: darkPalette.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  composerRoot: {
    backgroundColor: darkPalette.background,
    flex: 1,
  },
  composerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  composerTitle: {
    color: darkPalette.white,
    fontSize: 18,
    fontWeight: '800',
  },
  composerContent: {
    padding: 22,
    paddingBottom: 110,
  },
  addPhotoBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(28, 37, 65, 0.5)',
    borderColor: 'rgba(91, 192, 190, 0.25)',
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    gap: 8,
    height: 170,
    justifyContent: 'center',
  },
  addPhotoText: {
    color: darkPalette.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  metaBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(91, 192, 190, 0.12)',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(91, 192, 190, 0.25)',
  },
  metaText: {
    color: darkPalette.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  fieldLabel: {
    color: darkPalette.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 24,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  moodOption: {
    backgroundColor: 'rgba(28, 37, 65, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  moodOptionSelected: {
    backgroundColor: 'rgba(91, 192, 190, 0.18)',
    borderColor: darkPalette.primary,
  },
  moodEmoji: {
    fontSize: 20,
  },
  moodOptionText: {
    color: darkPalette.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '800',
  },
  moodOptionTextSelected: {
    color: darkPalette.primary,
  },
  noteInput: {
    backgroundColor: 'rgba(28, 37, 65, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    color: darkPalette.white,
    fontSize: 15,
    minHeight: 118,
    padding: 14,
    textAlignVertical: 'top',
  },
  aiCard: {
    backgroundColor: 'rgba(91, 192, 190, 0.08)',
    borderColor: 'rgba(91, 192, 190, 0.25)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 18,
    padding: 16,
  },
  aiHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginBottom: 9,
  },
  aiTitle: {
    color: darkPalette.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  aiText: {
    color: darkPalette.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 22,
  },
  composerFooter: {
    backgroundColor: darkPalette.background,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: 18,
    position: 'absolute',
    right: 0,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: darkPalette.primary,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: darkPalette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  saveButtonText: {
    color: darkPalette.slate,
    fontSize: 16,
    fontWeight: '800',
  },
  dialogScrim: {
    alignItems: 'center',
    backgroundColor: 'rgba(11, 19, 43, 0.75)',
    flex: 1,
    justifyContent: 'center',
    padding: 22,
  },
  dialogCard: {
    backgroundColor: darkPalette.slate,
    borderRadius: 24,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dialogTitle: {
    color: darkPalette.white,
    fontSize: 20,
    fontWeight: '800',
  },
  dialogText: {
    color: darkPalette.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  confirmInput: {
    backgroundColor: 'rgba(11, 19, 43, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    color: darkPalette.white,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 14,
    padding: 12,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  dialogSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  dialogSecondaryText: {
    color: darkPalette.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  dialogDanger: {
    backgroundColor: darkPalette.red,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  dialogDangerText: {
    color: darkPalette.white,
    fontSize: 14,
    fontWeight: '800',
  },
  calendarEventList: {
    maxHeight: 280,
    marginTop: 16,
  },
  calendarEventListContent: {
    gap: 10,
  },
  calendarEventRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  calendarEventIcon: {
    alignItems: 'center',
    backgroundColor: darkPalette.primaryContainer,
    borderRadius: 14,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  calendarEventTextBox: {
    flex: 1,
  },
  calendarEventTitle: {
    color: darkPalette.onSurface,
    fontSize: 15,
    fontWeight: '800',
  },
  calendarEventMeta: {
    color: darkPalette.onSurfaceVariant,
    fontSize: 12,
    marginTop: 3,
  },
  themeOptionList: {
    gap: 10,
    marginBottom: 16,
    marginTop: 16,
  },
  themeOption: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  themeOptionActive: {
    backgroundColor: darkPalette.primaryContainer,
    borderColor: darkPalette.primary,
  },
  themeOptionText: {
    color: darkPalette.onSurface,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  moodCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    marginTop: 16,
  },
  moodDayCell: {
    alignItems: 'center',
    backgroundColor: 'rgba(28, 37, 65, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    width: '30.7%',
  },
  moodDayName: {
    color: darkPalette.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  moodDateText: {
    color: darkPalette.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },
  moodDotLarge: {
    backgroundColor: darkPalette.primary,
    borderRadius: 13,
    height: 26,
    marginTop: 10,
    width: 26,
  },
  moodCellText: {
    color: darkPalette.white,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  moodCountText: {
    color: darkPalette.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },
  luminousBlob1: {
    position: 'absolute',
    top: -150,
    left: -150,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: darkPalette.primary,
    opacity: 0.12,
  },
  luminousBlob2: {
    position: 'absolute',
    top: '40%',
    right: -150,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: darkPalette.tertiary,
    opacity: 0.08,
  },
  luminousBlob3: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: darkPalette.primary,
    opacity: 0.1,
  },
});

const getActiveStyles = () => {
  try {
    const store = useJournalStore.getState();
    const storeTheme = store?.settings?.theme;
    if (storeTheme === 'dark') {
      return darkStyles;
    }
    if (storeTheme === 'light') {
      return lightStyles;
    }
    const systemColorScheme = Appearance.getColorScheme();
    return systemColorScheme === 'dark' ? darkStyles : lightStyles;
  } catch (e) {
    return lightStyles;
  }
};

// === Export styles Proxy for Realtime Dynamic styling ===
export const styles = new Proxy({} as typeof lightStyles, {
  get(target, prop) {
    const activeStyles = getActiveStyles();
    const styleObj = activeStyles[prop as keyof typeof lightStyles];
    
    if (styleObj && typeof styleObj === 'object') {
      const flat = { ...StyleSheet.flatten(styleObj) };
      
      // Helper to convert dynamic hex color to rgba for translucent borders/glows
      const getAlphaColor = (color: string, opacity: number) => {
        if (color.startsWith('#')) {
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return color;
      };

      // Dynamic Accent Color Mapping
      Object.keys(flat).forEach((key) => {
        const val = flat[key];
        if (typeof val === 'string') {
          const lowerVal = val.toLowerCase();
          
          // Replace light/dark hardcoded primary accents
          if (lowerVal === '#031f41' || lowerVal === '#5bc0be') {
            flat[key] = palette.primary;
          }
          // Replace primary containers
          else if (lowerVal === '#dff0ff' || lowerVal === 'rgba(91, 192, 190, 0.15)') {
            flat[key] = palette.primaryContainer;
          }
          // Replace light/dark hardcoded green
          else if (lowerVal === '#031f41' || lowerVal === '#5bc0be') {
            flat[key] = palette.green;
          }
          // Replace greenSoft
          else if (lowerVal === '#dff0ff' || lowerVal === 'rgba(91, 192, 190, 0.15)') {
            flat[key] = palette.greenSoft;
          }
          // Replace backgrounds
          else if (lowerVal === '#f6faff' || lowerVal === '#0b132b') {
            flat[key] = palette.background;
          }
          // Replace slate surfaces
          else if (lowerVal === '#ffffff' || lowerVal === '#1c2541') {
            flat[key] = palette.slate;
          }
          // Replace cream
          else if (lowerVal === '#ffffff' || lowerVal === 'rgba(28, 37, 65, 0.7)') {
            flat[key] = palette.cream;
          }
          // Replace glow values
          else if (lowerVal.includes('rgba(3, 31, 65, 0.1') || lowerVal.includes('rgba(91, 192, 190, 0.4)')) {
            flat[key] = palette.glow;
          }
          // Convert hardcoded translucent colors to follow active accent color dynamically
          else if (lowerVal.includes('rgba(3, 31, 65,') || lowerVal.includes('rgba(91, 192, 190,')) {
            const match = lowerVal.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d\.]+)\s*\)/);
            if (match && match[1]) {
              const opacity = parseFloat(match[1]);
              flat[key] = getAlphaColor(palette.primary, opacity);
            }
          }
        }
      });

      // Inject modern Plus Jakarta Sans Google Font dynamically for any text-related styles
      if (flat.fontSize !== undefined || flat.color !== undefined || flat.fontWeight !== undefined || flat.lineHeight !== undefined) {
        let fontFamily = 'PlusJakartaSans_400Regular';
        if (flat.fontWeight === '800' || flat.fontWeight === 'bold' || flat.fontWeight === '900') {
          fontFamily = 'PlusJakartaSans_800ExtraBold';
        } else if (flat.fontWeight === '700') {
          fontFamily = 'PlusJakartaSans_700Bold';
        } else if (flat.fontWeight === '600') {
          fontFamily = 'PlusJakartaSans_600SemiBold';
        } else if (flat.fontWeight === '500') {
          fontFamily = 'PlusJakartaSans_500Medium';
        }
        flat.fontFamily = fontFamily;
      }
      return flat;
    }
    return styleObj;
  },
  ownKeys() {
    return Reflect.ownKeys(lightStyles);
  },
  getOwnPropertyDescriptor(target, prop) {
    return Reflect.getOwnPropertyDescriptor(lightStyles, prop);
  }
});
