import React, { useState } from 'react';
import { 
  X, 
  TrendingUp, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Award, 
  ArrowRight, 
  Check, 
  AlertCircle,
  Building,
  Lock
} from 'lucide-react';
import { TeslaShareOrder } from '../types';

interface TeslaSharePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuantity?: number;
  currentSharePrice?: number;
  onOrderCompleted: (order: TeslaShareOrder) => void;
  onViewCertificate: (order: TeslaShareOrder) => void;
}

export const TeslaSharePurchaseModal: React.FC<TeslaSharePurchaseModalProps> = ({
  isOpen,
  onClose,
  initialQuantity = 25,
  currentSharePrice = 268.50,
  onOrderCompleted,
  onViewCertificate,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [shareQuantity, setShareQuantity] = useState<number>(initialQuantity);
  const sharePrice = currentSharePrice;
  const totalInvestment = Math.round(shareQuantity * sharePrice * 100) / 100;

  const [custodyType, setCustodyType] = useState<'drs_computershare' | 'dtc_broker' | 'physical_vault'>('drs_computershare');
  const [brokerDtcNumber, setBrokerDtcNumber] = useState('0785 (Fidelity / Schwab)');
  const [brokerAccountNumber, setBrokerAccountNumber] = useState('');

  // Investor details
  const [investorName, setInvestorName] = useState('');
  const [investorEmail, setInvestorEmail] = useState('');
  const [investorPhone, setInvestorPhone] = useState('');
  const [investorType, setInvestorType] = useState<'individual' | 'institutional' | 'family_office'>('individual');
  const [entityName, setEntityName] = useState('');
  const [taxIdMasked, setTaxIdMasked] = useState('');
  const [isAccredited, setIsAccredited] = useState(true);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'wire' | 'ach' | 'crypto'>('wire');
  const [bankRouting, setBankRouting] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  // Completed order
  const [completedOrder, setCompletedOrder] = useState<TeslaShareOrder | null>(null);

  if (!isOpen) return null;

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (shareQuantity < 1) return;
    setStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!investorName.trim() || !investorEmail.trim()) return;
    setStep(3);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const certNum = `TSLA-DRS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: TeslaShareOrder = {
      orderId: `TSLA-ORD-${Date.now().toString().slice(-6)}`,
      certificateNumber: certNum,
      shareQuantity,
      sharePrice,
      totalInvestment,
      custodyType,
      investorName: investorName.trim(),
      investorEmail: investorEmail.trim(),
      investorPhone: investorPhone.trim() || '+1 (512) 555-0199',
      investorType,
      entityName: entityName.trim() || undefined,
      taxIdMasked: taxIdMasked.trim() || '***-**-8921',
      brokerDtcNumber: custodyType === 'dtc_broker' ? brokerDtcNumber : undefined,
      brokerAccountNumber: custodyType === 'dtc_broker' ? brokerAccountNumber : undefined,
      paymentMethod,
      paymentStatus: 'pending_admin_approval',
      orderDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };

    setCompletedOrder(newOrder);
    onOrderCompleted(newOrder);
    setStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-[#061024] border border-blue-500/50 shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18] border-b border-blue-500/35 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-red-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-600/25 text-red-200 border border-red-400/50 font-bold uppercase tracking-wider">
                  NASDAQ: TSLA TREASURY DESK
                </span>
                <span className="text-xs font-mono text-blue-200/80">Direct Share Issuance</span>
              </div>
              <h3 className="font-display font-black text-lg text-white">
                Acquire Tesla, Inc. Common Stock
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-5 py-3 border-b border-blue-900/60 bg-[#050d20] flex items-center justify-between text-xs font-mono text-slate-400">
          <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-blue-300 font-bold' : step > 1 ? 'text-emerald-400' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 1 ? 'bg-blue-600 text-white' : step > 1 ? 'bg-emerald-600 text-white' : 'bg-[#0b1b3a]'}`}>1</span>
            <span>Allocation</span>
          </div>
          <span className="text-blue-800">→</span>
          <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-blue-300 font-bold' : step > 2 ? 'text-emerald-400' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? 'bg-blue-600 text-white' : step > 2 ? 'bg-emerald-600 text-white' : 'bg-[#0b1b3a]'}`}>2</span>
            <span>Investor ID</span>
          </div>
          <span className="text-blue-800">→</span>
          <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-blue-300 font-bold' : step > 3 ? 'text-emerald-400' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 3 ? 'bg-blue-600 text-white' : step > 3 ? 'bg-emerald-600 text-white' : 'bg-[#0b1b3a]'}`}>3</span>
            <span>Settlement</span>
          </div>
          <span className="text-blue-800">→</span>
          <div className={`flex items-center gap-1.5 ${step === 4 ? 'text-red-300 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 4 ? 'bg-red-600 text-white' : 'bg-[#0b1b3a]'}`}>4</span>
            <span>Certificate</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* STEP 1: Share Allocation & Custody */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-5">
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#1d0b18] border border-blue-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-blue-300 uppercase block">Current Direct Treasury Price</span>
                  <div className="text-2xl font-black font-mono tabular-nums text-white">
                    ${sharePrice.toFixed(2)} <span className="text-xs text-slate-300 font-normal">USD / Share</span>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                    +4.82% today · Free Book-Entry Registration
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-300 uppercase block">CUSIP</span>
                  <span className="text-xs font-mono font-bold text-red-300 tabular-nums">88160R101</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-100 flex justify-between">
                  <span>Number of TSLA Shares to Acquire *</span>
                  <span className="text-blue-300 font-mono tabular-nums">{shareQuantity} Shares</span>
                </label>

                {/* Preset Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 100, 500].map((qty) => (
                    <button
                      type="button"
                      key={qty}
                      onClick={() => setShareQuantity(qty)}
                      className={`py-2 rounded-lg text-xs font-mono tabular-nums font-bold border transition-colors cursor-pointer ${
                        shareQuantity === qty
                          ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white border-blue-400'
                          : 'bg-[#08142b] border-blue-900/70 text-slate-300 hover:text-white hover:border-blue-500/60'
                      }`}
                    >
                      {qty} Shares
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <input
                    type="range"
                    min={5}
                    max={2500}
                    step={5}
                    value={shareQuantity}
                    onChange={(e) => setShareQuantity(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono tabular-nums text-slate-400">
                    <span>5 Shares</span>
                    <span>1,000 Shares</span>
                    <span>2,500 Shares</span>
                  </div>
                </div>
              </div>

              {/* Custody Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-100">Legal Custody & Registration Method *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustodyType('drs_computershare')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      custodyType === 'drs_computershare'
                        ? 'bg-blue-600/25 border-blue-400 text-blue-100'
                        : 'bg-[#08142b] border-blue-900/70 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-1">Direct DRS</div>
                    <div className="text-[10px] leading-tight">Registered on Tesla corporate books via Computershare.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustodyType('dtc_broker')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      custodyType === 'dtc_broker'
                        ? 'bg-blue-600/25 border-blue-400 text-blue-100'
                        : 'bg-[#08142b] border-blue-900/70 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-1">Broker Transfer</div>
                    <div className="text-[10px] leading-tight">Delivered to your Fidelity, Schwab, or Vanguard account.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustodyType('physical_vault')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      custodyType === 'physical_vault'
                        ? 'bg-blue-600/25 border-blue-400 text-blue-100'
                        : 'bg-[#08142b] border-blue-900/70 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-1">Vault Certificate</div>
                    <div className="text-[10px] leading-tight">Archival physical certificate with Delaware seal.</div>
                  </button>
                </div>
              </div>

              {custodyType === 'dtc_broker' && (
                <div className="p-3 rounded-xl bg-[#040a18] border border-blue-900/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-300 font-mono block mb-1">Broker DTC Participant</label>
                    <input
                      type="text"
                      value={brokerDtcNumber}
                      onChange={(e) => setBrokerDtcNumber(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#08142b] border border-blue-800/80 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-300 font-mono block mb-1">Broker Account Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Z98-44219"
                      value={brokerAccountNumber}
                      onChange={(e) => setBrokerAccountNumber(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#08142b] border border-blue-800/80 text-white text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Total Calculation Card */}
              <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/70 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-300 uppercase block">Total Capital Outlay</span>
                  <div className="text-xl font-black font-mono tabular-nums text-white">
                    ${totalInvestment.toLocaleString()} <span className="text-xs text-blue-300 font-normal">USD</span>
                  </div>
                </div>
                <div className="text-right text-xs font-mono text-slate-300">
                  <span>Voting Power: </span>
                  <strong className="text-red-300 tabular-nums">{shareQuantity} Votes</strong>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 text-white font-bold text-xs shadow-lg cursor-pointer flex items-center gap-2 transition-transform active:scale-95"
                >
                  <span>Continue to Investor Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Investor Identification */}
          {step === 2 && (
            <form onSubmit={handleStep2Next} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-100">Investor Entity Classification *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'individual', label: 'Individual Investor' },
                    { id: 'institutional', label: 'Corporate Entity' },
                    { id: 'family_office', label: 'Family Office / Trust' },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setInvestorType(t.id as any)}
                      className={`py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        investorType === t.id
                          ? 'bg-blue-600/30 border-blue-400 text-white font-bold'
                          : 'bg-[#08142b] border-blue-900/70 text-slate-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-100">Legal Full Name (Beneficial Owner) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alexander Vance"
                    value={investorName}
                    onChange={(e) => setInvestorName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-100">Email Address (For In-App Certificate) *</label>
                  <input
                    type="email"
                    required
                    placeholder="investor@domain.com"
                    value={investorEmail}
                    onChange={(e) => setInvestorEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-100">Contact Telephone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={investorPhone}
                    onChange={(e) => setInvestorPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-100">Tax ID / SSN (Masked for SEC Transfer) *</label>
                  <input
                    type="text"
                    placeholder="***-**-8921"
                    value={taxIdMasked}
                    onChange={(e) => setTaxIdMasked(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {investorType !== 'individual' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-100">Corporate Entity / Trust Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Frontier Capital LLC"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 focus:outline-none focus:border-blue-400"
                  />
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#08142b] border border-blue-900/70 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="accredited-check"
                  checked={isAccredited}
                  onChange={(e) => setIsAccredited(e.target.checked)}
                  className="mt-1 accent-blue-500"
                />
                <label htmlFor="accredited-check" className="text-[11px] text-slate-300 leading-relaxed cursor-pointer">
                  I represent that I am acquiring these shares for long-term beneficial investment on the official Tesla Delaware shareholder ledger and understand that share allocation is verified by the Central Admin Desk.
                </label>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-mono text-slate-300 hover:text-white cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 text-white font-bold text-xs shadow-lg cursor-pointer flex items-center gap-2 transition-transform active:scale-95"
                >
                  <span>Continue to Settlement</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Settlement & Direct Payment Protocol */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-red-950/35 border border-red-500/45 text-xs flex items-start gap-3">
                <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-red-100 leading-relaxed">
                  <strong>Notice on Settlement Protocol:</strong> All direct share purchases are routed directly to the <strong>Hidden Admin Portal</strong> for payment confirmation and Delaware DRS allocation. You will receive an instant approval dispatch and book-entry certificate directly inside your in-app messaging inbox.
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-100">Settlement Method *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wire')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      paymentMethod === 'wire'
                        ? 'bg-blue-600/25 border-blue-400 text-blue-100'
                        : 'bg-[#08142b] border-blue-900/70 text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-0.5">Fedwire Wire</div>
                    <div className="text-[10px]">Institutional bank wire to Tesla Treasury Escrow.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ach')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      paymentMethod === 'ach'
                        ? 'bg-blue-600/25 border-blue-400 text-blue-100'
                        : 'bg-[#08142b] border-blue-900/70 text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-0.5">FedACH Direct</div>
                    <div className="text-[10px]">Direct electronic debit from US commercial bank.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('crypto')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      paymentMethod === 'crypto'
                        ? 'bg-blue-600/25 border-blue-400 text-blue-100'
                        : 'bg-[#08142b] border-blue-900/70 text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-0.5">Treasury Crypto</div>
                    <div className="text-[10px]">USDC / BTC / DOGE treasury escrow settlement.</div>
                  </button>
                </div>
              </div>

              {/* Wire Instructions Box */}
              {paymentMethod === 'wire' && (
                <div className="p-4 rounded-xl bg-[#040a18] border border-blue-900/70 space-y-2 text-xs font-mono">
                  <div className="text-[10px] text-blue-300 uppercase font-bold">
                    Tesla Institutional Treasury Wire Instructions
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>Beneficiary: <strong className="text-white">Tesla, Inc. Treasury</strong></div>
                    <div>Bank: <strong className="text-white">JPMorgan Chase N.A. (New York)</strong></div>
                    <div>Routing (ABA): <strong className="text-white tabular-nums">021000021</strong></div>
                    <div>Swift: <strong className="text-white">CHASUS33</strong></div>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-blue-900/60 tabular-nums">
                    Provisional Memo Reference: TSLA-ALLOC-{Math.floor(10000 + Math.random() * 90000)}
                  </div>
                </div>
              )}

              {paymentMethod === 'ach' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-300 font-mono">Bank Routing Number (ABA)</label>
                    <input
                      type="text"
                      required
                      placeholder="9-digit routing"
                      value={bankRouting}
                      onChange={(e) => setBankRouting(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#040a18] border border-blue-900/70 text-white font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-300 font-mono">Checking Account Number</label>
                    <input
                      type="text"
                      required
                      placeholder="Account number"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#040a18] border border-blue-900/70 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'crypto' && (
                <div className="p-3 rounded-xl bg-[#040a18] border border-blue-900/70 space-y-1 text-xs font-mono">
                  <span className="text-[10px] text-slate-300 uppercase">USDC / USDT Treasury Contract</span>
                  <div className="text-xs text-blue-300 font-bold truncate">
                    0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Network: Ethereum Mainnet or Solana (USDC). Transaction hash automatically logged with your order.
                  </p>
                </div>
              )}

              {/* Order Summary */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18] border border-blue-500/40 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-300">Total Purchase Amount</div>
                  <div className="text-2xl font-black font-mono tabular-nums text-white">
                    ${totalInvestment.toLocaleString()} USD
                  </div>
                  <div className="text-[11px] font-mono tabular-nums text-blue-200">
                    {shareQuantity} Common Shares @ ${sharePrice.toFixed(2)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-red-600/25 text-red-200 border border-red-400/50">
                    {custodyType === 'drs_computershare' ? 'DRS Direct Book' : 'DTC Broker'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-mono text-slate-300 hover:text-white cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 text-white font-bold text-xs shadow-xl cursor-pointer flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Execute TSLA Share Allocation</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success & Certificate Modal Launcher */}
          {step === 4 && completedOrder && (
            <div className="py-4 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="font-display font-black text-xl text-white">
                  Share Purchase Order Submitted Successfully
                </h4>
                <p className="text-xs text-blue-300 font-mono">
                  Provisional Certificate No: <strong className="text-white tabular-nums">{completedOrder.certificateNumber}</strong>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/70 text-left max-w-md mx-auto space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-blue-900/50">
                  <span className="text-slate-400">Beneficial Owner:</span>
                  <span className="text-white font-bold">{completedOrder.investorName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-900/50">
                  <span className="text-slate-400">TSLA Share Quantity:</span>
                  <span className="text-blue-300 font-bold tabular-nums">{completedOrder.shareQuantity} Units</span>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-900/50">
                  <span className="text-slate-400">Total Capital Outlay:</span>
                  <span className="text-white font-bold tabular-nums">${completedOrder.totalInvestment.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Payment Status:</span>
                  <span className="text-red-300 font-bold">PENDING ADMIN APPROVAL</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Payment confirmation and final transfer agent validation has been directed to the <strong>Hidden Admin Portal</strong>. You have also received an official notice in your In-App Inbox.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onViewCertificate(completedOrder)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 text-white font-bold text-xs shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Official Delaware Share Certificate</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#08142b] border border-blue-800/80 hover:border-blue-400/70 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Return to Brief
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
