import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-xs">
        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>FT HOST Android PWA is installed on your device.</span>
      </div>
    );
  }

  // Chromium / Android flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-esports font-bold shadow-lg shadow-cyan-500/20 border border-cyan-400/40 active:scale-98 transition-all ${
          compact ? 'px-3 py-1.5 text-xs' : 'w-full py-3 text-sm'
        }`}
      >
        <Smartphone className="w-4 h-4" />
        <span>INSTALL FT HOST ANDROID APP</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-slate-800 text-xs font-semibold ${
            compact ? 'px-3 py-1.5' : 'w-full py-2.5'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Add FT HOST to Home Screen</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl glass-panel-elevated p-6 border border-cyan-500/40 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-esports text-lg font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                  Install on iOS
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">1</span>
                  <p>Tap the <strong className="text-cyan-300">Share</strong> icon in the Safari navigation bar below.</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">2</span>
                  <p>Scroll down and select <strong className="text-cyan-300">Add to Home Screen</strong>.</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">3</span>
                  <p>Launch FT HOST directly from your phone app grid with full offline capability!</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-esports font-bold"
              >
                GOT IT
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers when beforeinstallprompt is not pending
  return (
    <button
      onClick={() => alert("To install FT HOST on your Android device: open Chrome options (⋮) and tap 'Install app' or 'Add to Home screen'.")}
      className={`flex items-center justify-center gap-2 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-300 hover:bg-slate-800/90 text-xs font-semibold ${
        compact ? 'px-3 py-1.5' : 'w-full py-2.5'
      }`}
    >
      <Download className="w-3.5 h-3.5" />
      <span>Install App on Mobile</span>
    </button>
  );
};
