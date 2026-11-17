import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Monitor,
  X,
  Share,
  ExternalLink,
  CheckCircle2,
  MoreVertical,
} from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, browserHint, inIframe, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) return;
    }
    setShowGuideModal(true);
  };

  const currentUrl =
    typeof window !== 'undefined' ? window.location.href : 'https://elonmusk.app';

  return (
    <>
      <button
        type="button"
        onClick={() => {
          void handleClick();
        }}
        className={`flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 active:scale-95 text-white font-bold shadow-sm border border-white/20 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
          compact ? 'px-2.5 py-2 text-xs' : 'px-4 py-3 text-xs sm:text-sm'
        } ${className}`}
        title="Download or install Elon Musk · Welcome & Meet App on this device"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>Download App</span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020611]/92 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#061024] border border-blue-500/50 p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  {isIOS ? (
                    <Smartphone className="w-5 h-5" />
                  ) : (
                    <Monitor className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    Download &amp; Install App
                  </h3>
                  <p className="text-[11px] font-mono text-blue-300">
                    Works on Desktop, Android &amp; iPhone / iPad
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                aria-label="Close download instructions"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS || browserHint === 'ios' ? (
              <ol className="space-y-2.5 text-xs text-slate-200 bg-[#040a18] border border-blue-900/60 rounded-xl p-4">
                <li className="flex items-start gap-2">
                  <span className="font-mono font-bold text-blue-300">1.</span>
                  <span>
                    Tap the{' '}
                    <strong className="inline-flex items-center gap-1 text-white">
                      <Share className="w-3.5 h-3.5 text-blue-300" /> Share
                    </strong>{' '}
                    button in your Safari toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono font-bold text-blue-300">2.</span>
                  <span>
                    Scroll down and tap <strong className="text-white">Add to Home Screen</strong>, then launch the app icon from your Home Screen.
                  </span>
                </li>
              </ol>
            ) : browserHint === 'safari-mac' ? (
              <ol className="space-y-2.5 text-xs text-slate-200 bg-[#040a18] border border-blue-900/60 rounded-xl p-4">
                <li className="flex items-start gap-2">
                  <span className="font-mono font-bold text-blue-300">1.</span>
                  <span>
                    Open <strong className="text-white">File → Add to Dock…</strong> in the macOS Safari menu bar (or click the <Share className="inline w-3.5 h-3.5 text-blue-300" /> Share button).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono font-bold text-blue-300">2.</span>
                  <span>
                    Click <strong className="text-white">Add</strong> to download it directly to your Mac Dock as a standalone app.
                  </span>
                </li>
              </ol>
            ) : browserHint === 'firefox' ? (
              <ol className="space-y-2.5 text-xs text-slate-200 bg-[#040a18] border border-blue-900/60 rounded-xl p-4">
                <li className="flex items-start gap-2">
                  <span className="font-mono font-bold text-blue-300">1.</span>
                  <span>
                    On Android Firefox, tap the <MoreVertical className="inline w-3.5 h-3.5 text-blue-300" /> menu button and select <strong className="text-white">Install</strong> / <strong className="text-white">Add app to Home screen</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono font-bold text-blue-300">2.</span>
                  <span>
                    On desktop, open in Chrome, Edge, or Brave and click the install icon in the address bar for full offline desktop app support.
                  </span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-2.5 text-xs text-slate-200 bg-[#040a18] border border-blue-900/60 rounded-xl p-4">
                <li className="flex items-start gap-2">
                  <span className="font-mono font-bold text-blue-300">1.</span>
                  <span>
                    Click the <strong className="text-white">Install App</strong> icon in your browser&apos;s address bar (top right) or tap the browser{' '}
                    <MoreVertical className="inline w-3.5 h-3.5 text-blue-300" /> menu →{' '}
                    <strong className="text-white">Install app / Add to Home screen</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono font-bold text-blue-300">2.</span>
                  <span>
                    Confirm <strong className="text-white">Install</strong> to add the standalone app to your device with offline cache and alerts enabled.
                  </span>
                </li>
              </ol>
            )}

            <div className="flex items-center gap-2 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/35 rounded-xl px-3.5 py-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Offline PWA service worker and Web App Manifest are active.</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {inIframe && (
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600/25 hover:bg-blue-600/40 border border-blue-500/50 text-blue-100 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Browser Tab to Install</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 border border-amber-300/60 px-3.5 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      <span>Offline Mode — Cached content active</span>
    </div>
  );
};
