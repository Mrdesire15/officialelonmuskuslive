import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  KeyRound,
  ArrowLeft,
  Check,
  UserCheck,
  Wallet,
  PlusCircle,
  Clock,
  Percent,
} from 'lucide-react';
import {
  CompanyWalletRecord,
  OfficialWalletSymbol,
  WalletLoadRequest,
} from '../types';
import {
  OFFICIAL_COMPANY_WALLETS,
  computeMemberWalletStats,
} from '../data/officialWallets';
import { OfficialWalletsSelector } from './OfficialWalletsSelector';
import {
  MemberAccountSnapshot,
  evaluatePasswordSecurity,
  isValidEmailAddress,
  mapMemberAuthError,
  registerMemberWithEmail,
  authenticateMemberWithEmailAndPassword,
  resetMemberPasswordByEmail,
  updateMemberDisplayName,
  signOutMember,
} from '../utils/memberAuth';
import {
  clearFailedAttempts,
  getLockoutStatus,
  recordFailedAttempt,
  LOCKOUT_DURATION_MINUTES,
} from '../utils/securityLockout';

interface MemberAuthModalProps {
  isOpen: boolean;
  initialTab?: 'register' | 'signin';
  gateNotice?: string | null;
  currentUser: MemberAccountSnapshot | null;
  onUserUpdated: (user: MemberAccountSnapshot | null) => void;
  onAccessGranted?: (user: MemberAccountSnapshot, isNewRegistration: boolean) => void;
  onClose: () => void;
  companyWallets?: CompanyWalletRecord[];
  walletLoadRequests?: WalletLoadRequest[];
  memberWalletBalances?: Record<string, number>;
  onSubmitWalletLoadRequest?: (payload: {
    walletSymbol: OfficialWalletSymbol;
    amountUsd: number;
    txReference: string;
    note?: string;
  }) => void;
  visitorReferralCode?: string;
  commissionPercent?: number;
  referralEarnedUsd?: number;
  referralConversionsCount?: number;
  onOpenReferralDashboard?: () => void;
}

export const MemberAuthModal: React.FC<MemberAuthModalProps> = ({
  isOpen,
  initialTab = 'register',
  gateNotice = null,
  currentUser,
  onUserUpdated,
  onAccessGranted,
  onClose,
  companyWallets = OFFICIAL_COMPANY_WALLETS,
  walletLoadRequests = [],
  memberWalletBalances = {},
  onSubmitWalletLoadRequest,
  visitorReferralCode = '',
  commissionPercent = 5,
  referralEarnedUsd = 0,
  referralConversionsCount = 0,
  onOpenReferralDashboard,
}) => {
  if (!isOpen) return null;

  return (
    <MemberAuthModalInner
      key={`${initialTab}-${currentUser?.uid || 'guest'}`}
      initialTab={initialTab}
      gateNotice={gateNotice}
      currentUser={currentUser}
      onUserUpdated={onUserUpdated}
      onAccessGranted={onAccessGranted}
      onClose={onClose}
      companyWallets={companyWallets}
      walletLoadRequests={walletLoadRequests}
      memberWalletBalances={memberWalletBalances}
      onSubmitWalletLoadRequest={onSubmitWalletLoadRequest}
      visitorReferralCode={visitorReferralCode}
      commissionPercent={commissionPercent}
      referralEarnedUsd={referralEarnedUsd}
      referralConversionsCount={referralConversionsCount}
      onOpenReferralDashboard={onOpenReferralDashboard}
    />
  );
};

