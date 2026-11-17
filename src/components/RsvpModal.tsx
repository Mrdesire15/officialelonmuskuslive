import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  CheckCircle, 
  ShieldCheck, 
  QrCode, 
  Download, 
  Sparkles, 
  Award, 
  Rocket, 
  Zap, 
  Check, 
  CreditCard,
  Building,
  Image as ImageIcon,
  Mail,
  Gift
} from 'lucide-react';
import { VipPassRequest } from '../types';
import { handleImageFallback, normalizePhotoSrc } from '../utils/photoHelper';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitVipRequest?: (request: VipPassRequest) => void;
  onOpenInbox?: () => void;
  defaultReferralCode?: string;
  commissionPercent?: number;
  defaultName?: string;
  defaultEmail?: string;
  defaultTier?: VipTier;
}

export type VipTier = 'christmas-fan-card' | 'silver' | 'platinum' | 'gold';

interface VipTierInfo {
  id: VipTier;
  name: string;
  shortLabel: string;
  price: number;
  originalPrice?: number;
  badge: string;
  promoTag?: string;
  plaqueClass: string;
  textColor: string;
  description: string;
  perks: string[];
}

const VIP_TIERS: VipTierInfo[] = [
  {
    id: 'christmas-fan-card',
    name: 'Fan Card · Christmas Special Offer (Meet Elon Musk)',
    shortLabel: 'Christmas Fan Card',
    price: 1000,
    originalPrice: 5000,
    badge: 'CHRISTMAS LIMITED EDITION',
    promoTag: 'LIMITED EDITION · $5,000 DOWN TO $1,000',
    plaqueClass: 'plaque-christmas',
    textColor: 'engraved-christmas-text',
    description:
      'Christmas Special Offer Fan Card to Meet Elon Musk — Limited Edition Platinum-tier collector card reduced from $5,000 down to $1,000.',
    perks: [
      'Limited Edition serialized Christmas Fan Card to meet Elon Musk',
      'Holiday Greet & Meet VIP photo opportunity & autograph slot',
      '$5,000 VIP experience markdown down to $1,000 (Save $4,000)',
      'Custom crimson-gold collector Fan Card & velvet presentation sleeve',
      'Priority Starbase & Gigafactory Texas visitor clearance',
    ],
  },
  {
    id: 'silver',
    name: 'Silver Experience Pass',
    shortLabel: 'Silver Plaque',
    price: 1000,
    badge: 'SILVER TIER',
    plaqueClass: 'plaque-silver',
    textColor: 'engraved-silver-text',
    description: 'Executive briefing access with commemorative brushed sterling silver plaque.',
    perks: [
      'Reserved seating at executive keynote',
      'Starbase launch control viewing terrace',
      'Custom engraved Silver metallic pass & certificate',
      'Official photo archive access',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum Experience Pass',
    shortLabel: 'Platinum Plaque',
    price: 5000,
    badge: 'PLATINUM TIER',
    plaqueClass: 'plaque-platinum',
    textColor: 'engraved-silver-text',
    description: 'Priority front-row access with private Q&A session and Giga Texas manufacturing tour.',
    perks: [
      'Front-row seating & executive lounge access',
      'Private 45-minute group Q&A with Elon Musk',
      'Full Starbase rocket production & Gigafactory tour',
      'Heavyweight brushed Platinum plaque delivered in display case',
      'Direct networking with venture executives',
    ],
  },
  {
    id: 'gold',
    name: 'Gold Founders Plaque Pass',
    shortLabel: 'Gold Plaque',
    price: 10000,
    badge: 'GOLD FOUNDERS TIER',
    plaqueClass: 'plaque-gold',
    textColor: 'engraved-gold-text',
    description: 'The pinnacle 1-on-1 private greet & meet experience with Elon Musk and 24K gold-plated plaque.',
    perks: [
      'Private 1-on-1 Greet & Meet session with Elon Musk',
      'Personal photo session with Elon & signed 24K gold plaque',
      'Starbase VIP Launch Tower & Starship Mechazilla platform access',
      'Private executive dinner with Elon & leadership team',
      'Permanent VIP priority on all future rocket launch invitations',
    ],
  },
];

export const RsvpModal: React.FC<RsvpModalProps> = ({
  isOpen,
  onClose,
  onSubmitVipRequest,
  onOpenInbox,
  defaultReferralCode = '',
  commissionPercent = 5,
  defaultName = '',
  defaultEmail = '',
  defaultTier = 'christmas-fan-card',
}) => {
  const [selectedTier, setSelectedTier] = useState<VipTier>(defaultTier);
  const [submitted, setSubmitted] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState('executive-briefing');
  const [preferredDate, setPreferredDate] = useState('2026-12-20');
  const [referralCodeInput, setReferralCodeInput] = useState(defaultReferralCode);
  const [ticketId, setTicketId] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSelectedTier(defaultTier);
  }, [isOpen, defaultTier]);

  useEffect(() => {
    if (!isOpen) return;
    if (defaultName) setName((prev) => prev || defaultName);
    if (defaultEmail) setEmail((prev) => prev || defaultEmail);
  }, [isOpen, defaultName, defaultEmail]);

  if (!isOpen) return null;

  const currentTier = VIP_TIERS.find((t) => t.id === selectedTier) || VIP_TIERS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    const prefixCode = selectedTier === 'christmas-fan-card' ? 'XMAS' : selectedTier.toUpperCase();
    const generatedId = `EM-${prefixCode}-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const normalizedRef = referralCodeInput.trim().toUpperCase();
    const vipRequest: VipPassRequest = {
      ticketId: generatedId,
      tier: selectedTier,
      tierName: currentTier.name,
      price: currentTier.price,
      originalPrice: currentTier.originalPrice,
      guestName: name.trim(),
      organization: organization.trim() || undefined,
      email: email.trim(),
      purpose,
      preferredDate,
      requestedAt: now.toISOString(),
      orderDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'pending_admin_approval',
      referralCodeUsed: normalizedRef || undefined,
      referralCommissionPercent: normalizedRef ? commissionPercent : undefined,
      referralCommissionAmount: normalizedRef
        ? Math.round(currentTier.price * (commissionPercent / 100) * 100) / 100
        : undefined,
    };

    onSubmitVipRequest?.(vipRequest);
    setTicketId(generatedId);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setOrganization('');
    setEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/92 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-4xl rounded-2xl bg-[#061024] border border-blue-500/45 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-blue-900/60 flex items-center justify-between bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-red-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-base sm:text-lg text-white">
                  Elon Musk · Exclusive Greet &amp; Meet Experience
                </h3>
                <span className="text-[10px] font-mono tabular-nums font-bold px-2 py-0.5 rounded bg-red-600/25 text-red-200 border border-red-400/50">
                  Christmas Special Fan Card · $5,000 → $1,000
                </span>
              </div>
              <p className="text-xs text-blue-200/80">
                Official commemorative Fan Card &amp; metal plaque pass with private access to Starbase and Gigafactory Texas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/50 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {!submitted ? (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Column: Metallic Plaque / Fan Card Live Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {selectedTier === 'christmas-fan-card' ? 'Limited Edition Fan Card Preview' : 'Plaque Design Preview'}
                </span>
                {currentTier.originalPrice && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-400/50">
                    SAVE ${(currentTier.originalPrice - currentTier.price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* The custom Elon Musk Brushed Metal Plaque / Fan Card */}
              <div className="relative p-2 rounded-2xl bg-[#040a18] shadow-2xl border border-blue-900/60 max-w-xs sm:max-w-sm mx-auto lg:max-w-none">
                {/* Outer Beveled Metal Plaque Container */}
                <div
                  className={`relative w-full aspect-[4/5] sm:aspect-[4/6] rounded-xl p-5 flex flex-col justify-between items-center text-center transition-all duration-500 overflow-hidden ${currentTier.plaqueClass}`}
                >
                  {/* Double debossed inner border frame */}
                  <div className="absolute inset-2.5 rounded-lg border border-black/25 pointer-events-none" />
                  <div className="absolute inset-3.5 rounded-md border border-white/40 pointer-events-none" />

                  {/* Top: ELON MUSK */}
                  <div className="relative z-10 pt-2 space-y-0.5">
                    <h4
                      className={`font-display text-2xl font-black tracking-[0.22em] uppercase ${currentTier.textColor}`}
                    >
                      ELON MUSK
                    </h4>
                    <div
                      className={`text-[9px] font-mono font-semibold tracking-widest uppercase ${
                        selectedTier === 'christmas-fan-card' ? 'text-amber-200' : 'text-black/70'
                      }`}
                    >
                      {selectedTier === 'christmas-fan-card'
                        ? 'CHRISTMAS SPECIAL · FAN CARD'
                        : 'CHIEF ENGINEER & TECHNOLOGIST'}
                    </div>
                  </div>

                  {/* Center: Aerospace & Holiday Emblem */}
                  <div className="relative z-10 my-auto space-y-2.5">
                    <div
                      className={`w-14 h-14 rounded-full border-2 flex items-center justify-center mx-auto shadow-inner ${
                        selectedTier === 'christmas-fan-card'
                          ? 'border-amber-300/80 bg-red-950/50'
                          : 'border-black/40 bg-black/5'
                      }`}
                    >
                      {selectedTier === 'christmas-fan-card' ? (
                        <Gift className="w-6 h-6 text-amber-300" />
                      ) : (
                        <div className="flex items-center gap-1 text-black/80">
                          <Rocket className="w-5 h-5" />
                          <Zap className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div
                        className={`text-[11px] font-bold tracking-[0.22em] uppercase ${
                          selectedTier === 'christmas-fan-card' ? 'text-amber-200' : 'text-black/80'
                        }`}
                      >
                        {selectedTier === 'christmas-fan-card' ? 'LIMITED EDITION' : 'EXCLUSIVE'}
                      </div>
                      <div
                        className={`font-display text-lg font-black tracking-[0.14em] uppercase leading-tight ${currentTier.textColor}`}
                      >
                        {selectedTier === 'christmas-fan-card' ? 'MEET ELON MUSK' : 'GREET & MEET'}
                      </div>
                      <div
                        className={`text-[11px] font-bold tracking-[0.22em] uppercase ${
                          selectedTier === 'christmas-fan-card' ? 'text-amber-100' : 'text-black/80'
                        }`}
                      >
                        {selectedTier === 'christmas-fan-card' ? 'FAN CARD PASS' : 'EXPERIENCE'}
                      </div>
                    </div>

                    <div
                      className={`text-[10px] font-mono tabular-nums font-bold tracking-wider uppercase flex items-center justify-center gap-2 ${
                        selectedTier === 'christmas-fan-card' ? 'text-amber-200' : 'text-black/75'
                      }`}
                    >
                      <span>{currentTier.badge}</span>
                      <span>·</span>
                      {currentTier.originalPrice ? (
                        <span>
                          <span className="line-through opacity-75 mr-1">
                            ${currentTier.originalPrice.toLocaleString()}
                          </span>
                          <span className="text-white font-black">${currentTier.price.toLocaleString()}</span>
                        </span>
                      ) : (
                        <span>${currentTier.price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Elon Portrait Medallion */}
                  <div className="relative z-10 pb-2 flex flex-col items-center">
                    <div
                      className={`w-20 h-20 rounded-full overflow-hidden border-2 shadow-md bg-stone-300 relative group ${
                        selectedTier === 'christmas-fan-card' ? 'border-amber-300/80' : 'border-black/40'
                      }`}
                    >
                      <img
                        src={normalizePhotoSrc('/assets/aistudio/elo_e882ff2e.webp')}
                        alt="Elon Musk Engraved Portrait"
                        loading="eager"
                        decoding="async"
                        onError={(e) => handleImageFallback(e)}
                        className={`w-full h-full object-cover object-top ${
                          selectedTier === 'christmas-fan-card'
                            ? 'contrast-110 brightness-100'
                            : 'grayscale contrast-125 brightness-95 filter'
                        }`}
                      />
                    </div>

                    <div
                      className={`text-[8px] font-mono font-semibold tracking-widest uppercase pt-1.5 ${
                        selectedTier === 'christmas-fan-card' ? 'text-amber-100' : 'text-black/75'
                      }`}
                    >
                      {name ? `HONORED FAN: ${name.toUpperCase()}` : 'LIMITED EDITION · STARBASE & GIGA TEXAS'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plaque Quality Description */}
              <div className="p-3.5 rounded-xl bg-[#08142b] border border-blue-900/60 text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Solid Aerospace-Grade Metal Construction</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Every attendee receives a physical serialized metal plaque (laser-etched stainless steel or 24K gold plated) in a velvet display case prior to meeting.
                </p>
              </div>
            </div>

            {/* Right Column: Tier Selector & Checkout Form */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* VIP Tier Selector: Christmas Special Fan Card ($5k -> $1k), Silver ($1k), Platinum ($5k), Gold ($10k) */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Select Fan Card / Experience Plaque Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VIP_TIERS.map((tier) => {
                    const isSelected = selectedTier === tier.id;
                    const isChristmas = tier.id === 'christmas-fan-card';
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedTier(tier.id)}
                        className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? isChristmas
                              ? 'bg-gradient-to-br from-red-700/35 via-red-900/25 to-amber-600/20 border-amber-400 text-white shadow-lg shadow-red-600/25'
                              : tier.id === 'gold'
                              ? 'bg-gradient-to-br from-blue-600/25 to-red-600/20 border-red-400 text-white shadow-lg shadow-red-500/15'
                              : 'bg-blue-600/25 border-blue-400 text-white shadow-lg'
                            : isChristmas
                            ? 'bg-gradient-to-br from-red-950/55 to-[#08142b] border-red-500/55 text-slate-200 hover:border-amber-400'
                            : 'bg-[#08142b] border-blue-900/60 text-slate-300 hover:border-blue-500/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                                isChristmas
                                  ? 'text-amber-300'
                                  : tier.id === 'gold'
                                  ? 'text-red-300'
                                  : 'text-blue-300'
                              }`}
                            >
                              {tier.badge}
                            </span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-red-500 text-white flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2 flex-wrap">
                            {tier.originalPrice && (
                              <span className="font-mono text-sm text-slate-400 line-through tabular-nums">
                                ${tier.originalPrice.toLocaleString()}
                              </span>
                            )}
                            <span className="font-display font-bold text-lg text-white tabular-nums">
                              ${tier.price.toLocaleString()}
                            </span>
                            {tier.originalPrice && (
                              <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase">
                                Save ${(tier.originalPrice - tier.price).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-slate-100 pt-0.5">
                            {tier.shortLabel}
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-300 pt-2.5 border-t border-blue-900/50 mt-2 line-clamp-2">
                          {tier.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tier Perks Details */}
              <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-white">
                    Included with {currentTier.name}:
                  </span>
                  <span className="text-blue-300 font-display font-bold font-mono tabular-nums text-sm flex items-center gap-1.5">
                    {currentTier.originalPrice && (
                      <span className="text-slate-400 line-through text-xs">
                        ${currentTier.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span className={currentTier.originalPrice ? 'text-amber-300' : ''}>
                      ${currentTier.price.toLocaleString()} USD
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {currentTier.perks.map((perk, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-slate-200">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-[11px]">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendee Details Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Attendee & Security Clearance Info
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">
                    Full Legal Name (Engraved on Plaque)
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Jennifer Vance"
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200">
                      Organization / Company
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Stanford AI Lab"
                      className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200">
                      Primary Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200">
                      Purpose of Meeting
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400 cursor-pointer"
                    >
                      <option value="executive-briefing">Executive Briefing & Strategic Alliance</option>
                      <option value="spacex-lunar">SpaceX Starship & Orbital Exploration</option>
                      <option value="tesla-fleet">Tesla Megapack & Autonomous Robotics</option>
                      <option value="xai-partnership">xAI Colossus Frontier Research</option>
                      <option value="private-founding">Founders Circle 1-on-1 Dinner Session</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400 font-mono tabular-nums"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-slate-200">
                      Referral Code (Optional)
                    </label>
                    <span className="text-[11px] font-mono text-emerald-400 tabular-nums">
                      Referrer earns {commissionPercent}% (${Math.round(currentTier.price * (commissionPercent / 100)).toLocaleString()})
                    </span>
                  </div>
                  <input
                    type="text"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. ELON-XXXX-XX"
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 font-mono uppercase focus:outline-none focus:border-blue-400"
                  />
                </div>

                {/* Submit / Purchase Button */}
                <div className="pt-4 border-t border-blue-900/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    <span>Total:</span>
                    {currentTier.originalPrice && (
                      <span className="font-mono line-through text-slate-400 tabular-nums">
                        ${currentTier.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <strong className="text-white font-mono tabular-nums font-bold text-sm">
                      ${currentTier.price.toLocaleString()}
                    </strong>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white font-semibold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <span>
                      Reserve {currentTier.shortLabel} (${currentTier.price.toLocaleString()})
                    </span>
                  </button>
                </div>
              </form>

            </div>

          </div>
        ) : (
          /* Confirmation State with Generated Plaque Pass */
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="relative p-2 rounded-2xl bg-[#040a18] shadow-2xl border border-blue-900/60 max-w-lg mx-auto">
              {/* The rendered personalized metallic plaque */}
              <div
                className={`relative w-full aspect-[4/6] rounded-xl p-6 flex flex-col justify-between items-center text-center transition-all ${currentTier.plaqueClass}`}
              >
                {/* Double debossed inner border */}
                <div className="absolute inset-3 rounded-lg border border-black/25 pointer-events-none" />
                <div className="absolute inset-4 rounded-md border border-white/40 pointer-events-none" />

                {/* Top: ELON MUSK */}
                <div className="relative z-10 pt-2 space-y-0.5">
                  <h4
                    className={`font-display text-2xl font-black tracking-[0.22em] uppercase ${currentTier.textColor}`}
                  >
                    ELON MUSK
                  </h4>
                  <div className="text-[9px] font-mono font-bold tracking-widest text-black/70 uppercase">
                    CHIEF ENGINEER & TECHNOLOGIST
                  </div>
                </div>

                {/* Center: Aerospace & Energy Emblem */}
                <div className="relative z-10 my-auto space-y-3">
                  <div className="w-14 h-14 rounded-full border-2 border-black/40 flex items-center justify-center mx-auto bg-black/5 shadow-inner">
                    <div className="flex items-center gap-1 text-black/80">
                      <Rocket className="w-5 h-5" />
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-bold tracking-[0.25em] text-black/80 uppercase">
                      EXCLUSIVE
                    </div>
                    <div
                      className={`font-display text-xl font-black tracking-[0.14em] uppercase leading-tight ${currentTier.textColor}`}
                    >
                      GREET & MEET
                    </div>
                    <div className="text-[11px] font-bold tracking-[0.25em] text-black/80 uppercase">
                      EXPERIENCE
                    </div>
                  </div>

                  <div className="text-[9px] font-mono tabular-nums font-bold text-black/75 tracking-widest uppercase">
                    {currentTier.badge} · {ticketId}
                  </div>
                </div>

                {/* Bottom: Elon Portrait Cameo */}
                <div className="relative z-10 pb-2 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-black/40 shadow-md bg-stone-300 relative">
                    <img
                      src={normalizePhotoSrc('/assets/aistudio/elo_e882ff2e.webp')}
                      alt="Elon Musk Engraved Portrait"
                      loading="eager"
                      decoding="async"
                      onError={(e) => handleImageFallback(e)}
                      className={`w-full h-full object-cover object-top ${
                        selectedTier === 'christmas-fan-card'
                          ? 'contrast-110 brightness-100'
                          : 'grayscale contrast-125 filter'
                      }`}
                    />
                  </div>

                  <div
                    className={`text-[9px] font-mono font-bold tracking-widest uppercase pt-2 ${
                      selectedTier === 'christmas-fan-card' ? 'text-amber-100' : 'text-black/90'
                    }`}
                  >
                    ISSUED TO: {name.toUpperCase()}
                  </div>
                  <div
                    className={`text-[8px] font-mono ${
                      selectedTier === 'christmas-fan-card' ? 'text-amber-200/90' : 'text-black/70'
                    }`}
                  >
                    {organization || 'INDEPENDENT DELEGATE'} · DATE: {preferredDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Approval Routing Notice */}
            <div className="max-w-lg mx-auto p-4 rounded-xl bg-blue-950/45 border border-blue-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Sent to Elon Musk Official Management Table</div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Pass <span className="font-mono text-blue-300">{ticketId}</span> has been sent to the Elon Musk Official Management Table for account provisioning and clearance verification. Updates arrive directly in your In-App Inbox.
                  </p>
                </div>
              </div>
              {onOpenInbox && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenInbox();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#08142b] border border-blue-500/50 text-blue-200 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open Inbox</span>
                </button>
              )}
            </div>

            {/* Confirmation actions */}
            <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={handleReset}
                className="text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Configure Another Pass
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const summary = [
                      'ELON MUSK · VIP GREET & MEET PASS / FAN CARD',
                      '=========================================',
                      `Ticket ID: ${ticketId}`,
                      `Tier: ${currentTier.name} (${
                        currentTier.originalPrice
                          ? `$${currentTier.originalPrice.toLocaleString()} down to $${currentTier.price.toLocaleString()}`
                          : `$${currentTier.price.toLocaleString()}`
                      } USD)`,
                      `Issued To: ${name.toUpperCase()}`,
                      `Organization: ${organization || 'INDEPENDENT DELEGATE'}`,
                      `Email: ${email}`,
                      `Preferred Date: ${preferredDate}`,
                      'Status: Sent to Elon Musk Official Management Table (Pending Verification)',
                    ].join('\n');
                    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${ticketId}-vip-pass.txt`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2.5 rounded-lg border border-blue-800/80 bg-[#08142b] text-slate-100 text-xs font-semibold hover:border-blue-400/70 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Plaque Pass</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white font-semibold text-xs hover:brightness-110 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
