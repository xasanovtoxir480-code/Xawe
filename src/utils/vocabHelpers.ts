import { Unit, WordItem, Question, HistoryRecord, Book } from '../types/vocab';

/**
 * Returns ALL words of the unit in { en, uz, category, unitTitle, unitId } form
 */
export function getUnitWords(unit: Unit): WordItem[] {
  const result: WordItem[] = [];

  if (unit.categories && unit.categories.length > 0) {
    for (const cat of unit.categories) {
      for (const [en, uz] of cat.words) {
        result.push({
          en,
          uz,
          category: cat.name,
          unitTitle: unit.title,
          unitId: unit.id,
        });
      }
    }
  } else if (unit.words && unit.words.length > 0) {
    for (const [en, uz] of unit.words) {
      result.push({
        en,
        uz,
        category: 'All',
        unitTitle: unit.title,
        unitId: unit.id,
      });
    }
  }

  return result;
}

/**
 * Returns unit group names list (or if no groups, ["All"])
 */
export function unitCategoryList(unit: Unit): string[] {
  if (unit.categories && unit.categories.length > 0) {
    return unit.categories.map((c) => c.name);
  }
  return ['All'];
}

/**
 * Returns words of a specific category from a unit in { en, uz, category, unitTitle } form
 */
export function getCategoryWords(unit: Unit, categoryName: string): WordItem[] {
  if (unit.categories && unit.categories.length > 0) {
    if (categoryName === 'All') {
      return getUnitWords(unit);
    }
    const cat = unit.categories.find((c) => c.name === categoryName);
    if (!cat) return [];
    return cat.words.map(([en, uz]) => ({
      en,
      uz,
      category: cat.name,
      unitTitle: unit.title,
      unitId: unit.id,
    }));
  }

  // Without categories
  return getUnitWords(unit);
}

/**
 * "Unit 3 — Coming and going" -> "Unit 3"
 */
export function shortUnitLabel(title: string): string {
  if (!title) return '';
  const match = title.match(/^(Unit\s+\d+)/i);
  if (match) return match[1];
  const dashIndex = title.indexOf('—');
  if (dashIndex !== -1) return title.substring(0, dashIndex).trim();
  const hyphenIndex = title.indexOf('-');
  if (hyphenIndex !== -1) return title.substring(0, hyphenIndex).trim();
  return title;
}

/**
 * Generic array shuffle (Fisher-Yates)
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Picks wrong options for test
 */
export function pickWrongOptions(
  correct: string,
  pool: WordItem[],
  count: number = 3,
  key: 'uz' | 'en' = 'uz'
): string[] {
  // Filter out identical answers
  const candidates = pool
    .map((item) => item[key])
    .filter((val, index, self) => val !== correct && self.indexOf(val) === index);

  const shuffled = shuffle(candidates);
  return shuffled.slice(0, count);
}

/**
 * Builds one test question (4 options, 1 correct)
 */
export function buildQuestion(
  word: WordItem,
  pool: WordItem[],
  fallbackPool?: WordItem[]
): Question {
  let wrong = pickWrongOptions(word.uz, pool, 3, 'uz');

  // If the active pool is very small (e.g. less than 4 words in a category), fill with fallback words
  if (wrong.length < 3 && fallbackPool && fallbackPool.length > 0) {
    const additional = pickWrongOptions(word.uz, fallbackPool, 3 - wrong.length, 'uz')
      .filter((w) => !wrong.includes(w) && w !== word.uz);
    wrong = [...wrong, ...additional].slice(0, 3);
  }

  const options = shuffle([word.uz, ...wrong]);

  return {
    id: `${word.en}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    word,
    options,
    correctOption: word.uz,
  };
}

/**
 * Gets all words across all units of a book
 */
export function getAllBookWords(book: Book): WordItem[] {
  const all: WordItem[] = [];
  for (const unit of book.units) {
    const words = getUnitWords(unit);
    for (const w of words) {
      all.push({
        ...w,
        bookTitle: book.title,
      });
    }
  }
  return all;
}

// Storage abstraction conforming to window.storage specifications with safe fallback
declare global {
  interface Window {
    storage?: {
      get: (key: string, shared?: boolean) => Promise<{ value: string } | string | null> | { value: string } | string | null;
      set: (key: string, value: string, shared?: boolean) => Promise<void> | void;
    };
  }
}

const STORAGE_KEY = 'quiz-history';

export async function loadHistoryRecords(): Promise<HistoryRecord[]> {
  try {
    if (typeof window !== 'undefined' && window.storage?.get) {
      const res = await window.storage.get(STORAGE_KEY, false);
      let raw: string | null = null;
      if (typeof res === 'string') raw = res;
      else if (res && typeof res === 'object' && 'value' in res) raw = res.value;

      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.warn('window.storage.get failed, trying fallback', err);
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (e) {
    console.error('localStorage.getItem error', e);
  }

  return [];
}

export async function saveHistoryRecord(record: HistoryRecord): Promise<HistoryRecord[]> {
  const existing = await loadHistoryRecords();
  // Keep newest first, max 50 records as specified in spec
  const updated = [record, ...existing].slice(0, 50);
  const jsonStr = JSON.stringify(updated);

  try {
    if (typeof window !== 'undefined' && window.storage?.set) {
      await window.storage.set(STORAGE_KEY, jsonStr, false);
    }
  } catch (err) {
    console.warn('window.storage.set error, falling back', err);
  }

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, jsonStr);
    }
  } catch (e) {
    console.error('localStorage.setItem error', e);
  }

  return updated;
}

export async function clearAllHistory(): Promise<void> {
  const emptyStr = JSON.stringify([]);
  try {
    if (typeof window !== 'undefined' && window.storage?.set) {
      await window.storage.set(STORAGE_KEY, emptyStr, false);
    }
  } catch (err) {
    console.warn('window.storage.set clear error', err);
  }

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, emptyStr);
    }
  } catch (e) {
    console.error('localStorage clear error', e);
  }
}

/**
 * Text-to-speech voice synthesis for English words
 */
export function playPronunciation(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('TTS error:', err);
  }
}
