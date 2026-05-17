import { ComposerMode, Mood } from '../types';

// === AI Service Interface ===

export interface AISuggestionInput {
  mode: ComposerMode;
  mood: Mood;
  time?: string;          // HH:MM
  dayOfWeek?: string;     // e.g. "Thứ Hai"
  period?: string;        // "sáng" | "chiều" | "tối"
  locationName?: string;
  calendarText?: string;
  photoLabels?: string[]; // e.g. ["coffee", "laptop", "street"]
}

export interface AISuggestionService {
  generateSuggestion(input: AISuggestionInput): Promise<string>;
}

// === Mock Implementation ===

/**
 * Mock AI suggestion service that returns hard-coded Vietnamese text.
 * Designed to be easily replaced with a real API (Gemini/OpenAI) later.
 *
 * To switch to a real implementation:
 * 1. Create a new class implementing AISuggestionService
 * 2. Replace the export in this file or use dependency injection
 */
class MockAISuggestionService implements AISuggestionService {
  async generateSuggestion(input: AISuggestionInput): Promise<string> {
    // Simulate slight delay like a real API would have
    await new Promise((resolve) => setTimeout(resolve, 100));
    return createMockSuggestion(input);
  }
}

// Singleton instance — swap this for a real implementation later
export const aiService: AISuggestionService = new MockAISuggestionService();

// === Mock Text Generation ===

function createMockSuggestion(input: AISuggestionInput): string {
  if (input.calendarText) {
    return `${input.calendarText} được giữ lại như một mốc nhỏ trong ngày, đủ để nhớ khi xem lại.`;
  }

  if (input.mode === 'photo') {
    if (input.locationName) {
      return `Một khoảnh khắc ở ${input.locationName}, được lưu lại nhẹ nhàng cùng cảm giác ${moodText(input.mood)}.`;
    }
    return `Một khoảnh khắc có ảnh được lưu lại, vừa đủ để nhớ nhịp của ngày hôm nay.`;
  }

  return `Một ghi chú ngắn trong ngày, không cần quá dài, chỉ để sau này bạn nhận ra mình đã đi qua gì.`;
}

function moodText(mood: Mood): string {
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

// === Prompt Template (for future real API integration) ===

/**
 * Generate the prompt to send to an LLM API.
 * Not used by mock service, but ready for real integration.
 *
 * Requirements:
 * - 1–2 sentences in Vietnamese
 * - Total < 40 words
 * - Neutral tone, no psychological analysis, no extreme language
 */
export function buildAIPrompt(input: AISuggestionInput): string {
  const parts: string[] = [
    'Bạn là trợ lý nhật ký riêng tư, chỉ mô tả khoảnh khắc, không phân tích tâm lý.',
    '',
    'Dữ liệu:',
  ];

  if (input.time) {
    parts.push(`- Thời gian: ${input.time} ${input.period || ''}, ${input.dayOfWeek || ''}`);
  }
  if (input.locationName) {
    parts.push(`- Địa điểm: ${input.locationName}`);
  }
  if (input.photoLabels && input.photoLabels.length > 0) {
    parts.push(`- Mô tả ảnh: ${input.photoLabels.join(', ')}`);
  }

  parts.push('');
  parts.push('Hãy viết 1–2 câu tiếng Việt ngắn gọn (tổng dưới 40 từ) mô tả khoảnh khắc này. Không dùng từ quá kịch tính.');

  return parts.join('\n');
}
