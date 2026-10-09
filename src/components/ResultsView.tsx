import React from 'react';
import { WordItem } from '../types/vocab';
import { playPronunciation } from '../utils/vocabHelpers';
import {
  Award,
  CheckCircle,
  XCircle,
  RotateCcw,
  Volume2,
  Layers,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface MistakeItem {
  word: WordItem;
  count: number;
}

interface ResultsViewProps {
  totalWords: number;
  mistakeWordsCount: number;
  percentage: number;
  mistakeItems: MistakeItem[];
  title: string;
  onRetestAll: () => void;
  onRetestMistakes?: () => void;
  onGoToFlashcards: () => void;
  onBackToMenu: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  totalWords,
  mistakeWordsCount,
  percentage,
  mistakeItems,
  title,
  onRetestAll,
  onRetestMistakes,
  onGoToFlashcards,
  onBackToMenu,
}) => {
  const isHigh = percentage >= 80;
  const isMedium = percentage >= 50 && percentage < 80;
  const isLow = percentage < 50;

  const badgeColorClass = isHigh
    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/15'
    : isMedium
    ? 'text-amber-400 border-amber-500/30 bg-amber-500/15'
    : 'text-rose-400 border-rose-500/30 bg-rose-500/15';

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Score Summary Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-purple-950/70 p-6 sm:p-10 backdrop-blur-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          <span>Test natijasi</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Barcha savollar to'liq tugatildi va natija tarixga saqlandi
          </p>
        </div>

        {/* Big percentage ring / badge */}
        <div className="py-2 flex flex-col items-center justify-center">
          <div
            className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl transition-all ${badgeColorClass}`}
          >
            <span className="text-4xl sm:text-5xl font-black tracking-tight">
              {percentage}%
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase mt-1">
              Aniqlik
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
            <span className="text-xs text-slate-400">Jami so'zlar:</span>
            <p className="text-2xl font-bold text-white font-mono">{totalWords}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
            <span className="text-xs text-slate-400">Xato qilingan so'zlar:</span>
            <p
              className={`text-2xl font-bold font-mono ${
                mistakeWordsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {mistakeWordsCount}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onRetestAll}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Qaytadan topshirish</span>
          </button>

          {mistakeWordsCount > 0 && onRetestMistakes && (
            <button
              onClick={onRetestMistakes}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-semibold text-xs sm:text-sm transition-all hover:scale-[1.02]"
            >
              <span>Faqat xatolardan test ({mistakeWordsCount})</span>
            </button>
          )}

          <button
            onClick={onGoToFlashcards}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs sm:text-sm transition-all hover:scale-[1.02]"
          >
            <span>Fleshkarta qilish</span>
          </button>
        </div>

        <div>
          <button
            onClick={onBackToMenu}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            &larr; Tanlov menyusiga qaytish
          </button>
        </div>
      </div>

      {/* Mistake Items Breakdown */}
      {mistakeItems.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-white text-base">
                Xato qilingan so'zlar ro'yxati
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {mistakeItems.length} ta so'zda adashdingiz
            </span>
          </div>

          <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
            {mistakeItems.map((item, idx) => (
              <div
                key={idx}
                className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-white/[0.02] rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => playPronunciation(item.word.en)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 shrink-0"
                    title="Talaffuz"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm truncate">
                      {item.word.en}
                    </p>
                    <p className="text-xs text-slate-300 truncate mt-0.5">
                      {item.word.uz}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30">
                    {item.count} marta xato
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
