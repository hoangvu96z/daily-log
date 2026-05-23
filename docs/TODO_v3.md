# Daily Log - TODO v3 (Roadmap Giai đoạn tiếp theo - Chi tiết)

Dựa trên roadmap chi tiết của Daily Log, dưới đây là tài liệu đặc tả (spec) và danh sách task chi tiết (checklist) dành cho Developer / AI Coder. Tài liệu này cung cấp rõ ràng từng function, từng file, cấu trúc state và các use-cases cụ thể cần xử lý.

---

## 📦 Khối P0 – Auto‑Journal Core & Vòng đời Entry

Mục tiêu: Đảm bảo tính năng tự động ghi nhận nhật ký (Auto-tracker) chạy ổn định, tạo ra gợi ý chính xác từ Ảnh + Vị trí + Sự kiện lịch. Đóng vòng đời của một entry (tạo, sửa, xóa, duyệt gợi ý).

### 1. Củng cố Auto Tracker Foreground
- **File:** `src/skills/autoTracker.ts`, `src/screens/HomeScreen.tsx`, `src/screens/DayScreen.tsx`
- [x] Xây dựng hàm `ensureAutoTrackerFreshness()`:
  - [x] Import `useJournalStore` và lấy giá trị `settings.last_auto_scan_time`.
  - [x] So sánh `last_auto_scan_time` với thời gian hiện tại. Nếu khoảng cách > 4 giờ HOẶC khác ngày (dựa trên `Date` API):
    - [x] Gọi hàm `runAutoTrackerOnce()`.
- [x] Cập nhật logic của `runAutoTrackerOnce()`:
  - [x] Kiểm tra điều kiện tiên quyết: `settings.autoTrackingEnabled === true`.
  - [x] Kiểm tra quyền truy cập thư viện ảnh (Photos Permission) đã được cấp chưa. Nếu chưa -> return (không crash).
- [x] Tích hợp vào UI lifecycle:
  - [x] Thêm `useEffect` vào `HomeScreen.tsx`: trigger `ensureAutoTrackerFreshness()` mỗi khi screen được focus (sử dụng `useFocusEffect` của React Navigation).
  - [x] Thêm `useEffect` tương tự vào `DayScreen.tsx` để scan khi user check theo ngày.

### 2. Mở rộng Pipeline Gợi ý (Location & Calendar)
- **File:** `src/skills/autoTracker.ts`, `src/skills/calendar.ts` (mới), `src/skills/location.ts` (mới)
- [x] Định nghĩa các Interfaces cho Signals:
  - [x] `PhotoSignal`: `{ type: 'photo', takenAt: Date, imageUri: string, locationName?: string }`
  - [x] `LocationSignal`: `{ type: 'location', time: Date, locationName: string }`
  - [x] `CalendarSignal`: `{ type: 'calendar', start: Date, end: Date, title: string, locationName?: string }`
- [x] Xây dựng hàm `buildSignals()`:
  - [x] Fetch ảnh chụp trong 24h qua -> map ra mảng `PhotoSignal`.
  - [x] (Tuỳ chọn) Fetch location history -> map ra mảng `LocationSignal`.
  - [x] Fetch calendar events trong ngày -> map ra mảng `CalendarSignal`.
  - [x] Gộp tất cả trả về một mảng phẳng (flat array) các signals.
- [x] Xây dựng hàm `clusterSignals(signals)`:
  - [x] Sắp xếp các signals theo mốc thời gian.
  - [x] Nhóm (cluster) các tín hiệu xảy ra sát nhau (trong khoảng thời gian 60-90 phút) thành một cụm. Ưu tiên lấy hình ảnh làm key-item cho cluster.
- [x] Tạo Entry từ Cluster:
  - [x] Khởi tạo đối tượng `Entry` mới (`source: 'auto'`, `status: 'suggested'`).
  - [x] Set `time` = giá trị trung bình của các tín hiệu trong cluster.
  - [x] Gán `imageUri` nếu cluster có `PhotoSignal`.
  - [x] Trích xuất `locationName` (nếu có).
  - [x] Gán tiêu đề calendar event vào `text` hoặc `aiSuggestion` (nếu có `CalendarSignal`).
  - [x] Bỏ qua việc tạo Entry nếu khung thời gian đó đã tồn tại một `Entry` (status='saved') trong DB.

