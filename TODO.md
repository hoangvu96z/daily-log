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
