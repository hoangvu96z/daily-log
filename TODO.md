# Daily Log – Roadmap & TODO List chi tiết

> Mục đích: Theo dõi toàn bộ quá trình phát triển dựa trên roadmap đã chốt. 
> Các tính năng CÓ SẴN trong codebase được đánh dấu ✅ (Done by default).
> Các tính năng đang làm hoặc cần làm được phân loại theo P0, P1, P2.

---

## 🟢 PHẦN 1: CÁC TÍNH NĂNG ĐÃ CÓ SẴN (Verify qua CodeGraph)

Các tính năng này đã được team phát triển implement từ trước và hoạt động tốt. Chúng ta **không** cần làm lại.

- ✅ **Auto-Tracker Core:** `ensureAutoTrackerFreshness()` ở foreground và background (clustered signals).
- ✅ **Nguồn Dữ Liệu:** Đã có tín hiệu từ Photos, Location và Calendar.
- ✅ **Database & State:** `expo-sqlite` lưu trữ an toàn trên thiết bị. Zustand quản lý state.
- ✅ **Entry Lifecycle (CRUD):** Thêm, sửa, xoá (kèm confirm dialog) đều đã hoàn thiện.
- ✅ **Reels & Xem lại:** Tự động tạo `WeeklyReels`. Card "Hôm nay năm trước" đã có trong `ReelScreen`.
- ✅ **Media Backup:** Backup đã export thành công file `.dailylog` nén kèm thư mục `media/`.
- ✅ **Dark Mode & Accent:** Đã có Proxy xử lý màu sắc động trong `src/theme/palette.ts`.
- ✅ **Bảo mật cơ bản:** Face ID/Fingerprint check và PIN Code đã chạy.

---

## 🔴 PHẦN 2: SPRINT 1 – BUG FIXES & CORE WIRING (Đang tiến hành)

Những tác vụ khẩn cấp cần xử lý trước để ứng dụng không bị crash hoặc rò rỉ dữ liệu test.

- ✅ **[P0-4] Xóa dữ liệu test & mock (Done)**
  - Xoá cờ `isPremium = true` hardcode trong `store.ts`.
  - Đưa test entry ("Hôm nay năm trước") vào block `if (__DEV__)`.

- ✅ **[P0-5] Cập nhật copy Paywall & Feature list (Done)**
  - Đã thêm tính năng `paywallFeature5` (Reel hàng tuần & Heatmap 30 ngày) vào `vi.ts` và `en.ts`.
  - Cập nhật text Feature 2 thành "Multiple Photos Per Moment" cho chuẩn xác.
  - Sửa hardcode text `"Allow"` trong `TabNavigator.tsx`.

- ⏳ **[P0-2] Kết nối Gemini API (Đang thực hiện)**
  - ✅ Đã tạo file template `.env.example`.
  - ✅ Cần tạo file `.env` với biến `EXPO_PUBLIC_GEMINI_API_KEY` (User tự điền key).
  - ✅ `aiService.ts` đã support đọc `EXPO_PUBLIC_GEMINI_API_KEY`.

- ✅ **[P1-4] Xóa hardcoded string trong Services (Done)**
  - Chuyển lỗi tiếng Việt trong `src/services/subscription.ts` sang dùng `t()`.
  - Chuyển fallback text của IAP sang dùng i18n key thay vì text cứng.

---

## 🟠 PHẦN 3: SPRINT 2 – IAP & REVENUECAT (Tiếp theo)

Tích hợp cổng thanh toán thực tế thay cho mock và `expo-in-app-purchases` (đã deprecated).

- ✅ **[P0-3] RevenueCat Integration (Done)**
  - ✅ Cài đặt `react-native-purchases`.
  - ✅ Thêm `EXPO_PUBLIC_RC_IOS_KEY` và `EXPO_PUBLIC_RC_ANDROID_KEY` vào `.env`.
  - ✅ Implement `NativePurchaseService` trong `subscription.ts` (Sử dụng API thực `Purchases.purchasePackage()`, v.v.).
  - Testing sandbox trên TestFlight.

---

## 🟡 PHẦN 4: SPRINT 3 – UI/UX POLISHING & DIAGNOSTICS

Hoàn thiện các hiệu ứng mượt mà và fix các lỗi hiển thị chưa triệt để.

