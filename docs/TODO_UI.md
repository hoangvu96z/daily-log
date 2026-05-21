# Daily Log — Master TODO v2

> Gộp từ: UI Review (Gen Z polish) + Market Analysis & Roadmap.
> Mỗi task có priority, file liên quan, và acceptance criteria rõ ràng.
>
> **Priority**: 🔴 P0 (must-have, ảnh hưởng trực tiếp retention) · 🟡 P1 (nên có) · 🟢 P2 (nice-to-have)
> **Category**: `[UI]` `[LOGIC]` `[AI]` `[INFRA]` `[MONETIZE]`

---

## Phase 1 — Auto-Journal "chạm được" + Core UI Polish
> **Mục tiêu**: User mở app lần đầu → thấy 2–3 entry auto → Lưu/Bỏ → hiểu ngay concept.

### 🔴 1.1 `[LOGIC]` Pipeline auto-tracker tối giản — ✅ DONE
**File**: `src/skills/autoTracker.ts`, `src/memory/database.ts`
- [x] Viết hàm `refreshAutoSuggestions()` chạy mỗi khi user mở app (không phụ thuộc background fetch)
- [x] Đọc ảnh mới trong 24–48h từ `expo-media-library`
- [x] Nhóm ảnh theo block 60–90 phút
- [x] Với mỗi block chưa có entry → tạo `Entry { status: 'suggested', imageUri, time, mood: 'neutral' }`
- [x] Lưu vào SQLite
- **AC**: Mở app → tab Ngày hiển thị 1–3 card "Gợi ý" từ ảnh thật của user

### 🔴 1.2 `[LOGIC]` Seed data cho user mới (first-run experience) — ✅ DONE
**File**: `src/data/seedEntries.ts` (NEW), `src/memory/store.ts`
- [x] Nếu DB trống hoàn toàn, tạo 2–3 entry demo trong ngày hiện tại
- [x] Entry demo có text mẫu, mood khác nhau, location names
- [x] Hiển thị ngay trên Home + Day tab để user hiểu concept
- [x] Khi user tạo entry thật đầu tiên → xóa demo entries (seed-* prefix)
- **AC**: Lần đầu mở app → Home có highlight tiles, Day có timeline cards

### 🔴 1.3 `[UI]` Visual timeline polish — ✅ DONE
**File**: `src/styles.ts` (sections: `railDot`, `railLine`, `entryCard`)
- [x] `railDot`: soft glow shadow (`shadowOpacity: 0.4, shadowRadius: 6`)
- [x] `railLine`: muted (`rgba(0,0,0,0.08)` light / `rgba(91,192,190,0.15)` dark)
- [x] `entryCard`: depth shadow (`elevation: 2, shadowOpacity: 0.12, shadowRadius: 12`)
- **AC**: Timeline cards have depth, not flat

### 🔴 1.4 `[UI]` Photo-first entry cards — ✅ DONE
**File**: `src/screens/DayScreen.tsx`, `src/components/ImagePlaceholder.tsx`
- [x] Khi `entry.imageUri` tồn tại → hiển thị ảnh trên cùng card (full width, bo tròn góc trên)
- [x] Layout: Image (aspectRatio 16/9) → text + mood meta bên dưới
- [x] Refactor `ImagePlaceholder` hoặc tạo `src/components/EntryImage.tsx`
- **AC**: Entry có ảnh → card hiển thị ảnh thật, trông giống story feed

### 🔴 1.5 `[UI]` Home → Photo mood board grid (2×2) — ✅ DONE
**File**: `src/screens/HomeScreen.tsx`, **NEW** `src/components/HighlightTile.tsx`
- [x] Thay `heroCard` text-only bằng grid 2×2:
  - Tile 1–3: entry highlight hôm qua — ảnh background + gradient overlay + mood chip (`☕ Cà phê sáng`)
  - Tile 4: Peace Index thu nhỏ (nửa vòng tròn + "Tuần này khá bình yên 💙")