### 3. Hardening AI Suggestion (Chống lỗi gọi AI)
- **File:** `src/skills/aiService.ts`, `src/components/MomentComposer.tsx`
- [ ] Xử lý API Key an toàn:
  - [ ] Lấy `GEMINI_API_KEY` từ `.env` (thông qua expo-env hoặc process.env).
  - [ ] Bắt lỗi nếu API key rỗng -> tự động fallback sang cơ chế local.
- [ ] Xây dựng Fallback Chain cho Gemini request:
  - [ ] Step 1: Gọi hàm fetch tới Gemini API kèm theo `AbortController` timeout cứng = 3000ms.
  - [ ] Step 2: Bắt catch (Lỗi mạng / Timeout / Hết quota) -> Gọi `MockAISuggestionService.generate()` (tạo text dựa trên mood, time, location).
  - [ ] Step 3: Bắt catch (Lỗi mock) -> Trả về chuỗi hardcode: "Hôm nay có gì muốn ghi lại?".
- [ ] Nâng cấp UI state của `MomentComposer`:
  - [ ] State: `loading` -> Hiển thị skeleton hoặc text "Đang phân tích gợi ý AI…".
  - [ ] State: `success` -> Hiển thị kết quả text kèm nút "Dùng gợi ý".
  - [ ] State: `error` -> Hiển thị fallback text, cho phép user tự nhập tay.

### 4. Xử lý Vòng đời Entry (Lưu / Bỏ / Sửa / Xóa)
- **File:** `src/memory/database.ts`, `src/components/TimelineCard.tsx`, `src/screens/DayScreen.tsx`, `src/components/MomentComposer.tsx`
- [ ] **Lưu/Bỏ Gợi ý (Suggested Entry):**
  - [ ] Hành động "Lưu": Giữ nguyên ID, đổi `status` thành `'saved'`, update vào database bằng `updateEntry`.
  - [ ] Hành động "Bỏ": Xóa cứng (hoặc soft-delete) bản ghi gợi ý đó khỏi SQLite. Phải đảm bảo logic autoTracker ở lần quét sau nhận biết được cụm signal này đã bị skip (lưu mảng `skipped_clusters` vào settings hoặc đánh dấu `deleted` trong DB).
  - [ ] Animation: Bọc Card gợi ý bằng Reanimated, kích hoạt slide-out và fade khi nhấn Lưu/Bỏ.
- [ ] **Sửa (Edit) Entry:**
  - [ ] Trong `database.ts`, tạo function `updateEntry(id: string, patch: Partial<Entry>)`.
  - [ ] Ở `TimelineCard.tsx`, thêm nút Menu `...` (hoặc xử lý long-press) cho các entry có `status === 'saved'`.
  - [ ] Mở menu có nút "Chỉnh sửa".
  - [ ] Khi click, gọi mở `MomentComposer` (hoặc AddMomentSheet), truyền prop `mode="edit"` và `initialEntry={entry}`.
  - [ ] Đổi nút CTA chính của composer thành "Cập nhật". Khi click, gọi `updateEntry` và update state Zustand.
- [ ] **Xóa (Delete) Entry:**
  - [ ] Tạo function `deleteEntry(id: string)` trong `database.ts`.
  - [ ] Menu của `TimelineCard` có nút "Xóa khoảnh khắc".
  - [ ] Khi click -> Hiện popup cảnh báo: "Xóa khoảnh khắc này? Hành động này không thể hoàn tác."
  - [ ] User confirm -> Gọi `deleteEntry`, trigger update Zustand để loại entry đó khỏi view của ngày.

### 5. Logging & Diagnostics (Dành cho Dev)
- **File:** `src/skills/autoTracker.ts`, `src/screens/MeScreen.tsx`
- [ ] Sau mỗi lần tracker chạy xong, ghi nhận thông số vào Zustand/Storage:
  - [ ] `last_auto_scan_time`: timestamp.
  - [ ] `last_auto_scan_stats`: chuỗi JSON `{ new_suggestions: N, photos_scanned: M }`.
  - [ ] `bgFetch_successCount` / `bgFetch_failCount`.
- [ ] Thêm section "Diagnostics" (Chẩn đoán) dưới cùng `MeScreen` (chỉ hiển thị nếu dùng biến môi trường dev `__DEV__`):
  - [ ] Render các chỉ số trên ra UI để tester dễ dàng kiểm chứng chức năng chạy ngầm.

