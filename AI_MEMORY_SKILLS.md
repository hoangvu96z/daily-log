# AI Context: Memory & Skills Definitions

File này định nghĩa các khái niệm cốt lõi về "Memory" (Trí nhớ/Lưu trữ) và "Skills" (Kỹ năng/Hành động) dành cho AI Coder khi xây dựng app **Nhật ký tự động**. AI cần phải đọc hiểu file này để biết cách thiết kế kiến trúc phần mềm mà không vi phạm tôn chỉ của app.

---

## 1. MEMORY (Định nghĩa Không gian Lưu trữ & Trạng thái)

Bởi vì app tuân thủ tuyệt đối nguyên tắc **"Local-first & Riêng tư"**, AI Coder tuyệt đối không được sử dụng các dịch vụ Cloud Database (Firebase, Supabase, AWS).

**Memory của app được chia làm 3 phân vùng chính:**

### 1.1. Core Database (Trí nhớ dài hạn)
- **Công cụ chỉ định:** `expo-sqlite` (hoặc `WatermelonDB`).
- **Nhiệm vụ:** Nơi lưu trữ vĩnh viễn các nhật ký (Entry) và các cụm dữ liệu (WeeklyReel).
- **Quy định AI:** Khi tạo bảng, luôn lưu `imageLocalId` thay vì chuỗi Base64 để tránh phình to DB. Các event tự động được fetch về sẽ nằm ở đây với trạng thái `status: 'suggested'`.

### 1.2. Vault (Trí nhớ bảo mật)
- **Công cụ chỉ định:** `expo-secure-store`.
- **Nhiệm vụ:** "Két sắt" của hệ thống. Dùng để chứa mã PIN, cờ cấu hình Face ID/Touch ID.
- **Quy định AI:** Mọi truy xuất liên quan đến khóa màn hình (Màn hình Bảo vệ nhật ký ở Tab Me) đều phải đọc/ghi thông qua module này.

### 1.3. Global State (Trí nhớ ngắn hạn / Trạng thái UI)
- **Công cụ chỉ định:** `Zustand` (khuyến nghị) hoặc `React Context`.
- **Nhiệm vụ:** Lưu giữ trạng thái tức thời của app (Theme Sáng/Tối, Ngôn ngữ, trạng thái hiển thị của Bottom Sheet, trạng thái cấp quyền).
- **Quy định AI:** Không dùng Redux vì quá nặng nề. Mọi state liên quan đến cấu hình hệ thống (Settings) nên được đồng bộ từ `expo-sqlite` hoặc `AsyncStorage/MMKV` lên Zustand khi app khởi động.

---

## 2. SKILLS (Định nghĩa Kỹ năng & Xử lý Logic)

Đây là các "kỹ năng" mà hệ thống cần có để chạy tự động ngầm và hỗ trợ user ghi nhật ký.

### 2.1. Skill: Thu thập tín hiệu (Signal Tracking)
- **Mô tả:** Khả năng tự động gom nhặt vị trí, ảnh mới, sự kiện lịch để làm "nguyên liệu" viết nhật ký.
- **Công cụ chỉ định:** 
  - `expo-location` (để lấy tọa độ).
  - `expo-calendar` (lấy sự kiện).
  - `expo-media-library` (lấy ảnh mới nhất).
- **Quy định AI:** Phải xử lý xin quyền (progressive permissions) thật mượt mà ở màn Onboarding. Không bao giờ được crash app nếu user từ chối quyền.

### 2.2. Skill: Hoạt động ngầm (Background Auto-Worker)
- **Mô tả:** Khả năng tự động "thức dậy" để tổng hợp dữ liệu mà không cần user mở app.
- **Công cụ chỉ định:** `expo-background-fetch` và `expo-task-manager`.
- **Quy định AI:** Định nghĩa một background task chạy định kỳ (ví dụ mỗi 2-4 tiếng). Khi thức dậy, task này sẽ chạy **Skill 2.1**, gom các sự kiện thành "cluster", sinh ra một Entry nháp (`suggested`) và lưu vào **Core Database**.

### 2.3. Skill: AI Gợi ý (AI Suggestion Generation)
- **Mô tả:** Phân tích bối cảnh (giờ, địa điểm, ảnh) để sinh ra dòng text miêu tả.
- **Công cụ chỉ định:** (Tạm thời) Hard-code logic hoặc gọi các API LLM nhỏ gọn.
- **Quy định AI:** Khi nhận task tạo tính năng này, AI coder phải **tạo ra một interface chuẩn (Mock Service)** trả về các câu string tiếng Việt mẫu (ví dụ: "Sáng yên bình ở quán cà phê quen"). Phải đảm bảo logic gọi AI được tách rời (Dependency Injection) để sau này dễ dàng cắm Gemini/OpenAI API thật vào.

### 2.4. Skill: Dựng phim (Reel / Slideshow Playback)
- **Mô tả:** Tạo trải nghiệm xem lại "Tuần của bạn" như xem Tiktok/Reels.
- **Quy định AI:** Tránh việc dùng thư viện render mp4 vì quá nặng. Hãy dùng `react-native-reanimated` để trình diễn một slideshow ảnh + chữ mượt mà, tự động chuyển cảnh (auto-advance) sau vài giây.
