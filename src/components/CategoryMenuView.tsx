import React, { useState } from 'react';
import { WordItem, SelectionMode } from '../types/vocab';
import { playPronunciation } from '../utils/vocabHelpers';
import {
  Layers,
  Search,
  BookOpen,
  Volume2,
  Play,
  RotateCcw,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ListChecks,
} from 'lucide-react';

interface SelectedSectionSummary {
  unitIndex: number;
  unitTitle: string;
  categoryName: string;
  wordCount: number;
}

interface CategoryMenuViewProps {
  selectionMode: SelectionMode;
  activeTitle: string;
  activeWords: WordItem[];
  // For single mode
  availableCategories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  // For multi mode
  selectedSectionsSummary?: SelectedSectionSummary[];
  // Actions
  onStartFlashcards: () => void;
  onStartQuiz: () => void;
  onOpenUnitSearch: () => void;
  onBackToUnitList: () => void;
}

export const CategoryMenuView: React.FC<CategoryMenuViewProps> = ({
  selectionMode,
  activeTitle,
  activeWords,
  availableCategories,
  selectedCategory,
  onSelectCategory,
  selectedSectionsSummary = [],
  onStartFlashcards,
  onStartQuiz,
  onOpenUnitSearch,
  onBackToUnitList,
}) => {
  const [showWordsList, setShowWordsList] = useState<boolean>(true);
  const [previewFilter, setPreviewFilter] = useState<string>('');

  const filteredWords = activeWords.filter((w) => {
    if (!previewFilter.trim()) return true;
    const q = previewFilter.toLowerCase();
    return w.en.toLowerCase().includes(q) || w.uz.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner / Selection summary */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-900/80 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>
                {selectionMode === 'multi'
                  ? "Bo'limlarni tanlash rejimi (Aralash to'plam)"
                  : 'Oddiy tanlov rejimi'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeTitle}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 pt-1">
              <span className="font-semibold text-cyan-400">
                {activeWords.length} ta so'z mavjud
              </span>
              <span>•</span>
              {selectionMode === 'multi' ? (
                <span>{selectedSectionsSummary.length} ta bo'lim aralashgan</span>
              ) : (
                <span>Bo'lim: <strong>{selectedCategory}</strong></span>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStartFlashcards}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition-all hover:scale-[1.02] shadow-lg shadow-black/20"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>Fleshkarta</span>
            </button>

            <button
              onClick={onStartQuiz}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Testni boshlash</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mode Specific Controls */}
      {selectionMode === 'single' ? (
        /* Single Mode: Category Chips (All + each category name) as specified in Page 5.1 */
        availableCategories.length > 1 && (
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Guruhni tanlang:
              </span>
              <button
                onClick={onOpenUnitSearch}
                className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Shu tanlovdan qidirish</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {['All', ...availableCategories.filter((c) => c !== 'All')].map((catName) => {
                const isActive = selectedCategory === catName;
                return (
                  <button
                    key={catName}
                    onClick={() => onSelectCategory(catName)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold shadow-md shadow-cyan-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    {catName === 'All' ? "Barchasi (All)" : catName}
                  </button>
                );
              })}
            </div>
          </div>
        )
      ) : (
        /* Multi Mode: List of selected sections (Unit — Guruh — So'zlar soni) as specified in Page 6 & 7 */
        <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-cyan-400" />
              <span>Tanlangan bo'limlar tarkibi:</span>
            </span>

            <button
              onClick={onOpenUnitSearch}
              className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Shu tanlovdan qidirish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {selectedSectionsSummary.map((sec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs text-cyan-400 font-medium truncate">
                    {sec.unitTitle}
                  </p>
                  <p className="text-sm font-semibold text-white truncate">
                    {sec.categoryName}
                  </p>
                </div>
                <span className="px-2 py-1 rounded-lg bg-white/5 text-slate-300 font-mono text-xs font-bold shrink-0">
                  {sec.wordCount} ta
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Words List Preview Accordion */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base">
              Lug'at ro'yxati
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
              {activeWords.length} ta so'z
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ro'yxatdan tezkor izlash..."
                value={previewFilter}
                onChange={(e) => setPreviewFilter(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              onClick={() => setShowWordsList(!showWordsList)}
              className="text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors shrink-0"
            >
              {showWordsList ? "Yashirish" : "Ko'rsatish"}
            </button>
          </div>
        </div>

        {showWordsList && (
          <div className="divide-y divide-white/5 max-h-[480px] overflow-y-auto">
            {filteredWords.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                So'z topilmadi.
              </div>
            ) : (
              filteredWords.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 sm:px-5 flex items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => playPronunciation(item.en)}
                      className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors shrink-0"
                      title="Talaffuz qilish"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm sm:text-base">
                          {item.en}
                        </span>
                        {item.category && item.category !== 'All' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium truncate max-w-[140px]">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                        {item.uz}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 shrink-0">
                    #{idx + 1}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
