import React from 'react';
import { X, Bell, CheckCheck, Trophy, Wallet, ShieldCheck, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsModal: React.FC = () => {
  const {
    isNotificationModalOpen,
    setIsNotificationModalOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useApp();

  if (!isNotificationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl glass-panel-elevated p-5 sm:p-6 border border-cyan-500/40 shadow-2xl my-6 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h3 className="font-esports text-lg font-bold text-white tracking-wider">
              NOTIFICATIONS
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={() => setIsNotificationModalOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-1">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-400" />
              <p className="text-sm font-semibold text-slate-300">No notifications.</p>
              <p className="text-slate-500">You will receive alerts here for custom room IDs, matches and wallet updates.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markNotificationAsRead(item.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  item.isRead
                    ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                    : 'bg-cyan-950/40 border-cyan-500/30 text-white shadow-sm'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 shrink-0 mt-0.5">
                    {item.type === 'registration' || item.type === 'tournament' ? (
                      <Trophy className="w-4 h-4" />
                    ) : item.type === 'wallet' ? (
                      <Wallet className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-semibold text-xs text-white truncate">{item.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{item.createdAt}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">{item.message}</p>
                  </div>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5 shadow-[0_0_6px_#22d3ee]" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
