import React, { useState, useMemo } from 'react';
import { 
  Maximize2, 
  Edit3, 
  Search, 
  Filter, 
  Plus, 
  RotateCcw, 
  Sparkles, 
  Copy, 
  Check, 
  Camera, 
  ChevronRight,
  ArrowRight,
  RotateCw
} from 'lucide-react';
import { GalleryImageData, GalleryFilter, PageId } from '../types';

interface GallerySectionProps {
  gallery: GalleryImageData[];
  onOpenLightbox: (index: number) => void;
  onEditCaption: (item: GalleryImageData) => void;
  onAddNewPhoto: () => void;
  onResetGallery: () => void;
  onSelectPage?: (page: PageId) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  gallery,
  onOpenLightbox,
  onEditCaption,
  onAddNewPhoto,
  onResetGallery,
  onSelectPage,
}) => {
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCaptionId, setCopiedCaptionId] = useState<string | null>(null);

  // Filter & Search logic
  const filteredGallery = useMemo(() => {
    return gallery.filter((item) => {
      const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.caption.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.year.includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [gallery, activeFilter, searchQuery]);

  const handleCopyCaption = (e: React.MouseEvent, item: GalleryImageData) => {
    e.stopPropagation();
    const fullText = `"${item.caption}" — ${item.title} (${item.year})`;
    navigator.clipboard.writeText(fullText);
    setCopiedCaptionId(item.id);
    setTimeout(() => {
      setCopiedCaptionId(null);
    }, 2000);
  };

  const getCategoryLabel = (cat: GalleryImageData['category']) => {
    switch (cat) {
      case 'portraits':
        return 'Portraits';
      case 'honors':
        return 'Honors & Gala';
      case 'spacex':
        return 'SpaceX';
      case 'tesla':
        return 'Tesla';
      default:
        return 'Executive';
    }
  };

  return (
    <section id="gallery" className="py-16 md:py-24 bg-[#061024] relative border-t border-blue-900/60 overflow-hidden">
      {/* Subtle American Blue & Red atmospheric glow */}
      <div className="absolute top-16 left-0 w-96 h-96 bg-blue-600/12 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-16 right-0 w-96 h-96 bg-red-600/10 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Headline with Gallery Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-blue-300 font-semibold font-mono">
              <span className="w-5 h-[2px] bg-gradient-to-r from-blue-500 to-red-500" />
              <span>Official Curated Archive · Custom Editorial Captions</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Photo <span className="us-text-gradient">Gallery</span> & Captions
            </h2>
            <p className="text-slate-300 text-base leading-relaxed font-light">
              Ordered photographic chronicle documenting key milestone moments: from the DOGE address and the Breakthrough Prize to Starbase orbital rocket milestones and executive portraits.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0">
            <button
              onClick={onAddNewPhoto}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-700/25 cursor-pointer font-mono whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Photo</span>
            </button>
            <button
              onClick={onResetGallery}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-blue-800/70 bg-[#08142b] text-slate-300 hover:text-white hover:border-blue-500/60 text-xs font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Reset captions back to initial factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-300" />
              <span>Reset Captions</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-blue-900/60">
          
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-[#040a18] rounded-xl border border-blue-900/60 overflow-x-auto max-w-full font-mono text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All Records ({gallery.length})
            </button>
            <button
              onClick={() => setActiveFilter('portraits')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeFilter === 'portraits'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Portraits
            </button>
            <button
              onClick={() => setActiveFilter('honors')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeFilter === 'honors'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Honors & Gala
            </button>
            <button
              onClick={() => setActiveFilter('spacex')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeFilter === 'spacex'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              SpaceX
            </button>
            <button
              onClick={() => setActiveFilter('tesla')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeFilter === 'tesla'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Tesla
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px] md:max-w-xs">
            <Search className="w-4 h-4 text-blue-300/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search captures by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 transition-colors font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-red-300 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer font-mono"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredGallery.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#08142b] border border-blue-900/60">
            <p className="text-slate-300 text-sm mb-4 font-light">
              No photos match your current filter or search criteria.
            </p>
            <button
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-red-600 text-white hover:brightness-110 cursor-pointer font-mono"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item, idx) => {
              const originalIndex = gallery.findIndex((g) => g.id === item.id);
              const isCopied = copiedCaptionId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#08142b] border border-blue-900/60 hover:border-blue-400/70 overflow-hidden flex flex-col group transition-all duration-300 shadow-xl"
                >
                  {/* Photo Container */}
                  <div
                    onClick={() => onOpenLightbox(originalIndex)}
                    className="relative aspect-[4/3] bg-[#040a18] overflow-hidden cursor-pointer"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040a18]/85 via-transparent to-blue-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="px-3.5 py-1.5 rounded-lg bg-[#040a18]/90 backdrop-blur-md border border-blue-400/40 text-xs font-semibold text-white flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform font-mono">
                        <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Inspect Fullscreen</span>
                      </div>
                    </div>

                    {/* Sequential Archive Identifier */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#040a18]/90 text-red-300 border border-blue-800/70 text-[10px] font-mono font-bold tracking-wider uppercase tabular-nums">
                      RECORD #0{idx + 1}
                    </div>
                  </div>

                  {/* Content & Custom Caption Area */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Zero-Pill Monospace Coordinates */}
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                        <span className="text-blue-300 font-medium">{getCategoryLabel(item.category)}</span>
                        <span aria-hidden="true" className="text-blue-800">·</span>
                        <span>{item.year}</span>
                        <span aria-hidden="true" className="text-blue-800">·</span>
                        <span className="truncate">{item.location}</span>
                      </div>

                      {/* Title & Subtitle */}
                      <div>
                        <h3 className="font-display text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                          {item.title}
                        </h3>
                        {item.subtitle && (
                          <div className="text-xs text-red-400 font-medium pt-0.5">
                            {item.subtitle}
                          </div>
                        )}
                      </div>

                      {/* Custom Caption Box */}
                      <div className="p-3.5 rounded-xl bg-[#040a18]/90 border border-blue-900/50 space-y-1 relative">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between font-mono">
                          <span>Custom Caption</span>
                          <span className="text-blue-300 font-mono text-[10px]">Editable</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-light italic">
                          &ldquo;{item.caption}&rdquo;
                        </p>
                      </div>

                      {/* Context */}
                      {item.context && (
                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 font-light">
                          {item.context}
                        </p>
                      )}
                    </div>

                    {/* Card Action Controls */}
                    <div className="pt-3 border-t border-blue-900/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onEditCaption(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-200 hover:text-white hover:bg-blue-600 border border-blue-500/40 transition-all cursor-pointer font-mono whitespace-nowrap shrink-0"
                        title="Edit caption, title, or metadata"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Caption</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleCopyCaption(e, item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-[#0b1b3a] transition-colors cursor-pointer"
                          title="Copy Caption Text"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => onOpenLightbox(originalIndex)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#0b1b3a] transition-colors cursor-pointer"
                          title="View Lightbox"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cycle Back to Chapter 01 Navigation Strip */}
        <div className="mt-12 p-6 rounded-2xl bg-[#08142b] border border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
              Completed Mission Sequence (Chapters 01 through 06)
            </div>
            <div className="text-xs text-slate-300 font-light">
              Return to Chapter 01 Executive Brief or explore additional VIP reservation passes.
            </div>
          </div>

          <button
            onClick={() => {
              if (onSelectPage) onSelectPage('executive');
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-700/25 flex items-center justify-center gap-2 cursor-pointer font-mono whitespace-nowrap shrink-0"
          >
            <RotateCw className="w-4 h-4 text-white" />
            <span>Return to 01 · Executive Brief</span>
          </button>
        </div>

      </div>
    </section>
  );
};
