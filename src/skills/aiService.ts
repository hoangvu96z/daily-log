import { ComposerMode, Mood } from '../types';
import { t, getLanguage } from '../i18n/translations';

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

function createMockSuggestion(input: AISuggestionInput): string {
  const dictionary = t();
  if (input.calendarText) {
    return `${input.calendarText} ${dictionary.ai.calendarSuffix}`;
  }

  if (input.mode === 'photo') {
    if (input.locationName) {
      return dictionary.ai.photoWithLocation(input.locationName, moodText(input.mood, dictionary));
    }
    return dictionary.ai.photoGeneric;
  }

  return dictionary.ai.noteGeneric;
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
