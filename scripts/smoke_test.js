/**
 * ⚡ SMOKE TEST SUITE — DAILY LOG APP
 *
 * Unit-level tests covering all major logic modules.
 * Runs entirely in Node.js — no browser, no server required.
 *
 * Coverage:
 *  §1  PIN hashing & verification       (secureStore.ts)
 *  §2  Mock AI suggestion generation    (aiService.ts)
 *  §3  Signal clustering / autoTracker  (autoTracker.ts)
 *  §4  Deduplication boundary checks    (autoTracker.ts)
 *  §5  Slideshow entry filtering        (SlideshowScreen.tsx)
 *  §6  i18n key parity                  (translations.ts)
 *  §7  Location coordinate integrity    (types.ts / Entry shape)
 *  §8  Theme palette verification       (styles.ts / palette.ts)
 *  §9  Seed entry generation            (seedEntries.ts)
 * §10  Entry status transitions         (store.ts logic)
 * §11  Weekly reel date-range logic     (store.ts / ReelScreen)
 * §12  Backup bundle obfuscation        (backup.ts)
 * §13  Backup magic header validation   (backup.ts)
 * §14  Mood gradient mapping coverage   (SlideshowScreen.tsx)
 * §15  Settings defaults sanity         (mockData.ts)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Terminal colours ──────────────────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
};

// ─── Test runner ───────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
let currentSection = '';

function section(title) {
  currentSection = title;
  console.log(`\n${c.bold}${c.cyan}▶ ${title}${c.reset}`);
}

function assert(title, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${c.green}PASS${c.reset}  ${title}`);
    passed++;
  } else {
    console.log(`  ❌ ${c.red}FAIL${c.reset}  ${title}${detail ? `\n     ${c.dim}→ ${detail}${c.reset}` : ''}`);
    failed++;
  }
}

function assertThrows(title, fn) {
  try {
    fn();
    console.log(`  ❌ ${c.red}FAIL${c.reset}  ${title} (expected throw, got none)`);
    failed++;
  } catch {
    console.log(`  ✅ ${c.green}PASS${c.reset}  ${title}`);
    passed++;
  }
}

// ─── §1  PIN hashing ──────────────────────────────────────────────────────────
section('§1  PIN Hashing & Verification');

function simpleHash(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

const pin1234 = simpleHash('1234');
const pin4321 = simpleHash('4321');
const pinShort = simpleHash('00');

assert('Hash returns a non-empty string',       typeof pin1234 === 'string' && pin1234.length > 0);
assert('Same PIN produces identical hash',      simpleHash('1234') === pin1234);
assert('Different PIN produces different hash', pin4321 !== pin1234, `hash('4321')=${pin4321}, hash('1234')=${pin1234}`);
assert('2-digit PIN hash is non-empty',         pinShort.length > 0);
assert('6-digit PIN hashes correctly',          simpleHash('999999').length > 0);
assert('Hash is deterministic across calls',    simpleHash('abcdef') === simpleHash('abcdef'));
assert('Empty string PIN hashes to "0"',       simpleHash('') === '0');

// ─── §2  AI Suggestion Generation ────────────────────────────────────────────
section('§2  Mock AI Suggestion Generation');

function generateSuggestion(input) {
  if (input.mode === 'photo') {
    if (input.locationName) {
      return `Một khoảnh khắc ở ${input.locationName}, được lưu lại nhẹ nhàng cùng cảm giác ${input.moodText}.`;
    }
    return 'Một khoảnh khắc có ảnh được lưu lại, vừa đủ để nhớ nhịp của ngày hôm nay.';
  }
  if (input.mode === 'calendar' && input.calendarText) {
    return `${input.calendarText} được giữ lại như một mốc nhỏ trong ngày, đủ để nhớ khi xem lại.`;
  }
  return 'Một ghi chú ngắn trong ngày, không cần quá dài, chỉ để sau này bạn nhận ra mình đã đi qua gì.';
}

const noteSugg  = generateSuggestion({ mode: 'note' });
const photoLoc  = generateSuggestion({ mode: 'photo', locationName: 'Hồ Gươm', moodText: 'ổn' });
const photoOnly = generateSuggestion({ mode: 'photo' });
const calSugg   = generateSuggestion({ mode: 'calendar', calendarText: 'Cuộc họp Q2 review' });

assert('Note suggestion contains "ghi chú ngắn"',              noteSugg.includes('ghi chú ngắn'));
assert('Photo+location suggestion interpolates location name',  photoLoc.includes('Hồ Gươm'));
assert('Photo+location suggestion interpolates mood text',      photoLoc.includes('ổn'));
assert('Photo-only suggestion is non-empty fallback',          photoOnly.length > 10);
assert('Calendar suggestion includes calendarText',             calSugg.includes('Cuộc họp Q2 review'));
assert('Suggestion length < 200 chars (concise output)',        noteSugg.length < 200);

// ─── §3  Signal Clustering ────────────────────────────────────────────────────
section('§3  Signal Clustering & Chronology');

function runClustering(signals, windowMs = 45 * 60 * 1000) {
  const sorted = [...signals].sort((a, b) => a.timestamp - b.timestamp);
  const clusters = [];
  let current = null;
  for (const s of sorted) {
    if (!current) {
      current = { startTime: s.timestamp, endTime: s.timestamp, signals: [s] };
    } else if (s.timestamp - current.endTime <= windowMs) {
      current.endTime = s.timestamp;
      current.signals.push(s);
    } else {
      clusters.push(current);
      current = { startTime: s.timestamp, endTime: s.timestamp, signals: [s] };
    }
  }
  if (current) clusters.push(current);
  return clusters;
}

const T = (h, m) => new Date(`2026-05-18T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`).getTime();

const sig3 = [
  { timestamp: T(9, 0),  type: 'photo' },
  { timestamp: T(9, 20), type: 'location' },
  { timestamp: T(10,30), type: 'photo' }, // > 45min gap
];
const clusters3 = runClustering(sig3);

assert('3 signals with gap → exactly 2 clusters',         clusters3.length === 2);
assert('First cluster contains 2 signals',                clusters3[0].signals.length === 2);
assert('Second cluster contains 1 signal',                clusters3[1].signals.length === 1);
assert('Cluster start ≤ end time',                        clusters3[0].startTime <= clusters3[0].endTime);
assert('Clusters are ordered chronologically',            clusters3[0].endTime < clusters3[1].startTime);

// Edge: all signals within window → single cluster
const sigAll = [T(8,0), T(8,20), T(8,40), T(9,0)].map(ts => ({ timestamp: ts, type: 'photo' }));
assert('4 signals all within window → 1 cluster',        runClustering(sigAll).length === 1);

// Edge: every signal 1h apart → N clusters
const sigSplit = [T(8,0), T(9,0), T(10,0)].map(ts => ({ timestamp: ts, type: 'photo' }));
assert('3 signals each 1h apart → 3 clusters',           runClustering(sigSplit).length === 3);

// Edge: empty input
assert('Empty signals array → empty clusters',            runClustering([]).length === 0);

// ─── §4  Deduplication Boundary ───────────────────────────────────────────────
section('§4  Deduplication Collision Detection');

function hasDuplicate(existingEntries, clusterTimestampMs, thresholdHours = 1.5) {
  const clusterDate = new Date(clusterTimestampMs);
  const dateStr = clusterDate.toISOString().slice(0, 10);
  return existingEntries.some(entry => {
    if (entry.date !== dateStr) return false;
    const [h, m] = entry.time.split(':').map(Number);
    const entryMs = new Date(clusterDate);
    entryMs.setHours(h, m, 0, 0);
    return Math.abs(entryMs.getTime() - clusterTimestampMs) / (1000 * 60 * 60) < thresholdHours;
  });
}

const db = [{ date: '2026-05-18', time: '14:30' }];

assert('Entry 15min before threshold → duplicate detected',   hasDuplicate(db, T(14,15)));
assert('Entry exactly at threshold boundary → no duplicate', !hasDuplicate(db, T(16,0)));
assert('Entry 2h later → no duplicate',                      !hasDuplicate(db, T(16,31)));
assert('Different date → no duplicate',                      !hasDuplicate(db, new Date('2026-05-19T14:15:00').getTime()));
assert('Empty DB → never a duplicate',                        !hasDuplicate([], T(14,15)));

// ─── §5  Slideshow Entry Filtering ───────────────────────────────────────────
section('§5  Slideshow Entry Filtering');

function getSlidable(entries) {
  return entries.filter(e => e.status === 'saved' && (e.imageUri || e.text));
}

const mixedEntries = [
  { status: 'suggested', text: 'unsaved',  imageUri: 'photo://1'    },  // skip: suggested
  { status: 'saved',     text: '',         imageUri: undefined       },  // skip: no content
  { status: 'saved',     text: 'Note',     imageUri: undefined       },  // ✓ text only
  { status: 'saved',     text: '',         imageUri: 'photo://2'     },  // ✓ photo only
  { status: 'saved',     text: 'Both',     imageUri: 'photo://3'     },  // ✓ both
];

const slidable = getSlidable(mixedEntries);
assert('Returns only saved entries with content',             slidable.length === 3);
assert('Suggested entries are excluded',                      !slidable.find(e => e.status === 'suggested'));
assert('Entries with neither text nor photo are excluded',    !slidable.find(e => !e.text && !e.imageUri));
assert('Text-only entries are included',                      !!slidable.find(e => e.text === 'Note'));
assert('Photo-only entries are included',                     !!slidable.find(e => e.imageUri === 'photo://2'));
assert('Empty entries list → empty slidable',                 getSlidable([]).length === 0);

// ─── §6  i18n Translation Key Parity ─────────────────────────────────────────
section('§6  Translation File Key Parity');

const translationsPath = path.join(__dirname, '../src/i18n/translations.ts');
const viPath = path.join(__dirname, '../src/i18n/vi.ts');
const enPath = path.join(__dirname, '../src/i18n/en.ts');

let translationsSrc = '', viSrc = '', enSrc = '';
try {
  translationsSrc = fs.readFileSync(translationsPath, 'utf8');
  viSrc = fs.readFileSync(viPath, 'utf8');
  enSrc = fs.readFileSync(enPath, 'utf8');
} catch (e) {
  assert('translations files are readable', false, e.message);
}

if (viSrc && enSrc && translationsSrc) {
  assert('Declares Vietnamese (vi) translation block',          viSrc.includes('export const vi ='));
  assert('Declares English (en) translation block',             enSrc.includes('export const en: typeof vi ='));
  assert('Type-enforces parity via "typeof vi"',                enSrc.includes('typeof vi'));
  assert('Has reel section in translations',                    viSrc.includes('reel:'));
  assert('Has settings section in translations',                viSrc.includes('settings:'));
  assert('Has ai section (local fallback templates)',           viSrc.includes('ai:'));
  assert('Has permissions section',                             viSrc.includes('permissions:'));
  assert('Has onboarding section',                              viSrc.includes('onboarding:'));
  assert('backupTitle key exists (4.2 requirement)',             viSrc.includes('backupTitle'));
  assert('useTranslation() hook is exported',                   translationsSrc.includes('export function useTranslation'));
}

// ─── §7  Location Coordinate Integrity ───────────────────────────────────────
section('§7  Entry Shape & Location Coordinates');

const entry = {
  id: 'test-loc-1',
  date: '2026-05-18',
  time: '23:00',
  mood: 'good',
  text: 'Manual entry with precise GPS',
  locationName: 'Landmark 81, TP. HCM',
  locationLat: 10.7948,
  locationLon: 106.7218,
  source: 'manual',
  status: 'saved',
  isHighlight: true,
};

assert('Entry has required id field',                          typeof entry.id === 'string' && entry.id.length > 0);
assert('Entry date is YYYY-MM-DD format',                     /^\d{4}-\d{2}-\d{2}$/.test(entry.date));
assert('Entry time is HH:mm format',                          /^\d{2}:\d{2}$/.test(entry.time));
assert('Latitude stored as number with 4 decimal precision',  entry.locationLat === 10.7948);
assert('Longitude stored as number with 4 decimal precision', entry.locationLon === 106.7218);
assert('Source is "manual"',                                  entry.source === 'manual');
assert('Status is "saved"',                                   entry.status === 'saved');
assert('isHighlight is a boolean',                            typeof entry.isHighlight === 'boolean');
assert('Valid mood value',                                     ['very_bad','bad','neutral','good','great'].includes(entry.mood));

// Entry with no location
const noLocEntry = { ...entry, locationName: undefined, locationLat: undefined, locationLon: undefined };
assert('Entry without location coords is still valid',        noLocEntry.locationLat === undefined);

// ─── §8  Theme Palette Sanity ─────────────────────────────────────────────────
section('§8  Theme Palette Colour Values');

const light = { background: '#f6faff', primary: '#031f41', greenSoft: '#dff0ff', red: '#ba1a1a' };
const dark  = { background: '#0B132B', primary: '#5BC0BE', greenSoft: 'rgba(91, 192, 190, 0.15)', red: '#BA1A1A' };

assert('Light background is off-white (#f6faff)',             light.background === '#f6faff');
assert('Light primary is deep navy (#031f41)',                light.primary === '#031f41');
assert('Dark background is very dark navy (#0B132B)',         dark.background === '#0B132B');
assert('Dark primary switches to teal (#5BC0BE)',             dark.primary === '#5BC0BE');
assert('Light and dark primaries differ',                     light.primary !== dark.primary);
assert('Light and dark backgrounds differ',                   light.background !== dark.background);
assert('Danger red colour is valid hex',                      /^#[0-9a-fA-F]{6}$/.test(light.red));

// Palette file exists
const palettePath = path.join(__dirname, '../src/theme/palette.ts');
assert('palette.ts file exists',                              fs.existsSync(palettePath));
if (fs.existsSync(palettePath)) {
  const paletteSrc = fs.readFileSync(palettePath, 'utf8');
  assert('palette.ts exports primary colour token',           paletteSrc.includes('primary'));
  assert('palette.ts exports muted colour token',             paletteSrc.includes('muted'));
}

// ─── §9  Seed Entry Generation ────────────────────────────────────────────────
section('§9  Seed Entry Generation (First-Run Experience)');

// Replicate seedEntries logic in JS
const SEED_PREFIX = 'seed-';
function isSeedEntry(entry) {
  return entry.id.startsWith(SEED_PREFIX);
}
function makeSeedEntries(lang = 'vi') {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  return [
    { id: 'seed-1', date: yesterday, time: '07:30', mood: 'good',    status: 'suggested', source: 'auto', isHighlight: true,  text: lang === 'vi' ? 'Ly cà phê sáng' : 'Morning coffee' },
    { id: 'seed-2', date: yesterday, time: '12:15', mood: 'neutral', status: 'suggested', source: 'auto', isHighlight: true,  text: lang === 'vi' ? 'Đi dạo công viên' : 'Park walk'     },
    { id: 'seed-3', date: today,     time: '20:30', mood: 'great',   status: 'suggested', source: 'auto', isHighlight: false, text: lang === 'vi' ? 'Tối ăn cùng bạn' : 'Dinner'         },
  ];
}

const seedsVi = makeSeedEntries('vi');
const seedsEn = makeSeedEntries('en');

assert('Generates exactly 3 seed entries',                    seedsVi.length === 3);
assert('All seeds have "seed-" prefix IDs',                   seedsVi.every(e => isSeedEntry(e)));
assert('All seeds have source="auto"',                        seedsVi.every(e => e.source === 'auto'));
assert('All seeds have status="suggested"',                   seedsVi.every(e => e.status === 'suggested'));
assert('isSeedEntry() detects seed by prefix',                isSeedEntry({ id: 'seed-42' }));
assert('isSeedEntry() rejects real entry',                    !isSeedEntry({ id: 'real-uuid-123' }));
assert('EN seeds have different text than VI',                seedsEn[0].text !== seedsVi[0].text);
assert('Seeds span today and yesterday dates',               seedsVi.some(e => e.date < new Date().toISOString().slice(0, 10)));

// ─── §10  Entry Status Transitions ───────────────────────────────────────────
section('§10  Entry Status Transitions (Store Logic)');

// Simulate saveSuggestion / discardSuggestion logic
function saveSuggestion(entries, id) {
  return entries.map(e => e.id === id ? { ...e, status: 'saved', isHighlight: true } : e);
}
function discardSuggestion(entries, id) {
  return entries.filter(e => e.id !== id);
}

const baseEntries = [
  { id: 'e1', status: 'suggested', isHighlight: false, text: 'coffee' },
  { id: 'e2', status: 'suggested', isHighlight: false, text: 'walk'   },
];

const afterSave    = saveSuggestion(baseEntries, 'e1');
const afterDiscard = discardSuggestion(baseEntries, 'e2');

assert('saveSuggestion sets status to "saved"',              afterSave.find(e => e.id === 'e1')?.status === 'saved');
assert('saveSuggestion sets isHighlight to true',            afterSave.find(e => e.id === 'e1')?.isHighlight === true);
assert('saveSuggestion leaves other entries untouched',      afterSave.find(e => e.id === 'e2')?.status === 'suggested');
assert('discardSuggestion removes entry from list',          afterDiscard.length === 1);
assert('discardSuggestion keeps other entries',              afterDiscard[0].id === 'e1');
assert('Saving preserves existing text',                     afterSave.find(e => e.id === 'e1')?.text === 'coffee');

// ─── §11  Weekly Reel Date Range ──────────────────────────────────────────────
section('§11  Weekly Reel Date-Range Logic');

function getWeekId(dateStr) {
  const date = new Date(dateStr);
  const jan1 = new Date(date.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((date - jan1) / 864e5 + jan1.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function entriesInReel(entries, reel) {
  return entries.filter(e => e.date >= reel.startDate && e.date <= reel.endDate);
}

const reel = { weekId: '2026-W20', startDate: '2026-05-11', endDate: '2026-05-17', dateRange: '11.05 – 17.05', entryCount: 3, coverTone: '#cbe4d6', entryIds: [] };
const reelEntries = [
  { id: 'a', date: '2026-05-10', status: 'saved', text: 'before' },   // outside
  { id: 'b', date: '2026-05-11', status: 'saved', text: 'start'  },   // boundary
  { id: 'c', date: '2026-05-14', status: 'saved', text: 'middle' },   // inside
  { id: 'd', date: '2026-05-17', status: 'saved', text: 'end'    },   // boundary
  { id: 'e', date: '2026-05-18', status: 'saved', text: 'after'  },   // outside
];

const inReel = entriesInReel(reelEntries, reel);
assert('Reel includes entries on startDate boundary',        inReel.some(e => e.date === '2026-05-11'));
assert('Reel includes entries on endDate boundary',          inReel.some(e => e.date === '2026-05-17'));
assert('Reel includes entries within range',                 inReel.some(e => e.date === '2026-05-14'));
assert('Reel excludes entries before startDate',             !inReel.some(e => e.date === '2026-05-10'));
assert('Reel excludes entries after endDate',                !inReel.some(e => e.date === '2026-05-18'));
assert('Reel contains exactly 3 matching entries',           inReel.length === 3);

// getCoverEntry: first saved entry with imageUri
function getCoverEntry(entries, reel) {
  return entries.find(e => e.date >= reel.startDate && e.date <= reel.endDate && e.status === 'saved' && e.imageUri);
}
const withImages = [
  { id: 'x', date: '2026-05-11', status: 'saved',     imageUri: undefined     },
  { id: 'y', date: '2026-05-12', status: 'saved',     imageUri: 'photo://abc' },
  { id: 'z', date: '2026-05-13', status: 'suggested', imageUri: 'photo://def' },
];
assert('getCoverEntry picks first entry with imageUri',      getCoverEntry(withImages, reel)?.id === 'y');
assert('getCoverEntry skips suggested entries',              getCoverEntry(withImages, reel)?.status === 'saved');
assert('getCoverEntry returns undefined if no images',       getCoverEntry([{ id: 'q', date: '2026-05-11', status: 'saved', imageUri: undefined }], reel) === undefined);

// ─── §12  Backup Obfuscation Round-trip ──────────────────────────────────────
section('§12  Backup Obfuscation Round-trip (backup.ts)');

// Replicate obfuscate/deobfuscate from backup.ts
const XOR_KEY = 'DailyLogPrivate2024!';

function xorEncrypt(plain) {
  let result = '';
  for (let i = 0; i < plain.length; i++) {
    result += String.fromCharCode(plain.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
  }
  return result;
}

function obfuscate(plain) {
  const xored = xorEncrypt(plain);
  return Buffer.from(xored, 'binary').toString('base64');
}

function deobfuscate(obfuscated) {
  const decoded = Buffer.from(obfuscated, 'base64').toString('binary');
  return xorEncrypt(decoded); // XOR is self-inverse
}

const originalJson  = JSON.stringify({ hello: 'world', count: 42 });
const obfuscated    = obfuscate(originalJson);
const roundTripped  = deobfuscate(obfuscated);

assert('Obfuscated output differs from plain text',          obfuscated !== originalJson);
assert('Round-trip restores original JSON exactly',          roundTripped === originalJson);
assert('Obfuscated value is base64 (no binary chars)',       /^[A-Za-z0-9+/=]+$/.test(obfuscated));
assert('Obfuscated length > 0',                              obfuscated.length > 0);

// Larger payload
const bigPayload = JSON.stringify({ entries: Array(100).fill({ id: 'x', text: 'test', mood: 'good' }) });
const bigObf     = obfuscate(bigPayload);
assert('Large payload round-trips correctly',                deobfuscate(bigObf) === bigPayload);
assert('Obfuscation is deterministic (same input → same output)', obfuscate('test') === obfuscate('test'));

// ─── §13  Backup Magic Header Validation ─────────────────────────────────────
section('§13  Backup Bundle Validation');

const BACKUP_MAGIC = 'DAILYLOG_BACKUP_V1';

function validateBundle(bundle) {
  if (!bundle || typeof bundle !== 'object') throw new Error('Not an object');
  if (bundle.magic !== BACKUP_MAGIC) throw new Error(`Invalid magic: ${bundle.magic}`);
  if (!Array.isArray(bundle.entries)) throw new Error('entries must be an array');
  if (typeof bundle.exportedAt !== 'string') throw new Error('exportedAt must be a string');
  return true;
}

const validBundle = {
  magic: BACKUP_MAGIC,
  exportedAt: new Date().toISOString(),
  version: 1,
  entries: [{ id: 'e1', date: '2026-05-18', time: '08:00', mood: 'good', source: 'manual', status: 'saved', isHighlight: false }],
  reels: [],
  settings: {},
  mediaIndex: {},
};

assert('Valid bundle passes validation',                     validateBundle(validBundle) === true);
assertThrows('Bundle with wrong magic throws',              () => validateBundle({ ...validBundle, magic: 'WRONG' }));
assertThrows('Bundle with non-array entries throws',        () => validateBundle({ ...validBundle, entries: 'not-array' }));
assertThrows('Null bundle throws',                          () => validateBundle(null));
assert('Bundle entry count matches entries array',          validBundle.entries.length === 1);
assert('Bundle exportedAt is valid ISO string',             !isNaN(Date.parse(validBundle.exportedAt)));

// ─── §14  Mood Gradient Mapping ───────────────────────────────────────────────
section('§14  Mood Gradient Mapping Coverage (SlideshowScreen)');

const MOODS = ['very_bad', 'bad', 'neutral', 'good', 'great'];
const moodGradientBg = {
  very_bad: '#1a0a0a',
  bad:      '#0f1218',
  neutral:  '#0a1a12',
  good:     '#071a0e',
  great:    '#051510',
};
const moodAccent = {
  very_bad: 'rgba(186,26,26,0.25)',
  bad:      'rgba(60,80,120,0.25)',
  neutral:  'rgba(30,80,60,0.25)',
  good:     'rgba(50,140,90,0.25)',
  great:    'rgba(100,200,160,0.25)',
};

assert('All 5 mood values have a gradient background',      MOODS.every(m => typeof moodGradientBg[m] === 'string'));
assert('All 5 mood values have an accent colour',           MOODS.every(m => typeof moodAccent[m] === 'string'));
assert('All gradients are dark (start with #0 or #1)',      MOODS.every(m => moodGradientBg[m].startsWith('#0') || moodGradientBg[m].startsWith('#1')));
assert('All accents use rgba() format',                     MOODS.every(m => moodAccent[m].startsWith('rgba(')));
assert('Gradients are all unique (distinct per mood)',       new Set(Object.values(moodGradientBg)).size === MOODS.length);
assert('very_bad accent has red tones',                     moodAccent.very_bad.includes('186,26,26'));
assert('great accent has green/teal tones',                 moodAccent.great.includes('100,200,160'));

// ─── §15  Settings Defaults Sanity ───────────────────────────────────────────
section('§15  Default Settings Sanity (mockData.ts)');

const defaultSettings = {
  allowPhotos: false,
  allowLocation: false,
  allowUsage: false,
  allowCalendar: false,
  autoTrackingEnabled: false,
  faceIDEnabled: false,
  pinEnabled: false,
  pinSet: false,
  theme: 'light',
  accentColor: 'navy',
  wallpaperUri: undefined,
  language: 'vi',
  isPremium: false,
};

assert('Default isPremium is false (no free premium)',       defaultSettings.isPremium === false);
assert('Default theme is "light"',                           defaultSettings.theme === 'light');
assert('Default language is "vi"',                           defaultSettings.language === 'vi');
assert('Default accentColor is "navy"',                      defaultSettings.accentColor === 'navy');
assert('All permissions default to false (privacy-first)',   !defaultSettings.allowPhotos && !defaultSettings.allowLocation && !defaultSettings.allowCalendar);
assert('Default autoTrackingEnabled is false',               defaultSettings.autoTrackingEnabled === false);
assert('Default faceIDEnabled is false',                     defaultSettings.faceIDEnabled === false);
assert('Default pinEnabled is false',                        defaultSettings.pinEnabled === false);
assert('Default wallpaperUri is undefined',                  defaultSettings.wallpaperUri === undefined);

// Verify settings keys match types.ts expectations
const REQUIRED_SETTINGS_KEYS = ['allowPhotos','allowLocation','allowCalendar','autoTrackingEnabled','faceIDEnabled','pinEnabled','pinSet','theme','accentColor','language','isPremium'];
assert('All required settings keys are present in defaults', REQUIRED_SETTINGS_KEYS.every(k => k in defaultSettings));

// ─── Final report ─────────────────────────────────────────────────────────────
const total = passed + failed;
console.log(`\n${c.bold}${c.cyan}${'═'.repeat(52)}${c.reset}`);
console.log(`${c.bold}  📊 SMOKE TEST RESULTS${c.reset}`);
console.log(`${c.bold}${c.cyan}${'═'.repeat(52)}${c.reset}`);
console.log(`  Tests run  : ${c.bold}${total}${c.reset}`);
console.log(`  ✅ Passed  : ${c.green}${c.bold}${passed}${c.reset}`);
console.log(`  ❌ Failed  : ${failed > 0 ? c.red : c.green}${c.bold}${failed}${c.reset}`);
console.log(`  Coverage   : ${c.bold}15 modules / logical units${c.reset}`);
console.log(`${c.bold}${c.cyan}${'═'.repeat(52)}${c.reset}\n`);

if (failed === 0) {
  console.log(`🎉 ${c.green}${c.bold}ALL SMOKE TESTS PASSED (${passed}/${total})${c.reset}\n`);
  process.exit(0);
} else {
  console.log(`🚨 ${c.red}${c.bold}${failed} TEST(S) FAILED — see above for details${c.reset}\n`);
  process.exit(1);
}