- [x] Tạo component `HighlightTile` — props: `entry`, `onPress`
- [x] Tap tile → navigate Day tab đúng mốc giờ
- [x] Fallback: khi không có ảnh → card text hiện tại
- **AC**: Home trông như Instagram mood board, không như dashboard KPI

---

## Phase 2 — AI Suggestion + UX Refinement

### 🔴 2.1 `[AI]` AI gợi ý note — service layer — ✅ DONE
**File**: `src/skills/aiService.ts`
- [x] Thiết kế interface `suggestNote({ time, weekday, locationName, photoLabels[] }) → string`
- [x] MVP: gọi cloud model (Gemini/OpenAI) với prompt đã define trong README
- [x] Dữ liệu ẩn danh: chỉ gửi label, KHÔNG gửi ảnh thô
- [x] Prompt: giọng trung tính, < 40 từ, tiếng Việt, không phân tích tâm lý
- [x] Fallback: nếu API > 3s → dùng template local (đã có mock)
- **AC**: Từ 1 ảnh + metadata → nhận được 1–2 câu gợi ý tự nhiên

### 🔴 2.2 `[AI]` Hook AI vào UI — MomentComposer + card Gợi ý — ✅ DONE
**File**: `src/components/MomentComposer.tsx`, `src/screens/DayScreen.tsx`
- [x] Khi user tạo entry từ ảnh → gọi `suggestNote()` → hiển thị AI suggestion card
- [x] Nút "Dùng gợi ý" / "Bỏ qua" trên card
- [x] Trong Day tab: card Suggested cũng show AI text nếu có
- **AC**: User chụp ảnh → 2–3s sau thấy gợi ý AI → tap "Dùng" → text auto-fill

### 🟡 2.3 `[UI]` CTA buttons layout — full-width — ✅ DONE
**File**: `src/screens/HomeScreen.tsx`
- [x] Layout column: `Xem cả ngày` full-width primary, `Lịch cảm xúc` full-width secondary
- **AC**: 2 nút chiếm full width, dễ tap trên mobile

### 🟡 2.4 `[UI]` Tile fade-in animation — ✅ DONE
**File**: `src/screens/HomeScreen.tsx`
- [x] Import `FadeInDown` từ `react-native-reanimated`
- [x] Wrap highlight tiles: `<Animated.View entering={FadeInDown.delay(i * 80)}>`
- **AC**: Tiles xuất hiện lần lượt với animation mượt

### 🟡 2.5 `[UI]` Parallax micro-interaction trên Onboarding — ✅ DONE
**File**: `src/screens/OnboardingScreen.tsx`
- [x] Dùng `scrollX` → `Animated.interpolate` → `translateY` parallax cho icon circle
- [x] Vuốt slide → icon dịch chuyển nhẹ tạo cảm giác depth

### 🟡 2.6 `[UI]` Mood Calendar — day cell tap interaction — ✅ DONE
**File**: `src/screens/HomeScreen.tsx` (MoodCalendar)
- [x] Thêm state `selectedDay`
- [x] Tap ô ngày → highlight, mở mini bottom sheet / preview container:
  - [x] 1–2 entry tiêu biểu (ảnh + caption)
  - [x] Nút "Xem cả ngày"
- **AC**: Tap vào ngày trong calendar → thấy preview entries

### 🟡 2.7 `[UI]` Settings — playful icons — ✅ DONE
**File**: `src/screens/MeScreen.tsx`
- [x] Review icons: `shield-checkmark-outline` → `lock-closed-outline`
- [x] Consistent accent color cho tất cả icon (sử dụng palette.primary động)
- **AC**: Icons cảm giác friendly, không enterprise

---

## Phase 3 — Permission UX + Privacy Messaging

### 🔴 3.1 `[UI]` Progressive permission flow — ✅ DONE
**File**: `src/navigation/TabNavigator.tsx`, `src/services/imagePicker.ts`, `src/skills/calendar.ts`
- [x] KHÔNG xin tất cả quyền trong onboarding
- [x] Onboarding chỉ giới thiệu value → bấm "Bắt đầu" → vào app
- [x] Khi cần quyền lần đầu (ví dụ: user tap "Chụp khoảnh khắc"):
  - [x] Hiển thị modal giải thích 1 dòng → rồi mới gọi system permission
  - [x] Mỗi quyền xin riêng: Ảnh → Calendar