---

## 🎬 Khối P1 – Xem lại (Reels) & Thống kê

Mục tiêu: Đem lại giá trị cốt lõi thứ 2 ngoài nhật ký tĩnh, đó là biến các khoảnh khắc thành những video/slideshow kỷ niệm ngắn.

### 1. Tự động Tạo Weekly Reels (Tổng hợp tuần)
- **File:** `src/skills/reels.ts` (mới), `src/screens/ReelScreen.tsx`, DB Schema
- [ ] Tạo bảng `weekly_reels` trong SQLite (nếu chưa có): `id`, `start_date`, `end_date`, `cover_uri`, `entry_count`, `entry_ids` (JSON).
- [ ] Viết hàm `generateWeeklyReels(entries: Entry[])`:
  - [ ] Fetch toàn bộ entry trong 8 tuần gần nhất.
  - [ ] Dùng thư viện ngày tháng (date-fns hoặc dayjs) để group các entry theo định dạng Tuần ISO (YYYY-WW).
  - [ ] Phân tích mỗi nhóm tuần: Đếm số lượng entry (`entryCount`), lập danh sách `entryIds`.
  - [ ] Xác định ảnh cover: Tìm entry có `mood` tốt nhất (tím/vàng), nếu không có thì lấy ảnh đầu tiên.
  - [ ] Ghi đè (Upsert) các object Reel vào bảng DB.
- [ ] Trigger tạo Reels:
  - [ ] Đặt trong `useEffect` lúc init app: check nếu `todayWeekId !== lastGeneratedWeekId` thì chạy generation.
  - [ ] Đặt trong hàm sau khi user `addEntry` thành công để reel được update tức thì.
- [ ] Cập nhật UI `ReelScreen`:
  - [ ] Fetch danh sách reels thực tế từ `getAllReels()`. Loại bỏ mock data.
  - [ ] Bấm vào card Weekly Reel -> Mở component `SlideshowScreen`, truyền vào list `entryIds` tương ứng.

### 2. Tính năng "Hôm nay năm trước" (On this day)
- **File:** `src/screens/ReelScreen.tsx`
- [ ] Tạo query fetch `getEntriesOnDate(date)` với `date` bằng đúng mốc thời gian hôm nay trừ đi 1 năm (tương đối theo DD/MM).
- [ ] UI Card "Hôm nay năm trước":
  - [ ] Nếu query trả về > 0 entries: Hiển thị 1 card lớn trên cùng màn hình Reel.
  - [ ] Card lấy ảnh thumbnail của entry đầu tiên. Kèm text nổi bật "X khoảnh khắc của một năm trước".
  - [ ] Action: Nhấn vào card -> Gọi `SlideshowScreen` khởi chạy tập các entry đó.

---

## 💎 Khối P1 – Premium (IAP) & Sao lưu (Backup)

Mục tiêu: Thiết lập hệ thống monetize và bảo vệ dữ liệu (kể cả asset hình ảnh) của người dùng khi đổi điện thoại/backup.

### 1. Hoàn thiện Logic Premium & UI
- **File:** `src/components/PaywallModal.tsx`, `src/services/subscription.ts`
- [ ] Cập nhật Copywriting của Paywall (UI/UX):
  - [ ] Đổi "Đồng bộ đám mây" thành "Xuất file backup (.dailylog) để lưu trên iCloud/Drive".
  - [ ] Đổi "Không giới hạn hình ảnh" thành "Mở khóa nhiều ảnh hơn mỗi tuần".
- [ ] Triển khai Native IAP (In-App Purchases):
  - [ ] Thêm thư viện `react-native-purchases` (RevenueCat) hoặc `expo-in-app-purchases`.
  - [ ] Implement hàm `purchase(planId)` giao tiếp với store platform (Apple App Store / Google Play). Xử lý promise trả về boolean success/fail hoặc ném error.
  - [ ] Implement hàm `restorePurchases()` để khôi phục khi user cài lại app.
  - [ ] Lưu trữ flag `settings.isPremium` vào DB và lưu receipt validation key vào `SecureStore`.
- [ ] Cập nhật Modal State:
  - [ ] Bắt lỗi và show Toast/Alert: "Thanh toán bị hủy" hoặc "Lỗi hệ thống: ABC".

