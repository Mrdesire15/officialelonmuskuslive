import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Car, 
  CreditCard, 
  DollarSign, 
  Mail, 
  Send, 
  AlertTriangle, 
  Wind, 
  Zap, 
  Check, 
  Lock, 
  Eye, 
  EyeOff,
  Search, 
  FileText,
  Clock,
  Sparkles,
  Award,
  Trash2,
  TrendingUp,
  Percent,
  Building2,
  Wallet,
  Gift,
  HeartHandshake,
  Globe,
  Copy,
  QrCode,
  Maximize2,
  BookOpen
} from 'lucide-react';
import {
  TeslaOrder,
  TeslaVehicle,
  InAppInboxMessage,
  TeslaShareOrder,
  VipPassRequest,
  ReferralConversion,
  PaymentAccountRequest,
  AdminPaymentAccounts,
  CharityDonationRequest,
  CharitySupportRequest,
  CompanyWalletRecord,
  OfficialWalletSymbol,
  WalletLoadRequest,
} from '../types';
import {
  OFFICIAL_COMPANY_WALLETS,
  formatCompanyWalletsSummary,
  mergeCompanyWallets,
} from '../data/officialWallets';
import { REAL_CAR_ASSET_PRESETS } from '../data/teslaVehicles';
import {
  clearFailedAttempts,
  getLockoutStatus,
  recordFailedAttempt,
  verifyAdminPasscode,
  LOCKOUT_DURATION_MINUTES,
} from '../utils/securityLockout';
import { WalletQRCode, WalletScanModal } from './WalletQRCode';
import { CryptoPaymentGuideModal } from './CryptoPaymentGuideModal';

interface HiddenAdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminAuthenticated?: () => void;
  orders: TeslaOrder[];
  vehicles: TeslaVehicle[];
  customCars: TeslaVehicle[];
  inboxMessages: InAppInboxMessage[];
  shareOrders?: TeslaShareOrder[];
  vipRequests?: VipPassRequest[];
  referralConversions?: ReferralConversion[];
  commissionPercent?: number;
  onUpdateCommissionPercent?: (nextPercent: number) => void;
  onApproveReferral?: (conversionId: string) => void;
  onRejectReferral?: (conversionId: string) => void;
  paymentAccountRequests?: PaymentAccountRequest[];
  adminPaymentAccounts?: AdminPaymentAccounts;
  onIssuePaymentAccount?: (requestId: string, accountDetails: string) => void;
  onSaveAdminPaymentAccounts?: (nextAccounts: AdminPaymentAccounts) => void;
  onApprovePayment: (orderId: string, notes?: string) => void;
  onRejectPayment: (orderId: string, reason?: string) => void;
  onUpdateOrderStatus?: (orderId: string, nextStatus: TeslaOrder['status']) => void;
  onApproveShareOrder?: (orderId: string, notes?: string) => void;
  onRejectShareOrder?: (orderId: string, reason?: string) => void;
  onApproveVipRequest?: (ticketId: string, notes?: string) => void;
  onRejectVipRequest?: (ticketId: string, reason?: string) => void;
  onAddNewCar: (car: TeslaVehicle) => void;
  onDeleteCustomCar: (carId: string) => void;
  onSendAdminReply: (messageId: string, replyText: string) => void;
  onSendSystemBroadcast: (subject: string, body: string) => void;
  charityDonations?: CharityDonationRequest[];
  charitySupportRequests?: CharitySupportRequest[];
  onApproveCharityDonation?: (donationId: string, notes?: string) => void;
  onRejectCharityDonation?: (donationId: string, reason?: string) => void;
  onApproveCharitySupport?: (requestId: string, notes?: string, provisionedAccount?: string) => void;
  onRejectCharitySupport?: (requestId: string, reason?: string) => void;
  walletLoadRequests?: WalletLoadRequest[];
  memberWalletBalances?: Record<string, number>;
  onReviewWalletLoadRequest?: (
    requestId: string,
    nextStatus: 'approved' | 'held' | 'rejected',
    adminNotes?: string
  ) => void;
  onAdjustMemberWalletBalance?: (
    memberEmail: string,
    deltaUsd: number,
    walletSymbol: OfficialWalletSymbol,
    reason?: string
  ) => void;
}

