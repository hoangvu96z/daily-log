# Spec app "Nhật ký tự động, riêng tư"

> File này dùng để đưa cho AI coder hoặc dev. App ưu tiên iOS 17+ (SwiftUI), sau này có thể port Android.
> 
> *Lưu ý: Dự án hiện tại đang được xây dựng bằng React Native (Expo) để hỗ trợ đa nền tảng thay vì chỉ native iOS.*

---

## 1. Product & UX Spec

### 1.1. Mô tả sản phẩm

- App mobile giúp người hướng nội **tự có nhật ký mỗi ngày mà hầu như không phải viết**.
- App tự thu thập một số tín hiệu trên thiết bị (ảnh, thời gian, location, lịch…) rồi dùng AI gợi ý entry, user chỉ việc chạm xác nhận hoặc chỉnh chút.
- Tôn chỉ:
  - **"Không theo dõi – chỉ phản chiếu"**: app không phải mạng xã hội, không có feed, like, share.
  - **"Local‑first & riêng tư"**: dữ liệu ở trên máy, backup là tùy chọn, rõ ràng về quyền và xóa dữ liệu.

### 1.2. Đối tượng & nhu cầu

- Gen Z / Gen Y làm việc văn phòng hoặc remote, hay dùng điện thoại, chụp ảnh, nhưng lười/ngại viết nhật ký.
- Muốn:
  - Có nơi **xem lại “hôm qua / tuần này / năm trước”** bằng ảnh + dòng chữ ngắn.
  - Không muốn chuyện cá nhân bị post lên mạng hay dùng train AI không kiểm soát.

### 1.3. Thông điệp chính

- "Nhật ký riêng, không mạng xã hội."
- "App không đăng bất cứ thứ gì lên đâu, chỉ để bạn xem lại cuộc sống của mình."
- "Dữ liệu nằm trên máy bạn, có thể xóa toàn bộ bất cứ lúc nào."

---

## 2. Information Architecture & Navigation

### 2.1. Cấu trúc tab

Bottom tab bar (4 tab) + FAB ở giữa:

1. **Home**  
   Tóm tắt “Hôm qua của bạn”: 3–4 chip sự kiện, nút `Xem cả ngày`, nút `Lịch cảm xúc`.

2. **Ngày**  
   Timeline chi tiết 1 ngày: mốc giờ, mood, text ngắn, ảnh, các entry “gợi ý” chờ xác nhận.

3. **Reel**  
   `Hôm nay năm trước`, danh sách `Weekly Reel` (clip 30–60s từ ảnh & mood).

4. **Me**  
   Cài đặt: Quyền & dữ liệu, Bảo vệ nhật ký, Ứng dụng (theme, ngôn ngữ, thông báo).

### 2.2. Bottom navigation & FAB

- **Tab bar**: 4 item `Home`, `Ngày`, `Reel`, `Me`.
  - Tab active: icon line + label màu xanh đậm, có chấm nhỏ phía trên.
  - Tab inactive: icon xám, label xám nhạt.
- **FAB**: nút tròn `+` màu xanh đậm, icon cộng trắng, nằm giữa, hơi overlap thanh nav.
- FAB mở bottom sheet “Thêm khoảnh khắc” với các hành động chính.

---

## 3. UX chi tiết theo màn hình

### 3.1. Onboarding

Mục tiêu: bán câu chuyện **riêng tư & tự động**, xin quyền nhưng không làm user sợ.

Gợi ý 3–4 màn slide:

1. **Giới thiệu**  
   - Tiêu đề: "Nhật ký tự động cho riêng bạn".  
   - Text: "App lặng lẽ ghi lại những khoảnh khắc mỗi ngày, không cần bạn phải ngồi viết."

2. **Riêng tư**  
   - Text: "Không mạng xã hội, không người lạ. Nhật ký chỉ nằm trên máy bạn."

3. **Quyền truy cập**  
   - List các quyền: Ảnh, Vị trí, Lịch…  
   - Nút: `Cho phép` / `Để sau` (progressive permission, không ép user bật hết ngay từ đầu).

