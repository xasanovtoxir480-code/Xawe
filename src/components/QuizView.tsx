import React, { useState, useEffect } from 'react';
import { WordItem, Question, HistoryRecord, SelectionMode } from '../types/vocab';
import {
  buildQuestion,
  playPronunciation,
  saveHistoryRecord,
  shuffle,
} from '../utils/vocabHelpers';
import {
  Volume2,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  X,
} from 'lucide-react';

interface QuizResultPayload {
  totalWords: number;
  mistakeWordsCount: number;
  percentage: number;
  mistakes: Record<string, number>;
  mistakeItems: { word: WordItem; count: number }[];
}

interface QuizViewProps {
  words: WordItem[];
  allBookWords: WordItem[];
  title: string;
  bookTitle: string;
  selectionMode: SelectionMode;
  selectedCategoryName: string;
  unitsHaveCategories: boolean;
  onFinish: (result: QuizResultPayload) => void;
  onAbort: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  words,
  allBookWords,
  title,
  bookTitle,
  selectionMode,
  selectedCategoryName,
  unitsHaveCategories,
  onFinish,
  onAbort,
}) => {
  // Queue of remaining word items to test
  const [queue, setQueue] = useState<WordItem[]>(() => shuffle([...words]));
  // Initial total word count
  const [totalCount] = useState<number>(words.length);
  // Count of distinct words successfully completed
  const [completedCount, setCompletedCount] = useState<number>(0);
  // Track mistakes: { [word.en]: countOfMistakes }
  const [mistakes, setMistakes] = useState<Record<string, number>>({});
  // Current active question
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  // User selected option for the current question
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  // Whether question is locked during answer feedback
  const [isAnswerLocked, setIsAnswerLocked] = useState<boolean>(false);
  // Show abort confirmation
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Initialize or generate next question when queue changes and no question active
  useEffect(() => {
    if (queue.length === 0 && !currentQuestion) {
      // Quiz completed!
      handleCompleteQuiz();
      return;
    }

    if (!currentQuestion && queue.length > 0) {
      const nextWord = queue[0];
      const q = buildQuestion(nextWord, words, allBookWords);
      setCurrentQuestion(q);
      setSelectedAnswer(null);
      setIsAnswerLocked(false);
    }
  }, [queue, currentQuestion]);

  const handleSelectOption = (option: string) => {
    if (isAnswerLocked || !currentQuestion) return;

    setSelectedAnswer(option);
    setIsAnswerLocked(true);

    const activeWord = currentQuestion.word;
    const isCorrect = option === currentQuestion.correctOption;

    if (isCorrect) {
      // Correct answer!
      setTimeout(() => {
        // Remove current word from head of queue
        setQueue((prev) => prev.slice(1));
        setCompletedCount((prev) => prev + 1);
        setCurrentQuestion(null);
        setSelectedAnswer(null);
        setIsAnswerLocked(false);
      }, 700);
    } else {
      // Wrong answer!
      // 1. Increment mistakes count for this word
      setMistakes((prev) => ({
        ...prev,
        [activeWord.en]: (prev[activeWord.en] || 0) + 1,
      }));

      // 2. Re-queue logic as specified in Doc Section 6:
      // "So'z navbatga 2–4 savoldan keyin tasodifiy joyga qayta qo'yiladi (Math.floor(Math.random()*3)+2 pozitsiyasiga insert)"
      setTimeout(() => {
        setQueue((prev) => {
          const rest = prev.slice(1);
          // Insert offset between 2 and 4
          const insertOffset = Math.floor(Math.random() * 3) + 2;
          const targetIndex = Math.min(insertOffset, rest.length);

          const newQueue = [...rest];
          newQueue.splice(targetIndex, 0, activeWord);
          return newQueue;
        });

        setCurrentQuestion(null);
        setSelectedAnswer(null);
        setIsAnswerLocked(false);
      }, 1000);
    }
  };

  const handleCompleteQuiz = async () => {
    // Unique mistaken words count
    const distinctMistakeKeys = Object.keys(mistakes);
    const mistakeWordsCount = distinctMistakeKeys.length;

    // Accuracy percentage based on first attempt success:
    // Foiz = (jami so'z − xato qilingan so'zlar soni) / jami so'z × 100
    const rawPercentage =
      totalCount > 0
        ? Math.round(((totalCount - mistakeWordsCount) / totalCount) * 100)
        : 100;
    const percentage = Math.max(0, Math.min(100, rawPercentage));

    // Save record to history as specified in Doc Section 7
    const historyCategory =
      selectionMode === 'multi'
        ? 'Aralash'
        : unitsHaveCategories
        ? selectedCategoryName
        : '—';

    const newRecord: HistoryRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: new Date().toISOString(),
      bookTitle,
      unitTitle: title,
      category: historyCategory,
      totalWords: totalCount,
      mistakeWords: mistakeWordsCount,
      percentage,
    };

    await saveHistoryRecord(newRecord);

    // Build mistake items list
    const mistakeItems = distinctMistakeKeys.map((enWord) => {
      const original = words.find((w) => w.en === enWord) || {
        en: enWord,
        uz: '',
        category: '',
      };
      return {
        word: original,
        count: mistakes[enWord],
      };
    });

    onFinish({
      totalWords: totalCount,
      mistakeWordsCount,
      percentage,
      mistakes,
      mistakeItems,
    });
  };

  if (!currentQuestion) {
    return (
      <div className="text-center p-12 text-slate-400">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p>Savol tayyorlanmoqda...</p>
      </div>
    );
  }

  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isSelectedCorrect =
    selectedAnswer !== null && selectedAnswer === currentQuestion.correctOption;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Testdan chiqish</span>
        </button>

        <div className="text-center">
          <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] block">
            {title}
          </span>
          <span className="text-[11px] text-cyan-400 font-semibold">
            {completedCount} / {totalCount} so'z yakunlandi
          </span>
        </div>

        {/* Mistakes counter badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs">
          <span className="text-slate-400">Xatolar:</span>
          <span
            className={`font-mono font-bold ${
              Object.keys(mistakes).length > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {Object.keys(mistakes).length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>O'rganilgan so'zlar</span>
          <span className="font-semibold text-cyan-400">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-purple-950/70 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-black/40 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-semibold text-cyan-400 tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/20">
            Inglizcha so'z
          </span>
          <button
            type="button"
            onClick={() => playPronunciation(currentQuestion.word.en)}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-cyan-300 hover:text-white transition-all shadow-md hover:scale-105"
            title="Talaffuz qilish"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center py-4 space-y-2">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {currentQuestion.word.en}
          </h2>
          {currentQuestion.word.category && currentQuestion.word.category !== 'All' && (
            <p className="text-xs text-slate-400">
              Bo'lim: {currentQuestion.word.category}
            </p>
          )}
        </div>

        {/* Options Grid */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-semibold text-slate-400 text-center uppercase tracking-wider">
            To'g'ri o'zbekcha tarjimani tanlang:
          </p>

          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOpt = option === currentQuestion.correctOption;

              let btnStyle =
                'border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.09] hover:border-white/20';

              if (selectedAnswer !== null) {
                if (isCorrectOpt) {
                  btnStyle =
                    'border-emerald-500/80 bg-emerald-500/25 text-emerald-200 shadow-lg shadow-emerald-500/20';
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle =
                    'border-rose-500/80 bg-rose-500/25 text-rose-200 shadow-lg shadow-rose-500/20 animate-shake';
                } else {
                  btnStyle = 'opacity-40 border-white/5 bg-white/[0.02] text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswerLocked}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full p-4 rounded-2xl border text-left font-medium text-sm sm:text-base flex items-center justify-between gap-3 transition-all cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-slate-400 shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="truncate">{option}</span>
                  </div>

                  {selectedAnswer !== null && (
                    <div className="shrink-0">
                      {isCorrectOpt && (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      )}
                      {isSelected && !isCorrectOpt && (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Requeue Notification when mistake made */}
      {selectedAnswer !== null && !isSelectedCorrect && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="font-semibold">Noto'g'ri javob qayd etildi.</p>
            <p className="text-amber-300/80 text-xs mt-0.5">
              Ushbu so'z mustahkamlash uchun 2–4 savoldan keyin yana qaytib keladi!
            </p>
          </div>
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h4 className="text-lg font-bold text-white">Testni to'xtatmoqchimisiz?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Agar hozir chiqsangiz, test natijasi to'liq saqlanmaydi. Boshlangan testni davom ettirish tavsiya etiladi.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
              >
                Davom ettirish
              </button>
              <button
                onClick={onAbort}
                className="px-4 py-2 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Chiqish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
