import React from 'react';
import { Book } from '../types/vocab';
import { getUnitWords } from '../utils/vocabHelpers';
import { BookOpen, ChevronRight, Layers, Sparkles } from 'lucide-react';

interface BookListViewProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
}

export const BookListView: React.FC<BookListViewProps> = ({ books, onSelectBook }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Mavjud darsliklar</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          O'rganish uchun kitob tanlang
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Quyidagi kitoblardan birini tanlang va uning unitlari bo'yicha mashqlarni boshlang.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {books.map((book) => {
          // Count words in this book
          const totalWords = book.units.reduce((acc, u) => acc + getUnitWords(u).length, 0);

          return (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="group cursor-pointer relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.08] p-6 sm:p-7 backdrop-blur-md transition-all hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  {book.level && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {book.level}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                    {book.description || "Ingliz tili darsligi bo'yicha so'zlar to'plami."}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    {book.units.length} ta unit
                  </span>
                  <span>•</span>
                  <span className="text-cyan-300 font-medium">
                    {totalWords} ta so'z
                  </span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Unitlarni ko'rish</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
