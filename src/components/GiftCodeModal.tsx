import React, { useState } from 'react';
import { Gift, X, Sparkles, CheckCircle2, AlertCircle, ArrowRight, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const GiftCodeModal: React.FC = () => {
  const { isGiftCodeModalOpen, closeGiftCodeModal, redeemGiftCode, openWalletModal } = useApp();
  const { profile, wallet } = useAuth();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);

  if (!isGiftCodeModalOpen) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setRewardAmount(null);

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setErrorMessage('Please enter a gift code.');
      return;
    }

    try {
      setLoading(true);
      const res = await redeemGiftCode(trimmed);
      if (res.success) {
        setSuccessMessage(res.message);
        setRewardAmount(res.reward ?? 10);
        setCode('');
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to redeem gift code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl glass-panel-elevated p-6 border border-cyan-500/40 shadow-2xl my-6 space-y-5">
        {/* Close Button */}
        <button
          onClick={closeGiftCodeModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Prominent Gift Icon */}
        <div className="text-center pt-2 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 p-3 shadow-xl shadow-cyan-500/30 text-white animate-pulse">
            <Gift className="w-10 h-10" />
          </div>
          <h2 className="font-esports text-2xl font-bold text-white tracking-wider text-glow">
            REDEEM <span className="text-cyan-400">GIFT CODE</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-xs mx-auto">
            Enter your official FT HOST promo or tournament gift code to claim instant cash rewards directly to your esports wallet.
          </p>
        </div>

        {/* Current Wallet Pill */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <span>Current Wallet Balance:</span>
          </div>
          <span className="font-esports font-bold text-sm text-cyan-300">
            ₹{wallet?.balance ?? 0}
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs space-y-2 text-center animate-fadeIn">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-semibold text-sm text-emerald-300 leading-snug">
              {successMessage}
            </p>
            {rewardAmount !== null && (
              <p className="text-[11px] text-emerald-400/90 font-mono">
                +₹{rewardAmount} credited to UID: {profile?.ffUid || 'Your Account'}
              </p>
            )}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  closeGiftCodeModal();
                  openWalletModal('deposit');
                }}
                className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-esports font-bold text-[11px] tracking-wider"
              >
                VIEW UPDATED WALLET
              </button>
            </div>
          </div>
        )}

        {/* Gift Code Input Form */}
        <form onSubmit={handleRedeem} className="space-y-4">
          <div>
            <label className="text-[11px] text-slate-300 font-semibold mb-1.5 block">
              ENTER GIFT CODE
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. TT"
                maxLength={20}
                autoFocus
                className="w-full bg-slate-900 border-2 border-cyan-500/40 focus:border-cyan-400 rounded-xl px-4 py-3 text-base text-white font-mono font-bold tracking-widest uppercase placeholder:text-slate-600 placeholder:tracking-normal focus:outline-none shadow-inner"
              />
              <span className="absolute right-3.5 top-3.5 text-xs text-slate-500 font-mono">
                {code.length}/20
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Official launch code: <strong className="text-cyan-300 font-mono">TT</strong> (Reward: ₹10)
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-esports font-black text-xs tracking-wider shadow-lg shadow-cyan-500/25 active:scale-98 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>VERIFYING CODE...</span>
            ) : (
              <>
                <span>REDEEM NOW</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-300">Rules & Limits:</strong> Each gift code can only be redeemed once per verified player account. Redemptions are validated atomically on the server.
        </div>
      </div>
    </div>
  );
};