- ✅ **[P1-1] Dark Mode Force Re-mount (Done)**
  - Xử lý việc `StyleSheet.create` bị cache khi đổi theme bằng cách thêm `key={activeTheme}` vào App.tsx root.

- ✅ **[P1-2] Khớp Accent Color (Done)**
  - Đảm bảo 6 màu accent hoạt động chuẩn xác trong toàn bộ UI (đã thay thế màu tĩnh của "great" mood bằng `palette.primary` trong các file components).

- ✅ **[P1-3] Cải thiện Mood Calendar (Done)**
  - Đã extract hàm tính streak. Heatmap 30 ngày và Emoji/Dots đã hoạt động.
  - Hiển thị Streak Chip (vd: 🔥 3 ngày liên tục).
  - Khoá 30-day heatmap phía sau Premium.

- ✅ **[P1-5] Dev Diagnostics Panel (Done)**
  - Màn hình phụ trong Settings (chỉ bật khi `__DEV__ === true`) hiển thị thông số hệ thống, log của Auto-Tracker.

- ✅ **[P1-6] Animation cho thẻ Timeline (Done)**
  - Slide-out Right khi Save, Slide-out Left khi Discard gợi ý. (Sử dụng `react-native-reanimated`).

---

## 🔵 PHẦN 5: SPRINT 4 – ADVANCED FEATURES (Giai đoạn Beta/Post-Beta)

- ✅ **[P2-1] Đăng nhiều ảnh (Multi-photo flow) (Done)**
  - Hệ thống DB (`media_json`), component `MomentComposer` và `PhotoGrid` đã hoàn thiện và hỗ trợ tối đa 10 ảnh/video.
- ✅ **[P2-2] Deep-link Push Notification (Done)**
  - ✅ Tạo `src/hooks/useNotificationDeepLink.ts` — lắng nghe `addNotificationResponseReceivedListener` + `getLastNotificationResponseAsync` (cold-launch).
  - ✅ Khi bấm thông báo nhắc nhở → tự động navigate đến `DayScreen` (ngày hôm nay hoặc ngày cụ thể).
  - ✅ Khi bấm thông báo tuần → navigate đến `ReelScreen`.
  - ✅ Tích hợp vào `AppNavigator.tsx` bằng `useNavigationContainerRef`.
  - ✅ Bổ sung `scheduleEntryReminder()` trong `notifications.ts` cho reminder gắn với ngày cụ thể.
- ✅ **[P2-3] Biểu đồ xu hướng (Mood Trend Chart) (Done)**
  - Dùng `react-native-chart-kit` vẽ biểu đồ trong màn Calendar (Trend Mode).
- ✅ **[P2-4] Hỗ trợ hiển thị Video (Done)**
  - `expo-av` đã được dùng trong `SlideshowScreen.tsx`, `PhotoGrid.tsx`, `ImageViewer.tsx`, `DayScreen.tsx` và `DetailScreen.tsx`.
  - Video tự phát (muted, looping) trong slideshow khi slide là kiểu `video`.
- ⏳ **[P2-5] Home Screen Widget (iOS/Android)**
  - Chờ Expo SDK 51 ổn định thư viện `expo-widgets` để hiển thị nhắc nhở ra ngoài màn hình chính.

- ✅ **[P2-6] Search & AI Insights Refactor (Done)**
  - `SearchScreen` đã hỗ trợ i18n đầy đủ, lọc thêm theo `date`.
  - `DailyInsightDialog` đã đọc 7 ngày gần nhất để tính mood phổ biến, streak, best day, v.v thay vì text cứng.
  - Sửa lỗi null check cho `SharedGroupPreferences` (Widget sync).

---

## 🟣 PHẦN 6: SPRINT 5 – EXPRESSION & ORGANIZATION

Hai tính năng giúp user bộc lộ cảm xúc tự nhiên hơn và tổ chức nhật ký có chủ đích hơn.

---

### ⏳ [P3-1] Voice Memo – Ghi âm cảm xúc

> Thay vì gõ text, user có thể ghi âm giọng nói ngắn để lưu lại cảm xúc trong khoảnh khắc. Đây là **audio clip thuần** (không phải voice-to-text). Voice memo hiển thị trực tiếp trên timeline và có thể nghe lại bất kỳ lúc nào.

