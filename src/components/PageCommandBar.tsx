import React from 'react';
import { Sparkles, Rocket, Wind, Car, Camera, LayoutList, Layers, ChevronRight, Activity } from 'lucide-react';
import { PageId, PageDefinition } from '../types';
import { PAGES_CONFIG } from '../data/pagesData';

interface PageCommandBarProps {
  activePage: PageId;
  onSelectPage: (pageId: PageId) => void;
  viewMode: 'paged' | 'scroll';
  onToggleViewMode: () => void;
}

export const PageCommandBar: React.FC<PageCommandBarProps> = ({
  activePage,
  onSelectPage,
  viewMode,
  onToggleViewMode,
}) => {
  const currentIndex = PAGES_CONFIG.findIndex((p) => p.id === activePage);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentPageConfig = PAGES_CONFIG[activeIndex] || PAGES_CONFIG[0];

  const getIcon = (iconName: PageDefinition['iconName'], className: string) => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'rocket':
        return <Rocket className={className} />;
      case 'wind':
        return <Wind className={className} />;
      case 'car':
        return <Car className={className} />;
      case 'camera':
        return <Camera className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <div className="sticky top-20 z-30 w-full bg-[#050d20]/95 backdrop-blur-2xl border-b border-blue-900/60 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        
        {/* Main Command Bar Container */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Left Side: Mission Telemetry & Active Status Display */}
          <div className="flex items-center justify-between lg:justify-start gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-2 ring-blue-400/50" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-300">
                  Mission Control
                </span>
                <span className="hidden sm:inline text-blue-700">/</span>
                <span className="text-xs font-semibold text-slate-200 truncate font-mono">
                  Stage {currentPageConfig.numberStr}: {currentPageConfig.shortLabel}
                </span>
              </div>
            </div>

            {/* Quick Micro Progress */}
            <div className="flex items-center gap-2 font-mono tabular-nums text-[11px] text-slate-400">
              <span className="text-red-300 font-bold">{currentPageConfig.numberStr}</span>
              <span className="text-blue-700">/</span>
              <span>05</span>
            </div>
          </div>

          {/* Top Right Side: Command Buttons + Arrangement Controls */}
          <div className="flex items-center justify-end flex-wrap gap-2 sm:gap-2.5 ml-auto w-full lg:w-auto">
            
            <nav 
              aria-label="Ordered Mission Chapters" 
              className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 bg-[#040a18] p-1 rounded-2xl border border-blue-900/60 shadow-inner"
            >
              {PAGES_CONFIG.map((page, idx) => {
                const isActive = activePage === page.id;
                const isPast = idx < activeIndex;

                return (
                  <button
                    key={page.id}
                    onClick={() => onSelectPage(page.id)}
                    className={`group relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/35 via-blue-700/25 to-red-600/25 text-white border border-blue-400/70 shadow-md shadow-blue-900/30'
                        : isPast
                        ? 'bg-[#08142b] hover:bg-blue-900/30 text-slate-200 border border-blue-900/60 hover:border-blue-600/60'
                        : 'bg-[#040a18] hover:bg-[#08142b] text-slate-400 hover:text-slate-200 border border-blue-900/40 hover:border-blue-700/60'
                    }`}
                    title={`${page.name} (Key ${idx + 1})`}
                  >
                    {/* Number Badge */}
                    <span
                      className={`font-mono tabular-nums text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-sm font-black'
                          : isPast
                          ? 'bg-[#040a18] text-blue-300 border border-blue-500/30'
                          : 'bg-[#08142b] text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {page.numberStr}
                    </span>

                    {/* Icon */}
                    <span className={isActive ? 'text-red-300' : isPast ? 'text-blue-300' : 'text-slate-400 group-hover:text-slate-300'}>
                      {getIcon(page.iconName, 'w-3.5 h-3.5')}
                    </span>

                    {/* Label */}
                    <span className="font-semibold tracking-wide whitespace-nowrap">
                      {page.shortLabel}
                    </span>

                    {/* Active indicator dot */}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 hidden md:inline-block" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onToggleViewMode}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-900/60 hover:border-blue-500/60 bg-[#08142b] text-slate-200 hover:text-white transition-all text-xs cursor-pointer shadow-sm"
                title="Toggle between arranged Page-by-Page layout or Continuous Scroll"
              >
                {viewMode === 'paged' ? (
                  <>
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-medium text-blue-300 whitespace-nowrap">Paged View</span>
                  </>
                ) : (
                  <>
                    <LayoutList className="w-3.5 h-3.5 text-red-400" />
                    <span className="font-medium whitespace-nowrap">Continuous</span>
                  </>
                )}
              </button>

              <span className="hidden xl:inline text-[11px] text-slate-400 font-mono ml-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[#08142b] border border-blue-800 text-slate-300">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-[#08142b] border border-blue-800 text-slate-300">5</kbd>
              </span>
            </div>

          </div>
        </div>

        {/* Current Active Page Command Bar Info */}
        {viewMode === 'paged' && (
          <div className="mt-2 pt-2 border-t border-blue-900/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-mono text-blue-300 font-bold uppercase tracking-wider text-[11px] shrink-0">
                {currentPageConfig.commandTitle}
              </span>
              <span className="text-blue-700 hidden sm:inline">·</span>
              <span className="text-slate-400 text-[11px] truncate hidden sm:inline">
                {currentPageConfig.commandDesc}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 shrink-0 font-mono text-[11px] text-slate-400">
              <span className="text-slate-400">Primary Command:</span>
              <span className="text-red-300 font-semibold">{currentPageConfig.primaryActionLabel}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
