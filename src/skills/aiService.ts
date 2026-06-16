import { ComposerMode, Mood } from '../types';
import { t, getLanguage } from '../i18n/translations';
import { vi } from '../i18n/vi';
import { en } from '../i18n/en';

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
  lang: 'vi' | 'en';
}

export interface AISuggestionResult {
  text: string;
  isError: boolean;
}

export interface AISuggestionService {
  generateSuggestion(input: AISuggestionInput): Promise<string>;
  generateSuggestionWithStatus(input: AISuggestionInput): Promise<AISuggestionResult>;
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
    const result = await this.generateSuggestionWithStatus(input);
    return result.text;
  }

  async generateSuggestionWithStatus(input: AISuggestionInput): Promise<AISuggestionResult> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      return { text: createMockSuggestion(input), isError: true };
    } catch {
      return { text: t().ai.fallbackText, isError: true };
    }
  }
}

class GeminiAISuggestionService implements AISuggestionService {
  async generateSuggestion(input: AISuggestionInput): Promise<string> {
    const result = await this.generateSuggestionWithStatus(input);
    return result.text;
  }

  async generateSuggestionWithStatus(input: AISuggestionInput): Promise<AISuggestionResult> {
    const apiKey = (typeof process !== 'undefined' && process.env ? (process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY) : '') || '';
    
    if (!apiKey) {
      return this.fallback(input);
    }

    const prompt = buildAIPrompt(input);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Empty API response');
      }

      return { text: text.trim(), isError: false };
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn('[GeminiAISuggestionService] Failed or timed out, falling back:', error);
      return this.fallback(input);
    }
  }

  private fallback(input: AISuggestionInput): AISuggestionResult {
    try {
      return { text: createMockSuggestion(input), isError: true };
    } catch (mockError) {
      console.error('[GeminiAISuggestionService] Mock failed, using hardcode string:', mockError);
      return { text: t().ai.fallbackText, isError: true };
    }
  }
}

// Singleton instance — using the robust Gemini service with automatic fallback
export const aiService: AISuggestionService = new GeminiAISuggestionService();

// === Mock Text Generation ===

/**
 * Map a period string to its canonical key (handles both vi and en period values).
 */
type PeriodKey = 'morning' | 'lunch' | 'afternoon' | 'evening' | 'night';

function normalizePeriod(period?: string): PeriodKey {
  if (!period) return 'afternoon';
  const p = period.toLowerCase();
  if (p === 'morning' || p === 's\u00e1ng') return 'morning';
  if (p === 'lunch' || p === 'tr\u01b0a') return 'lunch';
  if (p === 'afternoon' || p === 'chi\u1ec1u') return 'afternoon';
  if (p === 'evening' || p === 't\u1ed1i') return 'evening';
  if (p === 'night' || p === '\u0111\u00eam') return 'night';
  return 'afternoon';
}

function createMockSuggestion(input: AISuggestionInput): string {
  const d = input.lang === 'en' ? en : vi;
  const p = normalizePeriod(input.period);
  const loc = input.locationName;
  const cal = input.calendarText;

  // Priority 1: Calendar event — mention the event + period
  if (cal) {
    if (p === 'morning') return (d.ai as any).calendarMorning?.(cal) ?? `${cal} ${d.ai.calendarSuffix}`;
    if (p === 'evening' || p === 'night') return (d.ai as any).calendarEvening?.(cal) ?? `${cal} ${d.ai.calendarSuffix}`;
    return (d.ai as any).calendarAfternoon?.(cal) ?? `${cal} ${d.ai.calendarSuffix}`;
  }

  // Priority 2: Photo with location
  if (input.mode === 'photo' && loc) {
    return d.ai.photoWithLocation(loc, moodText(input.mood, d));
  }

  // Priority 3: Photo without location
  if (input.mode === 'photo') {
    return d.ai.photoGeneric;
  }

  // Priority 4: Note with location — period-specific
  if (loc) {
    const locFn: Record<PeriodKey, ((l: string) => string) | undefined> = {
      morning:   (d.ai as any).noteMorningLoc,
      lunch:     (d.ai as any).noteLunchLoc,
      afternoon: (d.ai as any).noteAfternoonLoc,
      evening:   (d.ai as any).noteEveningLoc,
      night:     (d.ai as any).noteNightLoc,
    };
    const fn = locFn[p];
    if (fn) return fn(loc);
  }

  // Priority 5: Note by period only
  const periodNote: Record<PeriodKey, string | undefined> = {
    morning:   (d.ai as any).noteMorning,
    lunch:     (d.ai as any).noteLunch,
    afternoon: (d.ai as any).noteAfternoon,
    evening:   (d.ai as any).noteEvening,
    night:     (d.ai as any).noteNight,
  };
  return periodNote[p] ?? d.ai.noteGeneric;
}

function moodText(mood: Mood, dictionary: any): string {
  switch (mood) {
    case 'very_bad':
      return dictionary.ai.moodTextVeryBad;
    case 'bad':
      return dictionary.ai.moodTextBad;
    case 'good':
      return dictionary.ai.moodTextGood;
    case 'great':
      return dictionary.ai.moodTextGreat;
    case 'neutral':
    default:
      return dictionary.ai.moodTextNeutral;
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
  const lang = input.lang || 'vi';
  const isEn = lang === 'en';

  const parts: string[] = [
    isEn 
      ? 'You are a private diary assistant. Write a SHORT, natural suggestion (1-2 sentences, under 40 words) that fits the moment described below. Be specific to the time of day and context. Do not use overly dramatic language.'
      : 'Bạn là trợ lý nhật ký riêng tư. Viết 1-2 câu ngắn gọn (dưới 40 từ) phù hợp với khoảnh khắc bên dưới. Cụ thể theo thời điểm trong ngày. Không dùng từ quá kịch tính.',
    '',
    isEn ? 'Context:' : 'Ngữ cảnh:',
  ];

  if (input.time) {
    parts.push(`- ${isEn ? 'Time' : 'Thời gian'}: ${input.time}${ input.period ? ` (${input.period})` : '' }${ input.dayOfWeek ? `, ${input.dayOfWeek}` : '' }`);
  }
  if (input.locationName) {
    parts.push(`- ${isEn ? 'Location' : 'Địa điểm'}: ${input.locationName}`);
  }
  if (input.calendarText) {
    parts.push(`- ${isEn ? 'Calendar event' : 'Sự kiện lịch'}: ${input.calendarText}`);
  }
  if (input.photoLabels && input.photoLabels.length > 0) {
    parts.push(`- ${isEn ? 'Photo content' : 'Nội dung ảnh'}: ${input.photoLabels.join(', ')}`);
  }

  parts.push('');
  if (input.period) {
    parts.push(
      isEn
        ? `The suggestion should feel natural for this time of day (${input.period}). If it is lunch time, ask if they have eaten. If it is morning, ask how the day is starting. If it is evening, ask how the day went.`
        : `Gợi ý phải phù hợp với buổi ${input.period}. Nếu là buổi trưa, hỏi ăn cơm chưa. Nếu sáng, hỏi buổi sáng thế nào. Nếu tối, hỏi ngày của họ ra sao.`
    );
  }
  parts.push(
    isEn 
      ? 'Write the suggestion now. Respond in English only.'
      : 'Hãy viết gợi ý ngay. Chỉ trả lời bằng tiếng Việt.'
  );

  return parts.join('\n');
}
