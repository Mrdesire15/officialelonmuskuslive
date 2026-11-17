import React from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (import.meta.env.DEV) {
      console.error('Application boundary caught error:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#040a18] text-slate-100 flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl bg-[#061024] border border-blue-500/45 shadow-2xl overflow-hidden">
            <div className="h-[2px] w-full us-flag-strip" />
            <div className="p-6 sm:p-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h1 className="font-display text-lg font-bold text-white">
                  Session Recovery Required
                </h1>
                <p className="text-xs text-slate-300 leading-relaxed">
                  An unexpected interface error occurred. Reload to restore your verified session cleanly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Platform</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