#### Yêu cầu xác nhận
- ⏱️ **Giới hạn 2 phút (120 giây)** / voice memo — đếm ngược khi ghi
- 🎧 **Hiển thị trên TimelineCard** — player mini có thể bấm Play ngay tại timeline
- 🔒 **Không mất dữ liệu** — file âm thanh phải tồn tại lâu dài, kể cả qua update app và backup/restore

#### Phân tích kỹ thuật
- **Thư viện:** `expo-av` (đã cài sẵn) — `Audio.Recording` để ghi, `Audio.Sound` để phát
- **Định dạng:** `.m4a` (AAC, ~1MB/phút) — native iOS/Android, không cần thêm codec
- **Thư mục lưu:** `FileSystem.documentDirectory + 'voice_memos/'`
  - ✅ Không bị xóa khi clear cache
  - ✅ Tồn tại qua các lần update app
  - ✅ Được iOS backup lên iCloud tự động (nằm trong Documents)
  - ❌ Bị xóa khi user uninstall app (chấp nhận được — giống ảnh local)

#### Chiến lược bảo vệ dữ liệu
```
Khi ghi xong:
  expo-av tạo temp file ở cacheDirectory
      ↓
  Copy sang documentDirectory/voice_memos/{entryId}.m4a (stable path)
      ↓  
  URI stable này lưu vào SQLite (voiceMemoUri)
      ↓
  Delete temp file

Khi xóa entry:
  Xóa file .m4a khỏi FileSystem
  Xóa row khỏi SQLite

Khi Backup (.dailylog export):
  Copy tất cả file trong voice_memos/ vào zip/media/
  
Khi Restore:
  Copy file từ zip/media/ về documentDirectory/voice_memos/
  URI trong SQLite vẫn hợp lệ

Startup orphan cleanup:
  Quét tất cả file trong voice_memos/
  So sánh với entries có voiceMemoUri
  Xóa file không có entry tương ứng (tránh rò rỉ dung lượng)
```

#### Các bước implement

**Bước 1 — DB Migration & Types**
- [ ] Thêm Migration 4 vào `database.ts`: `ALTER TABLE entries ADD COLUMN voiceMemoUri TEXT`
- [ ] Thêm `voiceMemoUri?: string` vào type `Entry` trong `types.ts`
- [ ] Cập nhật `insertEntry()` và `rowToEntry()` trong `database.ts`
- [ ] Thêm `voiceMemoUri` vào `updateEntry()` patch list

**Bước 2 — `src/skills/voiceMemo.ts` (new file)**
- [ ] `ensureVoiceMemoDir()` — tạo thư mục `voice_memos/` nếu chưa có
- [ ] `startRecording()` → trả về `Audio.Recording` instance (với preset HighQuality AAC)
- [ ] `stopAndSaveRecording(recording, entryId)` → copy sang stable path, trả về `{ uri, durationMs }`
- [ ] `deleteVoiceMemo(uri)` → xóa file khỏi FileSystem (silent fail nếu không tồn tại)
- [ ] `cleanupOrphanedVoiceMemos(entries)` → xóa file không có entry
- [ ] `formatDuration(ms)` → `"1:45"` format (tối đa `"2:00"`)

**Bước 3 — `src/components/VoiceMemoRecorder.tsx` (new file)**
- [ ] Nút mic → tap để bắt đầu/dừng (không hold — khó với clip 2 phút)
- [ ] Khi ghi: waveform giả (Animated bars), đồng hồ đếm lên `0:00 → 2:00`, countdown bar đỏ khi còn 15s
- [ ] Tự động dừng khi đạt 120 giây
- [ ] Sau khi dừng: hiển thị `VoiceMemoPlayer` preview inline + nút 🗑️ để xóa và ghi lại
- [ ] Callback `onRecorded(uri: string, durationMs: number)` / `onDeleted()`

**Bước 4 — `src/components/VoiceMemoPlayer.tsx` (new file)**
- [ ] Props: `uri: string`, `durationMs: number`, `compact?: boolean`
- [ ] Dùng `Audio.Sound.createAsync()` để load file
- [ ] Nút ▶️/⏸️ + thanh progress (Slider hoặc custom bar) + nhãn thời gian `0:32 / 1:45`
- [ ] `compact = true` → dùng trong `TimelineCard` (chiều cao thấp ~44px, không label text)
- [ ] `compact = false` → dùng trong `DetailScreen` và `MomentComposer` preview (đầy đủ)
- [ ] Tự unload sound khi unmount (tránh memory leak)
- [ ] Graceful error: nếu file không tìm thấy → hiện icon cảnh báo thay vì crash

