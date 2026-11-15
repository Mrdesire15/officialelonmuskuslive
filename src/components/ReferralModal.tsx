import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Percent,
  Share2,
  DollarSign,
  Car,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Calculator
} from 'lucide-react';
import { ReferralConversion } from '../types';
import { TESLA_VEHICLES } from '../data/teslaVehicles';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitorReferralCode: string;
  commissionPercent: number;
  conversions: ReferralConversion[];
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  visitorReferralCode,
  commissionPercent,
  conversions,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [calcCategory, setCalcCategory] = useState<'vehicle' | 'vip' | 'shares'>('vehicle');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(TESLA_VEHICLES[0]?.id || '');
  const [selectedVipAmount, setSelectedVipAmount] = useState<number>(10000);
  const [shareQty, setShareQty] = useState<number>(100);

  if (!isOpen) return null;

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?ref=${visitorReferralCode}`
      : `?ref=${visitorReferralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(visitorReferralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const myConversions = conversions.filter(
    (c) => c.referrerCode.toUpperCase() === visitorReferralCode.toUpperCase()
  );
  const otherConversions = conversions.filter(
    (c) => c.referrerCode.toUpperCase() !== visitorReferralCode.toUpperCase()
  );
  const displayedConversions = myConversions.length > 0 ? myConversions : conversions;

  const approvedTotal = myConversions
    .filter((c) => c.status === 'approved')
    .reduce((sum, c) => sum + c.commissionEarned, 0);

  const pendingTotal = myConversions
    .filter((c) => c.status === 'pending_admin_approval')
    .reduce((sum, c) => sum + c.commissionEarned, 0);

  const selectedVehicle =
    TESLA_VEHICLES.find((v) => v.id === selectedVehicleId) || TESLA_VEHICLES[0];

  const simulatedOrderValue =
    calcCategory === 'vehicle'
      ? selectedVehicle?.basePrice || 89990
      : calcCategory === 'vip'
      ? selectedVipAmount
      : shareQty * 268.5;

  const simulatedCommission = Math.round(simulatedOrderValue * (commissionPercent / 100) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/92 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-4xl rounded-2xl bg-[#061024] border border-blue-500/45 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-blue-900/60 flex items-center justify-between bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center text-white shadow-md">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-blue-300">
                <span>Visitor Referral Program</span>
                <span aria-hidden="true">·</span>
                <span className="text-red-300 font-bold tabular-nums">{commissionPercent}% Commission Earned</span>
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                Your Personal Referral Code & Earnings Desk
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Referral Desk"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Auto-Generated Visitor Referral Code Showcase */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#08152e] via-[#0a1a3a] to-[#1d0b18] border border-blue-500/45 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono text-blue-300">
                  Auto-Generated Visitor Code · Active Automatically
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-white tabular-nums">
                  {visitorReferralCode}
                </div>
                <p className="text-xs text-slate-300 max-w-xl">
                  Share your personal referral code or link. Every Tesla vehicle reservation, TSLA equity allocation, or VIP Greet & Meet pass placed with your code earns you{' '}
                  <strong className="text-white font-mono tabular-nums">{commissionPercent}%</strong> upon verification by the Elon Musk Official Management Table.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 shadow-md"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Code Copied' : 'Copy Code'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 rounded-xl bg-[#040a18] border border-blue-500/45 hover:border-blue-400 text-blue-100 hover:text-white text-xs font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-blue-300" />}
                  <span>{copiedLink ? 'Invite Link Copied' : 'Copy Referral Link'}</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
              <span className="truncate">Share Link: {shareUrl}</span>
              <span className="text-emerald-300 shrink-0 tabular-nums">
                Rate Locked: {commissionPercent}% per approved referral
              </span>
            </div>
          </div>

          {/* 3-Metric Earnings Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60">
              <div className="text-xs text-slate-400">Commission Rate</div>
              <div className="text-2xl font-display font-bold text-blue-300 font-mono tabular-nums mt-1">
                {commissionPercent}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Earned across fleet, shares & VIP passes
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60">
              <div className="text-xs text-slate-400">Approved Earned Balance</div>
              <div className="text-2xl font-display font-bold text-emerald-400 font-mono tabular-nums mt-1">
                ${approvedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Verified by Elon Musk Official Management Table
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60">
              <div className="text-xs text-slate-400">Pending Elon Musk Management Review</div>
              <div className="text-2xl font-display font-bold text-white font-mono tabular-nums mt-1">
                ${pendingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                {myConversions.length} total referral {myConversions.length === 1 ? 'order' : 'orders'}
              </div>
            </div>
          </div>

          {/* Interactive Commission Estimator */}
          <div className="p-5 rounded-xl bg-[#08142b] border border-blue-900/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-400" />
                <h4 className="font-semibold text-sm text-white">
                  Commission Earnings Estimator ({commissionPercent}%)
                </h4>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-lg bg-[#040a18] border border-blue-900/70 text-xs">
                <button
                  type="button"
                  onClick={() => setCalcCategory('vehicle')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    calcCategory === 'vehicle' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Vehicle Order</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalcCategory('vip')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    calcCategory === 'vip' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>VIP Pass</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalcCategory('shares')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    calcCategory === 'shares' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>TSLA Shares</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-7 space-y-2">
                {calcCategory === 'vehicle' && (
                  <div>
                    <label className="text-xs text-slate-300 block mb-1.5">Select Referred Tesla Model</label>
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#040a18] border border-blue-900/70 text-xs text-white focus:outline-none focus:border-blue-400 cursor-pointer"
                    >
                      {TESLA_VEHICLES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} — ${v.basePrice.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {calcCategory === 'vip' && (
                  <div>
                    <label className="text-xs text-slate-300 block mb-1.5">Select VIP Pass Tier</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Silver', price: 1000 },
                        { label: 'Platinum', price: 5000 },
                        { label: 'Gold', price: 10000 },
                      ].map((tier) => (
                        <button
                          key={tier.label}
                          type="button"
                          onClick={() => setSelectedVipAmount(tier.price)}
                          className={`py-2 px-3 rounded-lg border text-xs font-mono tabular-nums cursor-pointer transition-colors ${
                            selectedVipAmount === tier.price
                              ? 'bg-blue-600/30 border-blue-400 text-white font-bold'
                              : 'bg-[#040a18] border-blue-900/70 text-slate-300'
                          }`}
                        >
                          {tier.label} · ${tier.price.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {calcCategory === 'shares' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Referred TSLA Shares</span>
                      <span className="font-mono font-bold text-blue-300 tabular-nums">{shareQty} Shares</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={1000}
                      step={10}
                      value={shareQty}
                      onChange={(e) => setShareQty(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <div className="md:col-span-5 p-4 rounded-xl bg-[#040a18] border border-blue-900/70 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Your {commissionPercent}% Payout</div>
                  <div className="text-xl sm:text-2xl font-mono font-black text-emerald-400 tabular-nums">
                    +${simulatedCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                    On ${simulatedOrderValue.toLocaleString()} order
                  </div>
                </div>
                <DollarSign className="w-7 h-7 text-emerald-400/70 shrink-0" />
              </div>
            </div>
          </div>

          {/* Referral Conversions History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-white">
                Referral Activity & Payout Ledger
              </h4>
              <span className="text-xs font-mono text-slate-400 tabular-nums">
                {displayedConversions.length} recorded {displayedConversions.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            {displayedConversions.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#08142b] border border-blue-900/60 text-center space-y-2">
                <p className="text-xs text-slate-300">
                  No referrals recorded yet. Share <span className="font-mono text-blue-300 font-bold">{visitorReferralCode}</span> to start earning <strong className="text-white">{commissionPercent}%</strong> on every approved order.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-blue-900/50 rounded-xl bg-[#08142b] border border-blue-900/60 overflow-hidden">
                {displayedConversions.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                        <span className="text-blue-300 font-bold">{conv.orderId}</span>
                        <span aria-hidden="true">·</span>
                        <span>Code: {conv.referrerCode}</span>
                        <span aria-hidden="true">·</span>
                        <span>{conv.dateStr}</span>
                      </div>
                      <div className="font-semibold text-white">
                        {conv.itemTitle} — {conv.buyerName}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 font-mono tabular-nums">
                      <div className="text-right">
                        <div className="text-emerald-400 font-bold text-sm">
                          +${conv.commissionEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {conv.commissionPercent}% of ${conv.orderAmount.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                        {conv.status === 'approved' && (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Earned</span>
                          </span>
                        )}
                        {conv.status === 'pending_admin_approval' && (
                          <span className="text-blue-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending Elon Musk Management</span>
                          </span>
                        )}
                        {conv.status === 'rejected' && (
                          <span className="text-red-400 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Declined</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {myConversions.length === 0 && otherConversions.length > 0 && (
              <p className="text-[11px] text-slate-400">
                Showing recent referred orders logged in this workspace.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
