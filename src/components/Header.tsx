import React from 'react';
import { Bell, Wallet as WalletIcon, ShieldAlert, Sparkles, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const Header: React.FC = () => {
  const { profile, wallet } = useAuth();
  const { openWalletModal, setIsNotificationModalOpen, unreadCount, activeTab } = useApp();
  const isOnline = useOnlineStatus();
  const isHomeScreen = activeTab === 'home';

  return (
    <header className="sticky top-0 z-40 w-full glass-nav px-4 py-3 flex items-center justify-between border-b border-cyan-500/15">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-700 p-0.5 shadow-lg shadow-cyan-500/20">
          <img
            src="/icon.svg"
            alt="FT HOST Logo"
            className="w-full h-full object-cover rounded-md"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-esports text-xl font-bold tracking-wider text-white text-glow">
              FT <span className="text-cyan-400">HOST</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
              ESPORTS
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide">
            FREE FIRE TOURNAMENTS
          </p>
        </div>
      </div>

      {/* Right Controls: Simple Notification Icon (on Home), plus Wallet on dedicated screens */}
      <div className="flex items-center gap-2">
        {/* Offline indicator if disconnected */}
        {!isOnline && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Offline</span>
          </div>
        )}

        {/* Wallet Balance Pill on dedicated tabs */}
        {!isHomeScreen && (
          <button
            onClick={() => openWalletModal('deposit')}
            aria-label="Open Wallet"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border border-cyan-500/40 hover:border-cyan-400 active:scale-95 transition-all shadow-sm"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <WalletIcon className="w-3 h-3" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[9px] text-cyan-300/80 font-bold uppercase tracking-wider">Wallet</span>
              <span className="font-esports font-bold text-sm text-white">
                {wallet?.currency ?? '₹'}{wallet?.balance ?? 0}
              </span>
            </div>
            <span className="text-xs text-cyan-400 font-bold ml-0.5">+</span>
          </button>
        )}

        {/* Simple Notification Icon */}
        <button
          onClick={() => setIsNotificationModalOpen(true)}
          aria-label="View notifications"
          className="relative p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 active:scale-95 transition-all"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