**Bước 5 — Tích hợp vào `MomentComposer`**
- [ ] Thêm nút 🎙️ vào toolbar (cạnh 📷, 📝, 📅)
- [ ] Bấm nút mic → mở `VoiceMemoRecorder` dạng bottom sheet hoặc inline expand
- [ ] Khi có `voiceMemoUri` trong draft → hiển thị `VoiceMemoPlayer` compact + nút xóa
- [ ] Khi Save entry: `voiceMemoUri` được truyền vào entry
- [ ] Khi Cancel composer: nếu đã ghi → `deleteVoiceMemo(uri)` để không rò rỉ file

**Bước 6 — Tích hợp vào `TimelineCard`**
- [ ] Nếu `entry.voiceMemoUri` tồn tại → render `<VoiceMemoPlayer compact uri={...} durationMs={...} />` bên dưới text
- [ ] Player mini chiều cao ~44px, màu neutral, không chiếm nhiều không gian

**Bước 7 — Tích hợp vào `DetailScreen`**
- [ ] Nếu entry có `voiceMemoUri` → render `VoiceMemoPlayer` full (không compact) trong section riêng
- [ ] Nút xóa voice memo riêng biệt (confirm alert trước khi xóa)

**Bước 8 — Orphan cleanup khi khởi động**
- [ ] Trong `initStore()` sau khi load entries → gọi `cleanupOrphanedVoiceMemos(entries)`
- [ ] Runs silent in background, không block UI

**Bước 9 — Backup & Restore**
- [ ] Trong `backup.ts` (hoặc tương đương): zip thêm tất cả file từ `voice_memos/`
- [ ] Trong restore: copy file âm thanh về đúng thư mục trước khi insert entries

**Bước 10 — i18n**
- [ ] Thêm section `voiceMemo` vào `vi.ts` và `en.ts`:
  - `tapToRecord`, `recording`, `tapToStop`, `limitWarning` (`"Còn 15 giây"`), `limitReached`, `playback`, `deleteConfirm`, `fileNotFound`

#### Lưu ý kỹ thuật
- Xin permission microphone: `Audio.requestPermissionsAsync()` trước khi ghi lần đầu
- Trên iOS, cần `infoPlist.NSMicrophoneUsageDescription` trong `app.json`
- Voice memo KHÔNG phải Premium — tất cả user đều dùng được
- File size trung bình: ~1MB/phút → 2 phút ≈ 2MB / voice memo


---

### ⏳ [P3-2] Category / Tag System – Phân loại khoảnh khắc

> User tự tạo và chọn danh mục cho mỗi khoảnh khắc (đi làm, người yêu, gia đình, bạn bè...). Mỗi danh mục có màu sắc và emoji đại diện. Quản lý danh mục trong Settings.

#### Phân tích kỹ thuật
- **Lưu trữ:** Bảng `categories` trong SQLite (không dùng settings JSON vì cần CRUD độc lập).
- **Entry:** Thêm cột `categoryId TEXT` vào bảng `entries`.
- **Màu sắc:** Hex string (vd: `#FF6B6B`). Picker dùng thư viện nhẹ hoặc tự build grid màu.
- **Emoji:** Text input một ký tự hoặc emoji picker (có thể dùng `@fawazahmed0/react-native-emoji-picker` hoặc grid emoji đơn giản).

#### Các bước implement

**Bước 1 — DB Migration & Types**
- [ ] Thêm Migration 4 (hoặc 5 nếu voice memo đã dùng 4):
  ```sql
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '📁',
    color TEXT NOT NULL DEFAULT '#8B5CF6',
    sortOrder INTEGER NOT NULL DEFAULT 0,
    isDefault INTEGER NOT NULL DEFAULT 0
  );
  ALTER TABLE entries ADD COLUMN categoryId TEXT;
  ```
