import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  FileCheck2,
  QrCode,
  Search,
  ShieldCheck,
  Smartphone,
  Wallet,
  X,
} from 'lucide-react';
import { CompanyWalletRecord } from '../types';
import { WalletQRCode, WalletScanModal } from './WalletQRCode';

interface CryptoPaymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: CompanyWalletRecord[];
}

type GuideStepFilter = 'all' | 'step1' | 'step2' | 'step3' | 'step4';

const EXCHANGE_SOURCES = [
  {
    platform: 'Coinbase / Kraken',
    assets: 'BTC, ETH, USDT (ERC-20), SOL, LTC, DOGE, BCH',
    method: 'Bank ACH, Wire, or Debit Card -> Withdraw on matching network',
  },
  {
    platform: 'PayPal / Venmo',
    assets: 'PYUSD (PayPal USD), BTC, ETH, LTC, BCH',
    method: 'Instant USD conversion -> External crypto transfer to ERC-20 / native address',
  },
  {
    platform: 'Cash App / Strike',
    assets: 'BTC (Bitcoin Mainnet)',
    method: 'Instant Bitcoin purchase -> On-chain withdrawal to bc1q Bech32 address',
  },
  {
    platform: 'Self-Custody Wallets',
    assets: 'MetaMask (ETH/USDT/PYUSD/BNB), Phantom (SOL), Trust Wallet',
    method: 'Scan the official QR code directly from your mobile wallet app',
  },
];

const NETWORK_CHECKLIST = [
  {
    pair: 'BTC (Bitcoin)',
    rule: 'Send strictly over Bitcoin Native SegWit / Mainnet (bc1q...). Do not use Lightning or Wrapped BTC.',
  },
  {
    pair: 'ETH / USDT / PYUSD',
    rule: 'Send strictly on Ethereum Mainnet (ERC-20) to avoid cross-chain loss.',
  },
  {
    pair: 'BNB',
    rule: 'Send on BNB Smart Chain (BEP-20, 0x... EVM address).',
  },
  {
    pair: 'SOL / DOGE / LTC / BCH',
    rule: 'Use each coin native mainnet (Solana SPL/Native, Dogecoin, Litecoin, Bitcoin Cash CashAddr).',
  },
];

