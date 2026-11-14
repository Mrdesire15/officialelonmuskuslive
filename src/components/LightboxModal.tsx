import React, { useEffect, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Maximize2, 
  Share2, 
  Download, 
  MapPin, 
  Calendar,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { GalleryImageData } from '../types';

interface LightboxModalProps {
  isOpen: boolean;
  currentIndex: number;
  gallery: GalleryImageData[];
  onClose: () => void;
  onNavigate: (index: number) => void;
  onEditCaption: (item: GalleryImageData) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  currentIndex,
  gallery,
  onClose,
  onNavigate,
  onEditCaption,
}) => {
  const [copied, setCopied] = React.useState(false);

  const currentItem = gallery[currentIndex];

  const handlePrev = useCallback(() => {
    onNavigate((currentIndex - 1 + gallery.length) % gallery.length);
  }, [currentIndex, gallery.length, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate((currentIndex + 1) % gallery.length);
  }, [currentIndex, gallery.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || !currentItem) return null;

  const handleCopyCaption = () => {
    const text = `"${currentItem.caption}" — ${currentItem.title} (${currentItem.year})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/95 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
      {/* Top Bar Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-white tracking-wider text-sm">
            ELON MUSK ARCHIVE
          </span>
          <span className="text-blue-400">·</span>
          <span className="text-xs font-mono tabular-nums text-red-300 font-medium">
            Photo {currentIndex + 1} of {gallery.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditCaption(currentItem)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-200 bg-[#08142b] border border-blue-500/45 hover:bg-blue-600/20 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit Caption</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#08142b] border border-blue-900/70 text-slate-300 hover:text-white hover:bg-blue-900/50 transition-colors cursor-pointer"
            title="Close Lightbox (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-[#08142b]/85 border border-blue-500/40 text-slate-200 hover:text-white hover:bg-blue-600/30 transition-all cursor-pointer backdrop-blur-md hover:scale-110 active:scale-95"
        title="Previous photo (Left Arrow)"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-[#08142b]/85 border border-blue-500/40 text-slate-200 hover:text-white hover:bg-blue-600/30 transition-all cursor-pointer backdrop-blur-md hover:scale-110 active:scale-95"
        title="Next photo (Right Arrow)"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Lightbox Content Container */}
      <div className="w-full max-w-6xl max-h-[88vh] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-10">
        
        {/* Main Image Display */}
        <div className="lg:col-span-8 flex items-center justify-center max-h-[70vh] lg:max-h-[80vh] overflow-hidden rounded-xl bg-[#040a18]/70 border border-blue-900/50 relative group">
          <img
            src={currentItem.image}
            alt={currentItem.title}
            className="max-h-[68vh] lg:max-h-[78vh] w-auto max-w-full object-contain rounded-lg shadow-2xl transition-all"
          />
        </div>

        {/* Caption & Metadata Panel */}
        <div className="lg:col-span-4 rounded-2xl bg-[#061024]/95 border border-blue-500/40 p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Metadata info */}
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <span className="text-red-300 uppercase tracking-wider font-mono">{currentItem.category}</span>
            <span aria-hidden="true" className="text-blue-400">·</span>
            <span className="font-mono tabular-nums text-blue-300">{currentItem.year}</span>
          </div>

          {/* Title */}
          <div>
            <h2 className="font-display text-2xl font-bold text-white leading-snug">
              {currentItem.title}
            </h2>
            {currentItem.subtitle && (
              <p className="text-xs text-blue-300 font-medium pt-1">
                {currentItem.subtitle}
              </p>
            )}
          </div>

          {/* Prominent Custom Caption */}
          <div className="p-4 rounded-xl bg-[#08142b] border border-blue-500/35 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-300">
                Curated Caption
              </span>
              <button
                onClick={handleCopyCaption}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Copy caption"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-sm italic text-slate-100 font-light leading-relaxed">
              &ldquo;{currentItem.caption}&rdquo;
            </p>
          </div>

          {/* Context and Narrative Story */}
          {currentItem.context && (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-200">
                Background & Historical Context
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                {currentItem.context}
              </p>
            </div>
          )}

          {/* Location and Date details */}
          <div className="pt-3 border-t border-blue-900/60 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>{currentItem.location}</span>
            </div>
            {currentItem.dateStr && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-mono tabular-nums">{currentItem.dateStr}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              onClick={() => onEditCaption(currentItem)}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white font-semibold text-xs hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer shadow-md shadow-blue-500/20"
            >
              Edit This Caption
            </button>
            <a
              href={currentItem.image}
              download={`${currentItem.id}.jpg`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-lg border border-blue-800/80 bg-[#08142b] text-slate-200 hover:text-white hover:border-blue-400/70 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Open full image in new tab"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
