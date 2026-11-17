import React from 'react';
import { ArrowUp } from 'lucide-react';
import { PageId } from '../types';

interface FooterProps {
  onOpenRsvp: () => void;
  onSelectPage?: (page: PageId) => void;
  onOpenCharity?: () => void;
  onOpenAuthModal?: (initialTab?: 'register' | 'signin') => void;
  isMemberSignedIn?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenRsvp,
  onSelectPage,
  onOpenCharity,
  onOpenAuthModal,
  isMemberSignedIn = false,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 bg-[#040a18] border-t border-blue-900/60 py-14 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-blue-700 to-red-600 border border-white/20 flex items-center justify-center text-white font-display font-black text-sm">
                X
              </div>
              <span className="font-display font-bold text-white tracking-wider text-base">
                ELON MUSK · GREET & MEET
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm text-xs">
              Executive presentation, curated photo archive, and interactive technical specs for the next generation of American spaceflight and automotive engineering.
            </p>
          </div>

          <div className="md:col-span-3 space-y-2">
            <div className="font-semibold text-blue-200 text-xs tracking-wider uppercase">
              Core Architecture
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>Executive Dossier & Quotes</li>
              <li>6 Frontier Tech Ventures</li>
              <li>Tesla Flying Roadster Flight Lab</li>
              <li>TSLA Equity & Dividend Desk</li>
            </ul>

            <div className="pt-3 border-t border-blue-900/50 space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Elon Musk Official Management Table
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                All VIP pass requests, vehicle reservations, charity donations, support appeals, and settlement requests are sent directly to the Elon Musk Official Management Table for approval and account provisioning.
              </div>
            </div>
          </div>

          <div className="md:col-span-4 space-y-3">
            <div className="font-semibold text-blue-200 text-xs tracking-wider uppercase">
              Quick Portals
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onOpenRsvp}
                className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/35 text-red-200 border border-red-500/40 text-xs transition-colors cursor-pointer"
              >
                VIP Passes ($1k–$10k)
              </button>
              {onOpenCharity && (
                <button
                  onClick={onOpenCharity}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 border border-rose-500/45 text-xs transition-colors cursor-pointer"
                >
                  Charity NGO &amp; Relief
                </button>
              )}
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('signin')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/35 text-blue-200 border border-blue-500/45 text-xs transition-colors cursor-pointer"
                >
                  {isMemberSignedIn ? 'Member Account' : 'Member Sign In'}
                </button>
              )}
              <button
                onClick={scrollToTop}
                className="px-3 py-1.5 rounded-lg bg-[#08152e] hover:bg-blue-900/50 text-slate-300 hover:text-white border border-blue-800/60 text-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Back to Top</span>
              </button>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Elon Musk Executive Experience · United States Division.
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                if (onSelectPage) onSelectPage('executive');
                scrollToTop();
              }}
              className="hover:text-blue-300 transition-colors cursor-pointer"
            >
              01 · Visionary
            </button>
            <span>·</span>
            <button
              onClick={() => {
                if (onSelectPage) onSelectPage('enterprises');
                scrollToTop();
              }}
              className="hover:text-blue-300 transition-colors cursor-pointer"
            >
              02 · Ventures
            </button>
            <span>·</span>
            <button
              onClick={() => {
                if (onSelectPage) onSelectPage('flying-roadster');
                scrollToTop();
              }}
              className="hover:text-blue-300 transition-colors cursor-pointer"
            >
              03 · Flying Roadster
            </button>
            <span>·</span>
            <button
              onClick={() => {
                if (onSelectPage) onSelectPage('showroom');
                scrollToTop();
              }}
              className="hover:text-blue-300 transition-colors cursor-pointer"
            >
              04 · Tesla Fleet
            </button>
            <span>·</span>
            <button
              onClick={() => {
                if (onSelectPage) onSelectPage('shares');
                scrollToTop();
              }}
              className="hover:text-red-300 transition-colors cursor-pointer"
            >
              05 · TSLA Shares
            </button>
            <span>·</span>
            <button
              onClick={() => {
                if (onSelectPage) onSelectPage('gallery');
                scrollToTop();
              }}
              className="hover:text-blue-300 transition-colors cursor-pointer"
            >
              06 · Photo Archive
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
