import React, { useState } from 'react';
import { Trophy, Clock, Users, MapPin, Swords, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GameMode, TournamentStatus, Tournament } from '../types';

export const TournamentsScreen: React.FC = () => {
  const { tournaments, setSelectedTournament, registrations } = useApp();

  const [selectedMode, setSelectedMode] = useState<GameMode | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<TournamentStatus | 'All'>('All');

  // Filter logic
  const filteredTournaments = tournaments.filter((t) => {
    const matchesMode = selectedMode === 'All' || t.gameMode === selectedMode;
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    return matchesMode && matchesStatus;
  });

  return (
    <div className="space-y-5 pb-24">
      {/* Page Title & Intro */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-cyan-400" />
          <h2 className="font-esports text-2xl font-bold text-white tracking-wider text-glow">
            TOURNAMENTS <span className="text-cyan-400">HUB</span>
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Join verified Free Fire custom rooms and compete for guaranteed cash prize pools.
        </p>
      </div>

      {/* Game Mode Tab Switcher */}
      <div className="grid grid-cols-4 p-1 rounded-xl bg-slate-900/90 border border-cyan-500/20">
        {(['All', 'Solo', 'Duo', 'Squad'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setSelectedMode(mode)}
            className={`py-2 rounded-lg text-xs font-esports font-bold tracking-wider transition ${
              selectedMode === mode
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Status Filter Badges */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'All', label: 'All Status' },
          { id: 'open', label: 'Registration Open' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'live', label: 'Live Now' },
          { id: 'full', label: 'Full' },
          { id: 'completed', label: 'Completed' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedStatus(item.id as TournamentStatus | 'All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition ${
              selectedStatus === item.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tournaments List */}
      <div className="space-y-4">
        {filteredTournaments.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-2xl text-slate-400 text-xs space-y-2 border border-slate-800">
            <Trophy className="w-10 h-10 mx-auto mb-1 opacity-30 text-cyan-400" />
            <p className="text-sm font-semibold text-slate-300">No matches available right now.</p>
            <p className="text-slate-500">Check back later for newly scheduled tournament matches.</p>
          </div>
        ) : (
          filteredTournaments.map((tournament) => {
            const isRegistered = registrations.some(
              (r) => r.tournamentId === tournament.id && r.status === 'confirmed'
            );
            const isFull = tournament.registeredSlots >= tournament.totalSlots || tournament.status === 'full';
            const isLive = tournament.status === 'live';
            const isCompleted = tournament.status === 'completed';

            return (
              <div
                key={tournament.id}
                onClick={() => setSelectedTournament(tournament)}
                className="rounded-2xl overflow-hidden glass-panel-interactive border border-cyan-500/20 hover:border-cyan-400/50 transition cursor-pointer shadow-lg"
              >
                {/* Banner Header Image */}
                <div className="relative h-28 w-full overflow-hidden">
                  <img
                    src={tournament.bannerUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop'}
                    alt={tournament.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

                  {/* Mode & Map Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-cyan-300 text-[10px] font-esports font-bold border border-cyan-500/40">
                      {tournament.gameMode}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-slate-200 text-[10px] font-semibold border border-slate-700">
                      {tournament.map}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-2.5 right-2.5">
                    {isLive ? (
                      <span className="px-2 py-0.5 rounded bg-red-950/90 text-red-400 text-[10px] font-bold border border-red-500/50 flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        LIVE NOW
                      </span>
                    ) : isRegistered ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                        JOINED
                      </span>
                    ) : isFull ? (
                      <span className="px-2 py-0.5 rounded bg-slate-900/90 text-slate-400 text-[10px] font-bold border border-slate-700">
                        FULL
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 text-[10px] font-bold border border-cyan-500/40">
                        COMING SOON
                      </span>
                    )}
                  </div>

                  {/* Tournament Title */}
                  <div className="absolute bottom-2 left-3 right-3">
                    <h3 className="font-esports text-base font-bold text-white text-glow truncate">
                      {tournament.title}
                    </h3>
                  </div>
                </div>

                {/* Card Details Body */}
                <div className="p-3.5 space-y-3 bg-slate-950/70">
                  {/* Prize, Entry & Timing Bar */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Prize Pool</span>
                      <span className="font-esports font-bold text-sm text-cyan-400">
                        ₹{tournament.prizePool}
                      </span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Entry Fee</span>
                      <span className="font-esports font-bold text-sm text-white">
                        {tournament.entryFee === 0 ? <strong className="text-emerald-400">FREE</strong> : `₹${tournament.entryFee}`}
                      </span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Time</span>
                      <span className="font-semibold text-xs text-slate-200 block truncate">
                        {tournament.matchTime}
                      </span>
                    </div>
                  </div>

                  {/* Slots Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Schedule: {tournament.matchDate}</span>
                      <span>
                        <strong className="text-white">{tournament.registeredSlots}</strong> / {tournament.totalSlots} Slots
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (tournament.registeredSlots / tournament.totalSlots) * 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-1">
                    {isRegistered ? (
                      <button
                        type="button"
                        className="w-full py-2.5 rounded-xl bg-emerald-950/80 text-emerald-400 font-esports font-bold text-xs tracking-wider border border-emerald-500/40"
                      >
                        VIEW MATCH ROOM CREDENTIALS
                      </button>
                    ) : isCompleted ? (
                      <button
                        type="button"
                        className="w-full py-2.5 rounded-xl bg-slate-900 text-slate-400 font-esports font-bold text-xs tracking-wider"
                      >
                        MATCH COMPLETED - VIEW RESULTS
                      </button>
                    ) : isFull ? (
                      <button
                        type="button"
                        className="w-full py-2.5 rounded-xl bg-slate-900 text-slate-500 font-esports font-bold text-xs tracking-wider cursor-not-allowed"
                      >
                        SLOTS FULL
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-esports font-bold text-xs tracking-wider shadow-md shadow-cyan-500/20 active:scale-98 transition"
                      >
                        JOIN TOURNAMENT
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
