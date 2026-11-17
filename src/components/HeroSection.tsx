import React, { useState } from 'react';
import { 
  Quote, 
  ArrowRight, 
  RefreshCw, 
  Award, 
  ShieldCheck, 
  Crown,
  HeartHandshake,
  Gift,
  Maximize2
} from 'lucide-react';
import { ProfileData, PageId, GalleryImageData } from '../types';
import { FAMOUS_QUOTES } from '../data/initialData';
import { VipTier } from './RsvpModal';
import { handleImageFallback, normalizePhotoSrc } from '../utils/photoHelper';

interface HeroSectionProps {
  profile: ProfileData;
  gallery?: GalleryImageData[];
  onOpenGallery: () => void;
  onOpenLightbox?: (index: number) => void;
  onOpenRsvp: (tier?: VipTier) => void;
  onSelectPage?: (page: PageId) => void;
  referralCode?: string;
  commissionPercent?: number;
  referralEarnedUsd?: number;
  onOpenReferralModal?: () => void;
  onOpenCharity?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  gallery = [],
  onOpenGallery,
  onOpenLightbox,
  onOpenRsvp,
  onSelectPage,
  onOpenCharity,
}) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const cycleQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % FAMOUS_QUOTES.length);
  };

  const activeQuote = FAMOUS_QUOTES[currentQuoteIndex] || profile.quote;

  return (
    <section id="meet" className="relative pt-10 pb-20 md:pt-14 md:pb-28 overflow-hidden bg-[#040a18]">
      {/* Section Background: Main Page Executive Background Photo with Measured Contrast Scrim */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img
          src={normalizePhotoSrc('/assets/aistudio/elonxxx0_5bf1f316.jpg')}
          alt="Elon Musk main page background"
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => handleImageFallback(e)}
          className="w-full h-full object-cover object-top sm:object-[center_12%] opacity-60 sm:opacity-65 brightness-95 contrast-105"
        />
        {/* Measured navy directional scrims preserving 4.5:1+ text contrast while keeping background photo clearly visible on phones and desktops */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#040a18]/85 via-[#040a18]/50 to-[#040a18]/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040a18]/50 via-transparent to-[#040a18]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(37,99,235,0.14),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_65%,rgba(220,38,38,0.10),transparent_60%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start pt-2">
          
          {/* Left Column: Visionary Introduction */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-blue-300 font-semibold font-mono">
                  <span className="w-6 h-[2px] bg-gradient-to-r from-blue-500 to-red-500" />
                  <span>Technoking · Chief Engineer · Multi-Planetary Architect</span>
                </div>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] text-balance">
                Meet the <span className="us-text-gradient">Visionary</span> Behind the Future
              </h1>

              <p className="text-lg text-slate-200 font-light leading-relaxed pt-1">
                {profile.name} — entrepreneur, engineer, and the world&apos;s foremost pioneer across sustainable mobility, deep space colonization, and neural synthesis.
              </p>
            </div>

            {/* Quick Metrics Bar with Zero-Pill Monospace Layout */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-blue-800/60">
              <div className="space-y-0.5">
                <div className="text-xs text-slate-400 font-medium">Net Worth Valuation</div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-blue-300 font-mono tabular-nums">
                  {profile.netWorth}
                </div>
                <div className="text-[11px] text-slate-400">Projected 1st Trillionaire</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-xs text-slate-400 font-medium">Frontier Enterprises</div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-white font-mono tabular-nums">
                  06
                </div>
                <div className="text-[11px] text-slate-400">Space, Auto, AI, Telecom</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-xs text-slate-400 font-medium">Orbital Recoveries</div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-red-400 font-mono tabular-nums">
                  340+
                </div>
                <div className="text-[11px] text-slate-400">Falcon 9 & Heavy Landings</div>
              </div>
            </div>

            {/* Interactive Quote Cycler */}
            <div className="p-4 rounded-xl bg-[#08142b]/85 border border-blue-500/35 relative group hover:border-red-500/45 transition-all">
              <div className="flex items-start gap-3">
                <Quote className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <p className="text-sm italic text-slate-100 font-light leading-relaxed">
                    &ldquo;{activeQuote}&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-blue-300 font-medium tracking-wide">
                      — {profile.name} · Engineering Principle
                    </span>
                    <button
                      onClick={cycleQuote}
                      className="text-xs text-slate-300 hover:text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Next quote"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Next Principle</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Christmas Special Fan Card Offer Banner ($5,000 down to $1,000) */}
            <div
              onClick={() => onOpenRsvp('christmas-fan-card')}
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/90 via-[#1b0b1a]/95 to-blue-950/90 border border-amber-400/65 hover:border-amber-300 transition-all cursor-pointer group shadow-xl shadow-red-900/25"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1 text-amber-300">
                      <Gift className="w-3.5 h-3.5 text-red-400" />
                      <span>CHRISTMAS SPECIAL OFFER</span>
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-red-300">LIMITED EDITION FAN CARD</span>
                  </div>

                  <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-amber-200 transition-colors">
                    Fan Card to Meet Elon Musk — Limited Edition
                  </h3>
                  <p className="text-xs text-slate-200 font-light leading-relaxed">
                    Holiday collector metal Fan Card pass with Starbase &amp; Giga Texas Greet &amp; Meet clearance. Reduced from $5,000 down to $1,000 for Christmas.
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-red-800/50">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                      Save $4,000 · 80% Off
                    </div>
                    <div className="flex items-baseline gap-2 font-mono tabular-nums">
                      <span className="text-sm text-slate-400 line-through">$5,000</span>
                      <span className="text-2xl sm:text-3xl font-display font-black text-white">$1,000</span>
                    </div>
                  </div>

                  <span className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold text-xs font-mono whitespace-nowrap shadow-md group-hover:brightness-110 transition-all">
                    Claim Fan Card →
                  </span>
                </div>
              </div>
            </div>

            {/* Official VIP Greet & Meet Pass Tier Preview Cards */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-red-400" />
                  <span>VIP Greet &amp; Meet Experience Passes</span>
                </span>
                <span className="text-slate-400 font-mono text-[11px]">Limited Capacity Tiers</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Silver */}
                <div 
                  onClick={() => onOpenRsvp('silver')}
                  className="p-3.5 rounded-xl bg-[#08142b]/80 border border-blue-800/60 hover:border-blue-400/70 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-blue-200 group-hover:text-white">Silver Pass</span>
                    <span className="font-mono font-bold text-white tabular-nums">$1,000</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    General executive admission, keynote access &amp; commemorative credentials.
                  </p>
                </div>

                {/* Platinum */}
                <div 
                  onClick={() => onOpenRsvp('platinum')}
                  className="p-3.5 rounded-xl bg-[#0a1834]/90 border border-blue-500/45 hover:border-blue-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-blue-200 group-hover:text-white">Platinum Pass</span>
                    <span className="font-mono font-bold text-white tabular-nums">$5,000</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Front-row seating, backstage executive lounge &amp; priority briefing deck.
                  </p>
                </div>

                {/* Gold VIP Pass Plaque */}
                <div 
                  onClick={() => onOpenRsvp('gold')}
                  className="p-3.5 rounded-xl bg-gradient-to-br from-blue-950/85 via-[#0a1733] to-red-950/60 border border-red-500/55 hover:border-red-400 transition-all cursor-pointer group shadow-sm shadow-red-600/15"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white flex items-center gap-1">
                      <Crown className="w-3 h-3 text-red-400" />
                      <span>Gold Founders</span>
                    </span>
                    <span className="font-mono font-bold text-red-300 tabular-nums">$10,000</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug">
                    1-on-1 photo op with Elon Musk &amp; bespoke laser-engraved executive metal plaque.
                  </p>
                </div>
              </div>
            </div>

            {/* Sequence Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => onOpenRsvp('christmas-fan-card')}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white font-semibold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-blue-600/25 border border-white/15 flex items-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4 text-white" />
                <span>Reserve Fan Card &amp; VIP Pass</span>
              </button>

              {onOpenCharity && (
                <button
                  type="button"
                  onClick={onOpenCharity}
                  className="px-4 py-3 rounded-xl border border-rose-500/55 hover:border-rose-400 bg-rose-950/50 hover:bg-rose-900/50 text-rose-100 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 shadow-md"
                >
                  <HeartHandshake className="w-4 h-4 text-rose-300" />
                  <span>Donate to Official Charity NGO</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (onSelectPage) onSelectPage('enterprises');
                  else document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-3 rounded-xl border border-blue-700/60 hover:border-blue-400 bg-[#08142b]/90 text-blue-100 hover:text-white text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next: 02 · Frontier Ventures</span>
                <ArrowRight className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>

          {/* Right Column: Hero Profile Card (Always visible cleanly on phones and desktop) */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative w-full max-w-md">
              
              <div className="rounded-2xl bg-[#071226]/95 border border-blue-500/40 p-4 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                <div className="h-[2px] w-full us-flag-strip mb-4 rounded-full" />

                {/* Header status bar */}
                <div className="flex items-center justify-between pb-3.5 border-b border-blue-900/60 mb-4">
                  <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider font-mono">
                    Official Theme Portrait
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Boca Chica · Austin · D.C.
                  </span>
                </div>

                {/* Portrait Container */}
                <div className="relative aspect-[4/3] min-h-[210px] w-full rounded-xl overflow-hidden mb-4 bg-[#040a18] border border-blue-500/35 group shadow-lg">
                  <img
                    src={normalizePhotoSrc(profile.portrait)}
                    alt={profile.name}
                    loading="eager"
                    decoding="async"
                    onError={(e) => handleImageFallback(e)}
                    className="w-full h-full object-cover object-[center_18%] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040a18]/90 via-[#040a18]/20 to-transparent" />
                  
                  {/* Verified Executive Ribbon */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-[#040a18]/90 backdrop-blur-md border border-blue-500/45 flex items-center gap-1.5 text-[11px] text-blue-200 font-medium shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                    <span>DOGE Leadership Address</span>
                  </div>

                  {/* Mission Overlay Banner */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 p-3 rounded-lg bg-[#040a18]/90 backdrop-blur-md border border-blue-800/70 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-red-400 uppercase tracking-widest font-semibold font-mono">
                        Dept of Government Efficiency
                      </div>
                      <div className="text-xs font-semibold text-white">Radical Industrial Streamlining</div>
                    </div>
                    <span className="text-[10px] font-mono text-blue-300">2024–2026</span>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-bold text-white tracking-wide">
                      {profile.name}
                    </h2>
                    <span className="text-[11px] text-blue-300 font-mono tabular-nums">
                      {profile.bornYear} · Age 53
                    </span>
                  </div>
                  <p className="text-xs text-red-300 font-medium">
                    {profile.role} · Technoking of Tesla
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {profile.headline}
                  </p>
                </div>

                {/* Card Footer action */}
                <div className="mt-5 pt-4 border-t border-blue-900/60 flex items-center justify-end text-xs">
                  <button
                    onClick={() => {
                      if (onSelectPage) onSelectPage('gallery');
                      else onOpenGallery();
                    }}
                    className="font-semibold text-blue-300 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Photo in Archive</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* All-Device Official Photo Highlights Strip (Displays immediately on Phones, Tablets & Desktops) */}
        {gallery.length > 0 && (
          <div className="mt-10 pt-8 border-t border-blue-900/60 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-blue-300 font-semibold">
                  Official Photographic Chronicle · Mobile &amp; Desktop Ready
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                  Featured Archive <span className="us-text-gradient">Photos</span>
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onSelectPage) onSelectPage('gallery');
                  else onOpenGallery();
                }}
                className="px-4 py-2 rounded-xl bg-[#08142b] border border-blue-700/70 hover:border-blue-400 text-xs font-mono font-semibold text-blue-200 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open All {gallery.length} Photos</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {gallery.slice(0, 6).map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (onOpenLightbox) onOpenLightbox(idx);
                    else if (onSelectPage) onSelectPage('gallery');
                    else onOpenGallery();
                  }}
                  className="group text-left rounded-xl bg-[#08142b]/95 border border-blue-900/70 hover:border-blue-400/80 overflow-hidden shadow-md transition-all cursor-pointer flex flex-col"
                >
                  <div className="relative w-full aspect-[4/3] min-h-[104px] bg-[#040a18] overflow-hidden">
                    <img
                      src={normalizePhotoSrc(item.image)}
                      alt={item.title}
                      loading="eager"
                      decoding="async"
                      onError={(e) => handleImageFallback(e)}
                      className="w-full h-full object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040a18]/80 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute top-2 right-2 p-1 rounded-md bg-[#040a18]/85 border border-blue-700/60 text-blue-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="p-2.5 space-y-0.5">
                    <div className="text-[10px] font-mono text-blue-300 truncate">{item.year} · {item.category}</div>
                    <div className="text-xs font-semibold text-white truncate">{item.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
