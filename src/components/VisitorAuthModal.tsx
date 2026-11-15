import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '../firebase';
import {
  clearFailedAttempts,
  getLockoutStatus,
  recordFailedAttempt,
} from '../utils/securityLockout';

interface VisitorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  authReady: boolean;
  requiredGate?: boolean;
  onAuthSuccess?: (user: User, action: 'login' | 'signup') => void;
}

export const VisitorAuthModal: React.FC<VisitorAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  authReady,
  requiredGate = false,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'signup' | 'login' | 'reset'>('signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCredentialFailureCode = (code: string) =>
    code === 'auth/wrong-password' ||
    code === 'auth/invalid-credential' ||
    code === 'auth/user-not-found' ||
    code === 'auth/too-many-requests';

  const getFriendlyAuthError = (code: string, fallbackMessage: string) => {
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please verify your credentials and try again.';
      case 'auth/user-not-found':
        return 'No account was found for that email. Switch to Create Account to register.';
      case 'auth/too-many-requests':
        return 'Too many attempts detected. Please wait a moment and try again.';
      case 'auth/network-request-failed':
        return 'Network connection interrupted. Please check your internet connection.';
      case 'auth/operation-not-allowed':
        return 'Email sign-in is temporarily unavailable. Please try again later.';
      default:
        return fallbackMessage || 'Authentication failed. Please try again.';
    }
  };

  const handleFailedPasswordAttempt = (baseMessage: string) => {
    const status = recordFailedAttempt();
    if (status.isLocked) {
      onClose();
      return;
    }
    const attemptsWord = status.remainingAttempts === 1 ? 'attempt' : 'attempts';
    setErrorMsg(
      `${baseMessage} (${status.remainingAttempts} ${attemptsWord} remaining before a 5-minute site lockout.)`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (getLockoutStatus().isLocked) {
      onClose();
      return;
    }

    setErrorMsg(null);
    setStatusMsg(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (mode === 'reset') {
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, normalizedEmail);
        setStatusMsg(
          `Password reset link sent to ${normalizedEmail}. Check your inbox and return to sign in.`
        );
      } catch (err: unknown) {
        const fbErr = err as { code?: string; message?: string };
        setErrorMsg(getFriendlyAuthError(fbErr.code || '', fbErr.message || ''));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (password.length < 6) {
      if (mode === 'login') {
        handleFailedPasswordAttempt(
          'Incorrect email or password. Password must be at least 6 characters.'
        );
      } else {
        setErrorMsg('Password must be at least 6 characters.');
      }
      return;
    }

    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);

      if (mode === 'signup') {
        try {
          const cred = await createUserWithEmailAndPassword(
            auth,
            normalizedEmail,
            password
          );
          const trimmedName = fullName.trim().slice(0, 120);
          if (trimmedName) {
            await updateProfile(cred.user, { displayName: trimmedName });
          }
          clearFailedAttempts();
          onAuthSuccess?.(auth.currentUser || cred.user, 'signup');
          setStatusMsg(
            'Account created and authenticated. Your session will remain active on this device.'
          );
          setPassword('');
        } catch (signupErr: unknown) {
          const fbErr = signupErr as { code?: string; message?: string };

          // Automatically authenticate returning user if email already exists & password matches
          if (fbErr.code === 'auth/email-already-in-use') {
            try {
              const existingCred = await signInWithEmailAndPassword(
                auth,
                normalizedEmail,
                password
              );
              clearFailedAttempts();
              onAuthSuccess?.(auth.currentUser || existingCred.user, 'login');
              setStatusMsg(
                'Existing account verified — signed in automatically.'
              );
              setPassword('');
              return;
            } catch (signInErr: unknown) {
              const signInFbErr = signInErr as { code?: string; message?: string };
              setMode('login');
              const msg =
                signInFbErr.code === 'auth/wrong-password' ||
                signInFbErr.code === 'auth/invalid-credential'
                  ? 'An account with this email already exists, and the password did not match.'
                  : getFriendlyAuthError(signInFbErr.code || '', signInFbErr.message || '');
              if (isCredentialFailureCode(signInFbErr.code || '')) {
                handleFailedPasswordAttempt(msg);
              } else {
                setErrorMsg(msg);
              }
              return;
            }
          }

          setErrorMsg(getFriendlyAuthError(fbErr.code || '', fbErr.message || ''));
        }
      } else {
        const cred = await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          password
        );
        clearFailedAttempts();
        onAuthSuccess?.(auth.currentUser || cred.user, 'login');
        setStatusMsg(
          'Credentials verified — logged in automatically and remembered for future visits.'
        );
        setPassword('');
      }
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      const msg = getFriendlyAuthError(fbErr.code || '', fbErr.message || '');
      if (isCredentialFailureCode(fbErr.code || '')) {
        handleFailedPasswordAttempt(msg);
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      await signOut(auth);
      setVerificationSent(false);
      setStatusMsg('Signed out cleanly from this device.');
    } catch (err: unknown) {
      const fbErr = err as { message?: string };
      setErrorMsg(fbErr.message || 'Could not sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    if (!currentUser) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await sendEmailVerification(currentUser);
      setVerificationSent(true);
      setStatusMsg(`Verification link dispatched to ${currentUser.email}.`);
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      setErrorMsg(getFriendlyAuthError(fbErr.code || '', fbErr.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#030816]/90 backdrop-blur-lg animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="visitor-auth-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-[#050d21] border border-blue-800/70 shadow-2xl overflow-hidden text-slate-100 my-auto">
        {/* Top Accent Strip */}
        <div className="h-[2px] w-full us-flag-strip" />

        {requiredGate && !currentUser && (
          <div className="px-6 py-3 bg-[#040a18] border-b border-blue-900/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 via-blue-700 to-red-600 border border-white/20 flex items-center justify-center text-white font-display font-black text-sm shrink-0">
                X
              </div>
              <div className="min-w-0">
                <div className="font-display font-black text-xs tracking-wider text-white truncate">
                  ELON MUSK
                </div>
                <div className="text-[10px] font-mono tracking-wider text-blue-300/85 truncate">
                  Executive Portal Access
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/35 text-blue-200 text-[10px] font-mono font-semibold shrink-0">
              Member Gate
            </span>
          </div>
        )}

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-blue-900/50 flex items-center justify-between gap-3 bg-[#07132c]/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-red-600 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="visitor-auth-title"
                className="text-base font-display font-bold text-white tracking-wide truncate"
              >
                {currentUser
                  ? 'Member Account'
                  : mode === 'signup'
                  ? 'Create Your Account'
                  : mode === 'reset'
                  ? 'Reset Password'
                  : 'Account Sign In'}
              </h2>
              <p className="text-xs text-blue-300/80 truncate">
                {currentUser
                  ? 'Persistent session active on this device'
                  : mode === 'signup'
                  ? 'Register to unlock full portal access'
                  : 'Sign in with your email and password'}
              </p>
            </div>
          </div>

          {(!requiredGate || currentUser) && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close account sign-in dialog"
              className="p-2 rounded-xl bg-[#0a1833] border border-blue-800/50 text-slate-300 hover:text-white hover:border-blue-500 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          {!authReady ? (
            <div className="py-10 flex flex-col items-center justify-center gap-3 text-slate-300">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              <span className="text-xs font-mono">Restoring active session...</span>
            </div>
          ) : currentUser ? (
            /* Signed-in Account Profile Card */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#08152e] border border-emerald-500/40 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center text-white font-display font-bold text-base shrink-0">
                    {(currentUser.displayName || currentUser.email || 'M')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white truncate">
                      {currentUser.displayName || 'Account Member'}
                    </div>
                    <div className="text-xs text-blue-200/90 font-mono truncate">
                      {currentUser.email}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Logged In
                  </span>
                </div>

                <div className="pt-2 border-t border-blue-900/50 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Auto-Login Persistence</span>
                    <span className="text-emerald-300 font-medium">Enabled on Device</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400">Email Verification</span>
                    <span
                      className={
                        currentUser.emailVerified
                          ? 'text-emerald-300 font-medium'
                          : 'text-amber-300 font-medium'
                      }
                    >
                      {currentUser.emailVerified ? 'Verified' : 'Optional · Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Your name and email automatically prefill reservation, equity, and humanitarian forms while signed in, and future visits keep you logged in automatically.
              </p>

              {statusMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{statusMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {!currentUser.emailVerified && !verificationSent && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSendVerification}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#08152e] border border-blue-600/50 text-blue-200 hover:text-white hover:border-blue-400 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                  >
                    Send Verification Email
                  </button>
                )}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSignOut}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-red-600/20 border border-red-500/50 text-red-200 hover:bg-red-600/30 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer"
              >
                Continue to Portal
              </button>
            </div>
          ) : (
            /* Sign In / New Visitor Form */
            <>
              {/* Mode Switcher */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#08152e] border border-blue-900/60">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setStatusMsg(null);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-gradient-to-r from-blue-600/80 to-red-600/80 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setStatusMsg(null);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label
                      htmlFor="visitor-name"
                      className="block text-xs font-semibold text-slate-300 mb-1.5"
                    >
                      Full Name <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-blue-400/80 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="visitor-name"
                        type="text"
                        autoComplete="name"
                        maxLength={120}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Mercer"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#08152e] border border-blue-900/70 focus:border-blue-400 focus:outline-none text-sm text-white placeholder-slate-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="visitor-email"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-blue-400/80 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="visitor-email"
                      type="email"
                      required
                      autoComplete="email"
                      maxLength={254}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#08152e] border border-blue-900/70 focus:border-blue-400 focus:outline-none text-sm text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                {mode !== 'reset' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="visitor-password"
                        className="block text-xs font-semibold text-slate-300"
                      >
                        Password
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('reset');
                            setErrorMsg(null);
                            setStatusMsg(null);
                          }}
                          className="text-[11px] text-blue-300 hover:text-white cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-blue-400/80 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="visitor-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={
                          mode === 'signup' ? 'Create password (min. 6 chars)' : 'Enter your password'
                        }
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#08152e] border border-blue-900/70 focus:border-blue-400 focus:outline-none text-sm text-white placeholder-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {statusMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <span>{statusMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-200 text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                      <span>{errorMsg}</span>
                    </div>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signup');
                          setErrorMsg(null);
                        }}
                        className="text-[11px] text-blue-300 hover:text-white underline cursor-pointer ml-6 block"
                      >
                        New here? Create an account with this email &amp; password
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 active:scale-[0.99] text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying credentials...</span>
                    </>
                  ) : mode === 'reset' ? (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Password Reset Link</span>
                    </>
                  ) : mode === 'signup' ? (
                    <>
                      <span>Create Account &amp; Log In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Log In Automatically</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {mode === 'reset' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                      setStatusMsg(null);
                    }}
                    className="w-full py-2 text-xs text-blue-300 hover:text-white cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                )}
              </form>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                {mode === 'signup'
                  ? 'Official member registration for the Elon Musk Management Executive Portal. Existing matching credentials are authenticated seamlessly.'
                  : 'Protected access under Elon Musk Management security protocol. Verified credentials remain authenticated across returning visits.'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
