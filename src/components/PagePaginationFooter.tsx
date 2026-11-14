import React from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Award, Wind, Car, Camera, Sparkles, TrendingUp } from 'lucide-react';
import { PageId } from '../types';
import { PAGES_CONFIG } from '../data/pagesData';

interface PagePaginationFooterProps {
  activePage: PageId;
  onSelectPage: (pageId: PageId) => void;
  onPrimaryAction: (pageId: PageId) => void;
}

export const PagePaginationFooter: React.FC<PagePaginationFooterProps> = ({
  activePage,
  onSelectPage,
  onPrimaryAction,
}) => {
  const currentIndex = PAGES_CONFIG.findIndex((p) => p.id === activePage);
  const currentPage = PAGES_CONFIG[currentIndex] || PAGES_CONFIG[0];

  const prevPage = currentIndex > 0 ? PAGES_CONFIG[currentIndex - 1] : null;
  const nextPage = currentIndex < PAGES_CONFIG.length - 1 ? PAGES_CONFIG[currentIndex + 1] : null;

  const handleNext = () => {
    if (nextPage) {
      onSelectPage(nextPage.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Loop back to start
      onSelectPage(PAGES_CONFIG[0].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (prevPage) {
      onSelectPage(prevPage.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getActionIcon = (id: PageId) => {
    switch (id) {
      case 'executive':
        return <Award className="w-4 h-4 text-blue-300" />;
      case 'enterprises':
        return <Sparkles className="w-4 h-4 text-blue-300" />;
      case 'flying-roadster':
        return <Wind className="w-4 h-4 text-red-400" />;
      case 'showroom':
        return <Car className="w-4 h-4 text-blue-300" />;
      case 'shares':
        return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'gallery':
        return <Camera className="w-4 h-4 text-blue-300" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-300" />;
    }
  };

  return (
    <div className="w-full bg-[#050c1d] border-t border-b border-blue-900/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Main Command Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#08142b]/95 border border-blue-500/35 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Previous Page Command */}
          <div className="w-full md:w-auto flex items-center justify-start">
            {prevPage ? (
              <button
                onClick={handlePrev}
                className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-blue-800/70 hover:border-blue-500/70 bg-[#0b1b3a] hover:bg-[#10254f] text-slate-200 hover:text-white text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer group whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-blue-400 group-hover:-translate-x-1 transition-transform" />
                <div className="text-left">
                  <div className="text-[10px] text-blue-300 uppercase tracking-wider font-mono">Previous Chapter</div>
                  <div className="font-semibold text-white">{prevPage.shortLabel}</div>
                </div>
              </button>
            ) : (
              <div className="hidden md:block w-40 text-xs text-slate-500 font-mono">
                Start of Dossier
              </div>
            )}
          </div>

          {/* Center Page Selector & Dedicated Action Command */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-center">
            {/* Quick page jump command buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#040a18] border border-blue-900/60">
              {PAGES_CONFIG.map((page, idx) => {
                const isActive = page.id === activePage;
                return (
                  <button
                    key={page.id}
                    onClick={() => {
                      onSelectPage(page.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer tabular-nums ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-600 to-red-600 text-white shadow-md shadow-blue-600/25'
                        : 'text-slate-400 hover:text-white hover:bg-[#0d1d3d]'
                    }`}
                    title={`Jump to Page ${page.numberStr}: ${page.name}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Dedicated Page Action Command Button */}
            <button
              onClick={() => onPrimaryAction(activePage)}
              className="px-4 py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/35 text-blue-100 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm whitespace-nowrap shrink-0"
            >
              {getActionIcon(activePage)}
              <span>{currentPage.primaryActionLabel}</span>
            </button>
          </div>

          {/* Next Page Command */}
          <div className="w-full md:w-auto flex items-center justify-end">
            <button
              onClick={handleNext}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md shadow-blue-600/25 hover:brightness-110 active:scale-95 group border border-white/15 whitespace-nowrap shrink-0"
            >
              <div className="text-right">
                <div className="text-[10px] text-blue-100/90 uppercase tracking-wider font-mono">
                  {nextPage ? 'Next Chapter' : 'Cycle to Start'}
                </div>
                <div className="font-bold text-white">
                  {nextPage ? nextPage.shortLabel : '01 · Executive Brief'}
                </div>
              </div>
              {nextPage ? (
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              ) : (
                <RotateCcw className="w-4 h-4 text-white group-hover:rotate-180 transition-transform" />
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
