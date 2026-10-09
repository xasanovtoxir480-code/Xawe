import React from 'react';
import { ViewMode } from '../types/vocab';
import { BookOpen, History, Search, Library, Sparkles, ChevronLeft } from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  activeBookTitle?: string;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onBack,
  canGoBack,
  activeBookTitle,
  onOpenSearch,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Back button or Logo */}
        <div className="flex items-center gap-3">
          {canGoBack && onBack ? (
            <button
              onClick={onBack}
              aria-label="Orqaga qaytish"
              className="p-2 -ml-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              <ChevronLeft className="w-5 h-5 text-cyan-400" />
              <span className="hidden sm:inline">Orqaga</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  Lug'at
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    B1
                  </span>
                </span>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Ingliz tili lug'at o'rganish
                </p>
              </div>
            </button>
          )}

          {activeBookTitle && currentView !== 'home' && currentView !== 'bookList' && (
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/10 text-xs text-slate-400">
              <span className="truncate max-w-[200px] text-slate-300 font-medium">{activeBookTitle}</span>
            </div>
          )}
        </div>

        {/* Center / Right: Nav Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                currentView === 'search'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Qidiruv"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Qidirish</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('bookList')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              currentView === 'bookList' || currentView === 'unitList'
                ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Library className="w-4 h-4 text-indigo-400" />
            <span>Kitoblar</span>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              currentView === 'history'
                ? 'bg-purple-500/25 text-purple-200 border border-purple-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>Tarix</span>
          </button>
        </div>
      </div>
    </header>
  );
};