### 3.2. Tab 1 – Home

**Mục đích:** Tóm tắt nhanh “hôm qua của bạn”, dẫn user vào chi tiết hoặc lịch cảm xúc.

**Layout:**

- Header:
  - Title: `Hôm qua của bạn`  
  - Subtext: `Một vài khoảnh khắc nổi bật`  

- Card tóm tắt ngày hôm qua:
  - Nền kem, bo tròn, full chiều ngang.
  - Chứa 3–4 **chip sự kiện**: mỗi chip gồm icon tròn nhỏ + text ngắn (VD: `Cà phê sáng`, `Fix bug`, `Đi dạo tối`).
  - Tùy chọn flag `isHighlight` trong data để chọn sự kiện đưa vào đây.

- Khu vực nút điều hướng:
  - Nút primary: `Xem cả ngày` → mở tab **Ngày** với date = hôm qua.
  - Nút secondary: `Lịch cảm xúc` → mở Calendar view.

### 3.3. Tab 2 – Ngày (Timeline)

**Mục đích:** Xem chi tiết các mốc trong 1 ngày.

**Header:**

- Title: `DD Tháng MM, YYYY` (ví dụ `04 Tháng 5, 2026`).
- Nút chọn ngày (icon lịch) → mở DatePicker.

**Timeline:**

- Cột trái: line dọc + nhãn giờ (`00:21`, `07:12`, `07:44`, `07:59`, `08:05`, `09:17`...).
- Cột phải: card entry.

**Card entry (đã lưu):**

- Top row: giờ + chip mood (enum mood).
- Text: 1–2 dòng note.
- Thumbnail ảnh (nếu có ảnh).
- Nền trắng/kem, bo tròn, spacing thoáng.

**Card entry “Gợi ý” (draft):**

- Status = `suggested`.
- Hiển thị giống card thường nhưng:
  - Opacity thấp hơn hoặc viền nét đứt.
  - Label nhỏ `Gợi ý`.
  - Có 2 nút nhỏ trong card: `Lưu` (primary) và `Bỏ` (secondary).
- Khi user bấm `Lưu`:
  - status → `saved`.
  - Card chuyển thành entry bình thường.
- Khi `Bỏ`:
  - Entry bị xóa khỏi DB hoặc flagged `deleted`.

### 3.4. FAB & bottom sheet “Thêm khoảnh khắc”

**Khi user bấm nút `+`:**

- Hiện bottom sheet từ dưới trượt lên, chiếm ~60% chiều cao.
- Title: `Thêm khoảnh khắc`.
- 3 lựa chọn chính (list item, icon line trái, văn bản phải):

1. `Chụp khoảnh khắc`
   - Subtext: `Chụp ảnh hoặc chọn từ thư viện`.
   - Action: mở camera. Sau khi chụp xong → push màn **Khoảnh khắc mới** với ảnh đã chọn.

2. `Thêm ghi chú nhanh`
   - Subtext: `Viết vài dòng nếu bạn muốn`.
   - Action: push **Khoảnh khắc mới** không có ảnh.

3. `Thêm mốc từ lịch`
   - Subtext: `Đánh dấu một việc quan trọng`.
   - Action: nếu có permission Calendar → show list event hôm nay; user chọn 1 event → chuyển sang **Khoảnh khắc mới** đã prefill text/giờ.

### 3.5. Màn “Khoảnh khắc mới”

Màn dùng chung cho cả 3 action trên.

**Header:** `Khoảnh khắc mới`

**Thân màn:**

1. **Ảnh**  
   - Nếu có ảnh từ camera/gallery: hiển thị thumbnail phía trên.  
   - Nếu chưa có: placeholder hình khung ảnh + nút `Thêm ảnh`.

