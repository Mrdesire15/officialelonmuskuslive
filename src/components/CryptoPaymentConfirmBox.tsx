import React, { useEffect, useState } from 'react';
import { CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { OfficialWalletSymbol } from '../types';

interface CryptoPaymentConfirmBoxProps {
  amountUsd: number;
  walletSymbol: OfficialWalletSymbol;
  confirmed: boolean;
  onConfirmChange: (confirmed: boolean) => void;
  txHash: string;
  onTxHashChange: (value: string) => void;
}

export const CryptoPaymentConfirmBox: React.FC<CryptoPaymentConfirmBoxProps> = ({
  amountUsd,
  walletSymbol,
  confirmed,
  onConfirmChange,
  txHash,
  onTxHashChange,
}) => {
  const [confirmPhrase, setConfirmPhrase] = useState('');

  useEffect(() => {
    setConfirmPhrase('');
  }, [walletSymbol]);

  const isExactConfirmTyped = confirmPhrase.trim() === 'CONFIRM';

  return (
    <div
      className={`p-4 rounded-xl border text-xs transition-all space-y-3 ${
        confirmed
          ? 'bg-emerald-950/35 border-emerald-500/60 text-emerald-100'
          : 'bg-[#08142b] border-blue-500/50 text-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-bold text-white">
          {confirmed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          )}
          <span>
            {confirmed
              ? `Crypto Payment Confirmed (${walletSymbol})`
              : `Confirm ${walletSymbol} Payment to Proceed`}
          </span>
        </div>
        <span className="font-mono font-bold text-emerald-300 tabular-nums">
          ${amountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
        </span>
      </div>

      <p className="text-[11px] text-slate-300 leading-relaxed">
        After sending or scanning the <strong className="text-white">{walletSymbol}</strong> wallet address above, enter your optional transaction hash, type{' '}
        <strong className="font-mono text-amber-300">CONFIRM</strong> in the verification box, and click{' '}
        <strong className="text-white">Confirm Payment</strong> to finalize.
      </p>

      <div className="space-y-2.5">
        <input
          type="text"
          value={txHash}
          disabled={confirmed}
          onChange={(e) => onTxHashChange(e.target.value)}
          placeholder={`Optional ${walletSymbol} transaction hash / transfer reference...`}
          className="w-full px-3 py-2 rounded-lg bg-[#040a18] border border-blue-900/70 disabled:opacity-60 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Lock className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={confirmPhrase}
                disabled={confirmed}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                aria-label="Type CONFIRM to finalize crypto payment"
                placeholder="Type CONFIRM to finalize..."
                className={`w-full pl-8 pr-3 py-2 rounded-lg bg-[#040a18] border text-xs font-mono tracking-wider text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-60 ${
                  isExactConfirmTyped
                    ? 'border-emerald-500/70 focus:border-emerald-400'
                    : 'border-amber-500/45 focus:border-blue-400'
                }`}
              />
            </div>
            {!confirmed && (
              <span
                className={`text-[10px] font-mono whitespace-nowrap ${
                  isExactConfirmTyped ? 'text-emerald-300 font-bold' : 'text-amber-300/90'
                }`}
              >
                {isExactConfirmTyped ? 'CONFIRM verified' : 'Exact: CONFIRM'}
              </span>
            )}
          </div>

          {confirmed ? (
            <button
              type="button"
              onClick={() => {
                setConfirmPhrase('');
                onConfirmChange(false);
              }}
              className="px-4 py-2 rounded-lg bg-emerald-600/25 border border-emerald-400/60 hover:bg-emerald-600/35 text-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Payment Confirmed (Reset)</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!isExactConfirmTyped}
              onClick={() => {
                if (!isExactConfirmTyped) return;
                onConfirmChange(true);
              }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Payment</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
