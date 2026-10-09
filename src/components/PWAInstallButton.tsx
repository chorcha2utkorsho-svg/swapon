import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share, PlusSquare } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'button' | 'compact' | 'badge';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className = '', variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'compact') {
      return (
        <button
          onClick={install}
          title="Install OmniAI to Home Screen"
          className={`flex items-center gap-1.5 rounded-lg bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 px-2.5 py-1.5 text-xs font-medium border border-sky-500/30 transition-all active:scale-95 ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install</span> App
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-500 transition-all active:scale-95 ${className}`}
      >
        <Download className="w-4 h-4" />
        Install স্বপন App
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          title="Install on iOS Home Screen"
          className={`flex items-center gap-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 px-2.5 py-1.5 text-xs font-medium border border-indigo-500/30 transition-all active:scale-95 ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install</span> iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-inner text-sm">
                    স্ব
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Install on iPhone / iPad</h3>
                    <p className="text-xs text-slate-400">Add স্বপন to your Home Screen</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-sky-400 shrink-0">
                    1
                  </div>
                  <div>
                    Tap the <strong className="text-white inline-flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded text-xs"><Share className="w-3.5 h-3.5 inline text-sky-400" /> Share</strong> icon in your Safari bottom bar.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-sky-400 shrink-0">
                    2
                  </div>
                  <div>
                    Scroll down and select <strong className="text-white inline-flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded text-xs"><PlusSquare className="w-3.5 h-3.5 inline text-emerald-400" /> Add to Home Screen</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-sky-400 shrink-0">
                    3
                  </div>
                  <div>
                    Tap <strong className="text-white">Add</strong> in the top right corner. You can now launch OmniAI fullscreen with offline support!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-sm font-medium text-slate-200 transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