- [ ] Thêm type `Category` vào `types.ts`:
  ```ts
  export type Category = {
    id: string;
    name: string;
    emoji: string;   // single emoji char
    color: string;   // hex color
    sortOrder: number;
    isDefault: boolean; // không xóa được
  };
  ```
- [ ] Thêm `categoryId?: string` vào type `Entry`

**Bước 2 — `database.ts` — CRUD categories**
- [ ] `getAllCategories()` → `Category[]`
- [ ] `insertCategory(category)` → void
- [ ] `updateCategory(id, patch)` → void
- [ ] `deleteCategory(id)` → void (chỉ xóa nếu `!isDefault`)
- [ ] Cập nhật `insertEntry()`, `rowToEntry()` cho `categoryId`

**Bước 3 — Default categories**
- [ ] Seed categories khi DB rỗng trong `initStore()`:
  | Name | Emoji | Color |
  |---|---|---|
  | Công việc | 💼 | `#6366F1` |
  | Gia đình | 🏠 | `#F59E0B` |
  | Bạn bè | 🤝 | `#10B981` |
  | Người yêu | 💕 | `#EC4899` |
  | Bản thân | 🌱 | `#8B5CF6` |
  | Du lịch | ✈️ | `#0EA5E9` |

**Bước 4 — Store**
- [ ] Thêm `categories: Category[]` vào `JournalState`
- [ ] Thêm actions: `addCategory`, `updateCategory`, `removeCategory`
- [ ] Load categories trong `initStore()`

**Bước 5 — `src/components/CategoryPicker.tsx` (new file)**
- [ ] Horizontal scroll hoặc grid hiển thị categories dạng chip (emoji + name)
- [ ] Chip đang chọn → highlight màu của category đó
- [ ] Chip "Không có" → bỏ chọn
- [ ] Callback `onSelect(categoryId: string | null)`

**Bước 6 — Tích hợp vào `MomentComposer`**
- [ ] Thêm `CategoryPicker` bên dưới mood selector
- [ ] Draft lưu `categoryId`
- [ ] Truyền `categoryId` vào entry khi Save

**Bước 7 — `src/screens/CategoriesSettingsScreen.tsx` (new file)**
- [ ] Danh sách categories (kéo thả để sắp xếp — dùng `react-native-draggable-flatlist`)
- [ ] Mỗi row: emoji + name + color dot + nút Edit/Delete
- [ ] FAB "Thêm mới" → mở sheet tạo category
- [ ] Delete: disabled nếu `isDefault === true`, confirm alert nếu category đang được dùng bởi entries

**Bước 8 — `src/components/CategoryEditorSheet.tsx` (new file)**
- [ ] Input: tên category
- [ ] Emoji picker: grid 30-40 emoji phổ biến + input thủ công
- [ ] Color picker: grid 16-20 màu preset (không dùng full color wheel để đơn giản)
- [ ] Preview chip live: `[emoji] Name` với nền màu đã chọn
- [ ] Save / Cancel

**Bước 9 — Tích hợp vào `TimelineCard` và `DetailScreen`**
- [ ] Hiển thị category chip (emoji + tên, nền màu category) trên mỗi entry card
- [ ] Vị trí: cạnh mood chip trên `TimelineCard`

**Bước 10 — Filter theo Category trong `SearchScreen` / `DayScreen`**
- [ ] Thêm filter chip ngang "Tất cả | 💼 Công việc | 🏠 Gia đình | ..." ở đầu DayScreen
- [ ] `SearchScreen` hỗ trợ filter by categoryId

**Bước 11 — i18n**
- [ ] Thêm section `categories` vào `vi.ts` và `en.ts`:
  - `title`, `addNew`, `editCategory`, `deleteConfirm`, `cantDeleteDefault`, `noCategory`
  - Default category names (tất cả đều có i18n key)

**Bước 12 — Tích hợp vào Settings**
- [ ] Thêm row "Danh mục" vào `SettingsScreen` → navigate đến `CategoriesSettingsScreen`
- [ ] Thêm `CategoriesSettings` vào `RootStackParamList` + `AppNavigator`

#### Lưu ý kỹ thuật
- Khi xóa category → các entry đang dùng `categoryId` đó → set `categoryId = null` (không xóa entry)
- Category không bắt buộc — user có thể lưu entry không có category
- Category search filter trong DayScreen không phải Premium
