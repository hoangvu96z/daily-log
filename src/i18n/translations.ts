export type Language = 'vi' | 'en';

export type TranslationKeys = typeof vi;

// === Vietnamese (default) ===
const vi = {
  // --- Common ---
  common: {
    save: 'Lưu',
    discard: 'Bỏ',
    cancel: 'Hủy',
    close: 'Đóng',
    delete: 'Xóa',
    confirm: 'Xác nhận',
    loading: 'Đang mở nhật ký riêng...',
    entry: 'entry',
    moments: 'khoảnh khắc',
  },

  // --- Tab Bar ---
  tabs: {
    home: 'Home',
    day: 'Ngày',
    reel: 'Reel',
    me: 'Me',
  },

  // --- Moods ---
  mood: {
    very_bad: 'Tệ',
    bad: 'Chậm',
    neutral: 'Bình thường',
    good: 'Ổn',
    great: 'Tuyệt',
  },

  // --- Home Screen ---
  home: {
    title: 'Hôm qua của bạn',
    subtitle: 'Một vài khoảnh khắc nổi bật',
    kicker: 'Không theo dõi, chỉ phản chiếu',
    heroText: 'Một ngày có nhịp riêng, đủ để nhớ lại sau này.',
    viewFullDay: 'Xem cả ngày',
    moodCalendar: 'Lịch cảm xúc',
    privacyNote: 'Dữ liệu nằm trên máy bạn. Backup và AI cloud là tùy chọn.',
    moodCalendarTitle: 'Lịch cảm xúc',
    moodCalendarDesc: 'Tóm tắt 7 ngày gần đây từ các entry đã lưu trên máy.',
    emptyMood: 'Trống',
  },

  // --- Day Screen ---
  day: {
    momentsInDay: (count: number) => `${count} khoảnh khắc trong ngày`,
    emptyTitle: 'Chưa có khoảnh khắc',
    emptyText: 'Bấm nút + để thêm ghi chú, ảnh hoặc mốc từ lịch cho ngày này.',
    suggested: 'Gợi ý',
  },

  // --- Reel Screen ---
  reel: {
    title: 'Xem lại',
    subtitle: 'Nhìn lại những ngày đã qua của bạn',
    todayLastYear: 'Hôm nay năm trước',
    memorableMoments: (count: number) => `${count} khoảnh khắc đáng nhớ`,
    yourWeek: 'Tuần của bạn',
    momentCount: (count: number) => `${count} khoảnh khắc`,
  },

  // --- Add Moment Sheet ---
  addMoment: {
    title: 'Thêm khoảnh khắc',
    captureTitle: 'Chụp khoảnh khắc',
    captureSubtitle: 'Chụp ảnh hoặc chọn từ thư viện',
    noteTitle: 'Thêm ghi chú nhanh',
    noteSubtitle: 'Viết vài dòng nếu bạn muốn',
    calendarTitle: 'Thêm mốc từ lịch',
    calendarSubtitle: 'Đánh dấu một việc quan trọng',
  },

  // --- Moment Composer ---
  composer: {
    title: 'Khoảnh khắc mới',
    addPhoto: 'Thêm ảnh',
    now: 'Bây giờ',
    noLocation: 'Không lưu vị trí',
    moodLabel: 'Mood',
    noteLabel: 'Ghi chú',
    notePlaceholder: 'Hôm nay có gì muốn ghi lại? (không bắt buộc)',
    aiSuggestionTitle: 'Gợi ý AI',
    useSuggestion: 'Dùng gợi ý',
    ignoreSuggestion: 'Bỏ qua',
    saveButton: 'Lưu lại',
  },

  // --- Me / Settings Screen ---
  settings: {
    title: 'Cài đặt',
    subtitle: 'Quyền riêng tư và ứng dụng',

    // Group 1: Permissions & Data
    permissionsGroup: 'Quyền & dữ liệu',
    permissionsTitle: 'Quyền truy cập',
    permissionsSubtitle: 'Ảnh, vị trí, hoạt động ứng dụng...',
    photosAndVideo: 'Ảnh & video',
    location: 'Vị trí',
    backupTitle: 'Sao lưu & khôi phục',
    backupSubtitle: 'Backup iCloud/Drive, khôi phục khi đổi máy',
    deleteAllTitle: 'Xóa toàn bộ nhật ký',
    deleteAllSubtitle: (count: number) => `${count} entry trên thiết bị này`,

    // Group 2: Diary Protection
    protectionGroup: 'Bảo vệ nhật ký',
    faceIDEnabled: 'Khóa Face ID / vân tay',
    faceIDUnavailable: 'Face ID / vân tay chưa khả dụng',
    pinTitle: 'Mã PIN mở app',
    pinSubtitle: 'Dùng khi không muốn Face ID',

    // Group 3: App
    appGroup: 'Ứng dụng',
    notifications: 'Thông báo',
    notificationsSubtitle: 'Daily và weekly reminder',
    theme: 'Giao diện',
    themeSystem: 'Theo hệ thống',
    themeDark: 'Tối',
    themeLight: 'Sáng',
    language: 'Ngôn ngữ',
    languageVi: 'Tiếng Việt',
    languageEn: 'English',

    // Footer
    privacyPolicy: 'Chính sách quyền riêng tư',
    termsOfUse: 'Điều khoản sử dụng',

    // Delete Dialog
    deleteDialogTitle: 'Xóa toàn bộ nhật ký?',
    deleteDialogText: 'Nhập XÓA để xác nhận. Dữ liệu local sẽ bị xóa khỏi thiết bị này.',
    deleteConfirmWord: 'XÓA',

    // Permission Status
    permissionGranted: 'đã cho phép',
    permissionDenied: 'bị từ chối',
    permissionUnavailable: 'không hỗ trợ',
    permissionUnknown: 'chưa hỏi',
  },

  // --- Biometric Auth ---
  auth: {
    unlockPrompt: 'Mở khóa nhật ký',
    cancelLabel: 'Hủy',
  },

  // --- AI Service (mock suggestions) ---
  ai: {
    calendarSuffix: 'được giữ lại như một mốc nhỏ trong ngày, đủ để nhớ khi xem lại.',
    photoWithLocation: (location: string, moodText: string) =>
      `Một khoảnh khắc ở ${location}, được lưu lại nhẹ nhàng cùng cảm giác ${moodText}.`,
    photoGeneric: 'Một khoảnh khắc có ảnh được lưu lại, vừa đủ để nhớ nhịp của ngày hôm nay.',
    noteGeneric: 'Một ghi chú ngắn trong ngày, không cần quá dài, chỉ để sau này bạn nhận ra mình đã đi qua gì.',
    moodTextVeryBad: 'khá nặng',
    moodTextBad: 'chậm lại',
    moodTextNeutral: 'bình thường',
    moodTextGood: 'ổn',
    moodTextGreat: 'rất sáng',
  },

  // --- Location ---
  location: {
    webUnsupported: 'Web không hỗ trợ vị trí nền',
  },

  // --- Onboarding (future) ---
  onboarding: {
    slide1Title: 'Nhật ký tự động cho riêng bạn',
    slide1Text: 'App lặng lẽ ghi lại những khoảnh khắc mỗi ngày, không cần bạn phải ngồi viết.',
    slide2Title: 'Riêng tư tuyệt đối',
    slide2Text: 'Không mạng xã hội, không người lạ. Nhật ký chỉ nằm trên máy bạn.',
    slide3Title: 'Quyền truy cập',
    slide3Text: 'Cho phép app đọc ảnh, vị trí để tự tạo nhật ký. Bạn có thể bật sau.',
    allow: 'Cho phép',
    later: 'Để sau',
    getStarted: 'Bắt đầu',
  },

  // --- Calendar stub ---
  calendar: {
    stubText: 'Lịch: hoàn thành một việc quan trọng',
  },
};

