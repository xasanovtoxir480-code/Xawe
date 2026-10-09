import React, { useState, useMemo } from 'react';
import { WordItem, SearchScope, SearchLang } from '../types/vocab';
import { playPronunciation } from '../utils/vocabHelpers';
import {
  Search,
  Volume2,
  X,
  Layers,
  BookOpen,
  ArrowLeft,
  Filter,
} from 'lucide-react';

interface SearchViewProps {
  initialScope: SearchScope;
  bookTitle: string;
  activeSelectionTitle: string;
  allBookWords: WordItem[];
  activePoolWords: WordItem[];
  onBack: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  initialScope,
  bookTitle,
  activeSelectionTitle,
  allBookWords,
  activePoolWords,
  onBack,
}) => {
  const [scope, setScope] = useState<SearchScope>(initialScope);
  const [lang, setLang] = useState<SearchLang>('en');
  const [query, setQuery] = useState<string>('');

  // Target word pool based on scope
  const pool = useMemo(() => {
    return scope === 'book' ? allBookWords : activePoolWords;
  }, [scope, allBookWords, activePoolWords]);

  // Filtered results: max 50 items as per spec (Section 8)
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Show first 50 words if empty query to give users something to browse
      return pool.slice(0, 50);
    }

    const filtered = pool.filter((item) => {
      const targetStr = lang === 'en' ? item.en : item.uz;
      return targetStr.toLowerCase().includes(q);
    });

    return filtered.slice(0, 50);
  }, [pool, query, lang]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Orqaga qaytish</span>
        </button>

        <div className="text-right">
          <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1 justify-end">
            <Search className="w-3.5 h-3.5" />
            Lug'at qidiruvi
          </span>
          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
            {scope === 'book' ? bookTitle : activeSelectionTitle}
          </p>
        </div>
      </div>

      {/* Scope and Language Switchers */}
      <div className="p-4 sm:p-5 rounded-3xl border border-white/10 bg-white/[0.04] space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Scope selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Ko'lam:</span>
            <div className="inline-flex rounded-xl bg-slate-900/80 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setScope('book')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  scope === 'book'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Butun kitob ({allBookWords.length})</span>
              </button>

              {activePoolWords.length > 0 && (
                <button
                  type="button"
                  onClick={() => setScope('unit')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    scope === 'unit'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Joriy tanlov ({activePoolWords.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Language selection: 'en' or 'uz' (Section 8) */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Qidirish tili:</span>
            <div className="inline-flex rounded-xl bg-slate-900/80 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  lang === 'en'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Inglizcha (EN)
              </button>
              <button
                type="button"
                onClick={() => setLang('uz')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  lang === 'uz'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                O'zbekcha (UZ)
              </button>
            </div>
          </div>
        </div>

        {/* Search input field */}
        <div className="relative">
          <Search className="w-5 h-5 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === 'en'
                ? "Inglizcha so'zni yozing (masalan, beat, discover, take up)..."
                : "O'zbekcha tarjimani yozing (masalan, yutmoq, sayohat, mashq)..."
            }
            className="w-full bg-slate-900/90 border border-white/15 rounded-2xl pl-12 pr-11 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          {query.trim() ? (
            <>
              Topildi: <strong className="text-cyan-400">{results.length} ta</strong> natija (maksimal 50 ta)
            </>
          ) : (
            <>
              Ro'yxatdan dastlabki <strong className="text-slate-300">{results.length} ta</strong> so'z
            </>
          )}
        </span>
        <span className="text-slate-500">
          Qidiruv maydoni: {lang === 'en' ? 'Inglizcha' : "O'zbekcha"}
        </span>
      </div>

      {/* Results List */}
      <div className="space-y-2.5">
        {results.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-white/10 bg-white/[0.02] text-slate-400 space-y-2">
            <Search className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="font-medium text-white">Mos keluvchi so'z topilmadi</p>
            <p className="text-xs text-slate-500">
              Qidiruv so'zini yoki qidirish tilini o'zgartirib ko'ring.
            </p>
          </div>
        ) : (
          results.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <button
                  type="button"
                  onClick={() => playPronunciation(item.en)}
                  className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-colors shrink-0"
                  title="Talaffuz qilish"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-base">
                      {item.en}
                    </span>
                    {item.category && item.category !== 'All' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                    {item.uz}
                  </p>
                </div>
              </div>

              {/* Tag for Unit if in book scope */}
              {item.unitTitle && (
                <div className="text-right shrink-0 hidden sm:block">
                  <span className="text-[11px] font-medium text-cyan-400/90 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20">
                    {item.unitTitle}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