- **AC**: User không bị overwhelm bởi 3 permission dialog liên tiếp, chỉ hiện giải thích trước khi xin quyền thực tế


### 🟡 3.2 `[UI]` Privacy architecture explanation — ✅ DONE
**File**: `src/screens/MeScreen.tsx`
- [x] Thêm section/card trong tab Me giải thích kiến trúc privacy:
  - [x] "Dữ liệu lưu ở đâu?" → SQLite trên máy
  - [x] "AI có đọc nhật ký không?" → Chỉ gửi label ẩn danh, không gửi ảnh/text
  - [x] "Có server bên ngoài không?" → Không, trừ khi bật Backup tùy chọn
- [x] Design giống Apple Journal "Journaling Suggestions & Privacy" page (dùng Modal overlay thanh lịch với icon và layout thông tin chi tiết)
- **AC**: User có thể tự tra cứu privacy policy ngay trong app

---

## Phase 4 — Premium Features + Monetization Prep

### 🟡 4.1 `[INFRA]` Premium flag & gating — ✅ DONE
**File**: `src/types.ts`, `src/memory/store.ts`
- [x] Thêm `isPremium: boolean` vào Settings type
- [x] Tạo UI Upgrade Premium / Active banner
- [x] Đặt gate UI cho premium features (Backup, Wallpapers, Premium Accent Colors)
- [x] Bấm mua Premium giả lập cập nhật trạng thái `isPremium` sang `true` và lưu vào store để người dùng test thử
- **AC**: Có thể nâng cấp Premium thành công, UI phản ánh đúng trạng thái Premium active

### 🟡 4.2 `[LOGIC]` Backup mã hóa — ✅ DONE
**File**: **NEW** `src/skills/backup.ts`
- [x] Export DB SQLite + media đã mã hóa → file zip
- [x] Upload lên iCloud/Google Drive do user chọn (dùng `expo-file-system` + sharing)
- [x] Import/restore từ file backup
- [x] Đánh dấu premium feature
- **AC**: User export → xóa app → install lại → restore → data intact

### 🟡 4.3 `[UI]` Weekly Reel — recap tuần — ✅ DONE
**File**: `src/screens/ReelScreen.tsx`, `src/screens/SlideshowScreen.tsx`
- [x] Auto-generate weekly reel từ entries của tuần
- [x] Slideshow ảnh + text + mood transitions
- [x] Reel card dùng ảnh thật làm cover (thay vì color placeholder)
- [x] Thêm icon overlay ✨ hoặc 🎞️ ở góc cover
- **AC**: Mỗi tuần có 1 reel card, tap → play slideshow

### 🟡 4.4 `[UI]` Lịch cảm xúc mở rộng — ✅ DONE
**File**: `src/screens/HomeScreen.tsx` (MoodCalendar)
- [x] Mở rộng từ 7 ngày → 30 ngày (scrollable)
- [x] Heatmap view: ô màu theo mood, intensity theo số entries
- [x] On-this-day: hiển thị entries cùng ngày năm trước
- [x] Đánh dấu premium feature (> 7 ngày)
- **AC**: Calendar dạng heatmap 30 ngày, tap ngày → xem entries

### 🟢 4.5 `[INFRA]` IAP / Subscription integration — ✅ DONE
**File**: **NEW** `src/services/subscription.ts`, `src/components/PaywallModal.tsx`
- [x] Tích hợp RevenueCat hoặc Expo IAP (service layer sẵn sàng)
- [x] Gói: ~19k/tháng hoặc ~99k/năm hoặc ~199k lifetime (local VN pricing)
- [x] Paywall screen với feature comparison
- [x] Restore purchase flow
- **AC**: User có thể mua premium, restore trên thiết bị mới

---

## Phase 5 — Infrastructure & Polish