### 2. Export / Import Backup Full Media
- **File:** `src/memory/backup.ts`
- [ ] Logic Xuất dữ liệu (Export):
  - [ ] Dump toàn bộ entries, settings, reels ra JSON file (`metadata.json`).
  - [ ] Parse toàn bộ file, gom mảng chứa các `imageUri` local.
  - [ ] Sao chép từng tệp ảnh từ Document/Cache directory vào một thư mục staging (VD: `FileSystem.cacheDirectory + 'backup-media'`).
  - [ ] Dùng một package JS zip (như `jszip` hoặc `react-native-zip-archive`) để đóng gói `metadata.json` + folder `media/` thành một file `.zip`.
  - [ ] Nén/Mã hoá (XOR) file `.zip` đó thành định dạng `.dailylog` và share ra hệ thống.
- [ ] Logic Nhập dữ liệu (Import):
  - [ ] Giải mã XOR -> unzip nội dung.
  - [ ] Parse `metadata.json` và insert đè (hoặc thay thế) database hiện tại.
  - [ ] Move tất cả file trong folder `media/` của zip vào lại Document Directory của ứng dụng.
  - [ ] Viết hàm duyệt database để regex/replace `imageUri` trỏ đúng vào absolute path mới của thiết bị (do path iOS/Android thay đổi theo từng lần cài/version OS).

---

## 🎨 Khối P1/P2 – UI & UX Polish Trước Khi Beta

Mục tiêu: Đưa cảm giác App lên mức mượt mà, "có hồn" (GenZ) thông qua micro-interactions và theming.

### 1. Mood Calendar & Streak
- **File:** `src/components/MoodCalendar.tsx`, `src/screens/HomeScreen.tsx`
- [ ] Áp dụng Color-coding: Chấm (dot) theo ngày sẽ hiện màu sắc của mood (Đỏ, Vàng, Xám, Xanh, Tím) thay vì một màu đơn điệu.
- [ ] Thêm Text Summary Header: "7 ngày vừa qua: X ngày vui, Y ngày bình thường, Z ngày chưa ghi".
- [ ] Logic Streak: Đếm số ngày liên tục (tới hôm nay) có entry. Nếu >= 3 ngày -> Render 1 chip tag nhỏ trên UI `🔥 3 ngày liên tục`.

### 2. Custom Theme & Dark Mode
- **File:** `src/theme/palette.ts`, `src/styles.ts`, Zustand Settings
- [ ] Khởi tạo 2 biến thể bảng màu: Light và Dark.
- [ ] Tích hợp React Native `useColorScheme` hoặc đọc từ settings người dùng (System / Light / Dark).
- [ ] Dynamic Style: Map các biến color trong stylesheet sử dụng palette động. Đảm bảo text không bị ẩn màu xám khi qua Darkmode.

### 3. Cải thiện Animation (Reanimated)
- **File:** Component dùng chung (Card, Modal, Screen)
- [ ] Bọc các phần tử thẻ (Home / Day / Reel Card) bằng thẻ `Animated.View`. Áp dụng hiệu ứng fade-in + dịch chuyển nhẹ từ dưới lên (SlideUp) khi render lần đầu (stagger effects).
- [ ] Chỉnh sửa `Modal` mặc định thành Custom Animated View sử dụng `reanimated` để slide-up từ dưới đáy mượt hơn và fade mờ backdrop (hiệu ứng Glassmorphism).

---

## 🚀 Khối P2 – Tính năng Mở Rộng Sau Beta (Tương lai)
*(Phần này không bắt buộc hoàn thiện trong MVP)*

- [ ] Search entries text đầy đủ / filter theo mood / filter theo địa điểm.
- [ ] Biểu đồ Mood Trend (Line chart phân tích cảm xúc tuần/tháng).
- [ ] Hỗ trợ tạo 1 entry chứa nhiều ảnh (Carousel swipeable) hoặc 1 short video clip.
- [ ] Hệ thống Push Notification cục bộ (`expo-notifications`):
  - [ ] Nhắc nhở buổi tối (VD: 21:00) "Hôm nay bạn thấy thế nào?".
  - [ ] Nhắc cuối tuần: "Tuần qua của bạn đã sẵn sàng".
- [ ] Tạo Home Widget gốc (iOS / Android) render ảnh đại diện "Hôm nay năm trước" lên màn hình chính điện thoại.
