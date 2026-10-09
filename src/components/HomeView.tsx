import React from 'react';
import { Book, HistoryRecord } from '../types/vocab';
import { BookOpen, History, Library, ArrowRight, Award, Flame, CheckCircle, Search, Layers, Shuffle } from 'lucide-react';

interface HomeViewProps {
  books: Book[];
  history: HistoryRecord[];
  onSelectBook: (book: Book) => void;
  onGoToHistory: () => void;
  onGoToBooks: () => void;
  onQuickSearch: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  books,
  history,
  onSelectBook,
  onGoToHistory,
  onGoToBooks,
  onQuickSearch,
}) => {
  const destinationBook = books.find((b) => b.id === 'destination-b1') || books[0];

  // Calculate statistics from history
  const totalTests = history.length;
  const avgScore = totalTests > 0
    ? Math.round(history.reduce((sum, h) => sum + h.percentage, 0) / totalTests)
    : 0;
  const lastRecord = history[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900/60 p-6 sm:p-10 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
            <Flame className="w-3.5 h-3.5 text-cyan-400" />
            <span>Destination B1 Lug'at Platformasi</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Ingliz tili lug'atlarini{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
              samarali o'rganing
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Har bir unit bo'yicha so'zlar, iborali fe'llar (phrasal verbs) va predlogli birikmalar.
            Fleshkartalar, xatoni darhol qaytaruvchi aqlli testlar va moslashuvchan bo'limlar tanlash rejimi.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectBook(destinationBook)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Destination B1 ni boshlash</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={onQuickSearch}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium text-sm transition-all hover:scale-[1.02]"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Lug'atdan qidirish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Action Cards: "Kitob tanlash" & "Tarix" (As specified in Doc Section 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Kitob tanlash */}
        <div
          onClick={onGoToBooks}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.08] p-6 sm:p-8 backdrop-blur-md transition-all hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
              <Library className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              {books.length} ta darslik
            </span>
          </div>

          <div className="mt-5 space-y-2">
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
              Kitob tanlash
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-400" />
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Darsliklar ro'yxatini ko'rish. Destination B1 (14 ta to'liq unit) yoki 4000 Essential English Words to'plamlari bilan mashq qiling.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Oddiy yoki aralash bo'lim tanlash</span>
            </div>
            <span className="font-semibold text-cyan-400 group-hover:underline">Boshlash &rarr;</span>
          </div>
        </div>

        {/* Card 2: Tarix */}
        <div
          onClick={onGoToHistory}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.08] p-6 sm:p-8 backdrop-blur-md transition-all hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/10"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {totalTests} ta test natijasi
            </span>
          </div>

          <div className="mt-5 space-y-2">
            <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
              Natijalar tarixi
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-400" />
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              O'tgan barcha testlaringiz, xatolar soni va to'g'ri topish foizlarini kuzatib boring.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            {lastRecord ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-300">Oxirgi:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${
                  lastRecord.percentage >= 80
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : lastRecord.percentage >= 50
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {lastRecord.percentage}%
                </span>
                <span className="truncate max-w-[120px]">{lastRecord.unitTitle}</span>
              </div>
            ) : (
              <span>Hozircha testlar yo'q</span>
            )}
            <span className="font-semibold text-purple-400 group-hover:underline">Ko'rish &rarr;</span>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-white text-sm">Oddiy va ko'p-tanlov rejimlari</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Istalgan bitta unitni yoki har xil unitlardan istalgan bo'limlarni (Topic, Phrasal verbs, Prepositions) bitta umumiy to'plamga jamlang.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300">
            <Shuffle className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-white text-sm">Aqlli xato qaytarish (Re-queue)</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Testda adashgan so'zingiz 2–4 savoldan keyin yana qaytib keladi va to'g'ri topmaguningizcha mashq davom etadi.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
            <Search className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-white text-sm">Tezkor ikki ko'lamli qidiruv</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Butun kitob bo'ylab yoki faqat tanlangan bo'limlar ichida inglizcha va o'zbekcha so'zlarni lahzada qidiring.
          </p>
        </div>
      </div>
    </div>
  );
};
