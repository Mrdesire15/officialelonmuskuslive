import React, { useState } from 'react';
import { Download, Smartphone, X, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => {
          void install();
        }}
        className={`flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
          compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs'
        } ${className}`}
        title="Install app on your phone for native notifications"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center justify-center gap-1.5 rounded-xl border border-blue-500/50 bg-blue-600/20 hover:bg-blue-600/35 text-blue-100 hover:text-white font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs'
          } ${className}`}
          title="Add to iPhone / iPad Home Screen for phone notifications"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-300" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#020611]/90 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#061024] border border-blue-500/45 p-5 shadow-2xl space-y-4 text-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center text-white shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-white">
                      Install on iPhone / iPad
                    </h3>
                    <p className="text-[11px] font-mono text-blue-300">
                      Required on iOS for phone lockscreen alerts
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  aria-label="Close iOS install instructions"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <ol className="space-y-2.5 text-xs text-slate-200 bg-[#040a18] border border-blue-900/60 rounded-xl p-3.5">
                <li className="flex items-start gap-2">
                  <span className="font-mono font-bold text-blue-300">1.</span>
                  <span>
                    Tap the <strong className="inline-flex items-center gap-1 text-white"><Share className="w-3 h-3" /> Share</strong> button in your Safari toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono font-bold text-blue-300">2.</span>
                  <span>
                    Scroll down and tap <strong className="text-white">Add to Home Screen</strong>, then open the app from your Home Screen and tap <strong className="text-white">Enable Phone Alerts</strong>.
                  </span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
