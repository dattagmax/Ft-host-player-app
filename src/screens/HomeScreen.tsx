import React, { useState } from 'react';
import {
  Trophy,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Tournament, RegistrationStatus } from '../types';

interface HomeScreenProps {
  onOpenAuth: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenAuth }) => {
  const { profile } = useAuth();
  const {
    tournaments,
    setSelectedTournament,
    registrations,
    setActiveTab
  } = useApp();

  const [comingSoonNotice, setComingSoonNotice] = useState<string | null>(null);

  // Strictly display ONLY upcoming tournaments on the Home Screen.
  // Live and completed tournaments are automatically excluded and viewable in My Matches.
  const upcomingTournaments = tournaments.filter(
    (t) => t.status === 'open' || t.status === 'upcoming'
  );

  const handleCardClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
  };

  const handleJoinClick = (e: React.MouseEvent, tournament: Tournament) => {
    e.stopPropagation();

    if (tournament.registration_status === 'COMING_SOON') {
      setComingSoonNotice(`Registration has not opened yet for ${tournament.title}.`);
      setTimeout(() => setComingSoonNotice(null), 3500);
      return;
    }

    if (tournament.registration_status === 'CLOSED') {
      return;
    }

    if (tournament.registration_status === 'FULL') {
      return;
    }

    if (!profile) {
      onOpenAuth();
      return;
    }

    // Opens details modal where player reviews entry fee, squad roster and confirms registration
    setSelectedTournament(tournament);
  };

  const renderStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'COMING_SOON':
        return (
          <span className="px-2.5 py-0.5 rounded bg-cyan-950/90 text-cyan-300 text-[10px] font-esports font-bold tracking-wider border border-cyan-500/40 shadow-[0_0_8px_rgba(34,211,238,0.25)]">
            COMING SOON
          </span>
        );
      case 'OPEN':
        return (
          <span className="px-2.5 py-0.5 rounded bg-emerald-950/90 text-emerald-300 text-[10px] font-esports font-bold tracking-wider border border-emerald-500/50 flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            OPEN
          </span>
        );
      case 'FULL':
        return (
          <span className="px-2.5 py-0.5 rounded bg-amber-950/90 text-amber-300 text-[10px] font-esports font-bold tracking-wider border border-amber-500/40">
            FULL
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-0.5 rounded bg-slate-900/95 text-slate-400 text-[10px] font-esports font-bold tracking-wider border border-slate-700">
            REGISTRATION CLOSED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Home Main Content: One single heading "MATCHES" */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-cyan-400" />
          <h1 className="font-esports text-xl font-bold tracking-wider text-white text-glow">
            MATCHES
          </h1>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
          {upcomingTournaments.length} Upcoming
        </span>
      </div>

      {/* Ephemeral alert for Coming Soon interaction */}
      {comingSoonNotice && (
        <div className="p-3 rounded-xl bg-cyan-950/90 border border-cyan-400/60 text-cyan-200 text-xs flex items-center gap-2.5 shadow-lg shadow-cyan-950/50 transition-all animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-medium">{comingSoonNotice}</span>
        </div>
      )}

      {/* One vertical scrolling list of all upcoming tournaments */}
      <div className="space-y-3">
        {upcomingTournaments.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-2xl text-slate-400 text-xs space-y-2 border border-slate-800">
            <Trophy className="w-8 h-8 text-cyan-400/40 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No matches available right now.</p>
            <p className="text-slate-500">Upcoming tournaments will appear here once announced.</p>
          </div>
        ) : (
          upcomingTournaments.map((tournament) => {
            const isRegistered = registrations.some(
              (r) => r.tournamentId === tournament.id && r.status === 'confirmed'
            );

            const availableSlots = Math.max(
              0,
              tournament.totalSlots - tournament.registeredSlots
            );
            const isFull = availableSlots === 0 || tournament.registration_status === 'FULL';
            const isOpen = tournament.registration_status === 'OPEN' && !isFull;
            const isComingSoon = tournament.registration_status === 'COMING_SOON';
            const isClosed = tournament.registration_status === 'CLOSED';

            const fillPercentage = Math.min(
              100,
              Math.round((tournament.registeredSlots / tournament.totalSlots) * 100)
            );

            return (
              <div
                key={tournament.id}
                onClick={() => handleCardClick(tournament)}
                className="relative rounded-2xl glass-panel-elevated p-4 border border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-200 cursor-pointer space-y-3 group shadow-md"
              >
                {/* Header Row: Tournament Title & Registration Status */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-esports text-base sm:text-lg font-bold text-white text-glow leading-snug truncate group-hover:text-cyan-300 transition-colors">
                      {tournament.title}
                    </h3>

                    {/* Mode and Map tags */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-slate-200 text-[10px] font-bold font-esports">
                        {tournament.gameMode}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-cyan-300 text-[10px] font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        {tournament.map}
                      </span>
                    </div>
                  </div>

                  {/* Dedicated Registration Status Badge */}
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    {renderStatusBadge(tournament.registration_status)}
                    {isRegistered && (
                      <span className="px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 text-[9px] font-bold border border-cyan-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        JOINED
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Schedule: Date & Time */}
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{tournament.matchDate}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-white font-semibold">{tournament.matchTime}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Map: <strong className="text-slate-200">{tournament.map}</strong>
                  </div>
                </div>

                {/* Key Metrics: Prize Pool, Entry Fee, Available Slots */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {/* Prize Pool */}
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">
                      Prize Pool
                    </span>
                    <span className="font-esports font-bold text-sm text-cyan-400">
                      ₹{tournament.prizePool}
                    </span>
                  </div>

                  {/* Entry Fee */}
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">
                      Entry Fee
                    </span>
                    <span className="font-esports font-bold text-sm text-white">
                      {tournament.entryFee === 0 ? (
                        <strong className="text-emerald-400">FREE</strong>
                      ) : (
                        `₹${tournament.entryFee}`
                      )}
                    </span>
                  </div>

                  {/* Available Slots */}
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">
                      Available
                    </span>
                    <span className="font-esports font-bold text-sm text-cyan-300">
                      {availableSlots} Slots
                    </span>
                  </div>
                </div>

                {/* Slots Fill Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Capacity ({fillPercentage}% Filled)</span>
                    <span className="font-mono text-slate-300">
                      {tournament.registeredSlots}/{tournament.totalSlots} Slots
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFull
                          ? 'bg-amber-500'
                          : fillPercentage > 75
                          ? 'bg-cyan-400'
                          : 'bg-cyan-500'
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-1">
                  {isRegistered ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('matches');
                      }}
                      className="w-full py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-500/40 font-esports font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 transition active:scale-98"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      REGISTERED • VIEW IN MY MATCHES
                    </button>
                  ) : isOpen ? (
                    <button
                      type="button"
                      onClick={(e) => handleJoinClick(e, tournament)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-esports font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-98 transition"
                    >
                      <span>JOIN NOW</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : isComingSoon ? (
                    <button
                      type="button"
                      onClick={(e) => handleJoinClick(e, tournament)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400/80 hover:text-cyan-300 font-esports font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <span>COMING SOON</span>
                      <span className="text-[10px] text-slate-400 font-sans font-normal">
                        (Registration opens soon)
                      </span>
                    </button>
                  ) : isFull ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-500 font-esports font-bold text-xs tracking-wider cursor-not-allowed"
                    >
                      SLOTS FULL
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-500 font-esports font-bold text-xs tracking-wider cursor-not-allowed"
                    >
                      REGISTRATION CLOSED
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