// === English ===
const en: typeof vi = {
  common: {
    save: 'Save',
    discard: 'Discard',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    confirm: 'Confirm',
    loading: 'Opening your private diary...',
    entry: 'entry',
    moments: 'moments',
  },

  tabs: {
    home: 'Home',
    day: 'Day',
    reel: 'Reel',
    me: 'Me',
  },

  mood: {
    very_bad: 'Very Bad',
    bad: 'Bad',
    neutral: 'Neutral',
    good: 'Good',
    great: 'Great',
  },

  home: {
    title: 'Your Yesterday',
    subtitle: 'A few highlighted moments',
    kicker: 'No tracking – only reflecting',
    heroText: 'A day with its own rhythm, enough to remember later.',
    viewFullDay: 'View full day',
    moodCalendar: 'Mood Calendar',
    privacyNote: 'Data stays on your device. Backup and AI cloud are optional.',
    moodCalendarTitle: 'Mood Calendar',
    moodCalendarDesc: 'Summary of the last 7 days from entries saved on your device.',
    emptyMood: 'Empty',
  },

  day: {
    momentsInDay: (count: number) => `${count} moments today`,
    emptyTitle: 'No moments yet',
    emptyText: 'Tap the + button to add a note, photo, or calendar event for this day.',
    suggested: 'Suggested',
  },

  reel: {
    title: 'Look Back',
    subtitle: 'Review your past days',
    todayLastYear: 'Today Last Year',
    memorableMoments: (count: number) => `${count} memorable moments`,
    yourWeek: 'Your Week',
    momentCount: (count: number) => `${count} moments`,
  },

  addMoment: {
    title: 'Add Moment',
    captureTitle: 'Capture Moment',
    captureSubtitle: 'Take a photo or pick from gallery',
    noteTitle: 'Quick Note',
    noteSubtitle: 'Write a few lines if you want',
    calendarTitle: 'Add from Calendar',
    calendarSubtitle: 'Mark an important event',
  },

  composer: {
    title: 'New Moment',
    addPhoto: 'Add Photo',
    now: 'Now',
    noLocation: 'No location',
    moodLabel: 'Mood',
    noteLabel: 'Note',
    notePlaceholder: 'Anything to note today? (optional)',
    aiSuggestionTitle: 'AI Suggestion',
    useSuggestion: 'Use suggestion',
    ignoreSuggestion: 'Dismiss',
    saveButton: 'Save',
  },

  settings: {
    title: 'Settings',
    subtitle: 'Privacy and app preferences',

    permissionsGroup: 'Permissions & Data',
    permissionsTitle: 'Access Permissions',
    permissionsSubtitle: 'Photos, location, app usage...',
    photosAndVideo: 'Photos & Video',
    location: 'Location',
    backupTitle: 'Backup & Restore',
    backupSubtitle: 'Backup to iCloud/Drive, restore on new device',
    deleteAllTitle: 'Delete All Diary Data',
    deleteAllSubtitle: (count: number) => `${count} entries on this device`,

    protectionGroup: 'Diary Protection',
    faceIDEnabled: 'Face ID / Fingerprint Lock',
    faceIDUnavailable: 'Face ID / Fingerprint not available',
    pinTitle: 'App PIN Code',
    pinSubtitle: 'Use when Face ID is not preferred',

    appGroup: 'App',
    notifications: 'Notifications',
    notificationsSubtitle: 'Daily and weekly reminders',
    theme: 'Appearance',
    themeSystem: 'System',
    themeDark: 'Dark',
    themeLight: 'Light',
    language: 'Language',
    languageVi: 'Tiếng Việt',
    languageEn: 'English',

    privacyPolicy: 'Privacy Policy',
    termsOfUse: 'Terms of Use',

    deleteDialogTitle: 'Delete all diary data?',
    deleteDialogText: 'Type DELETE to confirm. Local data will be permanently removed from this device.',
    deleteConfirmWord: 'DELETE',

    permissionGranted: 'granted',
    permissionDenied: 'denied',
    permissionUnavailable: 'not supported',
    permissionUnknown: 'not asked',
  },

  auth: {
    unlockPrompt: 'Unlock your diary',
    cancelLabel: 'Cancel',
  },

  ai: {
    calendarSuffix: 'kept as a small milestone in the day, enough to remember when looking back.',
    photoWithLocation: (location: string, moodText: string) =>
      `A moment at ${location}, gently saved with a feeling of ${moodText}.`,
    photoGeneric: 'A moment captured in a photo, just enough to remember the rhythm of today.',
    noteGeneric: "A short note in the day, no need to be long, just so you'll know what you went through.",
    moodTextVeryBad: 'quite heavy',
    moodTextBad: 'slowing down',
    moodTextNeutral: 'normal',
    moodTextGood: 'fine',
    moodTextGreat: 'very bright',
  },

  location: {
    webUnsupported: 'Location not supported on web',
  },

  onboarding: {
    slide1Title: 'An automatic diary just for you',
    slide1Text: 'The app quietly records moments every day without you needing to write.',
    slide2Title: 'Completely private',
    slide2Text: 'No social networks, no strangers. Your diary stays on your device.',
    slide3Title: 'Permissions',
    slide3Text: 'Allow the app to read photos and location to auto-create your diary. You can enable later.',
    allow: 'Allow',
    later: 'Later',
    getStarted: 'Get Started',
  },

  calendar: {
    stubText: 'Calendar: completed an important task',
  },
};

// === Translation Map ===
const translations: Record<Language, typeof vi> = { vi, en };

// === Access Function ===

let currentLanguage: Language = 'vi';

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(): typeof vi {
  return translations[currentLanguage];
}

/**
 * Get the locale string for Intl.DateTimeFormat.
 */
export function getLocale(): string {
  return currentLanguage === 'vi' ? 'vi-VN' : 'en-US';
}
