import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ViewMode,
  SelectionMode,
  SearchScope,
  Book,
  Unit,
  WordItem,
  HistoryRecord,
} from './types/vocab';
import { BOOKS } from './data/booksData';
import {
  getUnitWords,
  unitCategoryList,
  getCategoryWords,
  shortUnitLabel,
  getAllBookWords,
  loadHistoryRecords,
} from './utils/vocabHelpers';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { BookListView } from './components/BookListView';
import { UnitListView } from './components/UnitListView';
import { CategoryMenuView } from './components/CategoryMenuView';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { ResultsView } from './components/ResultsView';
import { HistoryView } from './components/HistoryView';
import { SearchView } from './components/SearchView';

interface QuizResultState {
  totalWords: number;
  mistakeWordsCount: number;
  percentage: number;
  mistakes: Record<string, number>;
  mistakeItems: { word: WordItem; count: number }[];
}

export function App() {
  // Navigation & View state machine
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [previousView, setPreviousView] = useState<ViewMode>('home');

  // Selected Book
  const [selectedBook, setSelectedBook] = useState<Book>(() => BOOKS[0]);

  // Selection mode: 'single' | 'multi'
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('single');

  // Single mode state
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number>(0);
  const [selectedCat, setSelectedCat] = useState<string>('All');

  // Multi-select mode state: keys format "${unitIndex}::${categoryName}"
  const [multiSelectedKeys, setMultiSelectedKeys] = useState<string[]>([]);

  // Search scope state: 'book' | 'unit'
  const [searchScope, setSearchScope] = useState<SearchScope>('book');

  // History state
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // Quiz results state
  const [quizResult, setQuizResult] = useState<QuizResultState | null>(null);

  // Active quiz custom words (e.g. when practicing mistakes only)
  const [customQuizWords, setCustomQuizWords] = useState<WordItem[] | null>(null);

  // Load history on mount (Section 7: O'qish: komponent mount bo'lganda window.storage.get)
  const refreshHistory = useCallback(async () => {
    const records = await loadHistoryRecords();
    setHistory(records);
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  // Current unit object in single mode
  const currentUnit: Unit | undefined = selectedBook.units[selectedUnitIndex] || selectedBook.units[0];

  // All words across all units of current selected book
  const allBookWords = useMemo(() => {
    return getAllBookWords(selectedBook);
  }, [selectedBook]);

  // Words for current unit in single mode
  const singleUnitAllWords = useMemo(() => {
    if (!currentUnit) return [];
    return getUnitWords(currentUnit);
  }, [currentUnit]);

  // Active words for single mode (filtered by selected category)
  const singleActiveWords = useMemo(() => {
    if (!currentUnit) return [];
    if (selectedCat === 'All') {
      return singleUnitAllWords;
    }
    return singleUnitAllWords.filter((w) => w.category === selectedCat);
  }, [currentUnit, selectedCat, singleUnitAllWords]);

  // Available categories for current unit
  const currentUnitCategories = useMemo(() => {
    if (!currentUnit) return ['All'];
    return unitCategoryList(currentUnit);
  }, [currentUnit]);

  // Multi-select collected words & summaries
  const { multiPoolWords, multiSectionsSummary } = useMemo(() => {
    const words: WordItem[] = [];
    const summaries: {
      unitIndex: number;
      unitTitle: string;
      categoryName: string;
      wordCount: number;
    }[] = [];

    for (const key of multiSelectedKeys) {
      const [uIdxStr, catName] = key.split('::');
      const uIdx = parseInt(uIdxStr, 10);
      const unit = selectedBook.units[uIdx];
      if (unit && catName) {
        const catWords = getCategoryWords(unit, catName);
        words.push(...catWords);
        summaries.push({
          unitIndex: uIdx,
          unitTitle: unit.title,
          categoryName: catName,
          wordCount: catWords.length,
        });
      }
    }

    return {
      multiPoolWords: words,
      multiSectionsSummary: summaries,
    };
  }, [multiSelectedKeys, selectedBook]);

  // Unified active title & word pool as specified in Doc Section 5.3:
  // const activePoolWords = selectionMode === "multi" ? multiPoolWords : activeWords;
  // const activeTitle = selectionMode === "multi" ? multiTitle : selectionTitle;
  const multiTitle = `${multiSelectedKeys.length} ta bo'lim tanlandi`;
  const selectionTitle = currentUnit
    ? `${currentUnit.title}${selectedCat !== 'All' ? ` — ${selectedCat}` : ''}`
    : 'Tanlangan unit';

  const activePoolWords = useMemo(() => {
    if (selectionMode === 'multi') {
      return multiPoolWords;
    }
    return singleActiveWords;
  }, [selectionMode, multiPoolWords, singleActiveWords]);

  const activeTitle = useMemo(() => {
    if (selectionMode === 'multi') {
      return multiTitle;
    }
    return selectionTitle;
  }, [selectionMode, multiTitle, selectionTitle]);

  // Navigation handlers
  const navigateTo = (view: ViewMode) => {
    setPreviousView(currentView);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setSelectedUnitIndex(0);
    setSelectedCat('All');
    setMultiSelectedKeys([]);
    navigateTo('unitList');
  };

  const handleOpenSingleUnit = (unitIndex: number) => {
    setSelectionMode('single');
    setSelectedUnitIndex(unitIndex);
    setSelectedCat('All');
    navigateTo('categoryMenu');
  };

  const handleConfirmMultiSelect = (selectedKeys: string[]) => {
    setSelectionMode('multi');
    setMultiSelectedKeys(selectedKeys);
    navigateTo('categoryMenu');
  };

  const handleStartFlashcards = () => {
    navigateTo('flashcards');
  };

  const handleStartQuiz = (customWords?: WordItem[]) => {
    if (customWords) {
      setCustomQuizWords(customWords);
    } else {
      setCustomQuizWords(null);
    }
    navigateTo('quiz');
  };

  const handleQuizFinish = (result: QuizResultState) => {
    setQuizResult(result);
    refreshHistory();
    navigateTo('results');
  };

  const handleOpenBookSearch = () => {
    setSearchScope('book');
    navigateTo('search');
  };

  const handleOpenUnitSearch = () => {
    setSearchScope('unit');
    navigateTo('search');
  };

  // Back Navigation logic
  const handleBack = () => {
    switch (currentView) {
      case 'bookList':
        navigateTo('home');
        break;
      case 'unitList':
        navigateTo('bookList');
        break;
      case 'categoryMenu':
        navigateTo('unitList');
        break;
      case 'flashcards':
      case 'quiz':
        navigateTo('categoryMenu');
        break;
      case 'results':
        navigateTo('categoryMenu');
        break;
      case 'history':
        navigateTo('home');
        break;
      case 'search':
        if (previousView && previousView !== 'search') {
          navigateTo(previousView);
        } else {
          navigateTo('unitList');
        }
        break;
      default:
        navigateTo('home');
        break;
    }
  };

  const canGoBack = currentView !== 'home';

  // Words that quiz will actually run on
  const quizWords = customQuizWords || activePoolWords;

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onBack={handleBack}
        canGoBack={canGoBack}
        activeBookTitle={selectedBook?.title}
        onOpenSearch={handleOpenBookSearch}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentView === 'home' && (
          <HomeView
            books={BOOKS}
            history={history}
            onSelectBook={handleSelectBook}
            onGoToHistory={() => navigateTo('history')}
            onGoToBooks={() => navigateTo('bookList')}
            onQuickSearch={handleOpenBookSearch}
          />
        )}

        {currentView === 'bookList' && (
          <BookListView books={BOOKS} onSelectBook={handleSelectBook} />
        )}

        {currentView === 'unitList' && (
          <UnitListView
            book={selectedBook}
            onOpenSingleUnit={handleOpenSingleUnit}
            onConfirmMultiSelect={handleConfirmMultiSelect}
            onOpenBookSearch={handleOpenBookSearch}
            onBackToBooks={() => navigateTo('bookList')}
          />
        )}

        {currentView === 'categoryMenu' && (
          <CategoryMenuView
            selectionMode={selectionMode}
            activeTitle={activeTitle}
            activeWords={activePoolWords}
            availableCategories={currentUnitCategories}
            selectedCategory={selectedCat}
            onSelectCategory={(cat) => setSelectedCat(cat)}
            selectedSectionsSummary={multiSectionsSummary}
            onStartFlashcards={handleStartFlashcards}
            onStartQuiz={() => handleStartQuiz()}
            onOpenUnitSearch={handleOpenUnitSearch}
            onBackToUnitList={() => navigateTo('unitList')}
          />
        )}

        {currentView === 'flashcards' && (
          <FlashcardsView
            words={activePoolWords}
            title={activeTitle}
            onBack={() => navigateTo('categoryMenu')}
          />
        )}

        {currentView === 'quiz' && (
          <QuizView
            words={quizWords}
            allBookWords={allBookWords}
            title={activeTitle}
            bookTitle={selectedBook.title}
            selectionMode={selectionMode}
            selectedCategoryName={selectedCat}
            unitsHaveCategories={Boolean(currentUnit?.categories?.length)}
            onFinish={handleQuizFinish}
            onAbort={() => navigateTo('categoryMenu')}
          />
        )}

        {currentView === 'results' && quizResult && (
          <ResultsView
            totalWords={quizResult.totalWords}
            mistakeWordsCount={quizResult.mistakeWordsCount}
            percentage={quizResult.percentage}
            mistakeItems={quizResult.mistakeItems}
            title={activeTitle}
            onRetestAll={() => handleStartQuiz()}
            onRetestMistakes={
              quizResult.mistakeItems.length > 0
                ? () => handleStartQuiz(quizResult.mistakeItems.map((m) => m.word))
                : undefined
            }
            onGoToFlashcards={handleStartFlashcards}
            onBackToMenu={() => navigateTo('categoryMenu')}
          />
        )}

        {currentView === 'history' && (
          <HistoryView
            history={history}
            onRefreshHistory={refreshHistory}
            onGoToBooks={() => navigateTo('bookList')}
          />
        )}

        {currentView === 'search' && (
          <SearchView
            initialScope={searchScope}
            bookTitle={selectedBook.title}
            activeSelectionTitle={activeTitle}
            allBookWords={allBookWords}
            activePoolWords={activePoolWords}
            onBack={handleBack}
          />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Ingliz tili lug'at o'rganish ilovasi — Destination B1 & 4000 Essential English Words
          </p>
          <p className="text-slate-600">
            Fleshkarta • Aqlli Test • Bo'limlar miksi • Lug'at qidiruvi
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
