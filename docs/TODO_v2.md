# 📋 TODO v2 — Auto Diary App (Hyda)

> Cập nhật: 2026-05-20  
> Review toàn bộ codebase dựa trên README spec + TODO cũ.  
> File này thay thế `docs/TODO.md` cũ làm roadmap chính.

---

## 📊 Tổng quan hiện trạng

| Hạng mục | Trạng thái |
|----------|-----------|
| **Architecture** (Zustand, SQLite, SecureStore, Navigation, i18n) | ✅ Hoàn thành |
| **Onboarding** (3-4 slides, persist flag) | ✅ Hoàn thành |
| **Auth Gate** (Biometric + PIN + LockScreen) | ✅ Hoàn thành |
| **Tab 1 — Home** (Yesterday summary, Peace Index, Mood Calendar, Insights) | ✅ Hoàn thành |
| **Tab 2 — Day** (Timeline, suggested cards, save/discard) | ✅ Hoàn thành |
| **Tab 3 — Reel** (Today Last Year, Weekly Reel, SlideshowScreen) | ✅ Hoàn thành |
| **Tab 4 — Me** (Settings, Permissions, Theme, Accent, Wallpaper, Language, Notifications) | ✅ Hoàn thành |
| **FAB + AddMomentSheet** (@gorhom/bottom-sheet) | ✅ Hoàn thành |
| **MomentComposer** (Photo, Note, Calendar, Mood, AI Suggestion) | ✅ Hoàn thành |
| **Calendar Integration** (expo-calendar, CalendarEventPicker) | ✅ Hoàn thành |
| **Theme Switching** (Light/Dark/System + 5 Accent Colors) | ✅ Hoàn thành |
| **Custom Wallpaper** | ✅ Hoàn thành |
| **i18n** (Vietnamese + English, useTranslation hook) | ✅ Hoàn thành |
| **Auto-Tracking Background** (autoTracker.ts) | ✅ Hoàn thành |
| **Notifications** (notifications.ts) | ✅ Hoàn thành (Đã cài `expo-notifications`) |
| **Slideshow Player** (SlideshowScreen) | ✅ Hoàn thành |
| **Cleanup legacy files** | ✅ Hoàn thành |

---

## 🐛 Bugs & Issues phát hiện khi review

### B1. `expo-notifications` chưa có trong `package.json`
- File `src/skills/notifications.ts` import `expo-notifications` nhưng package chưa được cài.
- **Fix:** `npx expo install expo-notifications`

### B2. Hardcoded Vietnamese text chưa qua i18n
Nhiều chỗ vẫn hardcoded Vietnamese, vi phạm nguyên tắc i18n 100%:

| File | Dòng | Nội dung |
|------|------|----------|
| `ReelScreen.tsx` | 98-99 | `"Phát toàn bộ"`, `"khoảnh khắc đã lưu"` |
| `MeScreen.tsx` | 119 | `"Sắp ra mắt"`, `"Tính năng Backup..."` |
| `MeScreen.tsx` | 139 | `"Đang bật PIN"`, `"Đã tạo PIN, đang tắt"` |
| `MeScreen.tsx` | 144 | `"Dùng PIN để khóa app"` |
| `MeScreen.tsx` | 154 | `"Đang bật — nhắc nhở hàng ngày"` |
| `MeScreen.tsx` | 242 | `"Cần quyền thông báo"`, `"Vào Cài đặt máy..."` |
| `MeScreen.tsx` | 380-381, 396 | `"Chọn giao diện"`, `"Đổi theme ngay..."`, `"Đóng"` |
| `MeScreen.tsx` | 451, 542-565 | `"Đóng"`, `"Thông báo nhắc nhở"`, `"Bật/Tắt thông báo"` |
| `LockScreen.tsx` | 204 | `"Dùng mã PIN"` |
| `PinSetupScreen.tsx` | 98 | `"Tắt PIN"` |
| `PinUnlockScreen.tsx` | 63 | `"Dùng Face ID / vân tay"` |
| `CalendarEventPicker.tsx` | 25 | `"Chọn mốc từ lịch"` |
| `TabNavigator.tsx` | 60, 156 | `"Mốc từ lịch"` |

### B3. `registerAutoTracker()` không được gọi ở đâu
- `autoTracker.ts` đã implement đầy đủ logic (signal collection, clustering, dedup, entry generation) nhưng `registerAutoTracker()` chưa bao giờ được gọi từ `App.tsx` hay bất kỳ đâu.

### B4. `LockScreen` gọi hook sau conditional return
- `LockScreen.tsx` dòng 125: `useEffect` được gọi sau `if (pinMode) { return ... }` → vi phạm Rules of Hooks.

### B5. `styles.ts` rất lớn (48KB, ~2000+ dòng)
- File này cực lớn, khó maintain. Nên tách thành nhiều file theo component/screen.

### B6. PIN hash dùng `simpleHash` — không an toàn
- `secureStore.ts` dòng 97: Dùng home-brew hash thay vì SHA-256. TODO trong code nhưng chưa fix.

