import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Award,
  Car,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Link2,
  Mail,
  Percent,
  QrCode,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';
import { ReferralConversion } from '../types';
import { MemberAccountSnapshot } from '../utils/memberAuth';

interface MemberReferralDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberUser: MemberAccountSnapshot | null;
  referralCode: string;
  commissionPercent: number;
  conversions: ReferralConversion[];
  onOpenCalculator?: () => void;
}

type ConversionStatusFilter = 'successful' | 'all' | 'pending' | 'rejected';
type ConversionTypeFilter = 'all' | 'vehicle' | 'merch' | 'shares' | 'vip';
type SocialChannelId = 'x' | 'linkedin' | 'whatsapp' | 'facebook' | 'email';
type LandingChapterId = 'executive' | 'showroom' | 'flying-roadster' | 'shares' | 'rsvp';

const SOCIAL_CHANNELS: { id: SocialChannelId; label: string; utmSource: string }[] = [
  { id: 'x', label: 'X / Twitter', utmSource: 'x_social' },
  { id: 'linkedin', label: 'LinkedIn', utmSource: 'linkedin' },
  { id: 'whatsapp', label: 'WhatsApp', utmSource: 'whatsapp' },
  { id: 'facebook', label: 'Facebook', utmSource: 'facebook' },
  { id: 'email', label: 'Email / Direct', utmSource: 'direct_email' },
];

const LANDING_CHAPTERS: { id: LandingChapterId; label: string; hash: string }[] = [
  { id: 'executive', label: 'Executive Home', hash: '' },
  { id: 'showroom', label: 'Tesla Showroom', hash: '#showroom' },
  { id: 'flying-roadster', label: 'Flying Roadster', hash: '#flying-roadster' },
  { id: 'shares', label: 'TSLA Direct Shares', hash: '#shares' },
  { id: 'rsvp', label: 'VIP Fan & Greet Pass', hash: '#meet' },
];