const MemberAuthModalInner: React.FC<{
  initialTab: 'register' | 'signin';
  gateNotice?: string | null;
  currentUser: MemberAccountSnapshot | null;
  onUserUpdated: (user: MemberAccountSnapshot | null) => void;
  onAccessGranted?: (user: MemberAccountSnapshot, isNewRegistration: boolean) => void;
  onClose: () => void;
  companyWallets: CompanyWalletRecord[];
  walletLoadRequests: WalletLoadRequest[];
  memberWalletBalances: Record<string, number>;
  onSubmitWalletLoadRequest?: (payload: {
    walletSymbol: OfficialWalletSymbol;
    amountUsd: number;
    txReference: string;
    note?: string;
  }) => void;
  visitorReferralCode: string;
  commissionPercent: number;
  referralEarnedUsd: number;
  referralConversionsCount: number;
  onOpenReferralDashboard?: () => void;
}> = ({
  initialTab,
  gateNotice,
  currentUser,
  onUserUpdated,
  onAccessGranted,
  onClose,
  companyWallets,
  walletLoadRequests,
  memberWalletBalances,
  onSubmitWalletLoadRequest,
  visitorReferralCode,
  commissionPercent,
  referralEarnedUsd,
  referralConversionsCount,
  onOpenReferralDashboard,
}) => {
  const [mode, setMode] = useState<'register' | 'signin' | 'reset'>(initialTab);

  // Registration, Sign-In, & Recovery fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Anti-bot hidden honeypot field
  const [honeypotTrap, setHoneypotTrap] = useState('');

  // Signed-in account management fields
  const [editNameInput, setEditNameInput] = useState(currentUser?.displayName || '');
  const [isEditingName, setIsEditingName] = useState(false);

  // Personal Wallet Load state
  const [selectedWalletSymbol, setSelectedWalletSymbol] = useState<OfficialWalletSymbol>('BTC');
  const [showLoadForm, setShowLoadForm] = useState(false);
  const [loadAmountUsd, setLoadAmountUsd] = useState<string>('1000');
  const [loadTxRef, setLoadTxRef] = useState<string>('');
  const [loadNote, setLoadNote] = useState<string>('');
  const [loadConfirmKeyword, setLoadConfirmKeyword] = useState<string>('');

  // Submission & status feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(
    () => getLockoutStatus().remainingAttempts
  );

  const walletStats = computeMemberWalletStats(
    currentUser?.email,
    walletLoadRequests,
    memberWalletBalances
  );

  const handleWalletLoadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(loadAmountUsd);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Please enter a valid USD deposit amount greater than $0.');
      return;
    }
    if (!loadTxRef.trim()) {
      setErrorMessage('Please enter the transaction hash or transfer reference.');
      return;
    }
    if (loadConfirmKeyword.trim() !== 'CONFIRM') {
      setErrorMessage('Please type CONFIRM in uppercase to finalize your crypto wallet deposit.');
      return;
    }
    setErrorMessage(null);
    onSubmitWalletLoadRequest?.({
      walletSymbol: selectedWalletSymbol,
      amountUsd: Math.round(numericAmount * 100) / 100,
      txReference: loadTxRef.trim(),
      note: loadNote.trim() || undefined,
    });
    setStatusMessage(
      `Wallet funding request of $${numericAmount.toLocaleString()} (${selectedWalletSymbol}) submitted for payment approval. Funds credit to your balance once approved.`
    );
    setLoadTxRef('');
    setLoadNote('');
    setLoadConfirmKeyword('');
    setShowLoadForm(false);
  };

  const passwordReport = evaluatePasswordSecurity(password, email, displayName);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const switchMode = (nextMode: 'register' | 'signin' | 'reset') => {
    setMode(nextMode);
    setErrorMessage(null);
    setStatusMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (honeypotTrap.trim() !== '') {
      setErrorMessage('Security check flagged automated submission. Please try again normally.');
      return;
    }

    const cleanName = displayName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!isValidEmailAddress(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!passwordReport.isValid) {
      setErrorMessage(passwordReport.firstIssue || 'Please choose a stronger password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter carefully.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerMemberWithEmail({
        displayName: cleanName,
        email: cleanEmail,
        password,
      });
      clearFailedAttempts();
      onUserUpdated(result.user);
      setEditNameInput(result.user.displayName || cleanName);
      onAccessGranted?.(result.user, true);
      onClose();
    } catch (error) {
      const mapped = mapMemberAuthError(error);
      setErrorMessage(mapped.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (honeypotTrap.trim() !== '') {
      setErrorMessage('Security check flagged automated submission. Please retry manually.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmailAddress(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (password.length < 6) {
      const nextStatus = recordFailedAttempt();
      setRemainingAttempts(nextStatus.remainingAttempts);
      if (nextStatus.isLocked) {
        onClose();
        return;
      }
      setErrorMessage(
        `Password must be at least 6 characters. (${nextStatus.remainingAttempts} ${
          nextStatus.remainingAttempts === 1 ? 'attempt' : 'attempts'
        } remaining before ${LOCKOUT_DURATION_MINUTES}-minute security lockout.)`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authenticateMemberWithEmailAndPassword({
        email: cleanEmail,
        password,
      });
      clearFailedAttempts();
      onUserUpdated(result.user);
      setEditNameInput(result.user.displayName || '');
      onAccessGranted?.(result.user, result.isNewAccount);
      onClose();
    } catch (error) {
      const mapped = mapMemberAuthError(error);
      if (mapped.isCredentialFailure) {
        const nextStatus = recordFailedAttempt();
        setRemainingAttempts(nextStatus.remainingAttempts);
        if (nextStatus.isLocked) {
          onClose();
          return;
        }
        setErrorMessage(
          `${mapped.message} (${nextStatus.remainingAttempts} ${
            nextStatus.remainingAttempts === 1 ? 'attempt' : 'attempts'
          } remaining before ${LOCKOUT_DURATION_MINUTES}-minute security lockout.)`
        );
      } else {
        setErrorMessage(mapped.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmailAddress(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!passwordReport.isValid) {
      setErrorMessage(passwordReport.firstIssue || 'New password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter carefully.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await resetMemberPasswordByEmail({
        email: cleanEmail,
        newPassword: password,
      });
      clearFailedAttempts();
      onUserUpdated(updatedUser);
      setEditNameInput(updatedUser.displayName || '');
      onAccessGranted?.(updatedUser, false);
      onClose();
    } catch (error) {
      const mapped = mapMemberAuthError(error);
      setErrorMessage(mapped.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNameInput.trim() || editNameInput.trim().length < 2) {
      setErrorMessage('Display name must be at least 2 characters.');
      return;
    }
    setErrorMessage(null);
    setStatusMessage(null);
    setIsSubmitting(true);
    try {
      const updated = await updateMemberDisplayName(editNameInput);
      onUserUpdated(updated);
      setIsEditingName(false);
      setStatusMessage('Executive Member display name updated.');
    } catch (error) {
      const mapped = mapMemberAuthError(error);
      setErrorMessage(mapped.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsSubmitting(true);
    try {
      await signOutMember();
      onUserUpdated(null);
      setMode('signin');
    } catch {
      setErrorMessage('Unable to sign out cleanly. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const strengthColorClass =
    passwordReport.score >= 4
      ? 'bg-emerald-500'
      : passwordReport.score === 3
      ? 'bg-blue-500'
      : passwordReport.score === 2
      ? 'bg-amber-500'
      : 'bg-red-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-auth-modal-title"
    >
      <div className={`w-full ${currentUser ? 'max-w-2xl' : 'max-w-lg'} rounded-2xl bg-[#061024] border border-blue-500/45 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto`}>
        {/* Patriotic Top Accent */}
        <div className="h-[2px] w-full us-flag-strip" />

        {/* Header */}
        <div className="p-5 border-b border-blue-900/60 flex items-center justify-between bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center text-white shadow-md">
              {currentUser ? <UserCheck className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2
                id="member-auth-modal-title"
                className="font-display font-bold text-lg text-white tracking-wide"
              >
                {currentUser
                  ? 'Executive Member Account'
                  : mode === 'register'
                  ? 'Member Sign Up'
                  : mode === 'signin'
                  ? 'Member Sign In'
                  : 'Reset Member Password'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close member authentication portal"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Gate Context Banner when visitor tries to open a full feature */}
          {!currentUser && gateNotice && (
            <div className="p-3.5 rounded-xl bg-blue-950/55 border border-blue-400/45 text-blue-100 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{gateNotice}</span>
            </div>
          )}

          {/* Status & Error Banners */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-950/45 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {statusMessage && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/45 text-emerald-200 text-xs flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{statusMessage}</span>
            </div>
          )}

          {/* SIGNED-IN VIEW */}
          {currentUser ? (
            <div className="space-y-5">
              {/* Identity Card */}
              <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600/35 to-red-600/35 border border-blue-400/50 flex items-center justify-center font-display font-bold text-base text-white shrink-0">
                      {(currentUser.displayName || currentUser.email || 'M')
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">
                        {currentUser.displayName || 'Executive Member'}
                      </div>
                      <div className="text-xs font-mono text-slate-300 truncate">
                        {currentUser.email}
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 border bg-emerald-500/15 border-emerald-500/45 text-emerald-300">
                    Access Granted
                  </span>
                </div>

                {/* Display Name Editor */}
                {isEditingName ? (
                  <form onSubmit={(e) => void handleSaveDisplayName(e)} className="pt-3 border-t border-blue-900/50 flex gap-2">
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={120}
                      value={editNameInput}
                      onChange={(e) => setEditNameInput(e.target.value)}
                      placeholder="Your full name"
                      className="flex-1 px-3 py-2 text-xs bg-[#040a18] border border-blue-800/70 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(false);
                        setEditNameInput(currentUser.displayName || '');
                      }}
                      className="px-3 py-2 rounded-lg bg-[#040a18] border border-blue-900/70 text-slate-300 hover:text-white text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="pt-3 border-t border-blue-900/50 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Orders, VIP passes, and shares automatically prefill with your account details.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditNameInput(currentUser.displayName || '');
                        setIsEditingName(true);
                      }}
                      className="text-blue-300 hover:text-white font-semibold shrink-0 ml-3 cursor-pointer"
                    >
                      Edit Name
                    </button>
                  </div>
                )}
              </div>

              {/* Personal Wallet Balance & Payment Approval Summary */}
              <div className="p-4 rounded-xl bg-[#08142b] border border-emerald-500/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Personal Account Wallet Balance</span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-3 mt-1">
                      <span className="font-display font-black text-2xl text-white font-mono tabular-nums">
                        ${walletStats.approvedBalanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </span>
                      {walletStats.pendingBalanceUsd > 0 && (
                        <span className="text-[11px] font-mono text-amber-300 tabular-nums">
                          (${walletStats.pendingBalanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pending approval)
                        </span>
                      )}
                      {walletStats.heldBalanceUsd > 0 && (
                        <span className="text-[11px] font-mono text-red-300 tabular-nums">
                          (${walletStats.heldBalanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} on hold)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Money loaded on your personal wallets is released for checkout after individual management payment approval.
                    </p>
                  </div>

                  {onSubmitWalletLoadRequest && (
                    <button
                      type="button"
                      onClick={() => setShowLoadForm((prev) => !prev)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{showLoadForm ? 'Hide Deposit Form' : 'Load Money to Wallet'}</span>
                    </button>
                  )}
                </div>

                {showLoadForm && onSubmitWalletLoadRequest && (
                  <form
                    onSubmit={handleWalletLoadSubmit}
                    className="p-3.5 rounded-xl bg-[#040a18] border border-blue-900/70 space-y-3"
                  >
                    <div className="text-xs font-bold text-white">
                      Submit Wallet Deposit for Payment Approval
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300 block">
                          Personal Wallet Currency
                        </label>
                        <select
                          value={selectedWalletSymbol}
                          onChange={(e) => setSelectedWalletSymbol(e.target.value as OfficialWalletSymbol)}
                          className="w-full px-3 py-2 text-xs bg-[#08142b] border border-blue-900/70 rounded-lg text-white font-mono focus:outline-none focus:border-blue-400"
                        >
                          {companyWallets
                            .filter((w) => w.enabled)
                            .map((w) => (
                              <option key={w.symbol} value={w.symbol}>
                                {w.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300 block">
                          USD Amount Loaded ($)
                        </label>
                        <input
                          type="number"
                          min={1}
                          step="0.01"
                          required
                          value={loadAmountUsd}
                          onChange={(e) => setLoadAmountUsd(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#08142b] border border-blue-900/70 rounded-lg text-white font-mono tabular-nums focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300 block">
                          Transaction Hash / Reference *
                        </label>
                        <input
                          type="text"
                          required
                          value={loadTxRef}
                          onChange={(e) => setLoadTxRef(e.target.value)}
                          placeholder="Paste blockchain TxID or transfer ref..."
                          className="w-full px-3 py-2 text-xs bg-[#08142b] border border-blue-900/70 rounded-lg text-white font-mono focus:outline-none focus:border-blue-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300 block">
                          Note (Optional)
                        </label>
                        <input
                          type="text"
                          value={loadNote}
                          onChange={(e) => setLoadNote(e.target.value)}
                          placeholder="e.g. For Cybertruck order / VIP card"
                          className="w-full px-3 py-2 text-xs bg-[#08142b] border border-blue-900/70 rounded-lg text-white focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={loadConfirmKeyword}
                          onChange={(e) => setLoadConfirmKeyword(e.target.value)}
                          aria-label="Type CONFIRM to finalize wallet deposit"
                          placeholder="Type CONFIRM to finalize..."
                          className={`flex-1 px-3 py-2 text-xs bg-[#08142b] border rounded-lg font-mono tracking-wider text-white placeholder:text-slate-500 focus:outline-none ${
                            loadConfirmKeyword.trim() === 'CONFIRM'
                              ? 'border-emerald-500/70 focus:border-emerald-400'
                              : 'border-amber-500/45 focus:border-blue-400'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-mono whitespace-nowrap ${
                            loadConfirmKeyword.trim() === 'CONFIRM'
                              ? 'text-emerald-300 font-bold'
                              : 'text-amber-300/90'
                          }`}
                        >
                          {loadConfirmKeyword.trim() === 'CONFIRM' ? 'Ready' : 'Type CONFIRM'}
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={loadConfirmKeyword.trim() !== 'CONFIRM'}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                      >
                        Confirm Payment &amp; Submit
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Member Individual Referral Dashboard Quick Card */}
              {onOpenReferralDashboard && (
                <div className="p-4 rounded-xl bg-[#08142b] border border-blue-500/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-blue-300 font-bold flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Individual Referral Dashboard · {commissionPercent}% Partner Rate</span>
                    </div>
                    <div className="text-xs text-slate-200 font-mono tabular-nums">
                      Code: <strong className="text-white">{visitorReferralCode || 'Active'}</strong> ·{' '}
                      Earned:{' '}
                      <strong className="text-emerald-300">
                        ${referralEarnedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>{' '}
                      · {referralConversionsCount} {referralConversionsCount === 1 ? 'conversion' : 'conversions'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenReferralDashboard}
                    className="px-3.5 py-2 rounded-xl bg-blue-600/25 border border-blue-400/60 hover:bg-blue-600/40 text-blue-100 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <Percent className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Open Referral Dashboard</span>
                  </button>
                </div>
              )}

              {/* All 9 Official Wallets Shown as Visitor Personal Wallet Addresses */}
              <OfficialWalletsSelector
                wallets={companyWallets}
                selectedSymbol={selectedWalletSymbol}
                onSelectSymbol={setSelectedWalletSymbol}
                mode="personal"
              />

              {/* Visitor's Recent Wallet Load Requests & Approval Status */}
              {walletStats.memberRequests.length > 0 && (
                <div className="p-4 rounded-xl bg-[#040a18] border border-blue-900/60 space-y-2.5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-blue-300 font-bold">
                    Personal Wallet Loads &amp; Payment Approval Log ({walletStats.memberRequests.length})
                  </div>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {walletStats.memberRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-2.5 rounded-lg bg-[#08142b] border border-blue-900/60 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-mono font-bold text-white tabular-nums">
                            ${req.amountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                            <span className="text-blue-300">({req.walletSymbol})</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 truncate">
                            Ref: {req.txReference} · {req.timeStr}
                          </div>
                          {req.adminNotes && (
                            <div className="text-[10px] text-blue-200 mt-0.5">
                              Note: {req.adminNotes}
                            </div>
                          )}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 border ${
                            req.status === 'approved'
                              ? 'bg-emerald-500/15 border-emerald-500/45 text-emerald-300'
                              : req.status === 'held'
                              ? 'bg-amber-500/15 border-amber-500/45 text-amber-300'
                              : req.status === 'rejected'
                              ? 'bg-red-500/15 border-red-500/45 text-red-300'
                              : 'bg-blue-500/15 border-blue-500/45 text-blue-200 flex items-center gap-1'
                          }`}
                        >
                          {req.status === 'pending_approval' && <Clock className="w-2.5 h-2.5" />}
                          <span>
                            {req.status === 'approved'
                              ? 'Approved'
                              : req.status === 'held'
                              ? 'On Hold'
                              : req.status === 'rejected'
                              ? 'Rejected'
                              : 'Pending Approval'}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-blue-900/60">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void handleSignOut()}
                  className="px-4 py-2.5 rounded-xl bg-[#08142b] border border-red-500/40 hover:bg-red-950/40 text-red-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs font-bold cursor-pointer"
                >
                  Continue to Platform
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* TAB SWITCHER (Sign Up / Sign In) */}
              {mode !== 'reset' && (
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#040a18] border border-blue-900/70">
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mode === 'register'
                        ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mode === 'signin'
                        ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* REGISTER FORM */}
              {mode === 'register' && (
                <form onSubmit={(e) => void handleRegister(e)} className="space-y-4">
                  {/* Off-screen honeypot input against automated bots */}
                  <div className="sr-only" aria-hidden="true">
                    <label htmlFor="member-access-code-field">Leave blank</label>
                    <input
                      id="member-access-code-field"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypotTrap}
                      onChange={(e) => setHoneypotTrap(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="reg-full-name" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      <span>Full Name</span>
                    </label>
                    <input
                      id="reg-full-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={120}
                      autoComplete="name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Jordan Vance"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="reg-email" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <span>Email Address</span>
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      maxLength={254}
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="reg-password" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-blue-400" />
                        <span>Create Strong Password</span>
                      </label>
                      {password.length > 0 && (
                        <span
                          className={`text-[10px] font-mono font-bold uppercase ${
                            passwordReport.score >= 3
                              ? 'text-emerald-300'
                              : passwordReport.score === 2
                              ? 'text-amber-300'
                              : 'text-red-300'
                          }`}
                        >
                          {passwordReport.label}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters (8+ with symbols recommended)"
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Strength Meter & Live Policy Checklist */}
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
                        {[1, 2, 3, 4].map((stepIdx) => (
                          <div
                            key={stepIdx}
                            className={`h-1.5 rounded-full transition-colors ${
                              passwordReport.score >= stepIdx ? strengthColorClass : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono">
                        <div className={`flex items-center gap-1.5 ${passwordReport.checks.minLength ? 'text-emerald-300' : 'text-slate-400'}`}>
                          <Check className="w-3 h-3 shrink-0" />
                          <span>6+ characters</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${passwordReport.checks.uppercase && passwordReport.checks.lowercase ? 'text-emerald-300' : 'text-slate-400'}`}>
                          <Check className="w-3 h-3 shrink-0" />
                          <span>Upper &amp; lowercase</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${passwordReport.checks.number ? 'text-emerald-300' : 'text-slate-400'}`}>
                          <Check className="w-3 h-3 shrink-0" />
                          <span>Number (0-9)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${passwordReport.checks.symbol ? 'text-emerald-300' : 'text-slate-400'}`}>
                          <Check className="w-3 h-3 shrink-0" />
                          <span>Symbol (!@#$...)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="reg-confirm-password" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                      <span>Confirm Password</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="text-[11px] text-red-300 font-mono">Passwords do not match yet.</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold tracking-wide shadow-lg shadow-blue-600/20 cursor-pointer"
                  >
                    {isSubmitting ? 'Creating Encrypted Account...' : 'Sign Up & Unlock Full Access'}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    Instant access upon submission with salted PBKDF2 protection and 3-attempt brute-force defense.
                  </p>
                </form>
              )}

              {/* SIGN-IN FORM */}
              {mode === 'signin' && (
                <form onSubmit={(e) => void handleSignIn(e)} className="space-y-4">
                  {/* Off-screen honeypot input against automated bots */}
                  <div className="sr-only" aria-hidden="true">
                    <label htmlFor="signin-access-code-field">Leave blank</label>
                    <input
                      id="signin-access-code-field"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypotTrap}
                      onChange={(e) => setHoneypotTrap(e.target.value)}
                    />
                  </div>

                  {remainingAttempts < 3 && (
                    <div className="p-3 rounded-xl bg-amber-950/35 border border-amber-500/45 text-[11px] text-amber-200 font-mono tabular-nums">
                      Security Notice: {remainingAttempts}{' '}
                      {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining before {LOCKOUT_DURATION_MINUTES}-minute full-site lockout.
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="signin-email" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <span>Email Address</span>
                    </label>
                    <input
                      id="signin-email"
                      type="email"
                      required
                      maxLength={254}
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="signin-password" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-blue-400" />
                        <span>Password</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => switchMode('reset')}
                        className="text-[11px] text-blue-300 hover:text-white font-semibold cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password (min. 6 characters)"
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold tracking-wide shadow-lg shadow-blue-600/20 cursor-pointer"
                  >
                    {isSubmitting ? 'Verifying & Granting Access...' : 'Sign In & Unlock Platform'}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    New visitor? Switch to the <button type="button" onClick={() => switchMode('register')} className="text-blue-300 hover:text-white font-semibold underline cursor-pointer">Sign Up</button> tab to register. Three consecutive incorrect password attempts lock access for {LOCKOUT_DURATION_MINUTES} minutes.
                  </p>
                </form>
              )}

              {/* PASSWORD RESET FORM */}
              {mode === 'reset' && (
                <form onSubmit={(e) => void handlePasswordReset(e)} className="space-y-4">
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white font-semibold cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Enter your registered email address and set a new password to restore immediate encrypted access.
                  </p>

                  <div className="space-y-1.5">
                    <label htmlFor="reset-email" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <span>Email Address</span>
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      required
                      maxLength={254}
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="reset-new-password" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      <span>New Password</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reset-new-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="reset-confirm-password" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                      <span>Confirm New Password</span>
                    </label>
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold tracking-wide shadow-lg cursor-pointer"
                  >
                    {isSubmitting ? 'Updating Password...' : 'Update Password & Sign In'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