### B7. `MomentComposer` tạo entry id bằng `Date.now().toString()`
- Dòng 59: Dùng `Date.now()` thay vì UUID → có thể trùng lặp nếu tạo 2 entry trong cùng 1ms.
- `autoTracker.ts` đã dùng `uuidv4()` đúng chuẩn — nên thống nhất.

### B8. Weekly Reels chưa có logic tự động tạo
- Không có code nào tự động tạo `WeeklyReel` khi tuần kết thúc.
- `reels` luôn là `[]` trừ khi tự chèn vào DB bằng tay.

### B9. `src/hooks/` folder rỗng — nên xóa
- Thư mục tồn tại nhưng không có file nào.

### B10. Palette Proxy bị tính tĩnh trong StyleSheet
- `palette` dùng Proxy để dynamic switch light/dark, nhưng `StyleSheet.create()` chỉ evaluate 1 lần khi import → rất nhiều style không reactive. Chỉ inline styles mới re-render đúng.

---

## 🚀 Đề xuất công việc tiếp theo (ưu tiên cao → thấp)

---

### Phase A: Bug Fixes & Cleanup (Ưu tiên CAO — làm ngay)

- [x] **A1.** Cài `expo-notifications` vào package.json
- [x] **A2.** Fix Rules of Hooks violation trong `LockScreen.tsx` — di chuyển `useEffect` lên trên conditional return
- [x] **A3.** Thay `Date.now().toString()` bằng `uuidv4()` trong `MomentComposer.tsx`
- [x] **A4.** Migrate tất cả hardcoded Vietnamese text sang `i18n/translations.ts` (danh sách ở B2)
- [x] **A5.** Xóa thư mục `src/hooks/` rỗng
- [x] **A6.** Xóa `@react-native-async-storage/async-storage` khỏi package.json (nếu còn tồn tại — hiện đã không import ở đâu)
- [x] **A7.** Kiểm tra và xóa legacy files nếu tồn tại:
  - `src/hooks/useJournalStore.ts`
  - `src/services/aiSuggestion.ts`

---

### Phase B: Wire Up Auto-Tracking (Ưu tiên CAO — USP của app)

- [x] **B1.** Gọi `registerAutoTracker()` từ `App.tsx` sau khi permissions đã được cấp
- [x] **B2.** Thêm toggle "Auto-Tracking" vào MeScreen (on/off)
- [x] **B3.** Khi user bật auto-tracking → `registerAutoTracker()`, tắt → `unregisterAutoTracker()`
- [x] **B4.** Thêm foreground trigger: khi mở app → chạy auto-tracker 1 lần (`runAutoTrackerOnce()`)
- [x] **B5.** Hiển thị suggested entries từ auto-tracker trên DayScreen (đã có UI, chỉ cần data)
- [x] **B6.** Test trên thiết bị thật (Android + iOS) — background fetch không chạy trên simulator
- [x] **B7.** Handle edge case: background fetch bị hệ điều hành tắt → hiển thị cảnh báo

---

### Phase C: Weekly Reel Auto-Generation (Ưu tiên TRUNG BÌNH)

- [ ] **C1.** Tạo function `generateWeeklyReel()` — tự động nhóm entries theo tuần
- [ ] **C2.** Gọi `generateWeeklyReel()` khi mở ReelScreen hoặc vào Chủ nhật
- [ ] **C3.** Chọn `coverImageId` từ entry có ảnh đầu tiên trong tuần
- [ ] **C4.** Tính `entryCount` và `entryIds` từ entries thực
- [ ] **C5.** Lưu WeeklyReel vào SQLite qua `insertReel()`

---

### Phase D: AI Service Nâng Cấp (Ưu tiên TRUNG BÌNH)

- [ ] **D1.** Thay MockAISuggestionService bằng real API (Gemini hoặc OpenAI)
- [ ] **D2.** Dùng `buildAIPrompt()` đã có sẵn để tạo prompt
- [ ] **D3.** Thêm config AI API key trong MeScreen settings (lưu SecureStore)
- [ ] **D4.** Fallback về mock service khi không có API key hoặc offline
- [ ] **D5.** Thêm photo labels bằng on-device vision (expo-ml hoặc API) cho prompt chất lượng hơn

---

### Phase E: Polish & UX (Ưu tiên TRUNG BÌNH)

- [ ] **E1.** Reverse geocoding: lat/lon → tên địa điểm (hiện chỉ có trong autoTracker, chưa có trong MomentComposer)
- [ ] **E2.** Tách `styles.ts` (48KB) thành nhiều file: `homeStyles.ts`, `dayStyles.ts`, `meStyles.ts`, `composerStyles.ts`, `commonStyles.ts`
- [ ] **E3.** Fix Palette Proxy: chuyển từ `StyleSheet.create` sang inline styles hoặc dùng `useMemo` re-compute styles khi theme thay đổi
- [ ] **E4.** Thêm micro-animations cho card transitions (FadeIn cho DayScreen timeline cards)
- [ ] **E5.** Implement Backup & Restore (hiện show "Coming Soon")
  - Export: SQLite → JSON file → chia sẻ qua Share Sheet
  - Import: Chọn file JSON → import vào SQLite
