import React, { useState } from 'react';
import { Book, Unit } from '../types/vocab';
import { getUnitWords, unitCategoryList } from '../utils/vocabHelpers';
import {
  Search,
  ListChecks,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  MinusSquare,
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface UnitListViewProps {
  book: Book;
  onOpenSingleUnit: (unitIndex: number) => void;
  onConfirmMultiSelect: (selectedKeys: string[]) => void;
  onOpenBookSearch: () => void;
  onBackToBooks: () => void;
}

export const UnitListView: React.FC<UnitListViewProps> = ({
  book,
  onOpenSingleUnit,
  onConfirmMultiSelect,
  onOpenBookSearch,
  onBackToBooks,
}) => {
  // Mode toggle: normal (single) or multi-select (Bo'limlarni tanlash)
  const [multiSelectMode, setMultiSelectMode] = useState<boolean>(false);
  const [expandedUnits, setExpandedUnits] = useState<Record<number, boolean>>({});
  // Selected keys format: "${unitIndex}::${categoryName}"
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Toggle unit expansion in accordion
  const toggleExpand = (unitIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedUnits((prev) => ({
      ...prev,
      [unitIndex]: !prev[unitIndex],
    }));
  };

  // Helper to get all categories for a unit
  const getCategories = (unit: Unit): string[] => {
    return unitCategoryList(unit);
  };

  // Determine tri-state checkbox state for a unit: 'none' | 'partial' | 'full'
  const getUnitCheckState = (unitIndex: number, unit: Unit): 'none' | 'partial' | 'full' => {
    const cats = getCategories(unit);
    if (cats.length === 0) return 'none';

    let count = 0;
    for (const cat of cats) {
      const key = `${unitIndex}::${cat}`;
      if (selectedKeys.includes(key)) {
        count++;
      }
    }

    if (count === 0) return 'none';
    if (count === cats.length) return 'full';
    return 'partial';
  };

  // Toggle whole unit (all categories inside it)
  const toggleUnitAll = (unitIndex: number, unit: Unit, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentState = getUnitCheckState(unitIndex, unit);
    const cats = getCategories(unit);
    const unitKeys = cats.map((cat) => `${unitIndex}::${cat}`);

    if (currentState === 'full') {
      // Unselect all
      setSelectedKeys((prev) => prev.filter((k) => !unitKeys.includes(k)));
    } else {
      // Select all
      setSelectedKeys((prev) => {
        const withoutCurrent = prev.filter((k) => !unitKeys.includes(k));
        return [...withoutCurrent, ...unitKeys];
      });
    }
  };

  // Toggle single category key: "${unitIndex}::${catName}"
  const toggleCategoryKey = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Select all sections across all units
  const handleSelectAll = () => {
    const allKeys: string[] = [];
    book.units.forEach((unit, uIdx) => {
      const cats = getCategories(unit);
      cats.forEach((cat) => {
        allKeys.push(`${uIdx}::${cat}`);
      });
    });
    setSelectedKeys(allKeys);
  };

  // Clear selections
  const handleClearSelections = () => {
    setSelectedKeys([]);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{book.title}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Unitlar ro'yxati
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {multiSelectMode
              ? "Turli unitlardan xohlagan bo'limlarni belgilang va aralashtirib mashq qiling"
              : "Shug'ullanish uchun unitni tanlang yoki 'Bo'limlarni tanlash' rejimini yoqing"}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={onOpenBookSearch}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs sm:text-sm font-medium transition-all"
            title="Kitob bo'yicha so'z qidirish"
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span>Qidirish</span>
          </button>

          <button
            onClick={() => {
              setMultiSelectMode(!multiSelectMode);
              if (!multiSelectMode && selectedKeys.length === 0) {
                // Keep selections intact or start fresh
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              multiSelectMode
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-white/10 hover:bg-white/15 border border-white/15 text-white'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>{multiSelectMode ? "Oddiy rejimga o'tish" : "Bo'limlarni tanlash"}</span>
          </button>
        </div>
      </div>

      {/* Multi-select helper bar when active */}
      {multiSelectMode && (
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-cyan-200 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              Tanlangan bo'limlar: <strong>{selectedKeys.length} ta</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-medium transition-colors"
            >
              Hammasini belgilash
            </button>
            {selectedKeys.length > 0 && (
              <button
                onClick={handleClearSelections}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-medium transition-colors"
              >
                Tozalash
              </button>
            )}
          </div>
        </div>
      )}

      {/* Units List */}
      <div className="space-y-3">
        {book.units.map((unit, uIdx) => {
          const unitWords = getUnitWords(unit);
          const categories = getCategories(unit);
          const hasCategories = Boolean(unit.categories && unit.categories.length > 0);
          const checkState = getUnitCheckState(uIdx, unit);
          const isExpanded = !!expandedUnits[uIdx];

          // Count selected categories in this unit
          const selectedInUnit = categories.filter((cat) =>
            selectedKeys.includes(`${uIdx}::${cat}`)
          ).length;

          return (
            <div
              key={unit.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                multiSelectMode && checkState !== 'none'
                  ? 'border-cyan-500/40 bg-cyan-950/20 shadow-md shadow-cyan-950/20'
                  : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
              }`}
            >
              {/* Unit Header Row */}
              <div
                onClick={() => {
                  if (multiSelectMode) {
                    // Toggle expand in multi select mode
                    setExpandedUnits((prev) => ({ ...prev, [uIdx]: !prev[uIdx] }));
                  } else {
                    onOpenSingleUnit(uIdx);
                  }
                }}
                className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Multi-select checkbox on the left */}
                  {multiSelectMode && (
                    <button
                      type="button"
                      onClick={(e) => toggleUnitAll(uIdx, unit, e)}
                      aria-label="Unitni to'liq belgilash"
                      className="p-1 -m-1 rounded-lg text-cyan-400 hover:text-cyan-300 focus:outline-none transition-colors"
                    >
                      {checkState === 'full' && (
                        <CheckSquare className="w-5 h-5 text-cyan-400" />
                      )}
                      {checkState === 'partial' && (
                        <MinusSquare className="w-5 h-5 text-cyan-400" />
                      )}
                      {checkState === 'none' && (
                        <Square className="w-5 h-5 text-slate-500 hover:text-slate-400" />
                      )}
                    </button>
                  )}

                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                      <span className="truncate">{unit.title}</span>
                      {multiSelectMode && selectedInUnit > 0 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {selectedInUnit}/{categories.length}
                        </span>
                      )}
                    </h3>

                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{unitWords.length} ta so'z</span>
                      {hasCategories && (
                        <>
                          <span>•</span>
                          <span className="text-slate-300">
                            {categories.length} ta bo'lim
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {multiSelectMode ? (
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(uIdx, e)}
                      aria-label="Bo'limlarni ochish yoki yopish"
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-all">
                      <span>Ochish</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Collapsible Category List (When expanded or in multi-select) */}
              {multiSelectMode && isExpanded && (
                <div className="border-t border-white/10 bg-slate-950/40 p-3 sm:p-4 space-y-2">
                  <p className="text-xs font-medium text-slate-400 px-2 mb-1">
                    Ushbu unit ichidagi bo'limlar:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {categories.map((catName) => {
                      const key = `${uIdx}::${catName}`;
                      const isCatSelected = selectedKeys.includes(key);

                      // Count words in this category
                      let catWordCount = 0;
                      if (unit.categories) {
                        const foundCat = unit.categories.find((c) => c.name === catName);
                        catWordCount = foundCat ? foundCat.words.length : 0;
                      } else {
                        catWordCount = unitWords.length;
                      }

                      return (
                        <div
                          key={catName}
                          onClick={(e) => toggleCategoryKey(key, e)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                            isCatSelected
                              ? 'border-cyan-500/50 bg-cyan-500/15 text-white'
                              : 'border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isCatSelected ? (
                              <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500 shrink-0" />
                            )}
                            <span className="text-xs sm:text-sm font-medium truncate">
                              {catName}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400 ml-2 shrink-0">
                            {catWordCount} so'z
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Bar in Multi-Select Mode (Specified in Section 5.2 & Page 6) */}
      {multiSelectMode && selectedKeys.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center animate-in slide-in-from-bottom-5">
          <div className="max-w-xl w-full bg-slate-900/95 border border-cyan-500/40 p-3 sm:p-4 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 pl-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                {selectedKeys.length}
              </div>
              <div className="text-xs sm:text-sm">
                <span className="text-white font-semibold">
                  {selectedKeys.length} ta bo'lim tanlandi
                </span>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Umumiy to'plam tayyor
                </p>
              </div>
            </div>

            <button
              onClick={() => onConfirmMultiSelect(selectedKeys)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
            >
              <span>Davom etish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
