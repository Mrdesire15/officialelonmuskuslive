import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, Download, Maximize2, QrCode, X } from 'lucide-react';
import { CompanyWalletRecord } from '../types';

interface WalletQRCodeProps {
  address: string;
  label?: string;
  size?: number;
  onExpand?: () => void;
}

export const WalletQRCode: React.FC<WalletQRCodeProps> = ({
  address,
  label = 'Wallet QR Code',
  size = 76,
  onExpand,
}) => {
  const cleanAddress = address.trim();

  if (!cleanAddress) {
    return (
      <div className="w-20 h-20 rounded-xl bg-[#08142b] border border-dashed border-blue-800/70 flex flex-col items-center justify-center text-[10px] font-mono text-slate-500 shrink-0 text-center px-1">
        <QrCode className="w-4 h-4 mb-1 opacity-60" />
        <span>No Addr</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onExpand}
      disabled={!onExpand}
      title={onExpand ? `Click to enlarge ${label} QR code` : label}
      aria-label={`QR code for ${label}`}
      className={`group relative p-1.5 rounded-xl bg-white border border-blue-200/80 shadow-md shrink-0 flex flex-col items-center justify-center ${
        onExpand ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all' : 'cursor-default'
      }`}
    >
      <QRCodeSVG
        value={cleanAddress}
        size={size}
        level="M"
        bgColor="#ffffff"
        fgColor="#040a18"
      />
      {onExpand && (
        <span className="mt-1 flex items-center gap-0.5 text-[9px] font-mono font-bold uppercase text-slate-700 group-hover:text-blue-700">
          <Maximize2 className="w-2.5 h-2.5" />
          <span>Scan</span>
        </span>
      )}
    </button>
  );
};

interface WalletScanModalProps {
  wallet: CompanyWalletRecord | null;
  onClose: () => void;
  titlePrefix?: string;
}

export const WalletScanModal: React.FC<WalletScanModalProps> = ({
  wallet,
  onClose,
  titlePrefix = 'Scan & Pay Official Wallet',
}) => {
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement | null>(null);

  if (!wallet || !wallet.address.trim()) return null;

  const cleanAddress = wallet.address.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const svgEl = qrContainerRef.current?.querySelector('svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgMarkup = serializer.serializeToString(svgEl);
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${wallet.symbol.toLowerCase()}-official-wallet-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#020611]/90 backdrop-blur-md p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-[#061024] border border-blue-500/50 shadow-2xl overflow-hidden text-slate-100"
      >
        <div className="p-4 bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#2a0b16] border-b border-blue-900/60 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
              {titlePrefix}
            </div>
            <h4 className="text-sm font-bold text-white truncate">
              {wallet.name}
            </h4>
            <div className="text-[11px] font-mono text-blue-300 truncate">
              {wallet.network}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close QR scanner preview"
            className="p-1.5 rounded-full bg-[#08142b] border border-blue-900/70 text-slate-300 hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col items-center gap-4">
          <div
            ref={qrContainerRef}
            className="p-4 rounded-2xl bg-white shadow-xl border-2 border-blue-200 flex items-center justify-center"
          >
            <QRCodeSVG
              value={cleanAddress}
              size={220}
              level="M"
              bgColor="#ffffff"
              fgColor="#040a18"
            />
          </div>

          <div className="w-full space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 text-center">
              Scan with any {wallet.symbol} compatible mobile wallet app
            </div>
            <div className="p-2.5 rounded-xl bg-[#040a18] border border-blue-900/70 font-mono text-[11px] text-emerald-200 break-all text-center select-all">
              {cleanAddress}
            </div>
          </div>

          <div className="w-full flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Address Copied' : 'Copy Address'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="py-2 px-3 rounded-xl bg-[#08142b] border border-blue-800/70 hover:border-blue-400 text-blue-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save QR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
