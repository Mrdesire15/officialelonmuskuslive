import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Rocket, 
  Wind, 
  Car, 
  Camera, 
  ShoppingBag, 
  Award, 
  Sliders, 
  Layers, 
  LayoutList,
  Menu,
  X as CloseIcon,
  ChevronRight,
  Mail,
  Lock,
  ShieldAlert,
  TrendingUp,
  DollarSign,
  Percent
} from 'lucide-react';
import { PageId, PageDefinition } from '../types';
import { PAGES_CONFIG } from '../data/pagesData';

interface NavbarProps {
  onOpenContentStudio: () => void;
  onOpenRsvp: () => void;
  onOpenMyOrders: () => void;
  onPreOrderRoadster: () => void;
  onOpenInbox: () => void;
  inboxUnreadCount: number;
  onOpenAdminPortal: () => void;
  galleryCount: number;
  ordersCount: number;
  isAdmin?: boolean;
  activePage: PageId;
  onSelectPage: (pageId: PageId) => void;
  viewMode: 'paged' | 'scroll';
  onToggleViewMode: () => void;
  onOpenReferralModal?: () => void;
  commissionPercent?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenContentStudio,
  onOpenRsvp,
  onOpenMyOrders,
  onPreOrderRoadster,
  onOpenInbox,
  inboxUnreadCount,
  onOpenAdminPortal,
  galleryCount,
  ordersCount,
  isAdmin = false,
  activePage,
  onSelectPage,
  viewMode,
  onToggleViewMode,
  onOpenReferralModal,
  commissionPercent = 5,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoTapCountRef = useRef(0);
  const logoTapTimerRef = useRef<number | null>(null);

