import { ComposerMode, Mood } from '../types';

export function createMomentSuggestion({
  mode,
  mood,
  locationName,
  calendarText,
}: {
  mode: ComposerMode;
  mood: Mood;
  locationName?: string;
  calendarText?: string;
}) {
  if (calendarText) {
    return `${calendarText} được giữ lại như một mốc nhỏ trong ngày, đủ để nhớ khi xem lại.`;
  }

  if (mode === 'photo') {
    return locationName
      ? `Một khoảnh khắc ở ${locationName}, được lưu lại nhẹ nhàng cùng cảm giác ${moodText(mood)}.`
      : `Một khoảnh khắc có ảnh được lưu lại, vừa đủ để nhớ nhịp của ngày hôm nay.`;
  }

  return `Một ghi chú ngắn trong ngày, không cần quá dài, chỉ để sau này bạn nhận ra mình đã đi qua gì.`;
}

function moodText(mood: Mood) {
  switch (mood) {
    case 'very_bad':
      return 'khá nặng';
    case 'bad':
      return 'chậm lại';
    case 'good':
      return 'ổn';
    case 'great':
      return 'rất sáng';
    case 'neutral':
    default:
      return 'bình thường';
  }
}
