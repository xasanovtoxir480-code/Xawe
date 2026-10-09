export type ViewMode =
  | 'home'
  | 'bookList'
  | 'unitList'
  | 'categoryMenu'
  | 'flashcards'
  | 'quiz'
  | 'results'
  | 'history'
  | 'search';

export type SelectionMode = 'single' | 'multi';

export type SearchScope = 'book' | 'unit';
export type SearchLang = 'en' | 'uz';

export interface Category {
  name: string;
  words: [string, string][]; // [english, uzbek]
}

export interface Unit {
  id: string;
  title: string;
  categories?: Category[];
  words?: [string, string][]; // for books without categories
}

export interface Book {
  id: string;
  title: string;
  description?: string;
  level?: string;
  units: Unit[];
}

export interface WordItem {
  en: string;
  uz: string;
  category: string;
  unitTitle?: string;
  unitId?: string;
  bookTitle?: string;
}

export interface Question {
  id: string;
  word: WordItem;
  options: string[]; // 4 options (uzbek)
  correctOption: string; // correct uzbek translation
}

export interface HistoryRecord {
  id: string;
  date: string; // ISOString
  bookTitle: string;
  unitTitle: string; // "Unit 3 — Coming and going" or "4 ta bo'lim tanlandi"
  category: string; // "Aralash", category name, or "—"
  totalWords: number;
  mistakeWords: number;
  percentage: number;
}