- [ ] **E6.** Thay `simpleHash()` PIN bằng SHA-256 (`expo-crypto`)
- [ ] **E7.** Thêm haptic feedback cho các nút quan trọng (FAB, Save, Mood chips)
- [ ] **E8.** Notification settings: cho phép user chọn giờ nhắc nhở (hiện hardcode 21:00)
- [ ] **E9.** Thêm DatePicker thật cho DayScreen (hiện chỉ có nút prev/next)
- [ ] **E10.** Swipe gesture để chuyển ngày trên DayScreen

---

### Phase F: Chất lượng code & Testing (Ưu tiên THẤP)

- [ ] **F1.** TypeScript strict mode — chạy `tsc --noEmit` và fix errors
- [ ] **F2.** Thêm unit tests cho các hàm quan trọng:
  - `database.ts` CRUD operations
  - `secureStore.ts` PIN verify
  - `autoTracker.ts` clustering logic
  - `aiService.ts` suggestion generation
- [ ] **F3.** Thêm React Testing Library tests cho screens chính
- [ ] **F4.** Setup ESLint + Prettier config
- [ ] **F5.** CI/CD: GitHub Actions chạy typecheck + tests
- [ ] **F6.** Add `RULES.md` và `AI_MEMORY_SKILLS.md` guidelines vào project root (hiện chỉ ở docs/)

---

### Phase G: Tính năng tương lai (Backlog)

- [ ] **G1.** Search entries: tìm kiếm theo text, ngày, mood, location
- [ ] **G2.** Entry editing: cho phép sửa entry đã lưu (hiện chỉ có tạo mới)
- [ ] **G3.** Entry deletion: cho phép xóa từng entry (hiện chỉ có xóa toàn bộ)
- [ ] **G4.** Photo gallery view: xem tất cả ảnh đã lưu dạng grid
- [ ] **G5.** Export diary: xuất nhật ký ra PDF hoặc HTML
- [ ] **G6.** Mood statistics: biểu đồ mood theo tuần/tháng/năm
- [ ] **G7.** App Usage tracking (allowUsage) — hiện có toggle nhưng chưa implement
- [ ] **G8.** Widget: iOS/Android widget hiển thị mood hôm nay
- [ ] **G9.** Cloud backup thực tế (iCloud/Google Drive) — hiện "Coming Soon"
- [ ] **G10.** Multiple diary notebooks (work, personal, travel)

---

## 📁 Cấu trúc file hiện tại (đã review)

```
├── App.tsx ✅
├── index.js ✅
├── package.json ⚠️ thiếu expo-notifications
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.tsx ✅
│   │   └── TabNavigator.tsx ⚠️ hardcoded text
│   ├── screens/
│   │   ├── HomeScreen.tsx ✅
│   │   ├── DayScreen.tsx ✅
│   │   ├── ReelScreen.tsx ⚠️ hardcoded text
│   │   ├── MeScreen.tsx ⚠️ nhiều hardcoded text
│   │   ├── OnboardingScreen.tsx ✅
│   │   ├── LockScreen.tsx 🐛 Rules of Hooks + hardcoded
│   │   ├── PinSetupScreen.tsx ⚠️ hardcoded text
│   │   ├── PinUnlockScreen.tsx ⚠️ hardcoded text
│   │   └── SlideshowScreen.tsx ✅
│   ├── components/
│   │   ├── AddMomentSheet.tsx ✅
│   │   ├── BottomTabs.tsx ✅
│   │   ├── CalendarEventPicker.tsx ⚠️ hardcoded text
│   │   ├── MomentComposer.tsx ⚠️ Date.now() ID
│   │   ├── ImagePlaceholder.tsx ✅
│   │   └── ScreenHeader.tsx ✅
│   ├── memory/
│   │   ├── store.ts ✅
│   │   ├── database.ts ✅
│   │   └── secureStore.ts ⚠️ simpleHash
│   ├── skills/
│   │   ├── autoTracker.ts ✅ code ok, chưa wire
│   │   ├── aiService.ts ✅ mock ok
│   │   ├── permissions.ts ✅
│   │   ├── calendar.ts ✅
│   │   └── notifications.ts ⚠️ thiếu package
│   ├── i18n/translations.ts ✅
│   ├── data/mockData.ts ✅
│   ├── theme/palette.ts ⚠️ Proxy issue
│   ├── services/imagePicker.ts ✅
│   ├── styles.ts ⚠️ quá lớn (48KB)
│   ├── types.ts ✅
│   └── hooks/ ❌ rỗng, nên xóa
```

---

## 📌 Khuyến nghị thứ tự thực hiện

1. **Sprint 1 (1-2 ngày):** Phase A — fix bugs & cleanup
2. **Sprint 2 (2-3 ngày):** Phase B — wire auto-tracking (đây là USP)
3. **Sprint 3 (1-2 ngày):** Phase C — weekly reel tự động
4. **Sprint 4 (2-3 ngày):** Phase D + E — AI nâng cấp + polish
5. **Sprint 5 (ongoing):** Phase F + G — tests + backlog features
