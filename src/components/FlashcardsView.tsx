import React, { useState, useEffect, useCallback } from 'react';
import { WordItem } from '../types/vocab';
import { playPronunciation, shuffle } from '../utils/vocabHelpers';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  Shuffle,
  Sparkles,
  Layers,
  ArrowLeft,
  Eye,
} from 'lucide-react';

interface FlashcardsViewProps {
  words: WordItem[];
  title: string;
  onBack: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ words, title, onBack }) => {
  const [deck, setDeck] = useState<WordItem[]>(() => [...words]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Reset when words prop changes
  useEffect(() => {
    setDeck([...words]);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [words]);

  const currentWord = deck[currentIndex] || deck[0];

  const handleNext = useCallback(() => {
    if (currentIndex < deck.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, deck.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleShuffle = () => {
    setDeck(shuffle([...deck]));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  if (!currentWord || deck.length === 0) {
    return (
      <div className="text-center p-12 text-slate-300">
        <p>So'zlar ro'yxati bo'sh.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-white/10 rounded-xl text-white hover:bg-white/20"
        >
          Orqaga qaytish
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Menyuga qaytish</span>
        </button>

        <div className="text-center">
          <h3 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
            {title}
          </h3>
          <p className="text-[11px] text-cyan-400 font-medium">
            Fleshkarta rejimi
          </p>
        </div>

        <button
          onClick={handleShuffle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all"
          title="Kartalarni aralashtirish"
        >
          <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Aralashtirish</span>
        </button>
      </div>

      {/* Progress Bar & Counter */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>Karta {currentIndex + 1} / {deck.length}</span>
          <span className="font-semibold text-cyan-400">{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Flashcard Card (Interactive Flip) */}
      <div
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label="Fleshkartani ag'darish"
        className="relative cursor-pointer select-none min-h-[340px] sm:min-h-[380px] rounded-3xl border border-white/15 bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-purple-950/70 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-black/40 flex flex-col justify-between transition-all hover:border-cyan-500/40 hover:shadow-cyan-500/10 group focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
      >
        {/* Card Header tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">
              {currentWord.category || 'Vocabulary'}
            </span>
            {currentWord.unitTitle && (
              <span className="text-[11px] text-slate-400 hidden sm:inline truncate max-w-[150px]">
                {currentWord.unitTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playPronunciation(currentWord.en);
              }}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-cyan-300 hover:text-white transition-all shadow-md group-hover:scale-105"
              title="Talaffuz qilish"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Body - Front (English) or Back (Uzbek) */}
        <div className="my-auto py-8 text-center space-y-4">
          {!isFlipped ? (
            /* Front Face */
            <div className="space-y-3 animate-in fade-in duration-200">
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-widest">
                Inglizcha so'z
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-snug">
                {currentWord.en}
              </h2>
              <p className="text-xs text-cyan-300/80 pt-2 flex items-center justify-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>Tarjimasini ko'rish uchun kartani bosing</span>
              </p>
            </div>
          ) : (
            /* Back Face */
            <div className="space-y-3 animate-in fade-in duration-200">
              <span className="text-xs uppercase font-semibold text-emerald-400 tracking-widest">
                O'zbekcha tarjimasi
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
                {currentWord.uz}
              </h2>
              <div className="pt-2 text-xs text-slate-400">
                Asl so'z: <strong className="text-cyan-300 font-medium">{currentWord.en}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer prompt */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Maslahat:</span>
            <span>Space tugmasi ag'daradi</span>
          </div>
          <span className="text-cyan-400 font-semibold group-hover:underline">
            {isFlipped ? "Old yuziga o'tish &rarr;" : "Orqa yuzini ko'rish &rarr;"}
          </span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all ${
            currentIndex === 0
              ? 'opacity-40 cursor-not-allowed bg-white/5 text-slate-500'
              : 'bg-white/10 hover:bg-white/15 text-white active:scale-95'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Oldingi</span>
        </button>

        <button
          onClick={handleFlip}
          className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-xs sm:text-sm transition-all hover:scale-105 active:scale-95"
        >
          Ag'darish
        </button>

        {currentIndex === deck.length - 1 ? (
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Boshidan</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 active:scale-95"
          >
            <span>Keyingi</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="hidden sm:flex items-center justify-center gap-6 pt-3 text-[11px] text-slate-500">
        <span>Oldingi: <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">←</kbd></span>
        <span>Ag'darish: <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">Space</kbd></span>
        <span>Keyingi: <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">→</kbd></span>
      </div>
    </div>
  );
};
