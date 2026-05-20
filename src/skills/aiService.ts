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

class GeminiAISuggestionService implements AISuggestionService {
  async generateSuggestion(input: AISuggestionInput): Promise<string> {
    // Try to get GEMINI_API_KEY from env or store (if configured)
    const apiKey = (typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : '') || '';
    if (!apiKey) {
      return createMockSuggestion(input);
    }

    const prompt = buildAIPrompt(input);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const apiCall = async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Empty API response');
      }

      return text.trim();
    };

    // Timeout helper (3 seconds)
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('API request timed out')), 3000)
    );

    try {
      // Race API call against 3-second timeout
      return await Promise.race([apiCall(), timeout]);
    } catch (error) {
      console.warn('[GeminiAISuggestionService] Failed or timed out, falling back to mock:', error);
      return createMockSuggestion(input);
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