export const CryptoPaymentGuideModal: React.FC<CryptoPaymentGuideModalProps> = ({
  isOpen,
  onClose,
  wallets,
}) => {
  const [stepFilter, setStepFilter] = useState<GuideStepFilter>('all');
  const [walletSearch, setWalletSearch] = useState<string>('');
  const [showEnabledOnly, setShowEnabledOnly] = useState<boolean>(false);
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);
  const [copiedGuide, setCopiedGuide] = useState<boolean>(false);
  const [enlargedWallet, setEnlargedWallet] = useState<CompanyWalletRecord | null>(null);

  const filteredWallets = useMemo(() => {
    const q = walletSearch.trim().toLowerCase();
    return wallets.filter((w) => {
      if (showEnabledOnly && !w.enabled) return false;
      if (!q) return true;
      return (
        w.symbol.toLowerCase().includes(q) ||
        w.name.toLowerCase().includes(q) ||
        w.network.toLowerCase().includes(q) ||
        w.address.toLowerCase().includes(q)
      );
    });
  }, [wallets, walletSearch, showEnabledOnly]);

  if (!isOpen) return null;

  const activeCount = wallets.filter((w) => w.enabled && w.address.trim()).length;

  const handleCopyAddress = (wallet: CompanyWalletRecord) => {
    const clean = wallet.address.trim();
    if (!clean) return;
    navigator.clipboard.writeText(clean);
    setCopiedSymbol(wallet.symbol);
    setTimeout(() => setCopiedSymbol(null), 2000);
  };

  const handleCopyFullGuide = () => {
    const activeWalletsText = wallets
      .filter((w) => w.enabled && w.address.trim())
      .map((w) => `- ${w.name} (${w.symbol} · ${w.network}): ${w.address.trim()}`)
      .join('\n');

    const guideText = [
      'TESLA & SPACEX OFFICIAL CRYPTO & PAYPAL USD PAYMENT GUIDE',
      '',
      'Step 1: Obtain Supported Crypto or PayPal USD (PYUSD)',
      '- Purchase BTC, ETH, USDT, PYUSD, BNB, SOL, DOGE, LTC, or BCH on a verified platform (Coinbase, Kraken, PayPal, Cash App, MetaMask, Phantom, Trust Wallet).',
      '- Ensure you withdraw on the exact matching blockchain network.',
      '',
      'Step 2: Send to an Official Company Wallet Address (or Scan QR)',
      activeWalletsText || '- Configure official company wallets in AdminPortal -> Wallets & Accounts.',
      '',
      'Step 3: Record Your Transaction Hash (TxID)',
      '- Confirm the net USD amount covers any sender network gas fees.',
      '- Copy the confirmed blockchain TxID / PayPal transfer reference.',
      '',
      'Step 4: Explicit CONFIRM Verification & Payment Approval',
      '- Paste your TxID / reference in checkout or Personal Wallet Load.',
      '- Type exact uppercase CONFIRM and click "Confirm Payment" to submit.',
      '- Management verifies on-chain settlement and approves your order or wallet balance.',
    ].join('\n');

    navigator.clipboard.writeText(guideText);
    setCopiedGuide(true);
    setTimeout(() => setCopiedGuide(false), 2500);
  };

  const showStep1 = stepFilter === 'all' || stepFilter === 'step1';
  const showStep2 = stepFilter === 'all' || stepFilter === 'step2';
  const showStep3 = stepFilter === 'all' || stepFilter === 'step3';
  const showStep4 = stepFilter === 'all' || stepFilter === 'step4';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[65] flex items-center justify-center bg-[#020611]/90 backdrop-blur-md p-3 sm:p-5 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl h-[88vh] max-h-[820px] rounded-2xl bg-[#061024] border border-blue-500/50 shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#2a0b16] border-b border-blue-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-emerald-300 uppercase tracking-wider font-bold">
                Visitor Settlement Handbook · {activeCount} of {wallets.length} Active Official Wallets
              </div>
              <h3 className="font-display font-black text-lg text-white truncate">
                Step-by-Step Crypto Payment Guide &amp; Official Wallet QR Directory
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Crypto Payment Guide"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Step Navigation Strip */}
        <div className="px-4 sm:px-5 py-2.5 bg-[#050d20] border-b border-blue-900/60 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All 4 Steps' },
              { id: 'step1', label: '1. Obtain Crypto' },
              { id: 'step2', label: '2. Scan QR & Transfer' },
              { id: 'step3', label: '3. Verify TxID' },
              { id: 'step4', label: '4. CONFIRM & Approval' },
            ].map((tab) => {
              const active = stepFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStepFilter(tab.id as GuideStepFilter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-[#08142b] text-slate-300 border border-blue-900/60 hover:text-white hover:border-blue-600/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleCopyFullGuide}
            className="px-3 py-1.5 rounded-lg bg-[#08142b] border border-emerald-500/45 hover:border-emerald-400 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            {copiedGuide ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedGuide ? 'Full Guide Copied' : 'Copy Full Visitor Guide'}</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quick End-to-End Flow Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                num: '01',
                title: 'Obtain Asset',
                desc: 'Acquire BTC, ETH, USDT, PYUSD, BNB, SOL, DOGE, LTC, or BCH on a verified wallet/exchange.',
                icon: Wallet,
              },
              {
                num: '02',
                title: 'Scan Official QR',
                desc: 'Match the exact blockchain network and scan or copy an official company wallet below.',
                icon: QrCode,
              },
              {
                num: '03',
                title: 'Capture TxID',
                desc: 'Send the exact USD total plus gas fees, then copy your transaction hash or receipt ID.',
                icon: FileCheck2,
              },
              {
                num: '04',
                title: 'Type CONFIRM & Submit',
                desc: 'Type exact uppercase CONFIRM to unlock Confirm Payment, then await management verification.',
                icon: ShieldCheck,
              },
            ].map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.num}
                  className="p-3.5 rounded-xl bg-[#08142b] border border-blue-900/70 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-blue-300">
                    <span className="font-bold">Step {stage.num}</span>
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-white">{stage.title}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{stage.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Step 1: Obtain Supported Crypto / PayPal USD */}
          {showStep1 && (
            <section className="p-4 sm:p-5 rounded-2xl bg-[#08142b] border border-blue-900/70 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-blue-900/60">
                <div>
                  <div className="text-xs font-mono text-blue-300">Step 01 · Asset Acquisition &amp; Network Preparation</div>
                  <h4 className="text-base font-bold text-white">
                    How Visitors Obtain Crypto or PayPal USD (PYUSD)
                  </h4>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  9 Supported Settlement Assets
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXCHANGE_SOURCES.map((source) => (
                  <div
                    key={source.platform}
                    className="p-3.5 rounded-xl bg-[#040a18] border border-blue-900/60 space-y-1.5"
                  >
                    <div className="text-xs font-bold text-white">{source.platform}</div>
                    <div className="text-[11px] font-mono text-emerald-300">{source.assets}</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{source.method}</p>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-[#040a18] border border-blue-900/60 space-y-2">
                <div className="text-xs font-bold text-amber-300">
                  Mandatory Blockchain Network Matching Rules
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {NETWORK_CHECKLIST.map((item) => (
                    <div key={item.pair} className="text-xs text-slate-300 leading-relaxed">
                      <span className="font-mono font-bold text-white">{item.pair}: </span>
                      <span>{item.rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Step 2: QR Code Examples & Official Company Wallets */}
          {showStep2 && (
            <section className="p-4 sm:p-5 rounded-2xl bg-[#08142b] border border-blue-500/45 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-blue-900/60">
                <div>
                  <div className="text-xs font-mono text-emerald-300">Step 02 · Live Official Company Wallet QR Examples</div>
                  <h4 className="text-base font-bold text-white">
                    Scan Official QR Codes or Copy Verified Wallet Addresses
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Click any QR code below to open the large scan modal, save the QR SVG, or copy the exact address synced with Wallets &amp; Accounts.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={walletSearch}
                      onChange={(e) => setWalletSearch(e.target.value)}
                      placeholder="Filter asset or network..."
                      className="pl-8 pr-3 py-1.5 rounded-lg bg-[#040a18] border border-blue-900/70 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400 w-48"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEnabledOnly((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors whitespace-nowrap ${
                      showEnabledOnly
                        ? 'bg-emerald-600/25 border-emerald-400 text-emerald-200'
                        : 'bg-[#040a18] border-blue-900/70 text-slate-300 hover:text-white'
                    }`}
                  >
                    {showEnabledOnly ? 'Showing Active Only' : 'Show Active Only'}
                  </button>
                </div>
              </div>

              {filteredWallets.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#040a18] border border-blue-900/60 text-center space-y-2">
                  <p className="text-xs text-slate-300">
                    No official company wallets match your current filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setWalletSearch('');
                      setShowEnabledOnly(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    Reset Wallet Filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredWallets.map((wallet) => {
                    const isCopied = copiedSymbol === wallet.symbol;
                    return (
                      <div
                        key={wallet.symbol}
                        className="p-3.5 rounded-xl bg-[#040a18] border border-blue-900/70 flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-xs font-mono">
                              <span className="font-bold text-blue-300">{wallet.symbol}</span>
                              <span className="text-slate-500">·</span>
                              <span
                                className={
                                  wallet.enabled ? 'text-emerald-400 font-semibold' : 'text-amber-300 font-semibold'
                                }
                              >
                                {wallet.enabled ? 'Active for Visitors' : 'Paused'}
                              </span>
                            </div>
                            <div className="text-sm font-bold text-white truncate mt-0.5">
                              {wallet.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 truncate">
                              {wallet.network}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <WalletQRCode
                            address={wallet.address}
                            label={`${wallet.name} (${wallet.symbol})`}
                            size={84}
                            onExpand={() => setEnlargedWallet(wallet)}
                          />

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="text-[11px] font-mono text-emerald-200 break-all leading-snug select-all bg-[#08142b] border border-blue-900/60 rounded-lg p-2">
                              {wallet.address.trim() || 'No wallet address configured'}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={!wallet.address.trim()}
                                onClick={() => handleCopyAddress(wallet)}
                                className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#08142b] border border-blue-800/70 hover:border-blue-400 disabled:opacity-40 text-[11px] font-semibold text-blue-200 hover:text-white flex items-center justify-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                              >
                                {isCopied ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>{isCopied ? 'Copied' : 'Copy'}</span>
                              </button>
                              <button
                                type="button"
                                disabled={!wallet.address.trim()}
                                onClick={() => setEnlargedWallet(wallet)}
                                className="py-1.5 px-2.5 rounded-lg bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/35 disabled:opacity-40 text-[11px] font-semibold text-blue-200 hover:text-white flex items-center justify-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                              >
                                <Smartphone className="w-3 h-3" />
                                <span>Scan</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Step 3: Execute Transfer & Capture Transaction Hash */}
          {showStep3 && (
            <section className="p-4 sm:p-5 rounded-2xl bg-[#08142b] border border-blue-900/70 space-y-3">
              <div className="pb-2 border-b border-blue-900/60">
                <div className="text-xs font-mono text-blue-300">Step 03 · Transfer Execution &amp; Reference Capture</div>
                <h4 className="text-base font-bold text-white">
                  Verify Transfer Amount, Network Fees &amp; Transaction Hash (TxID)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#040a18] border border-blue-900/60 space-y-1.5">
                  <div className="text-xs font-bold text-white">1. Match Exact USD Total</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ensure the net received asset value matches the checkout invoice or Personal Wallet load USD amount after exchange withdrawal fees.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#040a18] border border-blue-900/60 space-y-1.5">
                  <div className="text-xs font-bold text-white">2. Wait for Broadcast Confirmation</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Most networks generate a public Transaction Hash (TxID) within seconds (SOL/BNB/DOGE) or 1–10 minutes (BTC/ETH/LTC/BCH).
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#040a18] border border-blue-900/60 space-y-1.5">
                  <div className="text-xs font-bold text-white">3. Copy Full TxID / Receipt</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Paste the complete TxID (or PayPal USD transfer confirmation code) into the payment reference field so management can audit settlement on-chain.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Step 4: CONFIRM Verification & Management Approval Workflow */}
          {showStep4 && (
            <section className="p-4 sm:p-5 rounded-2xl bg-[#08142b] border border-emerald-500/40 space-y-4">
              <div className="pb-2 border-b border-blue-900/60">
                <div className="text-xs font-mono text-emerald-300">Step 04 · Mandatory Safeguard &amp; Management Settlement</div>
                <h4 className="text-base font-bold text-white">
                  Complete Explicit <span className="font-mono text-amber-300">CONFIRM</span> Verification &amp; Payment Approval
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#040a18] border border-blue-900/60 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>Visitor Checkout &amp; Wallet Load Safeguard</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>
                        When Crypto is selected in Vehicle Order, Merch Checkout, TSLA Shares, Charity Donation, or Personal Wallet Load, the Confirm Payment box appears.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>
                        Visitors must type exact uppercase <span className="font-mono font-bold text-amber-300">CONFIRM</span> and click <span className="font-semibold text-white">Confirm Payment</span> before submission is enabled.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-[#040a18] border border-blue-900/60 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>AdminPortal Verification &amp; Individual Control</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        Inspect the submitted TxID against the matching Official Company Wallet address in <span className="font-semibold text-white">Payment &amp; Order Approvals</span> or <span className="font-semibold text-white">Wallets &amp; Accounts</span>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        Enter exact uppercase <span className="font-mono font-bold text-amber-300">CONFIRM</span> to unlock Approve &amp; Credit, Hold, or Direct Balance Adjustments — updating the visitor account and In-App Inbox immediately.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-blue-900/60 bg-[#050d20] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-mono text-slate-400">
            All QR examples update dynamically from active Wallets &amp; Accounts settings.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyFullGuide}
              className="px-3.5 py-1.5 rounded-lg bg-[#08142b] border border-blue-800/70 hover:border-blue-400 text-blue-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
            >
              {copiedGuide ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedGuide ? 'Copied Guide' : 'Copy Full Guide'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs font-bold cursor-pointer transition-all whitespace-nowrap"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>

      <WalletScanModal
        wallet={enlargedWallet}
        onClose={() => setEnlargedWallet(null)}
        titlePrefix="Crypto Payment Guide · Scan & Pay QR Example"
      />
    </div>
  );
};
