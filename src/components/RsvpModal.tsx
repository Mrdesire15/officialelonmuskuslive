import React, { useState } from 'react';
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
  Mail
} from 'lucide-react';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type VipTier = 'silver' | 'platinum' | 'gold';

interface VipTierInfo {
  id: VipTier;
  name: string;
  price: number;
  badge: string;
  plaqueClass: string;
  textColor: string;
  description: string;
  perks: string[];
}

const VIP_TIERS: VipTierInfo[] = [
  {
    id: 'silver',
    name: 'Silver Experience Pass',
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

export const RsvpModal: React.FC<RsvpModalProps> = ({ isOpen, onClose }) => {
  const [selectedTier, setSelectedTier] = useState<VipTier>('gold');
  const [activeView, setActiveView] = useState<'card' | 'physical'>('card');
  const [submitted, setSubmitted] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState('executive-briefing');
  const [preferredDate, setPreferredDate] = useState('2026-11-20');
  const [ticketId, setTicketId] = useState('');

  if (!isOpen) return null;

  const currentTier = VIP_TIERS.find((t) => t.id === selectedTier) || VIP_TIERS[2];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    const generatedId = `EM-${selectedTier.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
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
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">
                  Elon Musk · Exclusive Greet & Meet Experience
                </h3>
                <span className="text-[10px] font-mono tabular-nums font-bold px-2 py-0.5 rounded bg-red-600/25 text-red-200 border border-red-400/50">
                  $1,000 – $10,000 VIP Passes
                </span>
              </div>
              <p className="text-xs text-blue-200/80">
                Official commemorative metal plaque pass & private access to Starbase and Gigafactory Texas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {!submitted ? (
          <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Metallic Plaque Live Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Plaque Design Preview
                </span>
                
                {/* View toggle */}
                <div className="flex items-center gap-1 p-0.5 bg-[#08142b] rounded-lg border border-blue-900/70 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setActiveView('card')}
                    className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                      activeView === 'card' ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Elon Plaque
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('physical')}
                    className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                      activeView === 'physical' ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Physical Keepsake
                  </button>
                </div>
              </div>

              {activeView === 'card' ? (
                /* The custom Elon Musk Brushed Metal Plaque */
                <div className="relative p-2 rounded-2xl bg-[#040a18] shadow-2xl border border-blue-900/60">
                  {/* Outer Beveled Metal Plaque Container */}
                  <div
                    className={`relative w-full aspect-[4/6] rounded-xl p-5 flex flex-col justify-between items-center text-center transition-all duration-500 overflow-hidden ${currentTier.plaqueClass}`}
                  >
                    {/* Double debossed inner border frame (matching reference photo) */}
                    <div className="absolute inset-2.5 rounded-lg border border-black/25 pointer-events-none" />
                    <div className="absolute inset-3.5 rounded-md border border-white/40 pointer-events-none" />

                    {/* Top: ELON MUSK */}
                    <div className="relative z-10 pt-2 space-y-0.5">
                      <h4
                        className={`font-display text-2xl font-black tracking-[0.22em] uppercase ${currentTier.textColor}`}
                      >
                        ELON MUSK
                      </h4>
                      <div className="text-[9px] font-mono font-semibold tracking-widest text-black/70 uppercase">
                        CHIEF ENGINEER & TECHNOLOGIST
                      </div>
                    </div>

                    {/* Center: Aerospace & Energy Emblem */}
                    <div className="relative z-10 my-auto space-y-3">
                      {/* Custom Elon Emblem replacing film reel */}
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
                          className={`font-display text-lg font-black tracking-[0.14em] uppercase leading-tight ${currentTier.textColor}`}
                        >
                          GREET & MEET
                        </div>
                        <div className="text-[11px] font-bold tracking-[0.25em] text-black/80 uppercase">
                          EXPERIENCE
                        </div>
                      </div>

                      <div className="text-[9px] font-mono tabular-nums font-semibold text-black/70 tracking-widest uppercase">
                        {currentTier.badge} · ${currentTier.price.toLocaleString()}
                      </div>
                    </div>

                    {/* Bottom: Elon Portrait Medallion Engraving */}
                    <div className="relative z-10 pb-2 flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-black/40 shadow-md bg-stone-300 relative group">
                        <img
                          src="/assets/aistudio/elo_e882ff2e.webp"
                          alt="Elon Musk Engraved Portrait"
                          className="w-full h-full object-cover object-top grayscale contrast-125 brightness-95 filter"
                        />
                        <div className="absolute inset-0 bg-amber-500/10 mix-blend-multiply" />
                      </div>

                      <div className="text-[8px] font-mono font-semibold tracking-widest uppercase text-black/75 pt-1.5">
                        {name ? `HONORED GUEST: ${name.toUpperCase()}` : 'VIP CLEARANCE · STARBASE & GIGA TEXAS'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Physical Reference Plaque View from User Upload */
                <div className="relative rounded-xl overflow-hidden bg-[#08142b] border border-blue-900/60 shadow-xl">
                  <img
                    src="/assets/aistudio/b9dfb02c-a28c-4fb3-8565-2ca793b5d3a4_ad75e2b2.jpeg"
                    alt="Commemorative Metal Plaque Keepsake"
                    className="w-full h-auto object-cover"
                  />
                  <div className="p-3 bg-[#040a18]/90 border-t border-blue-900/60 text-[11px] text-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-blue-300">Physical Brushed Metal Keepsake</span>
                    <span className="text-slate-400 font-mono">Crafted in Austin, TX</span>
                  </div>
                </div>
              )}

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
              
              {/* VIP Tier Selector: Silver $1,000, Platinum $5,000, Gold $10,000 */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Select Experience Plaque Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {VIP_TIERS.map((tier) => {
                    const isSelected = selectedTier === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedTier(tier.id)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? tier.id === 'gold'
                              ? 'bg-gradient-to-br from-blue-600/25 to-red-600/20 border-red-400 text-white shadow-lg shadow-red-500/15'
                              : 'bg-blue-600/25 border-blue-400 text-white shadow-lg'
                            : 'bg-[#08142b] border-blue-900/60 text-slate-300 hover:border-blue-500/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${tier.id === 'gold' ? 'text-red-300' : 'text-blue-300'}`}>
                              {tier.badge}
                            </span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-red-500 text-white flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className="font-display font-bold text-lg text-white tabular-nums">
                            ${tier.price.toLocaleString()}
                          </div>
                          <div className="text-xs font-semibold text-slate-100 pt-0.5">
                            {tier.name.split(' ')[0]} Plaque
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-300 pt-3 border-t border-blue-900/50 mt-2 line-clamp-2">
                          {tier.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tier Perks Details */}
              <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">
                    Included with {currentTier.name}:
                  </span>
                  <span className="text-blue-300 font-display font-bold font-mono tabular-nums text-sm">
                    ${currentTier.price.toLocaleString()} USD
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

                {/* Submit / Purchase Button */}
                <div className="pt-4 border-t border-blue-900/60 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-300">
                    Total: <strong className="text-white font-mono tabular-nums font-bold text-sm">${currentTier.price.toLocaleString()}</strong>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white font-semibold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-blue-500/25 cursor-pointer flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>Reserve {currentTier.name.split(' ')[0]} Plaque Pass (${currentTier.price.toLocaleString()})</span>
                  </button>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-slate-300">
                  <span>Direct VIP Customer Service:</span>
                  <a
                    href="mailto:officialelonmusk076@gmail.com"
                    className="text-blue-300 hover:text-white font-mono transition-colors flex items-center gap-1 font-medium"
                  >
                    <Mail className="w-3 h-3 text-red-400" />
                    <span>officialelonmusk076@gmail.com</span>
                  </a>
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
                      src="/assets/aistudio/elo_e882ff2e.webp"
                      alt="Elon Musk Engraved Portrait"
                      className="w-full h-full object-cover object-top grayscale contrast-125 filter"
                    />
                  </div>

                  <div className="text-[9px] font-mono font-bold tracking-widest uppercase text-black/90 pt-2">
                    ISSUED TO: {name.toUpperCase()}
                  </div>
                  <div className="text-[8px] font-mono text-black/70">
                    {organization || 'INDEPENDENT DELEGATE'} · DATE: {preferredDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation actions */}
            <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={handleReset}
                className="text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Configure Another Plaque
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    alert(`VIP Plaque Pass ${ticketId} downloaded!`);
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