  const getPageIcon = (iconName: PageDefinition['iconName'], className: string) => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'rocket':
        return <Rocket className={className} />;
      case 'wind':
        return <Wind className={className} />;
      case 'car':
        return <Car className={className} />;
      case 'trending-up':
        return <TrendingUp className={className} />;
      case 'dollar-sign':
        return <DollarSign className={className} />;
      case 'camera':
        return <Camera className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  const handleOptionClick = (pageId: PageId) => {
    onSelectPage(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoTap = () => {
    logoTapCountRef.current += 1;

    if (logoTapTimerRef.current !== null) {
      window.clearTimeout(logoTapTimerRef.current);
    }

    if (logoTapCountRef.current >= 4) {
      logoTapCountRef.current = 0;
      logoTapTimerRef.current = null;
      setMobileMenuOpen(false);
      onOpenAdminPortal();
      return;
    }

    logoTapTimerRef.current = window.setTimeout(() => {
      logoTapCountRef.current = 0;
      logoTapTimerRef.current = null;
    }, 2500);

    if (activePage !== 'executive') {
      handleOptionClick('executive');
    } else {
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050d21]/95 backdrop-blur-2xl border-b border-blue-900/60 shadow-2xl transition-all">
      {/* Subtle 2px American Tri-Color Hairline */}
      <div className="h-[2px] w-full us-flag-strip" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Single Consolidated Navigation Bar */}
        <div className="h-20 flex items-center justify-between gap-4">
          
          {/* Left: Brand Identity */}
          <button
            onClick={handleLogoTap}
            className="flex items-center gap-3 group text-left cursor-pointer shrink-0 select-none"
            title="Return to Chapter 01 · Executive Dossier"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-red-600 border border-white/25 flex items-center justify-center text-white font-display font-black text-xl shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform">
              X
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-base tracking-wider text-white group-hover:text-blue-300 transition-colors whitespace-nowrap">
                ELON MUSK
              </span>
              <span className="text-[10px] font-mono tracking-wider text-blue-300/90 whitespace-nowrap">
                Executive Command · USA
              </span>
            </div>
          </button>

          {/* All Navigation Keys Lined Up and Arranged Together */}
          <div className="hidden lg:flex items-center gap-2 ml-auto overflow-x-auto no-scrollbar py-1">
            
            {/* Main Feature Keys Lined Up */}
            <nav 
              aria-label="Features Navigation" 
              className="flex items-center gap-1 p-1 rounded-2xl bg-[#07132c]/95 border border-blue-800/50 shadow-inner shrink-0"
            >
              {PAGES_CONFIG.map((page) => {
                const isActive = activePage === page.id;
                return (
                  <button
                    key={page.id}
                    onClick={() => handleOptionClick(page.id)}
                    className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/40 via-blue-700/30 to-red-600/35 text-white border border-blue-400/70 shadow-md shadow-blue-600/20'
                        : 'text-slate-300 hover:text-white hover:bg-blue-950/70 border border-transparent'
                    }`}
                    title={`${page.name} (${page.numberStr})`}
                  >
                    {/* Number Badge */}
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors tabular-nums ${
                        isActive
                          ? 'bg-red-600 text-white shadow-sm font-black'
                          : 'bg-[#0c1c3d] text-blue-300 group-hover:text-white'
                      }`}
                    >
                      {page.numberStr}
                    </span>

                    {/* Icon */}
                    <span className={isActive ? 'text-blue-200' : 'text-blue-400/80 group-hover:text-blue-300'}>
                      {getPageIcon(page.iconName, 'w-3.5 h-3.5')}
                    </span>

                    {/* Label */}
                    <span className="font-medium tracking-wide">
                      {page.shortLabel}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Action Navigation Keys Lined Up Right Alongside */}
            <div className="flex items-center gap-1.5 shrink-0">
              
              {/* In-App Inbox Key */}
              <button
                onClick={onOpenInbox}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-blue-600/25 border border-blue-500/50 text-blue-100 hover:bg-blue-600/40 hover:text-white transition-all cursor-pointer shadow-sm shadow-blue-500/10 font-sans whitespace-nowrap shrink-0"
                title="Open In-App Messaging Inbox"
              >
                <Mail className="w-3.5 h-3.5 text-blue-300" />
                <span>Inbox</span>
                {inboxUnreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white tabular-nums">
                    {inboxUnreadCount}
                  </span>
                )}
              </button>

              {/* Pre-Order Flying Car Key */}
              <button
                onClick={onPreOrderRoadster}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-[#0a1833] border border-blue-500/40 text-blue-200 hover:bg-blue-600/30 hover:text-white transition-all cursor-pointer shadow-sm font-mono whitespace-nowrap shrink-0"
                title="Pre-Order Tesla Flying Roadster ($10,000+)"
              >
                <Wind className="w-3.5 h-3.5 text-red-400" />
                <span>Pre-Order</span>
              </button>

              {/* VIP Passes Key */}
              <button
                onClick={onOpenRsvp}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-600/25 cursor-pointer border border-white/20 tracking-wide font-sans whitespace-nowrap shrink-0"
                title="Reserve VIP Greet & Meet Experience Pass ($1k Silver, $5k Platinum, $10k Gold)"
              >
                <Award className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                <span>VIP Pass</span>
              </button>

              {/* Referral Earn % Key */}
              {onOpenReferralModal && (
                <button
                  onClick={onOpenReferralModal}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-emerald-500/45 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-white transition-all cursor-pointer shadow-sm font-mono whitespace-nowrap shrink-0 tabular-nums"
                  title={`View your auto-generated referral code and earn ${commissionPercent}% commission`}
                >
                  <Percent className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Earn {commissionPercent}%</span>
                </button>
              )}

              {/* My Orders Key (When orders exist) */}
              {ordersCount > 0 && (
                <button
                  onClick={onOpenMyOrders}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-blue-500/45 bg-blue-600/15 text-blue-200 hover:bg-blue-600/30 transition-all cursor-pointer shadow-sm font-mono whitespace-nowrap shrink-0 tabular-nums"
                  title="View your placed Tesla vehicle orders"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-300" />
                  <span>Orders ({ordersCount})</span>
                </button>
              )}

              {/* View Mode Toggle: Paged vs Continuous */}
              <button
                onClick={onToggleViewMode}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-blue-800/60 hover:border-blue-500/60 bg-[#08152e] text-slate-200 hover:text-white transition-all text-xs cursor-pointer font-mono shadow-sm whitespace-nowrap shrink-0"
                title="Toggle between Arranged Page-by-Page layout or Continuous Scroll"
              >
                {viewMode === 'paged' ? (
                  <>
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-blue-200 font-semibold">Paged</span>
                  </>
                ) : (
                  <>
                    <LayoutList className="w-3.5 h-3.5 text-red-400" />
                    <span>Scroll</span>
                  </>
                )}
              </button>

              {/* Hidden Admin Portal is accessed by tapping the X logo 4 times */}

              {/* Admin Content Studio Key */}
              {isAdmin && (
                <button
                  onClick={onOpenContentStudio}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-blue-700/60 bg-[#08152e] text-blue-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  title="Admin Content Studio"
                >
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  <span>Studio</span>
                </button>
              )}

            </div>

          </div>

          {/* Mobile Compact Actions + Menu Button */}
          <div className="flex lg:hidden items-center gap-2 ml-auto">
            <button
              onClick={onOpenInbox}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold rounded-xl bg-blue-600/25 border border-blue-500/50 text-blue-100 cursor-pointer whitespace-nowrap shrink-0"
              aria-label="Open Inbox"
            >
              <Mail className="w-4 h-4 text-blue-300" />
              {inboxUnreadCount > 0 && (
                <span className="px-1.5 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white tabular-nums">
                  {inboxUnreadCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenRsvp}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-red-600 text-white border border-white/20 cursor-pointer whitespace-nowrap shrink-0"
            >
              VIP Pass
            </button>

            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl bg-[#08152e] border border-blue-800/60 text-white cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

      </div>

      {/* Mobile Drawer (When Mobile Menu is opened) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-blue-900/60 bg-[#050d21]/98 px-4 py-4 space-y-3 backdrop-blur-2xl animate-fadeIn">
          <div className="text-[11px] font-mono uppercase tracking-wider text-blue-300 font-bold mb-2">
            Navigation Chapters
          </div>

          <div className="grid grid-cols-1 gap-2">
            {PAGES_CONFIG.map((page) => {
              const isActive = activePage === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => handleOptionClick(page.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/30 to-red-600/25 border-blue-400/70 text-white'
                      : 'bg-[#08152e] border-blue-900/50 text-slate-300 hover:border-blue-600/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-md font-mono text-xs flex items-center justify-center font-bold ${
                      isActive ? 'bg-red-600 text-white' : 'bg-[#0d1f42] text-blue-300'
                    }`}>
                      {page.numberStr}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">{page.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{page.commandDesc}</div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-500'}`} />
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-2 pt-2 border-t border-blue-900/50">
            <button
              onClick={() => {
                onPreOrderRoadster();
                setMobileMenuOpen(false);
              }}
              className="py-2.5 px-3 rounded-xl bg-blue-600/25 border border-blue-500/40 text-blue-100 text-xs font-bold cursor-pointer"
            >
              Pre-Order Car
            </button>
            {onOpenReferralModal && (
              <button
                onClick={() => {
                  onOpenReferralModal();
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/45 text-emerald-200 text-xs font-bold font-mono tabular-nums cursor-pointer"
              >
                Referral Code & Earn {commissionPercent}%
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