export const HiddenAdminPortalModal: React.FC<HiddenAdminPortalModalProps> = ({
  isOpen,
  onClose,
  onAdminAuthenticated,
  orders,
  vehicles,
  customCars,
  inboxMessages,
  shareOrders = [],
  vipRequests = [],
  referralConversions = [],
  commissionPercent = 5,
  onUpdateCommissionPercent,
  onApproveReferral,
  onRejectReferral,
  paymentAccountRequests = [],
  adminPaymentAccounts = { wireDetails: '', giftCardInstructions: '', cryptoAddress: '' },
  onIssuePaymentAccount,
  onSaveAdminPaymentAccounts,
  onApprovePayment,
  onRejectPayment,
  onUpdateOrderStatus,
  onApproveShareOrder,
  onRejectShareOrder,
  onApproveVipRequest,
  onRejectVipRequest,
  onAddNewCar,
  onDeleteCustomCar,
  onSendAdminReply,
  onSendSystemBroadcast,
  charityDonations = [],
  charitySupportRequests = [],
  onApproveCharityDonation,
  onRejectCharityDonation,
  onApproveCharitySupport,
  onRejectCharitySupport,
  walletLoadRequests = [],
  memberWalletBalances = {},
  onReviewWalletLoadRequest,
  onAdjustMemberWalletBalance,
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'accounts' | 'add_car' | 'messages' | 'fleet' | 'referrals'>('approvals');
  const [approvalCategory, setApprovalCategory] = useState<'vehicles' | 'shares' | 'vip' | 'charity'>('vehicles');
  const [approvalNotes, setApprovalNotes] = useState<{ [orderId: string]: string }>({});
  const [shareApprovalNotes, setShareApprovalNotes] = useState<{ [orderId: string]: string }>({});
  const [vipApprovalNotes, setVipApprovalNotes] = useState<{ [ticketId: string]: string }>({});
  const [charityNotes, setCharityNotes] = useState<{ [id: string]: string }>({});
  const [supportAccountDrafts, setSupportAccountDrafts] = useState<{ [id: string]: string }>({});
  const [accountDrafts, setAccountDrafts] = useState<{ [reqId: string]: string }>({});
  const [wireDetailsInput, setWireDetailsInput] = useState<string>(adminPaymentAccounts.wireDetails || '');
  const [giftCardInstructionsInput, setGiftCardInstructionsInput] = useState<string>(adminPaymentAccounts.giftCardInstructions || '');
  const [cryptoAddressInput, setCryptoAddressInput] = useState<string>(adminPaymentAccounts.cryptoAddress || '');
  const [companyWalletsDraft, setCompanyWalletsDraft] = useState<CompanyWalletRecord[]>(() =>
    mergeCompanyWallets(adminPaymentAccounts.companyWallets)
  );
  const [walletReviewNotes, setWalletReviewNotes] = useState<{ [reqId: string]: string }>({});
  const [adjustMemberEmail, setAdjustMemberEmail] = useState<string>('');
  const [adjustAmountUsd, setAdjustAmountUsd] = useState<string>('500');
  const [adjustCurrency, setAdjustCurrency] = useState<OfficialWalletSymbol>('BTC');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustConfirmKeyword, setAdjustConfirmKeyword] = useState<string>('');
  const [walletApproveConfirmInputs, setWalletApproveConfirmInputs] = useState<{ [reqId: string]: string }>({});
  const [cryptoApprovalConfirmInputs, setCryptoApprovalConfirmInputs] = useState<{ [itemId: string]: string }>({});
  const [adjustSavedMsg, setAdjustSavedMsg] = useState<string | null>(null);
  const [accountsSavedBanner, setAccountsSavedBanner] = useState<boolean>(false);
  const [expandedQrWallet, setExpandedQrWallet] = useState<CompanyWalletRecord | null>(null);
  const [isCryptoGuideOpen, setIsCryptoGuideOpen] = useState<boolean>(false);
  const [copiedWalletSymbol, setCopiedWalletSymbol] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [approvalFilter, setApprovalFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [carAddedBanner, setCarAddedBanner] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [passcodeError, setPasscodeError] = useState<string>('');

  useEffect(() => {
    setWireDetailsInput(adminPaymentAccounts.wireDetails || '');
    setGiftCardInstructionsInput(adminPaymentAccounts.giftCardInstructions || '');
    setCryptoAddressInput(adminPaymentAccounts.cryptoAddress || '');
    setCompanyWalletsDraft(mergeCompanyWallets(adminPaymentAccounts.companyWallets));
  }, [
    adminPaymentAccounts.wireDetails,
    adminPaymentAccounts.giftCardInstructions,
    adminPaymentAccounts.cryptoAddress,
    adminPaymentAccounts.companyWallets,
  ]);

  useEffect(() => {
    if (!isOpen) {
      setIsAuthenticated(false);
      setPasscodeInput('');
      setPasscodeError('');
      setShowPasscode(false);
      setIsCryptoGuideOpen(false);
    }
  }, [isOpen]);

  // New Car Listing Form State
  const [newCarName, setNewCarName] = useState('');
  const [newCarTagline, setNewCarTagline] = useState('');
  const [newCarBasePrice, setNewCarBasePrice] = useState<number>(89990);
  const [newCarMinDeposit, setNewCarMinDeposit] = useState<number>(17998);
  const [newCarIsFlying, setNewCarIsFlying] = useState<boolean>(false);
  const [newCarAcceleration, setNewCarAcceleration] = useState('2.5 s (0–60 MPH)');
  const [newCarTopSpeed, setNewCarTopSpeed] = useState('163 MPH');
  const [newCarRange, setNewCarRange] = useState('345 Miles');
  const [newCarPowertrain, setNewCarPowertrain] = useState('Tri-Motor All-Wheel Drive');
  const [newCarImage, setNewCarImage] = useState(REAL_CAR_ASSET_PRESETS[0].src);
  const [newCarDelivery, setNewCarDelivery] = useState('Factory Priority Allocation · 2–4 Weeks');
  const [newCarDescription, setNewCarDescription] = useState(
    'Production electric vehicle engineered at Tesla Gigafactory with tri-motor torque vectoring, adaptive air suspension, and full HW4 safety suite.'
  );

  if (!isOpen) return null;

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (getLockoutStatus().isLocked) {
      onClose();
      return;
    }

    const valid = await verifyAdminPasscode(passcodeInput);
    if (valid) {
      clearFailedAttempts();
      setIsAuthenticated(true);
      setPasscodeError('');
      onAdminAuthenticated?.();
    } else {
      const status = recordFailedAttempt();
      if (status.isLocked) {
        onClose();
        return;
      }
      const attemptsWord = status.remainingAttempts === 1 ? 'attempt' : 'attempts';
      setPasscodeError(
        `Incorrect executive passcode. Access denied. (${status.remainingAttempts} ${attemptsWord} remaining before a ${LOCKOUT_DURATION_MINUTES}-minute site lockout.)`
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/90 backdrop-blur-md p-4 animate-fadeIn">
        <div className="w-full max-w-md rounded-2xl bg-[#061024] border border-red-500/55 shadow-2xl overflow-hidden text-slate-100">
          <div className="p-5 bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#2a0b16] border-b border-blue-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-red-300 font-bold uppercase tracking-wider">
                  Restricted Executive Access
                </div>
                <h3 className="font-display font-black text-base text-white">
                  Elon Musk Management Verification
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Elon Musk Management Verification"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="p-6 space-y-5">
            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your Elon Musk Management passcode to unlock vehicle listings, payment approvals, and direct inbox management.
            </p>

            <div className="space-y-2">
              <label htmlFor="admin-passcode-input" className="text-xs font-mono font-bold text-blue-200 block">
                Elon Musk Management Passcode
              </label>
              <div className="relative">
                <input
                  id="admin-passcode-input"
                  type={showPasscode ? 'text' : 'password'}
                  inputMode="numeric"
                  autoFocus
                  required
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    if (passcodeError) setPasscodeError('');
                  }}
                  placeholder="Enter passcode..."
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#040a18] border border-blue-900/70 text-sm font-mono tabular-nums text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode((prev) => !prev)}
                  aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passcodeError && (
                <div className="text-xs font-mono text-red-300 bg-red-950/50 border border-red-500/40 rounded-lg px-3 py-2 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{passcodeError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#08142b] border border-blue-900/60 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock Elon Musk Management Portal</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => !o.paymentStatus || o.paymentStatus === 'pending_admin_approval');
  const approvedOrders = orders.filter((o) => o.paymentStatus === 'approved');
  const rejectedOrders = orders.filter((o) => o.paymentStatus === 'rejected');

  const pendingShareOrders = shareOrders.filter((s) => !s.paymentStatus || s.paymentStatus === 'pending_admin_approval');
  const approvedShareOrders = shareOrders.filter((s) => s.paymentStatus === 'approved');
  const rejectedShareOrders = shareOrders.filter((s) => s.paymentStatus === 'rejected');

  const pendingVipRequests = vipRequests.filter((v) => !v.status || v.status === 'pending_admin_approval');
  const approvedVipRequests = vipRequests.filter((v) => v.status === 'approved');
  const rejectedVipRequests = vipRequests.filter((v) => v.status === 'rejected');

  const pendingReferrals = referralConversions.filter((r) => r.status === 'pending_admin_approval');
  const approvedReferrals = referralConversions.filter((r) => r.status === 'approved');
  const pendingAccountRequests = paymentAccountRequests.filter((r) => r.status === 'pending_admin');
  const pendingWalletLoads = walletLoadRequests.filter((w) => w.status === 'pending_approval');
  const totalApprovedCommission = approvedReferrals.reduce((sum, r) => sum + r.commissionEarned, 0);
  const totalPendingCommission = pendingReferrals.reduce((sum, r) => sum + r.commissionEarned, 0);

  const pendingCharityDonations = charityDonations.filter((d) => !d.status || d.status === 'pending_admin_approval');
  const approvedCharityDonations = charityDonations.filter((d) => d.status === 'approved');
  const pendingCharitySupport = charitySupportRequests.filter((s) => !s.status || s.status === 'pending_admin_approval');
  const approvedCharitySupport = charitySupportRequests.filter((s) => s.status === 'approved');
  const pendingCharityTotal = pendingCharityDonations.length + pendingCharitySupport.length;

  const totalPending =
    pendingOrders.length + pendingShareOrders.length + pendingVipRequests.length + pendingCharityTotal;

  const filteredCharityDonations = charityDonations.filter((d) => {
    if (approvalFilter === 'pending') return !d.status || d.status === 'pending_admin_approval';
    if (approvalFilter === 'approved') return d.status === 'approved';
    if (approvalFilter === 'rejected') return d.status === 'rejected';
    return true;
  });

  const filteredCharitySupport = charitySupportRequests.filter((s) => {
    if (approvalFilter === 'pending') return !s.status || s.status === 'pending_admin_approval';
    if (approvalFilter === 'approved') return s.status === 'approved';
    if (approvalFilter === 'rejected') return s.status === 'rejected';
    return true;
  });

  const filteredOrders = orders.filter((o) => {
    if (approvalFilter === 'pending') return !o.paymentStatus || o.paymentStatus === 'pending_admin_approval';
    if (approvalFilter === 'approved') return o.paymentStatus === 'approved';
    if (approvalFilter === 'rejected') return o.paymentStatus === 'rejected';
    return true;
  });

  const filteredShareOrders = shareOrders.filter((s) => {
    if (approvalFilter === 'pending') return !s.paymentStatus || s.paymentStatus === 'pending_admin_approval';
    if (approvalFilter === 'approved') return s.paymentStatus === 'approved';
    if (approvalFilter === 'rejected') return s.paymentStatus === 'rejected';
    return true;
  });

  const filteredVipRequests = vipRequests.filter((v) => {
    if (approvalFilter === 'pending') return !v.status || v.status === 'pending_admin_approval';
    if (approvalFilter === 'approved') return v.status === 'approved';
    if (approvalFilter === 'rejected') return v.status === 'rejected';
    return true;
  });

  const handleCreateCarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCarName.trim()) return;

    const carId = `tesla-custom-${Date.now()}`;
    const newVehicle: TeslaVehicle = {
      id: carId,
      name: newCarName.trim(),
      modelCode: `CUSTOM-${Date.now().toString().slice(-4)}`,
      tagline: newCarTagline.trim() || 'Custom Engineered Tesla Aerocraft',
      basePrice: Number(newCarBasePrice) || 89990,
      destinationFee: 1640,
      minDeposit: Number(newCarMinDeposit) || Math.round((Number(newCarBasePrice) || 89990) * 0.20),
      maxPrice: (Number(newCarBasePrice) || 120000) * 1.35,
      isFlyingCar: newCarIsFlying,
      image: newCarImage.trim() || REAL_CAR_ASSET_PRESETS[0].src,
      acceleration: newCarAcceleration.trim() || '2.5 s (0–60 MPH)',
      topSpeed: newCarTopSpeed.trim() || '163 MPH',
      range: newCarRange.trim() || '345 Miles',
      powertrain: newCarPowertrain.trim() || 'Tri-Motor AWD',
      description: newCarDescription.trim() || 'Custom Tesla model.',
      popular: true,
      deliveryEstimate: newCarDelivery.trim() || 'Delivery Q4 2026',
      colors: [
        { name: 'American Patriotic Red', hex: '#dc2626', price: 0 },
        { name: 'Cobalt Freedom Blue', hex: '#2563eb', price: 2000 },
        { name: 'Ultra Polar White', hex: '#ffffff', price: 1500 },
        { name: 'Midnight Deep Slate', hex: '#0f172a', price: 1500 },
      ],
      wheels: [
        { name: '21" Turbofan Aero Forged Wheels', size: '21"', price: 0 },
        { name: '22" Cyber Monoblock Carbon Wheels', size: '22"', price: 4500 },
      ],
      interiorColors: [
        { name: 'White & Slate Minimalist Cockpit', hex: '#f8fafc', price: 0 },
        { name: 'Deep Crimson & Carbon Trim', hex: '#450a0a', price: 2500 },
      ],
      packages: [
        {
          id: `pkg-${Date.now()}-thrust`,
          name: 'SpaceX Cold-Gas Thruster Vector Package',
          price: 35000,
          description: 'High-pressure COPV cold gas thrusters with multi-axis reaction control.',
          isFlightPackage: true,
        },
      ],
    };

    onAddNewCar(newVehicle);
    setCarAddedBanner(`"${newVehicle.name}" successfully added to the active Tesla Showroom.`);
    setNewCarName('');
    setNewCarTagline('');
    setActiveTab('fleet');
  };

  const handleAdminReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedMessageId) return;
    onSendAdminReply(selectedMessageId, adminReplyText.trim());
    setAdminReplyText('');
  };

  const selectedMessage = inboxMessages.find((m) => m.id === selectedMessageId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-5xl h-[88vh] max-h-[820px] rounded-2xl bg-[#061024] border border-red-500/55 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* US Patriotic Admin Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#2a0b16] border-b border-blue-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-red-600/20">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-600/30 text-red-200 border border-red-500/50 font-bold uppercase tracking-wider">
                  ELON MUSK MANAGEMENT PORTAL
                </span>
                <span className="text-xs font-mono text-blue-300">USA Executive Terminal</span>
              </div>
              <h3 className="font-display font-black text-lg text-white tracking-wide">
                Tesla & SpaceX Central Management Console
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsCryptoGuideOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#08142b] border border-blue-500/50 hover:border-emerald-400 text-blue-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Crypto Payment Guide</span>
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Elon Musk Management Live</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-blue-900/60 bg-[#050d20] flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'approvals'
                ? 'border-red-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4 text-red-400" />
            <span>Payment & Order Approvals</span>
            {totalPending > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-mono tabular-nums font-bold">
                {totalPending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('add_car')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'add_car'
                ? 'border-blue-400 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Add New Car Listing</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'messages'
                ? 'border-red-400 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4 text-red-400" />
            <span>In-App Messages ({inboxMessages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'fleet'
                ? 'border-blue-400 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-4 h-4 text-blue-300" />
            <span>Fleet Models ({vehicles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'accounts'
                ? 'border-blue-400 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Wallets &amp; Accounts</span>
            {pendingAccountRequests.length + pendingWalletLoads.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-mono tabular-nums font-bold">
                {pendingAccountRequests.length + pendingWalletLoads.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'referrals'
                ? 'border-emerald-400 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Percent className="w-4 h-4 text-emerald-400" />
            <span>Referrals ({referralConversions.length})</span>
            {pendingReferrals.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-mono tabular-nums font-bold">
                {pendingReferrals.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Payment & Order Approvals Desk */}
        {activeTab === 'approvals' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* Subcategory Toggle: Vehicles vs TSLA Shares vs VIP Passes */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-[#040a18] border border-blue-900/60">
              <button
                type="button"
                onClick={() => setApprovalCategory('vehicles')}
                className={`flex-1 min-w-[160px] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  approvalCategory === 'vehicles'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Vehicle Fleet Orders ({orders.length})</span>
                {pendingOrders.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-950 text-white font-mono tabular-nums font-bold">
                    {pendingOrders.length} pending
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setApprovalCategory('shares')}
                className={`flex-1 min-w-[160px] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  approvalCategory === 'shares'
                    ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>TSLA Direct Shares ({shareOrders.length})</span>
                {pendingShareOrders.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-950 border border-blue-400/50 text-blue-200 font-mono tabular-nums font-bold">
                    {pendingShareOrders.length} pending
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setApprovalCategory('vip')}
                className={`flex-1 min-w-[160px] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  approvalCategory === 'vip'
                    ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>VIP Pass Requests ({vipRequests.length})</span>
                {pendingVipRequests.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-950 border border-red-400/50 text-red-200 font-mono tabular-nums font-bold">
                    {pendingVipRequests.length} pending
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setApprovalCategory('charity')}
                className={`flex-1 min-w-[170px] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  approvalCategory === 'charity'
                    ? 'bg-gradient-to-r from-rose-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Charity &amp; Support ({charityDonations.length + charitySupportRequests.length})</span>
                {pendingCharityTotal > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-950 border border-rose-400/50 text-rose-200 font-mono tabular-nums font-bold">
                    {pendingCharityTotal} pending
                  </span>
                )}
              </button>
            </div>

            {/* Summary Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-red-950/35 border border-red-500/45">
                <div className="text-[10px] uppercase font-mono text-red-300 font-bold">
                  Pending Elon Musk Management Approval
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
                  {approvalCategory === 'vehicles'
                    ? pendingOrders.length
                    : approvalCategory === 'shares'
                    ? pendingShareOrders.length
                    : approvalCategory === 'vip'
                    ? pendingVipRequests.length
                    : pendingCharityTotal}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {approvalCategory === 'vehicles'
                    ? 'Direct payment review required before VIN allocation'
                    : approvalCategory === 'shares'
                    ? 'Review incoming wire/ACH to issue Delaware share certificate'
                    : approvalCategory === 'vip'
                    ? 'Review VIP Greet & Meet clearance and plaque issuance'
                    : 'Charity NGO donations & war/terrorism support requests awaiting approval'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-950/35 border border-blue-500/45">
                <div className="text-[10px] uppercase font-mono text-blue-300 font-bold">
                  Approved & Allocated
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
                  {approvalCategory === 'vehicles'
                    ? approvedOrders.length
                    : approvalCategory === 'shares'
                    ? approvedShareOrders.length
                    : approvalCategory === 'vip'
                    ? approvedVipRequests.length
                    : approvedCharityDonations.length + approvedCharitySupport.length}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Verified orders with dispatched in-app notifications
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60">
                <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                  {approvalCategory === 'vehicles'
                    ? 'Total Fleet Orders'
                    : approvalCategory === 'shares'
                    ? 'Total TSLA Share Allocations'
                    : approvalCategory === 'vip'
                    ? 'Total VIP Pass Requests'
                    : 'Total Charity & Support Filings'}
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
                  {approvalCategory === 'vehicles'
                    ? orders.length
                    : approvalCategory === 'shares'
                    ? shareOrders.length
                    : vipRequests.length}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {approvalCategory === 'vehicles'
                    ? 'Total gross revenue across fleet pre-orders'
                    : approvalCategory === 'shares'
                    ? 'Gross treasury capital across equity tranches'
                    : 'Executive VIP Greet & Meet security clearances'}
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/60">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setApprovalFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    approvalFilter === 'pending'
                      ? 'bg-red-600 text-white'
                      : 'bg-[#08142b] border border-blue-900/50 text-slate-300 hover:text-white'
                  }`}
                >
                  Pending Review ({approvalCategory === 'vehicles' ? pendingOrders.length : approvalCategory === 'shares' ? pendingShareOrders.length : pendingVipRequests.length})
                </button>
                <button
                  onClick={() => setApprovalFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    approvalFilter === 'approved'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#08142b] border border-blue-900/50 text-slate-300 hover:text-white'
                  }`}
                >
                  Approved ({approvalCategory === 'vehicles' ? approvedOrders.length : approvalCategory === 'shares' ? approvedShareOrders.length : approvedVipRequests.length})
                </button>
                <button
                  onClick={() => setApprovalFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    approvalFilter === 'all'
                      ? 'bg-blue-800 text-white'
                      : 'bg-[#08142b] border border-blue-900/50 text-slate-300 hover:text-white'
                  }`}
                >
                  All ({approvalCategory === 'vehicles' ? orders.length : approvalCategory === 'shares' ? shareOrders.length : vipRequests.length})
                </button>
              </div>

              <div className="text-xs font-mono text-blue-300">
                Auto-dispatches in-app inbox confirmation on approval
              </div>
            </div>

            {/* Vehicle Orders View */}
            {approvalCategory === 'vehicles' && (
              <div>
                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-[#08142b] border border-blue-900/60 text-slate-400 text-xs">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
                    No vehicle orders matching the &ldquo;{approvalFilter}&rdquo; filter currently.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => {
                      const isPending = !order.paymentStatus || order.paymentStatus === 'pending_admin_approval';
                      const isApproved = order.paymentStatus === 'approved';
                      const isRejected = order.paymentStatus === 'rejected';

                      return (
                        <div
                          key={order.orderId}
                          className={`p-5 rounded-2xl border transition-all ${
                            isPending
                              ? 'bg-gradient-to-r from-red-950/25 via-blue-950/25 to-[#08142b] border-red-500/50 shadow-lg'
                              : isApproved
                              ? 'bg-[#08142b] border-blue-500/40'
                              : 'bg-[#050d20] border-blue-900/50'
                          }`}
                        >
                          {/* Order Header Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-900/50">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-blue-300">
                                  {order.orderId}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {order.orderDate}
                                </span>
                                {order.isFlyingCar && (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-red-600/20 text-red-300 border border-red-500/40">
                                    Flying Roadster / VTOL
                                  </span>
                                )}
                                {order.itemCategory === 'merch' && (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-blue-600/25 text-blue-200 border border-blue-500/40">
                                    Official Merchandise
                                  </span>
                                )}
                              </div>
                              <h4 className="font-display font-bold text-base text-white mt-0.5">
                                {order.vehicleName}
                              </h4>
                              {order.itemCategory === 'merch' && (
                                <p className="text-[11px] font-mono text-slate-300 mt-0.5">
                                  {order.merchQualityTier} · Size: {order.merchSize} · Qty: {order.merchQuantity || 1}
                                </p>
                              )}
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2">
                              {isPending && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-red-600/30 text-red-200 border border-red-500 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Pending Elon Musk Management Approval
                                </span>
                              )}
                              {isApproved && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {order.itemCategory === 'merch' ? 'Payment Approved & Confirmed' : 'Payment Approved & VIN Allocated'}
                                </span>
                              )}
                              {isRejected && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Payment Rejected
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Detail Grid */}
                          <div className="py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase block">Customer</span>
                              <span className="text-white font-sans font-semibold">{order.customerName}</span>
                              <span className="text-slate-400 text-[11px] block">{order.customerEmail}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase block">
                                {order.itemCategory === 'merch' ? 'Amount Paid' : 'Amount Paid (Deposit)'}
                              </span>
                              <span className="text-white tabular-nums font-bold text-sm block">
                                ${order.amountPaidToday.toLocaleString()}
                              </span>
                              <span className="text-slate-400 tabular-nums text-[11px]">
                                Total Price: ${order.totalPrice.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase block">Payment Method</span>
                              <span className="text-blue-300 font-sans font-medium capitalize">
                                {order.paymentMethod || 'Credit / Escrow'}
                              </span>
                              <span className="text-slate-400 text-[11px] block">
                                {order.itemCategory === 'merch' ? 'SKU' : 'VIN'}: {order.reservationVin}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase block">Destination</span>
                              <span className="text-slate-200 truncate block">
                                {order.deliveryAddress || order.city || 'Austin, TX'}
                              </span>
                              <span className="text-slate-400 text-[11px]">Est: {order.estimatedDelivery}</span>
                            </div>
                          </div>

                          {(order.giftCardType || (order.giftCardPhotos && order.giftCardPhotos.length > 0)) && (
                            <div className="p-3 rounded-xl bg-[#040a18] border border-amber-500/40 space-y-2 text-xs">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-bold text-amber-300 font-mono">
                                  Gift Card Submitted: {order.giftCardType || 'Gift Card'}
                                  {order.giftCardFormat ? ` (${order.giftCardFormat === 'ecode' ? 'e-Code' : 'Physical'})` : ''}
                                  {order.giftCardFaceValue ? ` · $${order.giftCardFaceValue.toLocaleString()}` : ''}
                                  {order.giftCardCodeLast4 ? ` · Ends in ${order.giftCardCodeLast4}` : ''}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {order.giftCardPhotos?.length || 0} photo(s) attached
                                </span>
                              </div>
                              {order.giftCardPhotos && order.giftCardPhotos.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {order.giftCardPhotos.map((p) => (
                                    <div
                                      key={p.id}
                                      className="p-1 rounded-lg bg-[#08142b] border border-blue-900/70 flex items-center gap-2"
                                    >
                                      <img
                                        src={p.dataUrl}
                                        alt={p.label}
                                        className="w-10 h-10 rounded object-cover"
                                      />
                                      <div className="pr-1.5">
                                        <div className="text-[10px] font-bold text-white">{p.label}</div>
                                        <div className="text-[9px] font-mono text-slate-400 max-w-[90px] truncate">{p.fileName}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Admin Decision Actions */}
                          {isPending ? (
                            <div className="pt-3 border-t border-blue-900/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                              <div className="flex-1 max-w-md">
                                <input
                                  type="text"
                                  placeholder="Optional approval note (included in visitor's in-app inbox)..."
                                  value={approvalNotes[order.orderId] || ''}
                                  onChange={(e) =>
                                    setApprovalNotes({ ...approvalNotes, [order.orderId]: e.target.value })
                                  }
                                  className="w-full px-3 py-1.5 rounded-lg bg-[#040a18] border border-blue-900/70 text-xs text-white focus:outline-none focus:border-blue-400 placeholder:text-slate-500"
                                />
                              </div>

                               <div className="flex flex-wrap items-center gap-2">
                                 {order.paymentMethod === 'crypto' && (
                                   <input
                                     type="text"
                                     value={cryptoApprovalConfirmInputs[order.orderId] || ''}
                                     onChange={(e) =>
                                       setCryptoApprovalConfirmInputs((prev) => ({
                                         ...prev,
                                         [order.orderId]: e.target.value,
                                       }))
                                     }
                                     aria-label={`Type CONFIRM to finalize crypto order ${order.orderId}`}
                                     placeholder="Type CONFIRM..."
                                     className={`w-36 px-2.5 py-2 rounded-xl bg-[#040a18] border text-xs font-mono tracking-wider text-white placeholder:text-slate-500 focus:outline-none ${
                                       (cryptoApprovalConfirmInputs[order.orderId] || '').trim() === 'CONFIRM'
                                         ? 'border-emerald-500/70 focus:border-emerald-400'
                                         : 'border-amber-500/45 focus:border-blue-400'
                                     }`}
                                   />
                                 )}
                                 <button
                                   onClick={() => {
                                     onRejectPayment(order.orderId, approvalNotes[order.orderId]);
                                   }}
                                   className="px-3.5 py-2 rounded-xl bg-[#040a18] border border-blue-900/70 hover:border-red-500/50 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                                 >
                                   Reject Payment
                                 </button>
                                 <button
                                   disabled={
                                     order.paymentMethod === 'crypto' &&
                                     (cryptoApprovalConfirmInputs[order.orderId] || '').trim() !== 'CONFIRM'
                                   }
                                   onClick={() => {
                                     onApprovePayment(order.orderId, approvalNotes[order.orderId]);
                                     if (order.paymentMethod === 'crypto') {
                                       setCryptoApprovalConfirmInputs((prev) => ({ ...prev, [order.orderId]: '' }));
                                     }
                                   }}
                                   className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                                 >
                                   <Check className="w-4 h-4 stroke-[3]" />
                                   <span>
                                     {order.paymentMethod === 'crypto'
                                       ? 'Confirm Payment & Approve'
                                       : 'Approve Payment & Confirm Allocation'}
                                   </span>
                                 </button>
                               </div>
                            </div>
                          ) : (
                            <div className="pt-2.5 border-t border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                              <span className="truncate">
                                {order.approvalNotes ? `Elon Musk Management Note: ${order.approvalNotes}` : 'Approved by Elon Musk Official Management Table'}
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                {isApproved && onUpdateOrderStatus && (
                                  <label className="flex items-center gap-1.5 text-slate-300">
                                    <span className="text-[10px] text-blue-300 uppercase">Stage:</span>
                                    <select
                                      value={order.status}
                                      onChange={(e) => onUpdateOrderStatus(order.orderId, e.target.value)}
                                      className="px-2 py-1 rounded-lg bg-[#040a18] border border-blue-700/70 text-[11px] text-white focus:outline-none focus:border-blue-400 cursor-pointer"
                                    >
                                      <option value="Production Scheduled">1. Production Scheduled</option>
                                      <option value="Factory Assembly">2. Factory Assembly</option>
                                      <option value="Quality Inspection">3. Quality Inspection</option>
                                      <option value="In Transit">4. In Transit</option>
                                      <option value="Delivered">5. Delivered</option>
                                    </select>
                                  </label>
                                )}
                                <span className="text-blue-300">
                                  {order.approvedAt ? `Verified: ${new Date(order.approvedAt).toLocaleDateString()}` : 'Dispatched'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TSLA Share Allocations View */}
            {approvalCategory === 'shares' && (
              <div>
                {filteredShareOrders.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-[#08142b] border border-blue-900/60 text-slate-400 text-xs">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
                    No TSLA share orders matching the &ldquo;{approvalFilter}&rdquo; filter currently.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredShareOrders.map((shareOrder) => {
                      const isPending = !shareOrder.paymentStatus || shareOrder.paymentStatus === 'pending_admin_approval';
                      const isApproved = shareOrder.paymentStatus === 'approved';
                      const isRejected = shareOrder.paymentStatus === 'rejected';

                      return (
                        <div
                          key={shareOrder.orderId}
                          className={`p-5 rounded-2xl border transition-all ${
                            isPending
                              ? 'bg-gradient-to-r from-blue-950/30 via-[#08142b] to-red-950/25 border-blue-500/55 shadow-lg'
                              : isApproved
                              ? 'bg-[#08142b] border-blue-500/40'
                              : 'bg-[#050d20] border-blue-900/50'
                          }`}
                        >
                          {/* Share Order Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-900/50">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-blue-300">
                                  {shareOrder.orderId}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  Cert #{shareOrder.certificateNumber} · {shareOrder.orderDate}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                  NASDAQ: TSLA Common Stock
                                </span>
                              </div>
                              <h4 className="font-display font-bold text-base text-white mt-0.5 flex items-center gap-2">
                                <span>{shareOrder.shareQuantity.toLocaleString()} Shares of Tesla, Inc.</span>
                                <span className="text-red-300 font-mono tabular-nums text-sm">
                                  (${shareOrder.totalInvestment.toLocaleString()} USD)
                                </span>
                              </h4>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2">
                              {isPending && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-red-600/25 text-red-200 border border-red-500 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Pending Treasury Wire Verification
                                </span>
                              )}
                              {isApproved && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  DRS Certificate Issued & Allocated
                                </span>
                              )}
                              {isRejected && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Allocation Rejected
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Share Order Details Grid */}
                          <div className="py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase block">Beneficial Investor</span>
                              <span className="text-white font-sans font-semibold">{shareOrder.investorName}</span>
                              <span className="text-slate-400 text-[11px] block">{shareOrder.investorEmail}</span>
                              {shareOrder.entityName && (
                                <span className="text-blue-300 text-[10px] block">Entity: {shareOrder.entityName}</span>
                              )}
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase block">Allotment & Value</span>
                              <span className="text-white tabular-nums font-bold text-sm block">
                                {shareOrder.shareQuantity} Units @ ${shareOrder.sharePrice.toFixed(2)}
                              </span>
                              <span className="text-slate-400 tabular-nums text-[11px]">
                                Total Outlay: ${shareOrder.totalInvestment.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase block">Custody Method</span>
                              <span className="text-blue-300 font-sans font-medium capitalize block">
                                {shareOrder.custodyType === 'drs_computershare'
                                  ? 'Direct DRS (Computershare)'
                                  : shareOrder.custodyType === 'dtc_broker'
                                  ? `DTC Broker (${shareOrder.brokerDtcNumber || 'Participant'})`
                                  : 'Vault Archival Cert'}
                              </span>
                              <span className="text-slate-400 text-[11px] block">
                                Tax ID: {shareOrder.taxIdMasked || '***-**-8921'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase block">Settlement Method</span>
                              <span className="text-slate-200 capitalize font-bold block">
                                {shareOrder.paymentMethod.toUpperCase()} Settlement
                              </span>
                              <span className="text-emerald-400 text-[11px]">Transfer Duty: $0.00</span>
                            </div>
                          </div>

                          {/* Action Row */}
                          {isPending ? (
                            <div className="pt-3 border-t border-blue-900/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                              <div className="flex-1 max-w-md">
                                <input
                                  type="text"
                                  placeholder="Optional approval note (included in visitor's in-app certificate notification)..."
                                  value={shareApprovalNotes[shareOrder.orderId] || ''}
                                  onChange={(e) =>
                                    setShareApprovalNotes({ ...shareApprovalNotes, [shareOrder.orderId]: e.target.value })
                                  }
                                  className="w-full px-3 py-1.5 rounded-lg bg-[#040a18] border border-blue-900/70 text-xs text-white focus:outline-none focus:border-blue-400 placeholder:text-slate-500"
                                />
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {shareOrder.paymentMethod === 'crypto' && (
                                  <input
                                    type="text"
                                    value={cryptoApprovalConfirmInputs[shareOrder.orderId] || ''}
                                    onChange={(e) =>
                                      setCryptoApprovalConfirmInputs((prev) => ({
                                        ...prev,
                                        [shareOrder.orderId]: e.target.value,
                                      }))
                                    }
                                    aria-label={`Type CONFIRM to finalize crypto share order ${shareOrder.orderId}`}
                                    placeholder="Type CONFIRM..."
                                    className={`w-36 px-2.5 py-2 rounded-xl bg-[#040a18] border text-xs font-mono tracking-wider text-white placeholder:text-slate-500 focus:outline-none ${
                                      (cryptoApprovalConfirmInputs[shareOrder.orderId] || '').trim() === 'CONFIRM'
                                        ? 'border-emerald-500/70 focus:border-emerald-400'
                                        : 'border-amber-500/45 focus:border-blue-400'
                                    }`}
                                  />
                                )}
                                <button
                                  onClick={() => {
                                    if (onRejectShareOrder) {
                                      onRejectShareOrder(shareOrder.orderId, shareApprovalNotes[shareOrder.orderId]);
                                    }
                                  }}
                                  className="px-3.5 py-2 rounded-xl bg-[#040a18] border border-blue-900/70 hover:border-red-500/50 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                                >
                                  Reject Allocation
                                </button>
                                <button
                                  disabled={
                                    shareOrder.paymentMethod === 'crypto' &&
                                    (cryptoApprovalConfirmInputs[shareOrder.orderId] || '').trim() !== 'CONFIRM'
                                  }
                                  onClick={() => {
                                    if (onApproveShareOrder) {
                                      onApproveShareOrder(shareOrder.orderId, shareApprovalNotes[shareOrder.orderId]);
                                      if (shareOrder.paymentMethod === 'crypto') {
                                        setCryptoApprovalConfirmInputs((prev) => ({
                                          ...prev,
                                          [shareOrder.orderId]: '',
                                        }));
                                      }
                                    }
                                  }}
                                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                  <span>
                                    {shareOrder.paymentMethod === 'crypto'
                                      ? 'Confirm Payment & Approve Shares'
                                      : 'Approve Share Allocation & Issue Certificate'}
                                  </span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-blue-900/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                              <span>
                                {shareOrder.approvalNotes ? `Elon Musk Management Note: ${shareOrder.approvalNotes}` : 'Approved by Elon Musk Official Management Table'}
                              </span>
                              <span className="text-blue-300">
                                {shareOrder.approvedAt ? `Executed: ${new Date(shareOrder.approvedAt).toLocaleDateString()}` : 'Dispatched to In-App Inbox'}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIP Pass Requests View */}
            {approvalCategory === 'vip' && (
              <div>
                {filteredVipRequests.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-[#08142b] border border-blue-900/60 text-slate-400 text-xs">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
                    No VIP Pass requests matching the &ldquo;{approvalFilter}&rdquo; filter currently.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredVipRequests.map((vipReq) => {
                      const isPending = !vipReq.status || vipReq.status === 'pending_admin_approval';
                      const isApproved = vipReq.status === 'approved';
                      const isRejected = vipReq.status === 'rejected';

                      return (
                        <div
                          key={vipReq.ticketId}
                          className={`p-5 rounded-2xl border transition-all ${
                            isPending
                              ? 'bg-gradient-to-r from-red-950/25 via-blue-950/25 to-[#08142b] border-red-500/50 shadow-lg'
                              : isApproved
                              ? 'bg-[#08142b] border-blue-500/40'
                              : 'bg-[#050d20] border-blue-900/50'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-900/50">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-blue-300">
                                  {vipReq.ticketId}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {vipReq.orderDate}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-red-600/20 text-red-200 border border-red-500/40">
                                  {vipReq.tier.toUpperCase()} PLAQUE
                                </span>
                              </div>
                              <h4 className="font-display font-bold text-base text-white mt-0.5">
                                {vipReq.tierName} · ${vipReq.price.toLocaleString()} USD
                              </h4>
                            </div>

                            <div className="flex items-center gap-2">
                              {isPending && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-red-600/30 text-red-200 border border-red-500 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Pending Elon Musk Management Approval
                                </span>
                              )}
                              {isApproved && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  VIP Clearance Approved
                                </span>
                              )}
                              {isRejected && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Request Declined
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase block">Guest Name</span>
                              <span className="text-white font-sans font-semibold">{vipReq.guestName}</span>
                              <span className="text-slate-400 text-[11px] block">{vipReq.email}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase block">Organization</span>
                              <span className="text-slate-200 font-sans font-medium block">
                                {vipReq.organization || 'Independent Delegate'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase block">Meeting Purpose</span>
                              <span className="text-blue-300 capitalize block">{vipReq.purpose.replace('-', ' ')}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase block">Preferred Date</span>
                              <span className="text-white tabular-nums block">{vipReq.preferredDate}</span>
                            </div>
                          </div>

                          {isPending ? (
                            <div className="pt-3 border-t border-blue-900/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                              <div className="flex-1 max-w-md">
                                <input
                                  type="text"
                                  placeholder="Optional security clearance note (sent to visitor's in-app inbox)..."
                                  value={vipApprovalNotes[vipReq.ticketId] || ''}
                                  onChange={(e) =>
                                    setVipApprovalNotes({ ...vipApprovalNotes, [vipReq.ticketId]: e.target.value })
                                  }
                                  className="w-full px-3 py-1.5 rounded-lg bg-[#040a18] border border-blue-900/70 text-xs text-white focus:outline-none focus:border-blue-400 placeholder:text-slate-500"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onRejectVipRequest?.(vipReq.ticketId, vipApprovalNotes[vipReq.ticketId])}
                                  className="px-3.5 py-2 rounded-xl bg-[#040a18] border border-blue-900/70 hover:border-red-500/50 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                                >
                                  Reject Request
                                </button>
                                <button
                                  onClick={() => onApproveVipRequest?.(vipReq.ticketId, vipApprovalNotes[vipReq.ticketId])}
                                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                  <span>Approve VIP Pass & Dispatch Clearance</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-blue-900/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                              <span>
                                {vipReq.approvalNotes ? `Elon Musk Management Note: ${vipReq.approvalNotes}` : 'Reviewed by Elon Musk Official Management Table'}
                              </span>
                              <span className="text-blue-300">
                                {vipReq.approvedAt ? `Cleared: ${new Date(vipReq.approvedAt).toLocaleDateString()}` : 'Dispatched to In-App Inbox'}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Charity NGO Donations & Country Support Requests View */}
            {approvalCategory === 'charity' && (
              <div className="space-y-6">
                {/* Support Requests Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-900/60 pb-2">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-rose-400" />
                      <span>Humanitarian &amp; Country Support Requests ({filteredCharitySupport.length})</span>
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      Elon Musk Management Approval &amp; Accounts Provision
                    </span>
                  </div>

                  {filteredCharitySupport.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-[#08142b] border border-blue-900/60 text-slate-400 text-xs">
                      No humanitarian support requests matching the &ldquo;{approvalFilter}&rdquo; filter.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredCharitySupport.map((req) => {
                        const isPending = !req.status || req.status === 'pending_admin_approval';
                        const isApproved = req.status === 'approved';
                        return (
                          <div
                            key={req.requestId}
                            className={`p-5 rounded-2xl border space-y-3 ${
                              isPending
                                ? 'bg-gradient-to-r from-rose-950/25 via-blue-950/20 to-[#08142b] border-rose-500/45'
                                : isApproved
                                ? 'bg-[#08142b] border-emerald-500/40'
                                : 'bg-[#050d20] border-blue-900/50'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-900/50">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                                  <span className="text-blue-300 font-bold">{req.requestId}</span>
                                  <span>·</span>
                                  <span>{req.dateStr}</span>
                                  <span>·</span>
                                  <span className="text-rose-300 font-semibold">{req.crisisType}</span>
                                </div>
                                <h5 className="font-display font-bold text-base text-white mt-0.5">
                                  {req.countryName} ({req.cityOrZone}) — {req.aidCategory}
                                </h5>
                                <div className="text-xs text-slate-300">
                                  Applicant: <strong className="text-white">{req.applicantName}</strong> ({req.applicantEmail})
                                  {req.organizationName ? ` · ${req.organizationName}` : ''}
                                  {req.requestedAmountUsd ? (
                                    <span className="ml-2 font-mono text-emerald-300 tabular-nums">
                                      Grant Requested: ${req.requestedAmountUsd.toLocaleString()}
                                    </span>
                                  ) : null}
                                </div>
                              </div>

                              <span
                                className={`text-xs font-mono font-bold self-start ${
                                  isPending
                                    ? 'text-amber-300'
                                    : isApproved
                                    ? 'text-emerald-400'
                                    : 'text-red-400'
                                }`}
                              >
                                {isPending
                                  ? 'Pending Management Approval'
                                  : isApproved
                                  ? 'Approved by Management'
                                  : 'Declined'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {req.situationSummary}
                            </p>

                            {isPending ? (
                              <div className="pt-2 border-t border-blue-900/50 space-y-2.5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                  <input
                                    type="text"
                                    placeholder="Management clearance note (sent to applicant inbox)..."
                                    value={charityNotes[req.requestId] || ''}
                                    onChange={(e) =>
                                      setCharityNotes((prev) => ({ ...prev, [req.requestId]: e.target.value }))
                                    }
                                    className="px-3 py-2 rounded-lg bg-[#040a18] border border-blue-900/70 text-xs text-white focus:outline-none focus:border-blue-400 placeholder:text-slate-500"
                                  />
                                  <input
                                    type="text"
                                    placeholder={
                                      req.needsAccountProvisioning
                                        ? `Provision ${req.preferredPayoutMethod?.toUpperCase() || 'relief'} settlement account / voucher code...`
                                        : 'Optional relief tracking or dispatch account reference...'
                                    }
                                    value={supportAccountDrafts[req.requestId] || ''}
                                    onChange={(e) =>
                                      setSupportAccountDrafts((prev) => ({ ...prev, [req.requestId]: e.target.value }))
                                    }
                                    className="px-3 py-2 rounded-lg bg-[#040a18] border border-blue-900/70 text-xs font-mono text-white focus:outline-none focus:border-blue-400 placeholder:text-slate-500"
                                  />
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onRejectCharitySupport?.(req.requestId, charityNotes[req.requestId])
                                    }
                                    className="px-3.5 py-2 rounded-xl bg-[#040a18] border border-blue-900/70 hover:border-red-500/50 text-slate-300 text-xs font-semibold cursor-pointer"
                                  >
                                    Decline Request
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onApproveCharitySupport?.(
                                        req.requestId,
                                        charityNotes[req.requestId],
                                        supportAccountDrafts[req.requestId]?.trim() || undefined
                                      )
                                    }
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:brightness-110 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Check className="w-4 h-4" />
                                    <span>Approve Support &amp; Provision Account</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="pt-2 border-t border-blue-900/50 space-y-1 text-[11px] font-mono text-slate-400">
                                {req.provisionedAccountDetails && (
                                  <div className="text-emerald-300 break-all">
                                    Provisioned Account: {req.provisionedAccountDetails}
                                  </div>
                                )}
                                <div>{req.approvalNotes || 'Reviewed by Elon Musk Official Management Table'}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Fan Charity Donations Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-900/60 pb-2">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-blue-400" />
                      <span>Fan NGO Charity Donations ({filteredCharityDonations.length})</span>
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      Settlement Verification &amp; Official Receipt Issuance
                    </span>
                  </div>

                  {filteredCharityDonations.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-[#08142b] border border-blue-900/60 text-slate-400 text-xs">
                      No fan charity donations matching the &ldquo;{approvalFilter}&rdquo; filter.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredCharityDonations.map((don) => {
                        const isPending = !don.status || don.status === 'pending_admin_approval';
                        const isApproved = don.status === 'approved';
                        return (
                          <div
                            key={don.donationId}
                            className={`p-5 rounded-2xl border space-y-3 ${
                              isPending
                                ? 'bg-gradient-to-r from-blue-950/30 via-[#08142b] to-red-950/20 border-red-500/45'
                                : isApproved
                                ? 'bg-[#08142b] border-emerald-500/40'
                                : 'bg-[#050d20] border-blue-900/50'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-900/50">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                                  <span className="text-blue-300 font-bold">{don.donationId}</span>
                                  <span>·</span>
                                  <span>{don.dateStr}</span>
                                  <span>·</span>
                                  <span>{don.paymentReference}</span>
                                  <span>·</span>
                                  <span className="uppercase">{don.paymentMethod}</span>
                                </div>
                                <h5 className="font-display font-bold text-base text-white mt-0.5">
                                  {don.ngoSectionName} —{' '}
                                  <span className="font-mono text-emerald-300 tabular-nums">
                                    ${don.amountUsd.toLocaleString()} USD
                                  </span>
                                </h5>
                                <div className="text-xs text-slate-300">
                                  Donor: <strong className="text-white">{don.donorName}</strong> ({don.donorEmail}) · Target:{' '}
                                  <strong className="text-blue-200">{don.countryName}</strong> ({don.crisisType})
                                </div>
                                {don.dedicationNote && (
                                  <div className="text-[11px] text-slate-400 italic mt-0.5">
                                    Note: &ldquo;{don.dedicationNote}&rdquo;
                                  </div>
                                )}
                              </div>

                              <span
                                className={`text-xs font-mono font-bold self-start ${
                                  isPending
                                    ? 'text-amber-300'
                                    : isApproved
                                    ? 'text-emerald-400'
                                    : 'text-red-400'
                                }`}
                              >
                                {isPending
                                  ? 'Pending Elon Musk Management Approval'
                                  : isApproved
                                  ? 'Approved Donation'
                                  : 'Rejected'}
                              </span>
                            </div>

                            {isPending ? (
                              <div className="pt-2 border-t border-blue-900/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                <input
                                  type="text"
                                  placeholder="Optional approval note or official NGO receipt dispatch message..."
                                  value={charityNotes[don.donationId] || ''}
                                  onChange={(e) =>
                                    setCharityNotes((prev) => ({ ...prev, [don.donationId]: e.target.value }))
                                  }
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#040a18] border border-blue-900/70 text-xs text-white focus:outline-none focus:border-blue-400 placeholder:text-slate-500"
                                />
                                <div className="flex flex-wrap items-center gap-2 shrink-0">
                                  {don.paymentMethod === 'crypto' && (
                                    <input
                                      type="text"
                                      value={cryptoApprovalConfirmInputs[don.donationId] || ''}
                                      onChange={(e) =>
                                        setCryptoApprovalConfirmInputs((prev) => ({
                                          ...prev,
                                          [don.donationId]: e.target.value,
                                        }))
                                      }
                                      aria-label={`Type CONFIRM to finalize crypto donation ${don.donationId}`}
                                      placeholder="Type CONFIRM..."
                                      className={`w-36 px-2.5 py-2 rounded-xl bg-[#040a18] border text-xs font-mono tracking-wider text-white placeholder:text-slate-500 focus:outline-none ${
                                        (cryptoApprovalConfirmInputs[don.donationId] || '').trim() === 'CONFIRM'
                                          ? 'border-emerald-500/70 focus:border-emerald-400'
                                          : 'border-amber-500/45 focus:border-blue-400'
                                      }`}
                                    />
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onRejectCharityDonation?.(don.donationId, charityNotes[don.donationId])
                                    }
                                    className="px-3.5 py-2 rounded-xl bg-[#040a18] border border-blue-900/70 hover:border-red-500/50 text-slate-300 text-xs font-semibold cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    type="button"
                                    disabled={
                                      don.paymentMethod === 'crypto' &&
                                      (cryptoApprovalConfirmInputs[don.donationId] || '').trim() !== 'CONFIRM'
                                    }
                                    onClick={() => {
                                      onApproveCharityDonation?.(don.donationId, charityNotes[don.donationId]);
                                      if (don.paymentMethod === 'crypto') {
                                        setCryptoApprovalConfirmInputs((prev) => ({
                                          ...prev,
                                          [don.donationId]: '',
                                        }));
                                      }
                                    }}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Check className="w-4 h-4" />
                                    <span>
                                      {don.paymentMethod === 'crypto'
                                        ? 'Confirm Payment & Approve Donation'
                                        : 'Approve Donation & Issue Receipt'}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-[11px] font-mono text-slate-400">
                                {don.approvalNotes || 'Approved by Elon Musk Official Management Table'}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Add New Car Listing */}
        {activeTab === 'add_car' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              
              <div className="pb-3 border-b border-blue-900/60">
                <h4 className="font-display font-bold text-lg text-white">
                  Add New Car Listing to Active Catalog
                </h4>
                <p className="text-xs text-blue-300 font-mono mt-0.5">
                  Newly created vehicle specifications and photos will appear immediately in the public showroom and matrix.
                </p>
              </div>

              <form onSubmit={handleCreateCarSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200">Vehicle Model Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tesla AeroHyper Sport Plaid"
                      value={newCarName}
                      onChange={(e) => setNewCarName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200">Tagline / Subtitle</label>
                    <input
                      type="text"
                      placeholder="e.g. Sub-orbital levitation grand tourer"
                      value={newCarTagline}
                      onChange={(e) => setNewCarTagline(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200">Base Price (USD $) *</label>
                    <input
                      type="number"
                      required
                      min={10000}
                      value={newCarBasePrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewCarBasePrice(val);
                        setNewCarMinDeposit(Math.round((val || 0) * 0.20));
                      }}
                      className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 font-mono tabular-nums focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200">20% Advance Deposit (USD $) *</label>
                    <input
                      type="number"
                      required
                      min={500}
                      value={newCarMinDeposit}
                      onChange={(e) => setNewCarMinDeposit(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 font-mono tabular-nums focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200">Vehicle Type</label>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setNewCarIsFlying(true)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                          newCarIsFlying
                            ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white border-blue-400'
                            : 'bg-[#08142b] border-blue-900/60 text-slate-300'
                        }`}
                      >
                        Aerospace / Flying
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCarIsFlying(false)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                          !newCarIsFlying
                            ? 'bg-blue-600 text-white border-blue-400'
                            : 'bg-[#08142b] border-blue-900/60 text-slate-300'
                        }`}
                      >
                        Ground EV
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200">0–60 MPH Acceleration</label>
                    <input
                      type="text"
                      value={newCarAcceleration}
                      onChange={(e) => setNewCarAcceleration(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200">Top Speed</label>
                    <input
                      type="text"
                      value={newCarTopSpeed}
                      onChange={(e) => setNewCarTopSpeed(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200">Electric Range</label>
                    <input
                      type="text"
                      value={newCarRange}
                      onChange={(e) => setNewCarRange(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Vehicle Image (Asset Path or Web URL)</label>
                  <input
                    type="text"
                    value={newCarImage}
                    onChange={(e) => setNewCarImage(e.target.value)}
                    placeholder="/assets/aistudio/... or https://..."
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-blue-400"
                  />
                  {/* Preset Quick Select from generated real production vehicle photos */}
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400">
                    <span>Quick Select Real Car Assets:</span>
                    {REAL_CAR_ASSET_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setNewCarImage(preset.src)}
                        className="text-blue-400 underline hover:text-white cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Powertrain Specs</label>
                  <input
                    type="text"
                    value={newCarPowertrain}
                    onChange={(e) => setNewCarPowertrain(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Vehicle Description</label>
                  <textarea
                    rows={3}
                    value={newCarDescription}
                    onChange={(e) => setNewCarDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 text-white font-bold text-xs shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Vehicle Listing to Showroom</span>
                  </button>
                </div>
              </form>

              {/* Custom Cars currently created */}
              {customCars.length > 0 && (
                <div className="pt-6 border-t border-blue-900/60 space-y-3">
                  <h5 className="text-xs font-mono font-bold text-slate-400 uppercase">
                    Elon Musk Management Custom Models ({customCars.length})
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customCars.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-[#08142b] border border-blue-900/60 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={c.image}
                            alt={c.name}
                            className="w-12 h-10 object-cover rounded bg-[#040a18] border border-blue-900/60"
                          />
                          <div>
                            <div className="text-xs font-bold text-white">{c.name}</div>
                            <div className="text-[11px] text-blue-300 font-mono tabular-nums">
                              ${c.basePrice.toLocaleString()} · Min ${c.minDeposit.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteCustomCar(c.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                          title="Delete custom model"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Tab 3: In-App Messaging Desk */}
        {activeTab === 'messages' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Thread list */}
            <div className="w-full sm:w-80 border-r border-blue-900/60 flex flex-col bg-[#050d20] shrink-0">
              <div className="p-3 border-b border-blue-900/60 text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Visitor & Customer Threads</span>
                <span className="text-blue-300 font-bold">{inboxMessages.length} total</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-blue-900/40">
                {inboxMessages.map((msg) => {
                  const isSelected = selectedMessageId === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessageId(msg.id)}
                      className={`p-3.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/25 ring-1 ring-inset ring-blue-400/60 text-white'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono text-blue-300 font-semibold">{msg.senderName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{msg.timeStr}</span>
                      </div>
                      <div className="text-xs font-medium text-white truncate">{msg.subject}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{msg.body}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Thread detail & reply */}
            <div className="flex-1 flex flex-col bg-[#061024] overflow-hidden">
              {selectedMessage ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-blue-900/60 bg-[#08142b] flex items-center justify-between shrink-0">
                    <div>
                      <h4 className="font-bold text-sm text-white">{selectedMessage.subject}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Thread ID: {selectedMessage.id} · From {selectedMessage.senderName}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 text-xs">
                      <div className="text-slate-400 font-mono text-[10px] mb-1">
                        {selectedMessage.senderName} ({selectedMessage.timeStr}):
                      </div>
                      <div className="text-white whitespace-pre-wrap leading-relaxed">
                        {selectedMessage.body}
                      </div>
                    </div>

                    {selectedMessage.replies?.map((r) => (
                      <div
                        key={r.id}
                        className={`p-3.5 rounded-xl text-xs max-w-[85%] ${
                          r.sender === 'admin'
                            ? 'ml-auto bg-blue-600/30 border border-blue-400/50 text-white'
                            : 'bg-[#08142b] border border-blue-900/60 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] font-mono mb-1 text-slate-400">
                          <span className={r.sender === 'admin' ? 'text-red-300 font-bold' : 'text-blue-300'}>
                            {r.senderName}
                          </span>
                          <span>{r.timeStr}</span>
                        </div>
                        <p>{r.body}</p>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={handleAdminReplySubmit}
                    className="p-3 border-t border-blue-900/60 bg-[#050d20] flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Type Elon Musk Management reply (visitor receives this in their in-app inbox)..."
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#040a18] border border-blue-900/70 text-xs text-white focus:outline-none focus:border-blue-400 placeholder:text-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={!adminReplyText.trim()}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Management Reply</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8 text-slate-400 text-xs">
                  <div>
                    <Mail className="w-10 h-10 mx-auto text-blue-700 mb-2" />
                    Select an in-app conversation thread from the left to read or reply.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Fleet Overview */}
        {activeTab === 'fleet' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {carAddedBanner && (
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/50 text-blue-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{carAddedBanner}</span>
                </div>
                <button
                  onClick={() => setCarAddedBanner(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pb-3 border-b border-blue-900/60">
              <h4 className="font-bold text-sm text-white">
                Active Tesla Fleet Models & Pricing Catalog ({vehicles.length})
              </h4>
              <span className="text-xs font-mono text-slate-400">
                All models with real prices and deposits
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((v, i) => (
                <div
                  key={v.id}
                  className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-[#040a18] border border-blue-900/60">
                      <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#040a18]/90 border border-blue-500/30 text-[10px] font-mono text-blue-300">
                        #{i + 1} {v.isFlyingCar ? '· VTOL / Flying' : '· Production'}
                      </div>
                    </div>
                    <h5 className="font-bold text-xs text-white line-clamp-1">{v.name}</h5>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{v.description}</p>
                  </div>

                  <div className="pt-2 border-t border-blue-900/50 flex items-center justify-between text-xs font-mono tabular-nums">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Base Price</div>
                      <div className="text-white font-bold">${v.basePrice.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase">Min Deposit</div>
                      <div className="text-red-300 font-bold">${v.minDeposit.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Referral Program & Commission Payouts */}
        {activeTab === 'referrals' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#08142b] border border-blue-800/60 space-y-2">
                <div className="text-[11px] font-mono text-blue-300 font-semibold">
                  Global Commission Rate
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0.5}
                    max={50}
                    step={0.5}
                    value={commissionPercent}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!Number.isNaN(val) && val >= 0.5 && val <= 50 && onUpdateCommissionPercent) {
                        onUpdateCommissionPercent(val);
                      }
                    }}
                    className="w-24 px-3 py-1.5 rounded-lg bg-[#040a18] border border-blue-700/70 text-lg font-mono font-bold tabular-nums text-white focus:outline-none focus:border-blue-400"
                  />
                  <span className="text-lg font-mono font-bold text-emerald-400">%</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[3, 5, 7.5, 10, 15].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onUpdateCommissionPercent?.(preset)}
                      className={`px-2 py-1 rounded text-[11px] font-mono font-bold cursor-pointer transition-colors ${
                        commissionPercent === preset
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#040a18] border border-blue-900/60 text-slate-300 hover:text-white'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-500/40">
                <div className="text-[11px] font-mono text-emerald-300 font-semibold">
                  Approved Payouts ({approvedReferrals.length})
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
                  ${totalApprovedCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Settled referral rewards credited to referrers
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-950/25 border border-red-500/40">
                <div className="text-[11px] font-mono text-red-300 font-semibold">
                  Pending Review ({pendingReferrals.length})
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
                  ${totalPendingCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Auto-clears when parent order is approved, or approve manually below
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-900/60">
                <h4 className="font-bold text-sm text-white">
                  Visitor Referral Conversions ({referralConversions.length})
                </h4>
                <span className="text-xs font-mono text-slate-400">
                  Tracked automatically across Vehicle Orders, VIP Passes &amp; TSLA Shares
                </span>
              </div>

              {referralConversions.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-[#08142b] border border-blue-900/60 text-slate-400 text-xs">
                  No orders have been submitted with a referral code yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {referralConversions.map((conv) => {
                    const isPending = conv.status === 'pending_admin_approval';
                    const isApproved = conv.status === 'approved';
                    return (
                      <div
                        key={conv.id}
                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isPending
                            ? 'bg-gradient-to-r from-red-950/25 via-blue-950/20 to-[#08142b] border-red-500/45'
                            : isApproved
                            ? 'bg-[#08142b] border-emerald-500/40'
                            : 'bg-[#050d20] border-blue-900/50'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                            <span className="text-blue-300 font-bold">{conv.referrerCode}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-300">{conv.orderId}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400 uppercase">{conv.orderType}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400">{conv.dateStr}</span>
                          </div>
                          <div className="text-sm font-bold text-white">
                            {conv.itemTitle} — <span className="font-normal text-slate-300">{conv.buyerName}</span>
                          </div>
                          <div className="text-xs font-mono tabular-nums text-slate-300">
                            Order Total: ${conv.orderAmount.toLocaleString()} · Rate: {conv.commissionPercent}% ·{' '}
                            <span className="text-emerald-400 font-bold">
                              Earned: ${conv.commissionEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => onRejectReferral?.(conv.id)}
                                className="px-3 py-1.5 rounded-lg bg-[#040a18] border border-blue-900/70 hover:border-red-500/50 text-slate-300 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => onApproveReferral?.(conv.id)}
                                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:brightness-110 text-white text-xs font-bold cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve Payout</span>
                              </button>
                            </>
                          ) : isApproved ? (
                            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 whitespace-nowrap">
                              <CheckCircle2 className="w-4 h-4" />
                              Approved Payout
                            </span>
                          ) : (
                            <span className="text-xs font-mono font-semibold text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                              <XCircle className="w-4 h-4" />
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Admin Payment Accounts & Visitor Account Requests */}
        {activeTab === 'accounts' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            <div className="p-5 rounded-2xl bg-[#08142b] border border-blue-500/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-white">
                    Active Elon Musk Management Payment Accounts
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Leave blank to require visitors to request an account per order, or enter official details below to publish directly to checkout.
                  </p>
                </div>
                {accountsSavedBanner && (
                  <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Accounts Updated
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-blue-200 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Wire Transfer / ACH Account Details</span>
                  </label>
                  <textarea
                    rows={3}
                    value={wireDetailsInput}
                    onChange={(e) => setWireDetailsInput(e.target.value)}
                    placeholder="Enter bank name, routing/ABA, SWIFT, and beneficiary account..."
                    className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-blue-200 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gift Card Settlement Details</span>
                  </label>
                  <textarea
                    rows={3}
                    value={giftCardInstructionsInput}
                    onChange={(e) => setGiftCardInstructionsInput(e.target.value)}
                    placeholder="Enter accepted gift card brands, verification email/account, and instructions..."
                    className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-blue-200 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-red-400" />
                    <span>Bitcoin / Doge / USDC Wallet Address</span>
                  </label>
                  <textarea
                    rows={3}
                    value={cryptoAddressInput}
                    onChange={(e) => setCryptoAddressInput(e.target.value)}
                    placeholder="Auto-synced from Official Company Wallets below..."
                    className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Official 9 Company Wallet Addresses Control Panel */}
              <div className="pt-4 border-t border-blue-900/60 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Official Company Wallet Addresses &amp; Scan-to-Pay QR Codes</span>
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Every official wallet displays a live scannable QR code for visitors to scan and pay easily. Click any QR code to enlarge or save.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCryptoGuideOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/35 text-blue-200 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Open Crypto Payment Guide</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const restored = OFFICIAL_COMPANY_WALLETS.map((w) => ({ ...w }));
                        setCompanyWalletsDraft(restored);
                        setCryptoAddressInput(formatCompanyWalletsSummary(restored));
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#040a18] border border-blue-800/70 text-blue-200 hover:text-white text-[11px] font-mono cursor-pointer whitespace-nowrap"
                    >
                      Restore Official Defaults
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {companyWalletsDraft.map((wallet, idx) => (
                    <div
                      key={wallet.symbol}
                      className="p-3 rounded-xl bg-[#040a18] border border-blue-900/70 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-2 py-0.5 rounded bg-blue-600/25 border border-blue-500/40 text-[10px] font-mono font-bold text-blue-200 shrink-0">
                            {wallet.symbol}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{wallet.name}</div>
                            <div className="text-[10px] font-mono text-blue-300/80 truncate">{wallet.network}</div>
                          </div>
                        </div>
                        <label className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={wallet.enabled}
                            onChange={(e) => {
                              const next = companyWalletsDraft.map((item, i) =>
                                i === idx ? { ...item, enabled: e.target.checked } : item
                              );
                              setCompanyWalletsDraft(next);
                            }}
                            className="accent-emerald-500"
                          />
                          <span>Active</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          <input
                            type="text"
                            value={wallet.address}
                            onChange={(e) => {
                              const next = companyWalletsDraft.map((item, i) =>
                                i === idx ? { ...item, address: e.target.value } : item
                              );
                              setCompanyWalletsDraft(next);
                            }}
                            aria-label={`${wallet.name} wallet address`}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#08142b] border border-blue-900/70 text-[11px] font-mono text-emerald-200 focus:outline-none focus:border-blue-400"
                          />
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(wallet.address);
                                setCopiedWalletSymbol(wallet.symbol);
                                setTimeout(
                                  () => setCopiedWalletSymbol((curr) => (curr === wallet.symbol ? null : curr)),
                                  1800
                                );
                              }}
                              className="px-2.5 py-1 rounded-md bg-[#08142b] border border-blue-800/70 hover:border-blue-400 text-[10px] font-mono text-blue-200 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              {copiedWalletSymbol === wallet.symbol ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>{copiedWalletSymbol === wallet.symbol ? 'Copied' : 'Copy Address'}</span>
                            </button>
                            <button
                              type="button"
                              disabled={!wallet.address.trim()}
                              onClick={() => setExpandedQrWallet(wallet)}
                              className="px-2.5 py-1 rounded-md bg-[#08142b] border border-emerald-500/45 hover:border-emerald-400 disabled:opacity-40 text-[10px] font-mono text-emerald-200 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <Maximize2 className="w-3 h-3" />
                              <span>Scan QR</span>
                            </button>
                          </div>
                        </div>

                        <WalletQRCode
                          address={wallet.address}
                          label={wallet.name}
                          size={76}
                          onExpand={wallet.address.trim() ? () => setExpandedQrWallet(wallet) : undefined}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setWireDetailsInput('');
                    setGiftCardInstructionsInput('');
                    const defaultSummary = formatCompanyWalletsSummary(companyWalletsDraft);
                    setCryptoAddressInput(defaultSummary);
                    onSaveAdminPaymentAccounts?.({
                      wireDetails: '',
                      giftCardInstructions: '',
                      cryptoAddress: defaultSummary,
                      companyWallets: companyWalletsDraft,
                      updatedAt: new Date().toISOString(),
                    });
                    setAccountsSavedBanner(true);
                    setTimeout(() => setAccountsSavedBanner(false), 2500);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-[#040a18] border border-blue-900/70 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Clear Wire / Gift Card Accounts
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const summary = formatCompanyWalletsSummary(companyWalletsDraft);
                    setCryptoAddressInput(summary);
                    onSaveAdminPaymentAccounts?.({
                      wireDetails: wireDetailsInput.trim(),
                      giftCardInstructions: giftCardInstructionsInput.trim(),
                      cryptoAddress: summary || cryptoAddressInput.trim(),
                      companyWallets: companyWalletsDraft,
                      updatedAt: new Date().toISOString(),
                    });
                    setAccountsSavedBanner(true);
                    setTimeout(() => setAccountsSavedBanner(false), 2500);
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs font-bold cursor-pointer"
                >
                  Save Accounts &amp; Company Wallets
                </button>
              </div>
            </div>

            {/* Individual Control: Loaded Wallet Money & Payment Approvals */}
            <div className="p-5 rounded-2xl bg-[#08142b] border border-emerald-500/40 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    <span>Individual Control · Wallet Loaded Funds &amp; Payment Approvals</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Money loaded on visitor personal wallets stays pending until individually approved, placed on hold, or adjusted by management here.
                  </p>
                </div>
                {adjustSavedMsg && (
                  <span className="text-xs font-mono text-emerald-300 font-bold">
                    {adjustSavedMsg}
                  </span>
                )}
              </div>

              {/* Direct Individual Balance Credit / Debit Control */}
              {onAdjustMemberWalletBalance && (
                <div className="p-4 rounded-xl bg-[#040a18] border border-blue-900/70 space-y-3">
                  <div className="text-xs font-bold text-blue-200 uppercase tracking-wider">
                    Direct Visitor Wallet Balance Control (Load / Deduct USD)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="email"
                      value={adjustMemberEmail}
                      onChange={(e) => setAdjustMemberEmail(e.target.value)}
                      placeholder="Visitor email address..."
                      className="sm:col-span-2 px-3 py-2 text-xs bg-[#08142b] border border-blue-900/70 rounded-lg text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                    />
                    <select
                      value={adjustCurrency}
                      onChange={(e) => setAdjustCurrency(e.target.value as OfficialWalletSymbol)}
                      className="px-3 py-2 text-xs bg-[#08142b] border border-blue-900/70 rounded-lg text-white font-mono focus:outline-none focus:border-blue-400"
                    >
                      {companyWalletsDraft.map((w) => (
                        <option key={w.symbol} value={w.symbol}>
                          {w.symbol} Wallet
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      step="0.01"
                      value={adjustAmountUsd}
                      onChange={(e) => setAdjustAmountUsd(e.target.value)}
                      placeholder="Amount USD"
                      className="px-3 py-2 text-xs bg-[#08142b] border border-blue-900/70 rounded-lg text-white font-mono tabular-nums focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      placeholder="Approval note / reason (optional)..."
                      className="flex-1 px-3 py-2 text-xs bg-[#08142b] border border-blue-900/70 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                    />
                    <input
                      type="text"
                      value={adjustConfirmKeyword}
                      onChange={(e) => setAdjustConfirmKeyword(e.target.value)}
                      aria-label="Type CONFIRM to authorize wallet balance transaction"
                      placeholder="Type CONFIRM..."
                      className={`sm:w-36 px-3 py-2 text-xs bg-[#08142b] border rounded-lg font-mono tracking-wider text-white placeholder:text-slate-500 focus:outline-none ${
                        adjustConfirmKeyword.trim() === 'CONFIRM'
                          ? 'border-emerald-500/70 focus:border-emerald-400'
                          : 'border-amber-500/45 focus:border-blue-400'
                      }`}
                    />
                    <button
                      type="button"
                      disabled={adjustConfirmKeyword.trim() !== 'CONFIRM'}
                      onClick={() => {
                        const amt = Number(adjustAmountUsd);
                        if (
                          adjustConfirmKeyword.trim() !== 'CONFIRM' ||
                          !adjustMemberEmail.trim() ||
                          !Number.isFinite(amt) ||
                          amt <= 0
                        ) {
                          return;
                        }
                        onAdjustMemberWalletBalance(
                          adjustMemberEmail.trim().toLowerCase(),
                          amt,
                          adjustCurrency,
                          adjustReason.trim() || undefined
                        );
                        setAdjustSavedMsg(`Loaded +$${amt.toLocaleString()} to ${adjustMemberEmail.trim().toLowerCase()}`);
                        setAdjustReason('');
                        setAdjustConfirmKeyword('');
                        setTimeout(() => setAdjustSavedMsg(null), 3000);
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                    >
                      Confirm &amp; Load Funds (+$)
                    </button>
                    <button
                      type="button"
                      disabled={adjustConfirmKeyword.trim() !== 'CONFIRM'}
                      onClick={() => {
                        const amt = Number(adjustAmountUsd);
                        if (
                          adjustConfirmKeyword.trim() !== 'CONFIRM' ||
                          !adjustMemberEmail.trim() ||
                          !Number.isFinite(amt) ||
                          amt <= 0
                        ) {
                          return;
                        }
                        onAdjustMemberWalletBalance(
                          adjustMemberEmail.trim().toLowerCase(),
                          -amt,
                          adjustCurrency,
                          adjustReason.trim() || undefined
                        );
                        setAdjustSavedMsg(`Deducted -$${amt.toLocaleString()} from ${adjustMemberEmail.trim().toLowerCase()}`);
                        setAdjustReason('');
                        setAdjustConfirmKeyword('');
                        setTimeout(() => setAdjustSavedMsg(null), 3000);
                      }}
                      className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                    >
                      Confirm Hold / Deduct (-$)
                    </button>
                  </div>
                </div>
              )}

              {/* Active Loaded Balances Ledger */}
              {Object.keys(memberWalletBalances).length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                    Visitor Personal Wallet Balances ({Object.keys(memberWalletBalances).length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {Object.entries(memberWalletBalances).map(([emailKey, bal]) => (
                      <button
                        key={emailKey}
                        type="button"
                        onClick={() => setAdjustMemberEmail(emailKey)}
                        className="p-2.5 rounded-xl bg-[#040a18] border border-blue-900/70 hover:border-blue-400 text-left flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span className="text-[11px] font-mono text-slate-200 truncate">{emailKey}</span>
                        <span className="text-xs font-mono font-bold text-emerald-300 tabular-nums shrink-0">
                          ${Number(bal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Visitor Wallet Funding Approval Queue */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-white">
                  Visitor Wallet Funding &amp; Load Requests ({walletLoadRequests.length})
                </div>
                {walletLoadRequests.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-[#040a18] border border-blue-900/60 text-xs text-slate-400">
                    No visitor wallet deposit submissions yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {walletLoadRequests.map((req) => (
                      <div
                        key={req.id}
                        className={`p-3.5 rounded-xl border space-y-2.5 ${
                          req.status === 'pending_approval'
                            ? 'bg-gradient-to-r from-amber-950/25 via-blue-950/25 to-[#040a18] border-amber-500/45'
                            : req.status === 'approved'
                            ? 'bg-[#040a18] border-emerald-500/40'
                            : 'bg-[#040a18] border-red-500/40'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-white">
                              {req.memberName} ({req.memberEmail}) —{' '}
                              <span className="font-mono text-emerald-300 tabular-nums">
                                ${req.amountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>{' '}
                              <span className="text-blue-300 font-mono">[{req.walletSymbol}]</span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              Ref: {req.txReference} · {req.timeStr}
                              {req.note ? ` · "${req.note}"` : ''}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#08142b] border border-blue-800/70 text-slate-200">
                            {req.status.replace('_', ' ')}
                          </span>
                        </div>

                        {req.status === 'pending_approval' || req.status === 'held' ? (
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-900/50">
                            <input
                              type="text"
                              value={walletReviewNotes[req.id] || ''}
                              onChange={(e) =>
                                setWalletReviewNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                              }
                              placeholder="Optional approval / hold note..."
                              className="flex-1 min-w-[160px] px-3 py-1.5 rounded-lg bg-[#08142b] border border-blue-900/70 text-xs text-white focus:outline-none focus:border-blue-400"
                            />
                            <input
                              type="text"
                              value={walletApproveConfirmInputs[req.id] || ''}
                              onChange={(e) =>
                                setWalletApproveConfirmInputs((prev) => ({ ...prev, [req.id]: e.target.value }))
                              }
                              aria-label={`Type CONFIRM to approve wallet request ${req.id}`}
                              placeholder="Type CONFIRM..."
                              className={`w-32 px-2.5 py-1.5 rounded-lg bg-[#08142b] border text-xs font-mono tracking-wider text-white placeholder:text-slate-500 focus:outline-none ${
                                (walletApproveConfirmInputs[req.id] || '').trim() === 'CONFIRM'
                                  ? 'border-emerald-500/70 focus:border-emerald-400'
                                  : 'border-amber-500/45 focus:border-blue-400'
                              }`}
                            />
                            <button
                              type="button"
                              disabled={(walletApproveConfirmInputs[req.id] || '').trim() !== 'CONFIRM'}
                              onClick={() => {
                                if ((walletApproveConfirmInputs[req.id] || '').trim() !== 'CONFIRM') return;
                                onReviewWalletLoadRequest?.(req.id, 'approved', walletReviewNotes[req.id]);
                                setWalletApproveConfirmInputs((prev) => ({ ...prev, [req.id]: '' }));
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer"
                            >
                              Confirm Payment &amp; Credit Balance
                            </button>
                            {req.status !== 'held' && (
                              <button
                                type="button"
                                onClick={() => {
                                  onReviewWalletLoadRequest?.(req.id, 'held', walletReviewNotes[req.id]);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer"
                              >
                                Hold Funds
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                onReviewWalletLoadRequest?.(req.id, 'rejected', walletReviewNotes[req.id]);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          req.adminNotes && (
                            <div className="text-[11px] font-mono text-slate-300">
                              Review note: {req.adminNotes}
                            </div>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-900/60">
                <h4 className="font-bold text-sm text-white">
                  Visitor Account Requests ({paymentAccountRequests.length})
                </h4>
                <span className="text-xs font-mono text-slate-400">
                  {pendingAccountRequests.length} awaiting Elon Musk Management issuance
                </span>
              </div>

              {paymentAccountRequests.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-[#08142b] border border-blue-900/60 text-slate-400 text-xs">
                  No visitors have requested a Wire Transfer or Crypto payment account yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentAccountRequests.map((req) => {
                    const isPending = req.status === 'pending_admin';
                    const draft = accountDrafts[req.id] ?? '';
                    return (
                      <div
                        key={req.id}
                        className={`p-4 rounded-2xl border space-y-3 ${
                          isPending
                            ? 'bg-gradient-to-r from-red-950/25 via-blue-950/20 to-[#08142b] border-red-500/45'
                            : 'bg-[#08142b] border-emerald-500/40'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                              <span className="text-blue-300 font-bold">{req.id}</span>
                              <span className="text-slate-500">·</span>
                              <span className="text-red-300 font-bold uppercase">
                                {req.paymentMethod === 'wire'
                                  ? 'Wire Transfer / ACH'
                                  : req.paymentMethod === 'gift_card'
                                  ? 'Gift Card'
                                  : 'Bitcoin / Doge / USDC'}
                              </span>
                              <span className="text-slate-500">·</span>
                              <span className="text-slate-400">{req.timeStr}</span>
                            </div>
                            <div className="text-sm font-bold text-white">
                              {req.vehicleName} — <span className="text-blue-300 font-mono tabular-nums">${req.amountDue.toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-slate-300">
                              Visitor: <strong className="text-white">{req.visitorName}</strong> ({req.visitorEmail})
                            </div>
                            {req.note && (
                              <div className="text-[11px] text-slate-400 italic">
                                Visitor note: &ldquo;{req.note}&rdquo;
                              </div>
                            )}
                          </div>

                          <span
                            className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded uppercase self-start ${
                              isPending
                                ? 'bg-red-950/70 text-red-200 border border-red-500/45'
                                : 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/45'
                            }`}
                          >
                            {isPending ? 'Pending Management Account' : 'Account Issued'}
                          </span>
                        </div>

                        {isPending ? (
                          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-blue-900/60">
                            <input
                              type="text"
                              value={draft}
                              onChange={(e) =>
                                setAccountDrafts((prev) => ({ ...prev, [req.id]: e.target.value }))
                              }
                              placeholder={
                                req.paymentMethod === 'wire'
                                  ? 'Enter Wire/ACH Bank, Routing, Account Number & Beneficiary...'
                                  : req.paymentMethod === 'gift_card'
                                  ? 'Enter Accepted Gift Card Brand, Redemption Account & Instructions...'
                                  : 'Enter BTC / DOGE / USDC Wallet Address & Network...'
                              }
                              className="flex-1 px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                            />
                            <button
                              type="button"
                              disabled={!draft.trim()}
                              onClick={() => {
                                if (!draft.trim()) return;
                                onIssuePaymentAccount?.(req.id, draft.trim());
                                setAccountDrafts((prev) => ({ ...prev, [req.id]: '' }));
                              }}
                              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:brightness-110 disabled:opacity-40 text-white text-xs font-bold cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Provide Account to Visitor</span>
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-[#040a18] border border-emerald-500/35 text-xs font-mono text-emerald-200 break-all">
                            Issued: {req.issuedAccountDetails}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 px-5 border-t border-blue-900/60 bg-[#050d20] flex items-center justify-between text-xs text-slate-400 font-mono shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Elon Musk Management Mode Active (Protected by 10-digit executive passcode)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-blue-800 bg-[#08142b] text-slate-200 hover:text-white hover:border-blue-500 cursor-pointer transition-colors"
          >
            Exit Management Portal
          </button>
        </div>

      </div>

      <WalletScanModal
        wallet={expandedQrWallet}
        onClose={() => setExpandedQrWallet(null)}
        titlePrefix="Official Company Wallet · Scan & Pay QR"
      />

      <CryptoPaymentGuideModal
        isOpen={isCryptoGuideOpen}
        onClose={() => setIsCryptoGuideOpen(false)}
        wallets={companyWalletsDraft}
      />
    </div>
  );
};