2. **Meta (thời gian & địa điểm)**  
   - Text nhỏ: `HH:MM • Tên địa điểm` (VD: `08:05 • Quán cà phê`).  
   - Tự động fill từ thời gian hiện tại + location/Wi‑Fi (nếu có permission).  
   - Cho phép user bấm vào để chỉnh giờ/ngày hoặc tắt location.

3. **Mood**  
   - Hàng chip mood ngang, 4–5 giá trị: `😞 Tệ`, `😐 Bình thường`, `🙂 Ổn`, `😊 Vui`, `🤩 Tuyệt`.  
   - Một chip có trạng thái selected (màu nền đậm hơn).  
   - AI có thể chọn mood default dựa trên ảnh/giờ; user có thể đổi.

4. **Note & AI gợi ý**  
   - Textarea multiline với placeholder: `Hôm nay có gì muốn ghi lại? (không bắt buộc)`.
   - Bên dưới là **card gợi ý AI**:
     - Nền kem, icon nhỏ "spark/AI".
     - 1–2 câu tiếng Việt mô tả nhẹ nhàng (VD: `Ly cà phê sáng ở quán quen, chuẩn bị cho một ngày làm việc mới.`).
     - Hai nút nhỏ ở cạnh dưới card: `Dùng gợi ý` (fill note = gợi ý) và `Bỏ qua` (ẩn card hoặc giữ nguyên).

5. **Footer:**
   - Button lớn full width: `Lưu lại` (primary).  
   - Tap → tạo/ghi Entry mới (status = `saved`) rồi quay lại tab Ngày (scroll tới entry vừa tạo).

### 3.6. Tab 3 – Reel (Xem lại)

**Mục đích:** Cho user xem lại các recap (tuần, “hôm nay năm trước”).

**Header:**

- Title: `Xem lại`.
- Subtext: `Nhìn lại những ngày đã qua của bạn`.

**Section 1 – Hôm nay năm trước**

- Card lớn full width.
- Bên trái text:
  - `Hôm nay năm trước`
  - `X khoảnh khắc đáng nhớ` (đếm entry ngày đó).
- Bên phải: 2–3 thumbnail ảnh nhỏ chồng nhau.
- Tap card → mở view chi tiết ngày đó.

**Section 2 – Weekly Reel**

- Title nhỏ: `Tuần của bạn`.
- Danh sách card dọc, mỗi card gồm:
  - Thumbnail video (16:9) với icon play.
  - Text: `Tuần 18` + `29.04 – 05.05`.
  - Chip góc: `12 khoảnh khắc` (số entry tham gia reel).
- Tap card → mở player full screen.

### 3.7. Tab 4 – Me (Cài đặt)

**Mục đích:** Trung tâm quyền riêng tư, dữ liệu và cấu hình app.

**Header:**

- Title: `Cài đặt`.
- Subtext: `Quyền riêng tư và ứng dụng`.

**Nhóm 1 – Quyền & dữ liệu (card)**

- Row 1: `Quyền truy cập`
  - Subtext: `Ảnh, vị trí, hoạt động ứng dụng…`.
  - Icon: shield/lock.  
  - Tap → màn con `Quyền truy cập` với các toggle:
    - `Ảnh & video`
    - `Vị trí`
    - `Hoạt động ứng dụng`
    - `Thông tin lịch`

- Row 2: `Sao lưu & khôi phục`
  - Subtext: `Backup iCloud/Drive, khôi phục khi đổi máy`.
  - Icon: cloud.

- Row 3: `Xóa toàn bộ nhật ký`
  - Subtext: `Xóa vĩnh viễn dữ liệu trên thiết bị này`.
  - Icon: thùng rác, text màu cảnh báo.
  - Tap → dialog xác nhận nhập `XÓA`.

**Nhóm 2 – Bảo vệ nhật ký (card)**

- Row: `Khóa Face ID / vân tay`
  - Toggle bật/tắt.
- Row: `Mã PIN mở app`
  - Subtext: `Dùng khi không muốn Face ID`.
  - Tap → màn đặt/đổi PIN.

**Nhóm 3 – Ứng dụng (card)**

