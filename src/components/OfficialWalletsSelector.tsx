import React, { useState } from 'react';
import { Check, Copy, QrCode, ShieldCheck, Wallet } from 'lucide-react';
import { CompanyWalletRecord, OfficialWalletSymbol } from '../types';
import { formatCompanyWalletsSummary } from '../data/officialWallets';
import { WalletQRCode, WalletScanModal } from './WalletQRCode';

interface OfficialWalletsSelectorProps {
  wallets: CompanyWalletRecord[];
  selectedSymbol?: OfficialWalletSymbol;
  onSelectSymbol?: (symbol: OfficialWalletSymbol) => void;
  mode?: 'company' | 'personal';
  compact?: boolean;
}

export const OfficialWalletsSelector: React.FC<OfficialWalletsSelectorProps> = ({
  wallets,
  selectedSymbol,
  onSelectSymbol,
  mode = 'company',
  compact = false,
}) => {
  const enabledWallets = wallets.filter((w) => w.enabled && w.address.trim().length > 0);
  const [internalSymbol, setInternalSymbol] = useState<OfficialWalletSymbol>(
    selectedSymbol || enabledWallets[0]?.symbol || 'BTC'
  );
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [scanModalWallet, setScanModalWallet] = useState<CompanyWalletRecord | null>(null);

  const activeSymbol = selectedSymbol || internalSymbol;
  const activeWallet =
    enabledWallets.find((w) => w.symbol === activeSymbol) || enabledWallets[0];

  const handleSelect = (symbol: OfficialWalletSymbol) => {
    setInternalSymbol(symbol);
    onSelectSymbol?.(symbol);
  };

  const copyAddress = (address: string, key: string) => {
    navigator.clipboard.writeText(address);
    setCopiedSymbol(key);
    setTimeout(() => setCopiedSymbol((curr) => (curr === key ? null : curr)), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(formatCompanyWalletsSummary(enabledWallets));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  if (enabledWallets.length === 0) {
    return null;
  }

  return (
    <div className="p-4 rounded-xl bg-[#08142b] border border-emerald-500/45 text-xs text-slate-200 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold text-white flex items-center gap-1.5">
          {mode === 'personal' ? (
            <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>
            {mode === 'personal'
              ? 'Your Personal Wallet Addresses (Official Multi-Asset)'
              : 'Official Company Settlement Wallets'}
          </span>
        </div>

        <button
          type="button"
          onClick={copyAll}
          className="px-2.5 py-1 rounded-md bg-[#040a18] border border-blue-800/70 text-[11px] font-mono text-blue-200 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          {copiedAll ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copiedAll ? 'All Copied' : 'Copy All 9'}</span>
        </button>
      </div>

      {/* Coin Selection Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {enabledWallets.map((wallet) => {
          const isSelected = activeWallet?.symbol === wallet.symbol;
          return (
            <button
              key={wallet.symbol}
              type="button"
              onClick={() => handleSelect(wallet.symbol)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white border-blue-400 shadow-sm'
                  : 'bg-[#040a18] border-blue-900/70 text-slate-300 hover:text-white hover:border-blue-500/60'
              }`}
            >
              {wallet.symbol}
            </button>
          );
        })}
      </div>

      {/* Highlighted Active Wallet Address + Scannable QR Code */}
      {activeWallet && (
        <div className="p-3 rounded-lg bg-[#040a18] border border-blue-900/70 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-white truncate">
                  {activeWallet.name}{' '}
                  <span className="text-[10px] font-mono text-emerald-300 font-normal">
                    · {mode === 'personal' ? 'Personal Wallet Address' : 'Official Company Wallet'}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-blue-300">{activeWallet.network}</div>
              </div>

              <button
                type="button"
                onClick={() => copyAddress(activeWallet.address, activeWallet.symbol)}
                className="px-2.5 py-1 rounded-md bg-[#08142b] border border-blue-700/70 text-[11px] font-mono text-blue-200 hover:text-white flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedSymbol === activeWallet.symbol ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedSymbol === activeWallet.symbol ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-2.5 rounded-md bg-[#061024] border border-blue-950 font-mono text-[11px] text-emerald-200 break-all select-all tabular-nums">
              {activeWallet.address}
            </div>
          </div>

          <div className="flex sm:flex-col items-center gap-2 shrink-0 self-center sm:self-auto">
            <WalletQRCode
              address={activeWallet.address}
              label={activeWallet.name}
              size={84}
              onExpand={() => setScanModalWallet(activeWallet)}
            />
          </div>
        </div>
      )}

      {/* Compact Directory of All Personal / Official Wallets */}
      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {enabledWallets.map((w) => (
            <div
              key={w.symbol}
              onClick={() => handleSelect(w.symbol)}
              className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                activeWallet?.symbol === w.symbol
                  ? 'bg-[#091836] border-blue-500/60'
                  : 'bg-[#040a18]/85 border-blue-900/50 hover:border-blue-700/60'
              }`}
            >
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <span className="font-mono text-blue-300">{w.symbol}</span>
                  <span className="text-slate-400 font-normal truncate">{w.network}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-300 truncate">{w.address}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setScanModalWallet(w);
                  }}
                  aria-label={`Show QR code for ${w.name}`}
                  title={`Scan ${w.symbol} QR`}
                  className="p-1.5 rounded-md bg-[#08142b] border border-emerald-500/45 text-emerald-300 hover:text-white cursor-pointer"
                >
                  <QrCode className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyAddress(w.address, `row-${w.symbol}`);
                  }}
                  aria-label={`Copy ${w.name} address`}
                  className="p-1.5 rounded-md bg-[#08142b] border border-blue-900/70 text-blue-300 hover:text-white cursor-pointer"
                >
                  {copiedSymbol === `row-${w.symbol}` ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <WalletScanModal
        wallet={scanModalWallet}
        onClose={() => setScanModalWallet(null)}
        titlePrefix={
          mode === 'personal'
            ? 'Personal Wallet · Scan & Pay QR'
            : 'Official Company Wallet · Scan & Pay QR'
        }
      />
    </div>
  );
};
