import React, { useState } from 'react';
import { HistoryRecord } from '../types/vocab';
import { clearAllHistory } from '../utils/vocabHelpers';
import {
  History,
  Trash2,
  Calendar,
  Layers,
  BookOpen,
  Award,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface HistoryViewProps {
  history: HistoryRecord[];
  onRefreshHistory: () => void;
  onGoToBooks: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onRefreshHistory,
  onGoToBooks,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const handleClear = async () => {
    await clearAllHistory();
    setShowClearConfirm(false);
    onRefreshHistory();
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('uz-UZ', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Natijalar kundaligi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Testlar tarixi
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Topshirilgan barcha testlar, xatolar statistikasi va o'zlashtirish foizlari
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs sm:text-sm font-semibold transition-all self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Tarixni tozalash</span>
          </button>
        )}
      </div>

      {/* History List or Empty state */}
      {history.length === 0 ? (
        <div className="p-12 rounded-3xl border border-white/10 bg-white/[0.03] text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Tarix hali bo'sh</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Birorta ham test topshirilmadi. Istalgan unit yoki bo'limni tanlab test topshiring va natijalarni bu yerda kuzating.
          </p>
          <button
            onClick={onGoToBooks}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform"
          >
            <span>Kitob tanlash</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => {
            // Color according to spec: >=80% green, >=50% yellow, <50% red
            const isGreen = record.percentage >= 80;
            const isYellow = record.percentage >= 50 && record.percentage < 80;
            const isRed = record.percentage < 50;

            const badgeColor = isGreen
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : isYellow
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/30';

            return (
              <div
                key={record.id}
                className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {record.bookTitle}
                    </span>
                    <span className="text-slate-500 text-xs">•</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                      Guruh: {record.category}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                    {record.unitTitle}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {formatDate(record.date)}
                    </span>
                    <span>•</span>
                    <span>Jami: <strong className="text-slate-300 font-mono">{record.totalWords}</strong> so'z</span>
                    <span>•</span>
                    <span>Xato: <strong className="text-rose-400 font-mono">{record.mistakeWords}</strong></span>
                  </div>
                </div>

                {/* Score Badge */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div
                    className={`px-4 py-2 rounded-2xl border font-mono font-black text-lg sm:text-xl ${badgeColor}`}
                  >
                    {record.percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Tarixni tozalashni xohlaysizmi?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Barcha o'tgan test natijalari butunlay o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Ha, tozalash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