export const MemberReferralDashboardModal: React.FC<MemberReferralDashboardModalProps> = ({
  isOpen,
  onClose,
  memberUser,
  referralCode,
  commissionPercent,
  conversions,
  onOpenCalculator,
}) => {
  const [statusFilter, setStatusFilter] = useState<ConversionStatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<ConversionTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Personalized Referral Link Generator state
  const [selectedChannel, setSelectedChannel] = useState<SocialChannelId>('x');
  const [selectedLanding, setSelectedLanding] = useState<LandingChapterId>('executive');
  const [campaignTag, setCampaignTag] = useState<string>(() => {
    const raw = (memberUser?.displayName || memberUser?.email?.split('@')[0] || 'member')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return raw.slice(0, 20) || 'member';
  });
  const [customCaption, setCustomCaption] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedPost, setCopiedPost] = useState<boolean>(false);
  const [showQrPreview, setShowQrPreview] = useState<boolean>(false);

  const memberConversions = useMemo(() => {
    const targetCode = referralCode.trim().toUpperCase();
    return conversions.filter((c) => c.referrerCode.trim().toUpperCase() === targetCode);
  }, [conversions, referralCode]);

  const successfulConversions = useMemo(
    () => memberConversions.filter((c) => c.status === 'approved'),
    [memberConversions]
  );

  const pendingConversions = useMemo(
    () => memberConversions.filter((c) => c.status === 'pending_admin_approval'),
    [memberConversions]
  );

  const rejectedConversions = useMemo(
    () => memberConversions.filter((c) => c.status === 'rejected'),
    [memberConversions]
  );

  const approvedCommissionUsd = useMemo(
    () => successfulConversions.reduce((sum, c) => sum + c.commissionEarned, 0),
    [successfulConversions]
  );

  const pendingCommissionUsd = useMemo(
    () => pendingConversions.reduce((sum, c) => sum + c.commissionEarned, 0),
    [pendingConversions]
  );

  const successfulVolumeUsd = useMemo(
    () => successfulConversions.reduce((sum, c) => sum + c.orderAmount, 0),
    [successfulConversions]
  );

  const approvalRatePercent = useMemo(() => {
    if (memberConversions.length === 0) return 100;
    return Math.round((successfulConversions.length / memberConversions.length) * 100);
  }, [memberConversions.length, successfulConversions.length]);

  const sanitizedCampaign = useMemo(() => {
    return campaignTag
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 28);
  }, [campaignTag]);

  const personalizedUrl = useMemo(() => {
    const baseOrigin =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : 'https://tesla-executive.app/';
    const channelObj = SOCIAL_CHANNELS.find((c) => c.id === selectedChannel) || SOCIAL_CHANNELS[0];
    const landingObj = LANDING_CHAPTERS.find((l) => l.id === selectedLanding) || LANDING_CHAPTERS[0];

    const params = new URLSearchParams();
    params.set('ref', referralCode.trim().toUpperCase());
    params.set('utm_source', channelObj.utmSource);
    if (sanitizedCampaign) {
      params.set('utm_campaign', sanitizedCampaign);
    }
    return `${baseOrigin}?${params.toString()}${landingObj.hash}`;
  }, [referralCode, selectedChannel, selectedLanding, sanitizedCampaign]);

  const activeShareMessage = useMemo(() => {
    if (customCaption.trim()) return customCaption.trim();
    return `Join the Tesla & SpaceX Executive Platform with my personal referral code ${referralCode} for priority reservations, TSLA shares & VIP passes: ${personalizedUrl}`;
  }, [customCaption, referralCode, personalizedUrl]);

  const filteredConversions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return memberConversions.filter((conv) => {
      if (statusFilter === 'successful' && conv.status !== 'approved') return false;
      if (statusFilter === 'pending' && conv.status !== 'pending_admin_approval') return false;
      if (statusFilter === 'rejected' && conv.status !== 'rejected') return false;
      if (typeFilter !== 'all' && conv.orderType !== typeFilter) return false;
      if (!q) return true;
      return (
        conv.orderId.toLowerCase().includes(q) ||
        conv.itemTitle.toLowerCase().includes(q) ||
        conv.buyerName.toLowerCase().includes(q) ||
        conv.orderType.toLowerCase().includes(q)
      );
    });
  }, [memberConversions, statusFilter, typeFilter, searchQuery]);

  if (!isOpen) return null;

  const memberName = memberUser?.displayName?.trim() || 'Executive Member';
  const memberEmail = memberUser?.email?.trim() || 'Active Member Session';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(personalizedUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopySharePost = () => {
    navigator.clipboard.writeText(activeShareMessage);
    setCopiedPost(true);
    setTimeout(() => setCopiedPost(false), 2000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Tesla & SpaceX Executive Referral',
          text: `Use my personal referral code ${referralCode} to access priority Tesla reservations, TSLA allocations & VIP passes.`,
          url: personalizedUrl,
        });
      } catch {
        // User canceled share dialog
      }
    } else {
      handleCopySharePost();
    }
  };

  const xShareHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(activeShareMessage)}`;
  const linkedInShareHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(personalizedUrl)}`;
  const whatsappShareHref = `https://wa.me/?text=${encodeURIComponent(activeShareMessage)}`;
  const facebookShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(personalizedUrl)}`;
  const mailtoShareHref = `mailto:?subject=${encodeURIComponent(
    `Personal Invitation · Tesla & SpaceX Executive Platform (${referralCode})`
  )}&body=${encodeURIComponent(activeShareMessage)}`;

  const totalPendingPlusApproved = approvedCommissionUsd + pendingCommissionUsd;
  const approvedRatioWidth =
    totalPendingPlusApproved > 0
      ? Math.round((approvedCommissionUsd / totalPendingPlusApproved) * 100)
      : 100;

  const renderTypeIcon = (orderType: ReferralConversion['orderType']) => {
    switch (orderType) {
      case 'vehicle':
        return <Car className="w-3.5 h-3.5 text-blue-300" />;
      case 'shares':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />;
      case 'vip':
        return <Award className="w-3.5 h-3.5 text-amber-300" />;
      case 'merch':
        return <ShoppingBag className="w-3.5 h-3.5 text-rose-300" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-blue-300" />;
    }
  };

  const formatOrderTypeLabel = (orderType: ReferralConversion['orderType']) => {
    switch (orderType) {
      case 'vehicle':
        return 'Vehicle Reservation';
      case 'shares':
        return 'TSLA Equity';
      case 'vip':
        return 'VIP Pass';
      case 'merch':
        return 'Merchandise';
      default:
        return orderType;
    }
  };

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-referral-dashboard-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#020611]/92 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl rounded-2xl bg-[#061024] border border-blue-500/45 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto text-slate-100"
      >
        {/* Top Accent Strip */}
        <div className="h-[2px] w-full us-flag-strip shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-blue-900/60 flex items-center justify-between gap-3 bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-blue-300">
                <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{memberName}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate text-slate-300">{memberEmail}</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300 font-bold tabular-nums">
                  {commissionPercent}% Partner Rate
                </span>
              </div>
              <h2
                id="member-referral-dashboard-title"
                className="font-display font-bold text-lg text-white truncate"
              >
                Member Referral Dashboard
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Member Referral Dashboard"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/50 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Section 1: Current Commission Status & Earnings KPIs */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-mono text-blue-300">
                  Commission Status &amp; Settlement Standing
                </div>
                <h3 className="text-sm font-bold text-white">
                  Individual Partner Overview ({referralCode})
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-semibold">
                  Status: Active &amp; Payout Eligible
                </span>
                <span className="text-slate-500" aria-hidden="true">·</span>
                <span className="text-slate-300 tabular-nums">
                  {approvalRatePercent}% Approval Ratio
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl bg-[#08142b] border border-emerald-500/40 space-y-1">
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Approved Commissions</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-display font-bold text-emerald-400 font-mono tabular-nums">
                  ${approvedCommissionUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 tabular-nums">
                  {successfulConversions.length} successful{' '}
                  {successfulConversions.length === 1 ? 'conversion' : 'conversions'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/70 space-y-1">
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Pending Review</span>
                  <Clock className="w-4 h-4 text-blue-300" />
                </div>
                <div className="text-2xl font-display font-bold text-white font-mono tabular-nums">
                  ${pendingCommissionUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 tabular-nums">
                  {pendingConversions.length} awaiting management approval
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/70 space-y-1">
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Current Rate</span>
                  <Percent className="w-4 h-4 text-amber-300" />
                </div>
                <div className="text-2xl font-display font-bold text-blue-300 font-mono tabular-nums">
                  {commissionPercent}%
                </div>
                <div className="text-[11px] text-slate-400">
                  Applied to Vehicle, Shares, VIP &amp; Merch
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/70 space-y-1">
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Converted Sales Volume</span>
                  <DollarSign className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="text-2xl font-display font-bold text-white font-mono tabular-nums">
                  ${successfulVolumeUsd.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 tabular-nums">
                  {memberConversions.length} total referred{' '}
                  {memberConversions.length === 1 ? 'order' : 'orders'}
                </div>
              </div>
            </div>

            {/* Commission Settlement Progress Meter */}
            <div className="p-4 rounded-xl bg-[#040a18] border border-blue-900/70 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-200">
                  Commission Payout Clearance Progress
                </span>
                <span className="font-mono text-slate-400 tabular-nums">
                  Approved: ${approvedCommissionUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / Queued + Approved: ${totalPendingPlusApproved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#08142b] overflow-hidden border border-blue-900/60">
                <svg
                  className="w-full h-full block"
                  role="progressbar"
                  aria-label="Approved commission ratio"
                  aria-valuenow={approvedRatioWidth}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <defs>
                    <linearGradient id="ref-progress-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="0"
                    y="0"
                    width={`${approvedRatioWidth}%`}
                    height="100%"
                    rx="4"
                    fill="url(#ref-progress-grad)"
                  />
                </svg>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Every referred order enters Pending Review at submission. Once verified by the Elon Musk Official Management Table, its status updates to Earned and dispatches an approval notice to your In-App Inbox.
              </p>
            </div>
          </section>

          {/* Section 2: Personalized Referral Link Generator for Social Sharing */}
          <section className="p-4 sm:p-5 rounded-2xl bg-[#08142b] border border-blue-500/45 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-900/60">
              <div>
                <div className="text-xs font-mono text-emerald-300">
                  Personalized Referral Link Generator
                </div>
                <h3 className="text-base font-bold text-white">
                  Build Custom Social Invite Links &amp; Share Across Platforms
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono font-bold text-white bg-[#040a18] border border-blue-900/70 px-3 py-1.5 rounded-lg tabular-nums">
                  {referralCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-[#040a18] border border-blue-700/70 hover:border-blue-400 text-xs font-semibold text-blue-200 hover:text-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Code Copied' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Link Customizer Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">
                  1. Target Social Platform
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SOCIAL_CHANNELS.map((ch) => {
                    const active = selectedChannel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setSelectedChannel(ch.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                          active
                            ? 'bg-blue-600 border-blue-400 text-white'
                            : 'bg-[#040a18] border-blue-900/70 text-slate-300 hover:text-white'
                        }`}
                      >
                        {ch.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ref-landing-select" className="text-xs font-semibold text-slate-200 block">
                  2. Destination Chapter
                </label>
                <select
                  id="ref-landing-select"
                  value={selectedLanding}
                  onChange={(e) => setSelectedLanding(e.target.value as LandingChapterId)}
                  className="w-full px-3 py-2 rounded-lg bg-[#040a18] border border-blue-900/70 text-xs text-white focus:outline-none focus:border-blue-400 cursor-pointer"
                >
                  {LANDING_CHAPTERS.map((chap) => (
                    <option key={chap.id} value={chap.id}>
                      {chap.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ref-campaign-input" className="text-xs font-semibold text-slate-200 block">
                  3. Custom Tracking Tag (Optional)
                </label>
                <input
                  id="ref-campaign-input"
                  type="text"
                  maxLength={28}
                  value={campaignTag}
                  onChange={(e) => setCampaignTag(e.target.value)}
                  placeholder="e.g. cybertruck-launch"
                  className="w-full px-3 py-2 rounded-lg bg-[#040a18] border border-blue-900/70 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Generated URL Box + QR Toggle */}
            <div className="p-3.5 rounded-xl bg-[#040a18] border border-blue-900/70 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Link2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-mono text-xs text-emerald-200 break-all select-all">
                    {personalizedUrl}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Personalized Link Copied' : 'Copy Personalized Link'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQrPreview((prev) => !prev)}
                    className="px-3 py-2 rounded-lg bg-[#08142b] border border-blue-800/70 hover:border-blue-400 text-blue-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{showQrPreview ? 'Hide Link QR' : 'Show Link QR'}</span>
                  </button>
                </div>
              </div>

              {showQrPreview && (
                <div className="pt-3 border-t border-blue-900/60 flex flex-col sm:flex-row items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-white border border-blue-200 shrink-0">
                    <QRCodeSVG
                      value={personalizedUrl}
                      size={112}
                      level="M"
                      bgColor="#ffffff"
                      fgColor="#040a18"
                    />
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 text-center sm:text-left">
                    <div className="font-bold text-white">Scannable Personalized Invite QR Code</div>
                    <p className="leading-relaxed text-slate-400">
                      Anyone scanning this QR code automatically lands on{' '}
                      <span className="text-blue-300 font-semibold">
                        {LANDING_CHAPTERS.find((l) => l.id === selectedLanding)?.label}
                      </span>{' '}
                      with your referral code <span className="font-mono text-white">{referralCode}</span> pre-applied at checkout.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Editable Social Post + Platform Share Buttons */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="ref-social-caption" className="text-xs font-semibold text-slate-200">
                  Social Share Post Caption (Optional Custom Text)
                </label>
                <button
                  type="button"
                  onClick={handleCopySharePost}
                  className="text-xs font-semibold text-blue-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedPost ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPost ? 'Post Text Copied' : 'Copy Post Text'}</span>
                </button>
              </div>
              <textarea
                id="ref-social-caption"
                rows={2}
                value={customCaption}
                onChange={(e) => setCustomCaption(e.target.value)}
                placeholder={`Join the Tesla & SpaceX Executive Platform with my personal referral code ${referralCode} for priority reservations, TSLA shares & VIP passes: ${personalizedUrl}`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#040a18] border border-blue-900/70 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-400"
              />

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={xShareHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-[#040a18] border border-blue-800/70 hover:border-blue-400 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-300" />
                  <span>Share on X</span>
                </a>
                <a
                  href={linkedInShareHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-[#040a18] border border-blue-800/70 hover:border-blue-400 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-300" />
                  <span>Share on LinkedIn</span>
                </a>
                <a
                  href={whatsappShareHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-[#040a18] border border-emerald-700/60 hover:border-emerald-400 text-xs font-semibold text-emerald-200 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={facebookShareHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-[#040a18] border border-blue-800/70 hover:border-blue-400 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-300" />
                  <span>Facebook</span>
                </a>
                <a
                  href={mailtoShareHref}
                  className="px-3.5 py-2 rounded-lg bg-[#040a18] border border-blue-800/70 hover:border-blue-400 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Mail className="w-3.5 h-3.5 text-red-300" />
                  <span>Email Invite</span>
                </a>
                <button
                  type="button"
                  onClick={() => void handleNativeShare()}
                  className="px-3.5 py-2 rounded-lg bg-blue-600/25 border border-blue-500/50 hover:bg-blue-600/40 text-xs font-semibold text-blue-100 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Device Share</span>
                </button>
              </div>
            </div>
          </section>

          {/* Section 3: Successful Conversions & Referral Activity Ledger */}
          <section className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-mono text-blue-300">
                  Individual Conversion History
                </div>
                <h3 className="text-base font-bold text-white">
                  Successful Conversions &amp; Commission Ledger
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search buyer, order ID, item..."
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-[#040a18] border border-blue-900/70 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400 w-52"
                  />
                </div>

                <select
                  aria-label="Filter conversions by order category"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as ConversionTypeFilter)}
                  className="px-3 py-1.5 rounded-lg bg-[#040a18] border border-blue-900/70 text-xs text-white focus:outline-none focus:border-blue-400 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="vehicle">Vehicle Orders</option>
                  <option value="shares">TSLA Shares</option>
                  <option value="vip">VIP Passes</option>
                  <option value="merch">Merchandise</option>
                </select>
              </div>
            </div>

            {/* Segmented Status Filter Bar */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#040a18] border border-blue-900/70 w-fit">
              {[
                { id: 'all', label: `All Conversions (${memberConversions.length})` },
                { id: 'successful', label: `Successful (${successfulConversions.length})` },
                { id: 'pending', label: `Pending Review (${pendingConversions.length})` },
                { id: 'rejected', label: `Declined (${rejectedConversions.length})` },
              ].map((tab) => {
                const active = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id as ConversionStatusFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Conversions Table / List */}
            {filteredConversions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#08142b] border border-blue-900/60 text-center space-y-3">
                <div className="text-sm font-semibold text-white">
                  {memberConversions.length === 0
                    ? 'No Conversions Recorded for Your Referral Code Yet'
                    : 'No Conversions Match Current Filter'}
                </div>
                <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                  {memberConversions.length === 0
                    ? `Share your personalized link above with code ${referralCode}. Every completed vehicle order, TSLA stock purchase, VIP pass, or merchandise checkout earns ${commissionPercent}% commission once approved.`
                    : 'Try switching back to All Conversions or clearing your search query.'}
                </p>
                {memberConversions.length === 0 ? (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Link Copied' : 'Copy Personalized Referral Link'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all');
                      setTypeFilter('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-blue-900/50 rounded-2xl bg-[#08142b] border border-blue-900/60 overflow-hidden">
                {filteredConversions.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#0b1936]/70 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1 text-blue-200 font-semibold">
                          {renderTypeIcon(conv.orderType)}
                          <span>{formatOrderTypeLabel(conv.orderType)}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-blue-300 font-bold">{conv.orderId}</span>
                        <span aria-hidden="true">·</span>
                        <span>{conv.dateStr}</span>
                        {conv.approvedAt && conv.status === 'approved' && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-300">
                              Cleared {new Date(conv.approvedAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="font-semibold text-white text-sm truncate">
                        {conv.itemTitle}{' '}
                        <span className="font-normal text-slate-300">· Buyer: {conv.buyerName}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 font-mono tabular-nums">
                      <div className="text-left sm:text-right">
                        <div
                          className={`font-bold text-sm ${
                            conv.status === 'approved'
                              ? 'text-emerald-400'
                              : conv.status === 'rejected'
                              ? 'text-slate-400 line-through'
                              : 'text-blue-200'
                          }`}
                        >
                          +${conv.commissionEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {conv.commissionPercent}% of ${conv.orderAmount.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-semibold whitespace-nowrap">
                        {conv.status === 'approved' && (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Successful · Earned</span>
                          </span>
                        )}
                        {conv.status === 'pending_admin_approval' && (
                          <span className="text-amber-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending Approval</span>
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
          </section>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-blue-900/60 bg-[#050d20] flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <span className="font-mono text-slate-400 tabular-nums">
            Active Code: <strong className="text-white">{referralCode}</strong> · Commission Rate:{' '}
            <strong className="text-emerald-300">{commissionPercent}%</strong>
          </span>
          <div className="flex items-center gap-2">
            {onOpenCalculator && (
              <button
                type="button"
                onClick={onOpenCalculator}
                className="px-3.5 py-1.5 rounded-lg bg-[#08142b] border border-blue-800/70 hover:border-blue-400 text-blue-200 hover:text-white font-semibold cursor-pointer transition-colors whitespace-nowrap"
              >
                Commission Calculator
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#08142b] border border-blue-800/70 hover:border-blue-400 text-slate-200 hover:text-white font-semibold cursor-pointer transition-colors whitespace-nowrap"
            >
              Close Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