### 🟢 5.1 `[INFRA]` DB schema migration system
**File**: `src/memory/database.ts`
- [x] Thiết kế migration table: `schema_version`
- [x] Viết migration runner chạy khi app khởi động
- [x] Chuẩn hóa schema cho Entry, Settings, WeeklyReel
- [x] Tránh breaking changes khi thêm fields mới (tags, multi-device sync…)
- **AC**: Có thể upgrade DB schema mà không mất data user

### 🟢 5.2 `[INFRA]` Background fetch reliability
**File**: `src/skills/autoTracker.ts`
- [x] `expo-background-fetch` không reliable trên iOS/Android OEM
- [x] Strategy: background fetch là bonus, logic chính chạy khi user mở app
- [x] Thêm logic "catch-up" khi app foreground: scan ảnh từ lần cuối scan
- [x] Log & monitor background fetch success rate
- **AC**: Auto-suggestions luôn cập nhật dù background fetch bị OS kill

### 🟢 5.3 `[UI]` Typography audit
**File**: `src/styles.ts`, all screens
- [x] Verify `PlusJakartaSans` dùng consistent (không bị fallback system font)
- [x] Chuẩn font weights: title=800, subtitle=600, body=400
- [x] Check inline styles trong HomeScreen, MeScreen dialogs
- **AC**: Toàn app dùng đúng font, không có chỗ nào bị system default

### 🟢 5.4 `[UI]` Shared animation component — ✅ DONE
**File**: **NEW** `src/components/AnimatedCard.tsx`
- [x] Extract `AnimatedCard` từ `ReelScreen.tsx`
- [x] Variants: `fadeInUp`, `fadeInDown`, `scaleIn`, `slideOutRight`
- [x] Dùng chung cho: Home tiles, Day cards, Reel cards
- **AC**: Animation consistent, code DRY

### 🟢 5.5 `[UI]` Button press animation (Onboarding) — ✅ DONE
**File**: `src/screens/OnboardingScreen.tsx`
- [x] `Animated.spring` scale 0.98 khi bấm nút Tiếp tục/Bắt đầu
- [x] Dùng `Pressable` onPressIn/onPressOut
- **AC**: Nút có micro-feedback khi bấm

### 🟢 5.6 `[UI]` Header collapse on scroll (Home) — ✅ DONE
**File**: `src/screens/HomeScreen.tsx`
- [x] ScrollView onScroll + Animated.interpolate
- [x] fontSize: 32→22, paddingTop: 28→12
- **AC**: Scroll xuống → header co lại mượt

### 🟢 5.7 `[UI]` "Thống kê cảm xúc" thay duplicate Calendar trong Me tab — ✅ DONE
**File**: `src/screens/MeScreen.tsx`
- [] Đổi label calendar thành "Thống kê cảm xúc"
- [] Text: "Xem bạn đã lên mood board thế nào"
- [] Tap → mở MoodCalendar modal
- **AC**: Không duplicate tên "Lịch cảm xúc" ở 2 chỗ

---

## Tổng quan

| Phase | Tasks | Priority | Focus |
|-------|-------|----------|-------|
| **1 — Auto-Journal Core** | 5 | 🔴 P0 | Auto-tracker, seed data, timeline UI, photo cards, mood board |
| **2 — AI + UX Refine** | 7 | 🔴+🟡 | AI suggestion, CTA layout, animations, calendar tap |
| **3 — Permission UX** | 2 | 🔴+🟡 | Progressive permissions, privacy messaging |
| **4 — Premium Prep** | 5 | 🟡+🟢 | Premium flag, backup, weekly reel, extended calendar, IAP |
| **5 — Infra & Polish** | 7 | 🟡+🟢 | DB migration, background fetch, typography, animations |
| **Total** | **26** | | |

### Thứ tự thực hiện gợi ý:
```
Phase 1 (1–2 tuần)     → Auto-tracker + Timeline polish + Photo cards + Seed data
Phase 2 (1–2 tuần)     → AI service + Hook vào UI + CTA + Animations
Phase 3 (3–5 ngày)     → Progressive permissions + Privacy page
Phase 4 (2–3 tuần)     → Premium features + Monetization
Phase 5 (ongoing)      → Polish, migration, audit
```
