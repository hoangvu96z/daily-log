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
    allow: 'Cho phép',
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
    emptyMood: 'Chưa ghi',
    emptyYesterday: 'Hôm qua chưa có khoảnh khắc nào được lưu.',
    welcomeText: 'Chào bạn! Hãy bắt đầu ghi lại khoảnh khắc đầu tiên bằng nút + bên dưới.',
    entryCount: (count: number) => `${count} entry`,
    // Bento Grid and Insights Additions
    peaceIndex: 'Chỉ số bình yên',
    serenityOptimal: 'Tuần này bạn có nhiều ngày bình yên 😌',
    serenityModerate: 'Tuần này có chút lên xuống, nhưng vẫn ổn 🌤️',
    serenityMindful: 'Hôm nay thử dành vài phút cho riêng mình nhé 🧘',
    dailyInsights: 'Gợi ý suy ngẫm',
    luminousInsights: 'Gợi ý từ Luminous',
    insightsDesc: 'Dựa trên các bài nhật ký gần đây của bạn:',
    insightsText: '"Năng lượng của bạn lưu chuyển tuyệt vời nhất khi đi dạo ngoài thiên nhiên và dành thời gian viết nhật ký vào sáng sớm. Hãy tiếp tục ưu tiên những khoảng lặng thiền định."',
    heroSub: 'Môi trường phản chiếu bình yên của riêng bạn. Hãy nhìn lại hành trình và điều hòa năng lượng cho hôm nay.',
    moodSummary: (good: number, neutral: number, empty: number) => `7 ngày vừa qua: ${good} ngày vui, ${neutral} ngày bình thường, ${empty} ngày chưa ghi`,
    streakMessage: (days: number) => `Bạn đã giữ streak ${days} ngày 🎉`,
    insightHint: 'Hôm nay thử nhìn lại một khoảnh khắc bất ngờ',
    suggestMore: 'Gợi ý thêm',
    dayTitle: 'Ngày',
    noText: 'Không có nội dung',
    noEntriesForDay: 'Chưa ghi nhật ký ngày này.',
    viewDayDetails: 'Xem chi tiết ngày này',
    goToDayTab: 'Đi tới Tab Ngày',
  },

  // --- Day Screen ---
  day: {
    momentsInDay: (count: number) => `${count} khoảnh khắc trong ngày`,
    emptyTitle: 'Chưa có khoảnh khắc',
    emptyText: 'Hôm nay chưa có gì, thử bấm + để lưu lại một khoảnh khắc nhỏ 💫',
    suggested: 'Gợi ý',
  },

  // --- Reel Screen ---
  reel: {
    title: 'Xem lại',
    subtitle: 'Tự xem lại tuần/tháng của mình, không cần đăng đâu cả',
    todayLastYear: 'Hôm nay năm trước',
    memorableMoments: (count: number) => `${count} khoảnh khắc đáng nhớ`,
    yourWeek: 'Tuần của bạn',
    momentCount: (count: number) => `${count} khoảnh khắc`,
    noMoments: 'Chưa có khoảnh khắc nào',
    noReelsTitle: 'Chưa có reel nào',
    noReelsDesc: 'Khi bạn có đủ khoảnh khắc trong tuần, reel sẽ tự động được tạo.',
    playAll: 'Phát toàn bộ',
    savedMomentsCount: (count: number) => `${count} khoảnh khắc đã lưu`,
    paused: 'Đã tạm dừng',
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
    title: 'Góc riêng của bạn',
    subtitle: 'Nơi giữ an toàn cho nhật ký và chỉnh app theo ý bạn',

    // Group 1: Diary Protection (moved up — privacy first)
    protectionGroup: 'Khóa nhật ký',
    faceIDEnabled: 'Khóa Face ID / vân tay',
    faceIDUnavailable: 'Face ID / vân tay chưa khả dụng',
    pinTitle: 'Mã PIN mở app',
    pinSubtitle: 'Dùng khi không muốn Face ID',

    // PIN Setup & Status
    pinActive: 'Đang bật PIN',
    pinSetupDeactive: 'Đã tạo PIN, đang tắt',
    pinUseLock: 'Dùng PIN để khóa app',
    pinTitleSetup: 'Tạo mã PIN',
    pinTitleChange: 'Đổi mã PIN',
    pinConfirmSub: 'Nhập lại PIN một lần nữa để xác nhận.',
    pinHelperText: 'Chọn 4-6 số dễ nhớ với bạn, nhưng khó đoán với người khác.',
    pinConfirmTitle: 'Xác nhận PIN',
    pinSetupTitle: 'PIN riêng cho nhật ký',
    pinSaveBtn: 'Lưu PIN',
    pinContinueBtn: 'Tiếp tục',
    pinDisableBtn: 'Tắt PIN',
    pinErrorLength: 'PIN cần gồm 4-6 chữ số.',
    pinErrorMismatch: 'PIN chưa khớp. Thử lại từ đầu.',
    pinErrorIncorrect: 'PIN chưa đúng.',
    pinEnterTitle: 'Nhập PIN',
    pinEnterSub: 'Mở khóa nhật ký riêng của bạn.',
    pinUnlockBtn: 'Mở khóa',
    pinUseBiometric: 'Dùng Face ID / vân tay',
    pinDialogTitle: 'Chọn giao diện',
    pinDialogDesc: 'Đổi theme ngay và lưu vào cài đặt trên máy.',

    // Privacy & Alerts
    privacySecuredSub: 'Tìm hiểu cách dữ liệu của bạn được bảo mật',
    backupComingSoonTitle: 'Sắp ra mắt',
    backupComingSoonDesc: 'Tính năng Backup & Restore sẽ được thêm vào phiên bản tiếp theo.',
    notifComingSoonTitle: 'Cần quyền thông báo',
    notifComingSoonDesc: 'Vào Cài đặt máy → Thông báo → Bật cho ứng dụng này.',


    // Premium upgrade details
    premiumUpgradeTitle: 'Daily Log Premium',
    premiumUpgradeDesc: 'Mở khóa AI gợi ý, backup và theme cao cấp',
    premiumUpgradeBtn: 'Nâng cấp',
    premiumActiveTitle: 'Bạn đang sở hữu Premium!',
    premiumActiveDesc: 'Đã mở khóa toàn bộ tính năng cao cấp',

    // Paywall Success & Options
    paywallUpgradeSuccessTitle: 'Nâng cấp thành công',
    paywallUpgradeSuccessDesc: 'Chào mừng bạn đến với Daily Log Premium! Các tính năng đã được mở khóa.',
    paywallRestoreSuccessTitle: 'Khôi phục thành công',
    paywallRestoreSuccessDesc: 'Đã khôi phục giao dịch Premium của bạn.',
    paywallOptionLifetimeDesc: 'Thanh toán một lần',
    paywallOptionLifetimePrice: '199.000 đ',
    paywallOptionYearDesc: 'Tiết kiệm 55%',
    paywallOptionYearPrice: '99.000 đ/năm',
    paywallOptionMonthDesc: 'Hủy bất cứ lúc nào',
    paywallOptionMonthPrice: '19.000 đ/tháng',

    // Group 2: Permissions & Data
    permissionsGroup: 'Quyền & dữ liệu',
    permissionsTitle: 'Quyền truy cập',
    permissionsSubtitle: 'Ảnh, vị trí, hoạt động ứng dụng...',
    photosAndVideo: 'Ảnh & video',
    location: 'Vị trí',
    calendar: 'Lịch',
    autoTracking: 'Tự động ghi nhận (Auto-Tracking)',
    autoTrackingDesc: 'Tự động tạo gợi ý nhật ký từ ảnh, vị trí và sự kiện.',
    bgFetchWarningTitle: 'Background Fetch bị hạn chế',
    bgFetchWarningText: 'Background Fetch bị tắt hoặc hạn chế trên thiết bị này. Tính năng Tự động ghi nhận sẽ chỉ chạy khi bạn mở ứng dụng.',
    backupTitle: 'Sao lưu & khôi phục',
    backupSubtitle: 'Backup iCloud/Drive, khôi phục khi đổi máy',
    deleteAllTitle: 'Xóa toàn bộ nhật ký',
    deleteAllSubtitle: (count: number) => `${count} entry trên thiết bị này`,
    privacyMicrocopy: 'Nhật ký chỉ lưu trên máy. Không có server bên ngoài.',
    privacyTitle: 'Quyền riêng tư & Nhật ký tự động',
    privacyOnDeviceTitle: 'Lưu trữ trên thiết bị',
    privacyOnDeviceDesc: 'Tất cả bài viết, hình ảnh và vị trí được lưu trữ hoàn toàn trong SQLite trên máy của bạn.',
    privacyAITitle: 'Gợi ý AI an toàn',
    privacyAIDesc: 'AI chỉ nhận từ khóa hoạt động ẩn danh để gợi ý tiêu đề. Không có ảnh hay văn bản nhật ký nào bị gửi lên đám mây.',
    privacyServerTitle: 'Không có máy chủ ngoài',
    privacyServerDesc: 'App chạy offline 100%. Không có server lưu trữ dữ liệu của bạn, trừ phi bạn chọn sao lưu sau này.',
    paywallTitle: 'Daily Log Premium',
    paywallSubtitle: 'Mở khóa trọn đời khoảnh khắc của bạn',
    paywallFeature1Title: 'AI Gợi Ý Chuyên Sâu',
    paywallFeature1Desc: 'AI phân tích sâu hơn cảm xúc và đưa ra gợi ý viết nhật ký cá nhân hóa cao.',
    paywallFeature2Title: 'Không Giới Hạn Hình Ảnh',
    paywallFeature2Desc: 'Đính kèm bao nhiêu hình ảnh tùy thích vào mỗi moment trong ngày.',
    paywallFeature3Title: 'Giao Diện & Màu Sắc Nâng Cao',
    paywallFeature3Desc: 'Mở khóa toàn bộ bảng màu và hình nền độc quyền cao cấp.',
    paywallFeature4Title: 'Đồng Bộ Đám Mây iCloud/Drive',
    paywallFeature4Desc: 'Tự động sao lưu và đồng bộ hóa an toàn, không lo mất dữ liệu.',
    paywallOptionMonth: 'Gói Tháng',
    paywallOptionYear: 'Gói Năm',
    paywallOptionLifetime: 'Trọn Đời',
    paywallBestValue: 'Best Value',
    paywallButton: 'Nâng cấp ngay',
    paywallRestore: 'Khôi phục giao dịch mua',
    paywallFooter: 'Gói mua của bạn sẽ được kích hoạt ngay lập tức. Bạn có thể khôi phục bất cứ lúc nào.',

    // Group 3: App & Appearance
    appGroup: 'App & giao diện',
    notifications: 'Thông báo',
    notificationsSubtitle: 'Daily và weekly reminder',
    theme: 'Giao diện',
    themeSystem: 'Theo hệ thống',
    themeDark: 'Tối',
    themeLight: 'Sáng',
    accentColor: 'Tông màu chủ đạo',
    accentColorDesc: 'Thay đổi màu sắc chủ đạo của toàn bộ giao diện.',
    accentNavy: 'Classic Navy (Mặc định)',
    accentSage: 'Sage Green (Xanh lục bảo)',
    accentOcean: 'Ocean Blue (Xanh biển sâu)',
    accentLavender: 'Lavender (Tím oải hương)',
    accentTerracotta: 'Terracotta (Cam đất sét)',
    customWallpaper: 'Hình nền tùy chọn',
    customWallpaperDesc: 'Thiết lập hình nền riêng làm giao diện cho ứng dụng.',
    customWallpaperSet: 'Đã chọn hình nền riêng',
    customWallpaperDefault: 'Mặc định',
    pickFromGallery: 'Chọn từ thư viện ảnh',
    removeWallpaper: 'Gỡ bỏ hình nền hiện tại',
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
    comingSoon: 'Sắp ra mắt',
    backupAlertText: 'Tính năng Backup & Restore sẽ được thêm vào phiên bản tiếp theo.',
    pinEnabledState: 'Đang bật PIN',
    pinDisabledState: 'Đã tạo PIN, đang tắt',
    usePinLock: 'Dùng PIN để khóa app',
    notificationsEnabledSubtitle: 'Đang bật — nhắc nhở hàng ngày',
    notifPermissionAlertTitle: 'Cần quyền thông báo',
    notifPermissionAlertText: 'Vào Cài đặt máy → Thông báo → Bật cho ứng dụng này.',
    chooseThemeTitle: 'Chọn giao diện',
    chooseThemeDesc: 'Đổi theme ngay và lưu vào cài đặt trên máy.',
    notifDialogTitle: 'Thông báo nhắc nhở',
    notifDialogDesc: 'Bật để nhận nhắc nhở hàng ngày lúc 21:00 và tóm tắt tuần mỗi Chủ nhật 20:00.',
    enableNotifications: 'Bật thông báo',
    disableNotifications: 'Tắt thông báo',
  },

  // --- Biometric Auth ---
  auth: {
    unlockPrompt: 'Mở khóa nhật ký',
    cancelLabel: 'Hủy',
  },

  // --- PIN Code ---
  pin: {
    changeTitle: 'Đổi mã PIN',
    createTitle: 'Tạo mã PIN',
    confirmHelper: 'Nhập lại PIN một lần nữa để xác nhận.',
    createHelper: 'Chọn 4-6 số dễ nhớ với bạn, nhưng khó đoán với người khác.',
    validationError: 'PIN cần gồm 4-6 chữ số.',
    mismatchError: 'PIN chưa khớp. Thử lại từ đầu.',
    confirmHeading: 'Xác nhận PIN',
    createHeading: 'PIN riêng cho nhật ký',
    saveButton: 'Lưu PIN',
    continueButton: 'Tiếp tục',
    turnOff: 'Tắt PIN',
    incorrectPin: 'PIN chưa đúng.',
    enterPin: 'Nhập PIN',
    unlockDesc: 'Mở khóa nhật ký riêng của bạn.',
    unlockButton: 'Mở khóa',
    useBiometrics: 'Dùng Face ID / vân tay',
    usePinCode: 'Dùng mã PIN',
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
    skip: 'Bỏ qua',
    slide1Title: 'Mỗi ngày\nlà một dòng thời gian',
    slide1Text: 'App tự xâu chuỗi ảnh, giờ giấc và cảm xúc\nthành một dòng story cho riêng bạn.',
    slide2Title: 'Không like,\nkhông follower',
    slide2Text: 'Không mạng xã hội, không người lạ.\nChỉ có bạn và những khoảnh khắc của mình.',
    slide3Title: 'AI gợi ý,\nbạn quyết định',
    slide3Text: 'App dùng AI để tạo gợi ý nhật ký từ ảnh và vị trí.\nBạn chỉ cần chạm xác nhận hoặc bỏ qua.',
    slide4Title: 'Riêng tư\ntuyệt đối',
    slide4Text: 'Nhật ký ở trên máy bạn.\nBạn có thể xóa mọi thứ bất cứ lúc nào.',
    slide4PermPhotos: 'Để nhớ khoảnh khắc',
    slide4PermLocation: 'Để nhớ bạn đã ở đâu',
    slide4PermCalendar: 'Để đánh dấu mốc quan trọng',
    getStarted: 'Bắt đầu',
  },

  // --- Calendar ---
  calendar: {
    stubText: 'Lịch: hoàn thành một việc quan trọng',
    pickerTitle: 'Chọn mốc từ lịch',
    pickerDescWithEvents: 'Chọn một event hôm nay để tự điền giờ và nội dung.',
    pickerDescNoEvents: 'Hôm nay chưa có event nào trong lịch.',
    manualInput: 'Tự nhập',
    defaultEventText: 'Mốc từ lịch',
  },

  permissions: {
    webUnsupported: 'Web không hỗ trợ vị trí nền',
    biometricPrompt: 'Mở khóa nhật ký',
    photoExplanation: 'Truy cập Thư viện ảnh để bạn có thể đính kèm ảnh chụp các khoảnh khắc đáng nhớ vào nhật ký cá nhân.',
    locationExplanation: 'Truy cập Vị trí để tự động ghi nhận nơi bạn đã lưu giữ khoảnh khắc, hỗ trợ định vị dòng thời gian.',
    calendarExplanation: 'Truy cập Lịch để tích hợp các cuộc họp, sự kiện quan trọng trong ngày vào nhật ký tự động.',
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
    allow: 'Allow',
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
    emptyMood: 'Not logged',
    emptyYesterday: 'No moments recorded yesterday.',
    welcomeText: 'Welcome! Start capturing your first moment with the + button below.',
    entryCount: (count: number) => `${count} ${count === 1 ? 'entry' : 'entries'}`,
    // Bento Grid and Insights Additions
    peaceIndex: 'Peace Index',
    serenityOptimal: 'You had many peaceful days this week 😌',
    serenityModerate: 'A few ups and downs, but you\'re doing fine 🌤️',
    serenityMindful: 'Try taking a few minutes for yourself today 🧘',
    dailyInsights: 'Daily Insights',
    luminousInsights: 'Luminous Insights',
    insightsDesc: 'Based on your recent timeline reflections:',
    insightsText: '"Your energy flows beautifully when taking nature walks and dedicating time to journal early in the day. Keep prioritizing spaces of silent meditation."',
    heroSub: 'Your luminous sanctuary awaits. Reflect on your journey and align your energy for today.',
    moodSummary: (good: number, neutral: number, empty: number) => `Past 7 days: ${good} good, ${neutral} neutral, ${empty} not logged`,
    streakMessage: (days: number) => `You kept a ${days}-day streak 🎉`,
    insightHint: 'Try looking back at an unexpected moment today',
    suggestMore: 'Suggest More',
    dayTitle: 'Day',
    noText: 'No text',
    noEntriesForDay: 'No entries for this day.',
    viewDayDetails: 'View Day Details',
    goToDayTab: 'Go to Day Tab',
  },

  day: {
    momentsInDay: (count: number) => `${count} moments today`,
    emptyTitle: 'No moments yet',
    emptyText: 'Nothing here yet — tap + to save a small moment 💫',
    suggested: 'Suggested',
  },

  reel: {
    title: 'Look Back',
    subtitle: 'Review your past days',
    todayLastYear: 'Today Last Year',
    memorableMoments: (count: number) => `${count} memorable moments`,
    yourWeek: 'Your Week',
    momentCount: (count: number) => `${count} ${count === 1 ? 'moment' : 'moments'}`,
    noMoments: 'No moments yet',
    noReelsTitle: 'No reels yet',
    noReelsDesc: 'When you have enough moments this week, a weekly reel will be automatically generated.',
    playAll: 'Play All',
    savedMomentsCount: (count: number) => `${count} saved ${count === 1 ? 'moment' : 'moments'}`,
    paused: 'Paused',
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
    title: 'Your Corner',
    subtitle: 'Keep your diary safe and make the app yours',

    // Group 1: Diary Lock (moved up — privacy first)
    protectionGroup: 'Diary Lock',
    faceIDEnabled: 'Face ID / Fingerprint Lock',
    faceIDUnavailable: 'Face ID / Fingerprint not available',
    pinTitle: 'App PIN Code',
    pinSubtitle: 'Use when Face ID is not preferred',

    // PIN Setup & Status
    pinActive: 'PIN active',
    pinSetupDeactive: 'PIN set, inactive',
    pinUseLock: 'Use PIN code to lock app',
    pinTitleSetup: 'Create PIN Code',
    pinTitleChange: 'Change PIN Code',
    pinConfirmSub: 'Re-enter PIN once more to confirm.',
    pinHelperText: 'Choose 4-6 numbers that are easy for you to remember, but hard for others to guess.',
    pinConfirmTitle: 'Confirm PIN',
    pinSetupTitle: 'Private PIN for diary',
    pinSaveBtn: 'Save PIN',
    pinContinueBtn: 'Continue',
    pinDisableBtn: 'Disable PIN',
    pinErrorLength: 'PIN must be 4-6 digits.',
    pinErrorMismatch: 'PIN mismatch. Try again from the start.',
    pinErrorIncorrect: 'Incorrect PIN.',
    pinEnterTitle: 'Enter PIN',
    pinEnterSub: 'Unlock your private diary.',
    pinUnlockBtn: 'Unlock',
    pinUseBiometric: 'Use Face ID / Fingerprint',
    pinDialogTitle: 'Choose appearance',
    pinDialogDesc: 'Change theme now and save to device settings.',

    // Privacy & Alerts
    privacySecuredSub: 'Learn how your data is secured',
    backupComingSoonTitle: 'Coming Soon',
    backupComingSoonDesc: 'Backup & Restore features will be added in the next version.',
    notifComingSoonTitle: 'Notification Permission Required',
    notifComingSoonDesc: 'Go to device Settings → Notifications → Enable for this app.',


    // Premium upgrade details
    premiumUpgradeTitle: 'Daily Log Premium',
    premiumUpgradeDesc: 'Unlock AI writing prompts, backup & customization',
    premiumUpgradeBtn: 'Upgrade',
    premiumActiveTitle: 'Premium Account Active!',
    premiumActiveDesc: 'All premium features are fully unlocked',

    // Paywall Success & Options
    paywallUpgradeSuccessTitle: 'Upgrade Successful',
    paywallUpgradeSuccessDesc: 'Welcome to Daily Log Premium! All features have been unlocked.',
    paywallRestoreSuccessTitle: 'Restore Successful',
    paywallRestoreSuccessDesc: 'Your Premium purchase has been successfully restored.',
    paywallOptionLifetimeDesc: 'One-time purchase',
    paywallOptionLifetimePrice: '$9.99',
    paywallOptionYearDesc: 'Save 55%',
    paywallOptionYearPrice: '$4.99/yr',
    paywallOptionMonthDesc: 'Cancel anytime',
    paywallOptionMonthPrice: '$0.99/mo',

    // Group 2: Permissions & Data
    permissionsGroup: 'Permissions & Data',
    permissionsTitle: 'Access Permissions',
    permissionsSubtitle: 'Photos, location, app usage...',
    photosAndVideo: 'Photos & Video',
    location: 'Location',
    calendar: 'Calendar',
    autoTracking: 'Auto-Tracking',
    autoTrackingDesc: 'Automatically generate diary suggestions from photos, location, and calendar events.',
    bgFetchWarningTitle: 'Background Fetch Restricted',
    bgFetchWarningText: 'Background Fetch is disabled or restricted on this device. Auto-Tracking will only run when you open the app.',
    backupTitle: 'Backup & Restore',
    backupSubtitle: 'Backup to iCloud/Drive, restore on new device',
    deleteAllTitle: 'Delete All Diary Data',
    deleteAllSubtitle: (count: number) => `${count} entries on this device`,
    privacyMicrocopy: 'Your diary is stored locally. No external servers involved.',
    privacyTitle: 'Privacy & Auto-Journaling',
    privacyOnDeviceTitle: 'On-Device Storage',
    privacyOnDeviceDesc: 'All entries, images, and locations are stored locally in your device\'s SQLite database.',
    privacyAITitle: 'Secure AI Suggestions',
    privacyAIDesc: 'AI only receives anonymized activity tags to suggest titles. No photos or diary text are ever sent to the cloud.',
    privacyServerTitle: 'No External Servers',
    privacyServerDesc: 'The app works 100% offline. No servers collect your personal data unless you enable backup in the future.',
    paywallTitle: 'Daily Log Premium',
    paywallSubtitle: 'Unlock your moments forever',
    paywallFeature1Title: 'AI Deep Insights',
    paywallFeature1Desc: 'AI analyzes your feelings deeply and yields highly personalized journaling prompts.',
    paywallFeature2Title: 'Unlimited Photo Uploads',
    paywallFeature2Desc: 'Attach as many photos as you want to any single moment.',
    paywallFeature3Title: 'Exclusive Themes & Styling',
    paywallFeature3Desc: 'Access all premium accent colors and custom wallpapers.',
    paywallFeature4Title: 'Private iCloud/Drive Backup',
    paywallFeature4Desc: 'Auto-backup and sync securely. Never worry about losing your journal entries.',
    paywallOptionMonth: 'Monthly Plan',
    paywallOptionYear: 'Yearly Plan',
    paywallOptionLifetime: 'Lifetime Plan',
    paywallBestValue: 'Best Value',
    paywallButton: 'Upgrade Now',
    paywallRestore: 'Restore Purchase',
    paywallFooter: 'Your subscription will activate instantly. You can restore your purchase at any time.',

    // Group 3: App & Appearance
    appGroup: 'App & Appearance',
    notifications: 'Notifications',
    notificationsSubtitle: 'Daily and weekly reminders',
    theme: 'Appearance',
    themeSystem: 'System',
    themeDark: 'Dark',
    themeLight: 'Light',
    accentColor: 'Accent Color',
    accentColorDesc: 'Change the main color of the entire interface.',
    accentNavy: 'Classic Navy (Default)',
    accentSage: 'Sage Green',
    accentOcean: 'Ocean Blue',
    accentLavender: 'Lavender',
    accentTerracotta: 'Terracotta',
    customWallpaper: 'Custom Wallpaper',
    customWallpaperDesc: 'Set a custom background image for the app.',
    customWallpaperSet: 'Custom wallpaper active',
    customWallpaperDefault: 'Default',
    pickFromGallery: 'Pick from photo gallery',
    removeWallpaper: 'Remove current wallpaper',
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
    comingSoon: 'Coming Soon',
    backupAlertText: 'Backup & Restore features will be added in the next version.',
    pinEnabledState: 'PIN enabled',
    pinDisabledState: 'PIN set, but disabled',
    usePinLock: 'Use PIN for app lock',
    notificationsEnabledSubtitle: 'Enabled — daily reminders',
    notifPermissionAlertTitle: 'Notification Permission Required',
    notifPermissionAlertText: 'Go to System Settings → Notifications → Enable for this app.',
    chooseThemeTitle: 'Choose Appearance',
    chooseThemeDesc: 'Change theme immediately and save to device preferences.',
    notifDialogTitle: 'Reminder Notifications',
    notifDialogDesc: 'Turn on to receive daily reminders at 21:00 and weekly summary every Sunday at 20:00.',
    enableNotifications: 'Enable Notifications',
    disableNotifications: 'Disable Notifications',
  },

  auth: {
    unlockPrompt: 'Unlock your diary',
    cancelLabel: 'Cancel',
  },

  pin: {
    changeTitle: 'Change PIN',
    createTitle: 'Create PIN',
    confirmHelper: 'Enter PIN once more to confirm.',
    createHelper: 'Choose a 4-6 digit code that is easy to remember but hard for others to guess.',
    validationError: 'PIN must be 4-6 digits.',
    mismatchError: 'PIN code mismatch. Start over.',
    confirmHeading: 'Confirm PIN',
    createHeading: 'App Lock PIN',
    saveButton: 'Save PIN',
    continueButton: 'Continue',
    turnOff: 'Turn off PIN',
    incorrectPin: 'Incorrect PIN.',
    enterPin: 'Enter PIN',
    unlockDesc: 'Unlock your private diary.',
    unlockButton: 'Unlock',
    useBiometrics: 'Use Face ID / Fingerprint',
    usePinCode: 'Use PIN code',
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
    skip: 'Skip',
    slide1Title: 'Every day\nis a timeline',
    slide1Text: 'The app threads photos, timestamps, and emotions\ninto a story just for you.',
    slide2Title: 'No likes,\nno followers',
    slide2Text: 'No social networks, no strangers.\nJust you and your moments.',
    slide3Title: 'AI suggests,\nyou decide',
    slide3Text: 'The app uses AI to suggest entries from photos and location.\nYou just tap to confirm or dismiss.',
    slide4Title: 'Completely\nprivate',
    slide4Text: 'Your diary stays on your device.\nYou can delete everything at any time.',
    slide4PermPhotos: 'To remember moments',
    slide4PermLocation: 'To remember where you were',
    slide4PermCalendar: 'To mark milestones',
    getStarted: 'Get Started',
  },

  calendar: {
    stubText: 'Calendar: completed an important task',
    pickerTitle: 'Select from Calendar',
    pickerDescWithEvents: 'Select an event today to automatically prefill time and content.',
    pickerDescNoEvents: 'No events found in your calendar today.',
    manualInput: 'Manual entry',
    defaultEventText: 'Calendar Event',
  },

  permissions: {
    webUnsupported: 'Web does not support background location',
    biometricPrompt: 'Unlock diary',
    photoExplanation: 'Access your Photo Library to allow attaching photos of memorable moments to your private journal.',
    locationExplanation: 'Access your Location to log where you spend your moments, helping build your timeline.',
    calendarExplanation: 'Access your Calendar to integrate important meetings and events into your auto journal.',
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

import { useJournalStore } from '../memory/store';

export function useTranslation() {
  const language = useJournalStore((state) => state.settings?.language || 'vi');
  return {
    t: translations[language],
    lang: language,
    locale: language === 'vi' ? 'vi-VN' : 'en-US',
  };
}

/**
 * Get the locale string for Intl.DateTimeFormat.
 */
export function getLocale(): string {
  return currentLanguage === 'vi' ? 'vi-VN' : 'en-US';
}
