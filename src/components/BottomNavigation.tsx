import React from 'react';
import { Home, Trophy, Swords, Medal, User } from 'lucide-react';
import { useApp, NavTab } from '../context/AppContext';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, registrations } = useApp();

  // Active upcoming matches count
  const activeMatchesCount = registrations.filter(r => r.status === 'confirmed').length;

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'matches', label: 'My Matches', icon: Swords, badge: activeMatchesCount > 0 ? activeMatchesCount : undefined },
    { id: 'leaderboard', label: 'Rankings', icon: Medal },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto">
      <div className="glass-nav mx-3 mb-2 rounded-2xl border border-cyan-500/25 shadow-[0_-4px_24px_rgba(6,182,212,0.12)] px-2 py-2">
        <div className="grid grid-cols-5 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-cyan-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Active Glowing Backdrop Pill */}
                {isActive && (
                  <span className="absolute inset-0 bg-cyan-500/15 rounded-xl border border-cyan-500/30 -z-10 shadow-[0_0_12px_rgba(6,182,212,0.25)]" />
                )}

                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>

                <span className={`text-[10px] mt-1 tracking-wider uppercase font-esports transition-all ${isActive ? 'font-bold text-white' : 'font-medium'}`}>
                  {item.label}
                </span>

                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
