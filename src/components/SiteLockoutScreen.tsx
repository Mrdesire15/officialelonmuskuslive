import React from 'react';
import { ShieldAlert, Lock, Clock } from 'lucide-react';
import { formatLockoutCountdown, LOCKOUT_DURATION_MINUTES } from '../utils/securityLockout';

interface SiteLockoutScreenProps {
  remainingMs: number;
}

export const SiteLockoutScreen: React.FC<SiteLockoutScreenProps> = ({ remainingMs }) => {
  return (
    <div
      className="min-h-screen w-full bg-[#040a18] text-slate-100 flex items-center justify-center p-4 select-none"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="site-lockout-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#050d21] border border-red-500/60 shadow-2xl overflow-hidden">
        <div className="h-[2px] w-full us-flag-strip" />

        <div className="p-6 sm:p-8 text-center space-y-5">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 shadow-lg shadow-red-600/15">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-300 text-[11px] font-mono font-bold uppercase tracking-wider">
              <Lock className="w-3 h-3" />
              <span>Security Protection Active</span>
            </div>
            <h1
              id="site-lockout-title"
              className="text-xl font-display font-bold text-white tracking-wide"
            >
              Access Temporarily Locked
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Three consecutive incorrect password attempts were detected. To protect member accounts and prevent unauthorized access, site access is locked for {LOCKOUT_DURATION_MINUTES} minutes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#08152e] border border-blue-900/60 space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-blue-300">
              <Clock className="w-3.5 h-3.5" />
              <span>Time Remaining Until Unlock</span>
            </div>
            <div className="text-3xl font-mono font-black text-white tabular-nums tracking-widest">
              {formatLockoutCountdown(remainingMs)}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            This page will unlock automatically when the countdown reaches 00:00.
          </p>
        </div>
      </div>
    </div>
  );
};