- `Thông báo` – cài daily/weekly reminder.
- `Giao diện` – Sáng / Tối / Theo hệ thống.
- `Ngôn ngữ` – Tiếng Việt / English.

**Footer:**

- Link text: `Chính sách quyền riêng tư`.
- Link text: `Điều khoản sử dụng`.

---

## 4. Tech & Data Spec (cho coder)

### 4.1. Nền tảng & stack gợi ý

- Platform: iOS 17+.
- UI: SwiftUI / React Native (Expo) - Dự án hiện tại đang dùng React Native.
- Navigation: `TabView` cho 4 tab, `NavigationStack` (React Navigation) bên trong mỗi tab.
- Local storage: SwiftData / WatermelonDB / MMKV cho React Native, lưu Entry, Settings, WeeklyReel.
- Ảnh: lưu trong Photos (PHAsset) hoặc trong app container; trong DB chỉ lưu `localIdentifier` hoặc path.
- AI & vision:
  - Sử dụng framework Vision/CoreML hoặc các API AI (Gemini / OpenAI) để nhận diện đối tượng trong ảnh.
  - LLM sinh text gợi ý.

### 4.2. Data model (gợi ý)

```text
Entry
- id: UUID
- date: Date (ngày, chuẩn hóa 00:00)
- time: Date (giờ cụ thể)
- mood: String (enum: very_bad, bad, neutral, good, great)
- text: String?
- imageLocalId: String?
- locationName: String?
- locationLat: Double?
- locationLon: Double?
- source: String (enum: auto, manual)
- status: String (enum: saved, suggested)
- isHighlight: Bool

Settings
- allowPhotos: Bool
- allowLocation: Bool
- allowUsage: Bool
- allowCalendar: Bool
- faceIDEnabled: Bool
- pinCodeHash: String?
- theme: String (system/light/dark)
- language: String (vi/en)

WeeklyReel
- weekId: String (ví dụ "2026-W18")
- startDate: Date
- endDate: Date
- coverImageId: String?
- entryIds: [UUID]
```

### 4.3. Luồng auto tạo entry (business logic)

1. Khi app mở hoặc theo lịch (background task), đọc dữ liệu hệ thống trong X giờ gần nhất:
   - Ảnh mới chụp.
   - Location.
   - (Sau này) usage stats, event từ Calendar.
2. Nhóm các sự kiện thành "cluster" (ví dụ mỗi 30–60 phút).
3. Với mỗi cluster, nếu chưa có entry trong khoảng thời gian đó:
   - Tạo Entry mới với:
     - `time` = giờ giữa cluster.
     - `mood` = `neutral`.
     - `status` = `suggested`.
     - `imageLocalId` = id ảnh đại diện.
4. Lưu vào DB.
5. Khi user mở tab Ngày, hiển thị các Entry `status == suggested` dưới dạng card gợi ý.

### 4.4. Gợi ý AI (prompt khung)

Khi tạo gợi ý text cho entry:

Input cho model (on-device hoặc cloud):

- Thời gian: `HH:MM`, buổi (sáng/chiều/tối), thứ mấy.
- Location (nếu có): tên địa điểm.
- Kết quả vision từ ảnh: một vài label đơn giản (coffee, laptop, street, home...).

Yêu cầu model:

- Trả về 1–2 câu tiếng Việt.
- Tổng độ dài < 40 từ.
- Giọng trung tính, không phán xét tâm lý, không dùng từ cực đoan.

Ví dụ prompt:

```text
Bạn là trợ lý nhật ký riêng tư, chỉ mô tả khoảnh khắc, không phân tích tâm lý.

Dữ liệu:
- Thời gian: 08:05 sáng, Thứ Hai
- Địa điểm: quán cà phê Cộng
- Mô tả ảnh: ly cà phê, laptop, cửa kính nhìn ra đường

Hãy viết 1–2 câu tiếng Việt ngắn gọn (tổng dưới 40 từ) mô tả khoảnh khắc này. Không dùng từ quá kịch tính.
```
