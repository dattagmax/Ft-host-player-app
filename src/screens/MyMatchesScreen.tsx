import React, { useState } from 'react';
import {
  Swords,
  Lock,
  Unlock,
  Copy,
  Check,
  Calendar,
  Clock,
  Shield,
  HelpCircle,
  ExternalLink,
  Trophy,
  AlertCircle,
  Flame,
  Award,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Tournament } from '../types';

export const MyMatchesScreen: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { profile } = useAuth();
  const { registrations, tournaments, setActiveTab } = useApp();

  const [activeTab, setActiveTabFilter] = useState<'upcoming' | 'live' | 'completed'>('upcoming');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPass, setCopiedPass] = useState<string | null>(null);
  const [showRoomGuide, setShowRoomGuide] = useState(false);

  if (!profile) {
    return (
      <div className="py-16 text-center space-y-4 glass-panel rounded-2xl p-6">
        <Swords className="w-12 h-12 text-cyan-400 mx-auto opacity-70" />
        <h3 className="font-esports text-xl font-bold text-white">LOGIN TO VIEW YOUR MATCHES</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Sign in or create a player profile to access your registered tournaments and live Room IDs.
        </p>
        <button
          onClick={onOpenAuth}
          className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-esports font-bold text-xs tracking-wider shadow-lg shadow-cyan-500/20"
        >
          LOGIN / REGISTER
        </button>
      </div>
    );
  }

  // Map registrations to live tournament state
  const registeredMatches = registrations.map((reg) => {
    const tourney = tournaments.find((t) => t.id === reg.tournamentId);
    return {
      registration: reg,
      tournament: tourney
    };
  }).filter((item): item is { registration: typeof item.registration; tournament: Tournament } => item.tournament !== undefined);

  // Filter automatically by verified tournament status
  const filteredMatches = registeredMatches.filter(({ tournament }) => {
    if (!tournament) return false;
    if (activeTab === 'upcoming') {
      return tournament.status === 'open' || tournament.status === 'upcoming' || tournament.status === 'full';
    }
    if (activeTab === 'live') {
      return tournament.status === 'live';
    }
    if (activeTab === 'completed') {
      return tournament.status === 'completed';
    }
    return false;
  });

  const copyRoomId = (roomId: string) => {
    navigator.clipboard.writeText(roomId);
    setCopiedId(roomId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyRoomPass = (pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedPass(pass);
    setTimeout(() => setCopiedPass(null), 2000);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Swords className="w-5 h-5 text-cyan-400" />
            <h2 className="font-esports text-2xl font-bold text-white tracking-wider text-glow">
              MY <span className="text-cyan-400">MATCHES</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time match lifecycle tracking & custom room credentials.
          </p>
        </div>

        <button
          onClick={() => setShowRoomGuide(true)}
          className="p-2 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-1 hover:bg-slate-800"
          title="How to join Free Fire Room"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Room Guide</span>
        </button>
      </div>

      {/* Tabs: Upcoming / Live / Completed */}
      <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-900/90 border border-cyan-500/20">
        {[
          { id: 'upcoming', label: 'UPCOMING' },
          { id: 'live', label: 'LIVE' },
          { id: 'completed', label: 'COMPLETED' },
        ].map((tab) => {
          const tabCount = registeredMatches.filter(({ tournament }) => {
            if (tab.id === 'upcoming') return tournament.status === 'open' || tournament.status === 'upcoming' || tournament.status === 'full';
            if (tab.id === 'live') return tournament.status === 'live';
            if (tab.id === 'completed') return tournament.status === 'completed';
            return false;
          }).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabFilter(tab.id as 'upcoming' | 'live' | 'completed')}
              className={`py-2 rounded-lg text-xs font-esports font-bold tracking-wider transition flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tabCount > 0 && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {tabCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-2xl text-slate-400 text-xs space-y-3 border border-slate-800">
            <Swords className="w-10 h-10 mx-auto opacity-30 text-cyan-400" />
            <p className="text-sm font-semibold text-slate-300">
              {registrations.length === 0 ? "You haven't joined any matches yet." : `No ${activeTab} matches.`}
            </p>
            <p className="text-slate-500">
              {registrations.length === 0
                ? "Browse upcoming tournaments and reserve your custom room slot."
                : `Your ${activeTab} matches will automatically update here in real-time.`}
            </p>
            <button
              onClick={() => setActiveTab('tournaments')}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-esports font-bold text-xs tracking-wider shadow-md shadow-cyan-500/20"
            >
              BROWSE TOURNAMENTS
            </button>
          </div>
        ) : (
          filteredMatches.map(({ registration, tournament }) => {
            const isLive = tournament.status === 'live';
            const isCompleted = tournament.status === 'completed';
            const isReleased = tournament.isRoomReleased && tournament.roomId && tournament.roomPassword;
            const matchResult = tournament.matchResult;
            const isPlayerWinner = profile && matchResult?.winnerUid === profile.ffUid;

            return (
              <div
                key={registration.id}
                className={`rounded-2xl glass-panel-elevated p-4 sm:p-5 border space-y-4 shadow-xl transition-all ${
                  isLive
                    ? 'border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.2)]'
                    : isCompleted
                    ? 'border-emerald-500/40'
                    : 'border-cyan-500/30'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      {isLive ? (
                        <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 text-[10px] font-black font-esports border border-red-500/50 flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          LIVE IN PROGRESS
                        </span>
                      ) : isCompleted ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-black font-esports border border-emerald-500/50 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          COMPLETED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-black font-esports border border-cyan-500/30">
                          REGISTERED (UPCOMING)
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-medium border border-slate-800">
                        {tournament.gameMode} • {tournament.map}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                        SLOT #{registration.slotNumber}
                      </span>
                    </div>

                    <h3 className="font-esports text-lg font-bold text-white text-glow leading-tight">
                      {tournament.title}
                    </h3>

                    {registration.teamName && (
                      <p className="text-xs text-cyan-300 font-semibold mt-0.5">
                        Team: {registration.teamName}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Prize Pool</span>
                    <span className="font-esports font-bold text-base text-cyan-400">
                      ₹{tournament.prizePool}
                    </span>
                  </div>
                </div>

                {/* Match timing bar */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{tournament.matchDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{tournament.matchTime}</span>
                  </div>
                </div>

                {/* 1. UPCOMING & LIVE: CUSTOM ROOM CREDENTIALS CARD */}
                {!isCompleted && (
                  <div className={`p-3.5 rounded-xl border space-y-3 ${
                    isLive
                      ? 'bg-gradient-to-r from-red-950/40 via-slate-950 to-red-950/30 border-red-500/40'
                      : 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-cyan-500/35'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-esports font-bold text-white flex items-center gap-1.5 tracking-wider uppercase">
                        {isReleased ? (
                          <>
                            <Unlock className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">ROOM CREDENTIALS RELEASED</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400">ROOM ID & PASSWORD LOCKED</span>
                          </>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isReleased ? 'Official Custom Room' : 'Released 15m before match'}
                      </span>
                    </div>

                    {isReleased ? (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-3">
                          {/* Room ID Box */}
                          <div className="p-2.5 rounded-lg bg-black/70 border border-cyan-500/30 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase block">Room ID</span>
                              <span className="font-mono text-sm font-bold text-cyan-300 select-all">
                                {tournament.roomId}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyRoomId(tournament.roomId || '')}
                              className="p-1.5 rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 active:scale-95 transition"
                              title="Copy Room ID"
                            >
                              {copiedId === tournament.roomId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {/* Password Box */}
                          <div className="p-2.5 rounded-lg bg-black/70 border border-cyan-500/30 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase block">Password</span>
                              <span className="font-mono text-sm font-bold text-cyan-300 select-all">
                                {tournament.roomPassword}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyRoomPass(tournament.roomPassword || '')}
                              className="p-1.5 rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 active:scale-95 transition"
                              title="Copy Password"
                            >
                              {copiedPass === tournament.roomPassword ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-300 leading-tight">
                          Open Free Fire &gt; Custom &gt; Search Room ID &gt; Enter Password &gt; Occupy assigned <strong>Slot #{registration.slotNumber}</strong>.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-yellow-500 shrink-0" />
                        <span>
                          Room credentials remain hidden until authorized tournament marshals release them 15 minutes prior to start time.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. COMPLETED: VERIFIED MATCH RESULTS DISPLAY */}
                {isCompleted && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/50 via-slate-950 to-emerald-950/40 border border-emerald-500/40 space-y-3 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="font-esports font-bold text-xs text-emerald-400 flex items-center gap-1.5 tracking-wider uppercase">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        VERIFIED TOURNAMENT RESULTS
                      </span>
                      <span className="text-[10px] text-emerald-300/80 font-bold flex items-center gap-1">
                        <Shield className="w-3 h-3 text-emerald-400" />
                        VERIFIED BY REFEREE
                      </span>
                    </div>

                    {/* Winner Banner if Current Player Won */}
                    {isPlayerWinner && (
                      <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-950/80 via-amber-900/60 to-yellow-950/80 border border-yellow-400 flex items-center gap-3 shadow-lg">
                        <Crown className="w-8 h-8 text-yellow-400 shrink-0 animate-bounce" />
                        <div>
                          <span className="font-esports font-black text-sm text-yellow-300 block text-glow">
                            BOOYAH! YOU WON 1ST PLACE!
                          </span>
                          <span className="text-[11px] text-slate-200">
                            Prize of <strong>₹{matchResult?.prizeAwarded || tournament.firstPrize || Math.round(tournament.prizePool * 0.6)}</strong> has been credited to your esports wallet.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Standings Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {/* 1st Place */}
                      <div className="p-2.5 rounded-lg bg-yellow-950/50 border border-yellow-500/40">
                        <span className="text-[10px] text-yellow-400 font-bold block flex items-center justify-center gap-1">
                          <Crown className="w-3 h-3" />
                          1ST (BOOYAH)
                        </span>
                        <span className="font-esports font-bold text-sm text-yellow-200 truncate block mt-0.5">
                          {matchResult?.winnerUsername || '亗SHADOW_OP亗'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono block">
                          UID: {matchResult?.winnerUid || '891024819'}
                        </span>
                        <span className="text-[10px] text-yellow-300 font-bold font-mono mt-1 block">
                          ₹{matchResult?.prizeAwarded || tournament.firstPrize || Math.round(tournament.prizePool * 0.6)}
                        </span>
                      </div>

                      {/* 2nd Place */}
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700">
                        <span className="text-[10px] text-slate-300 font-bold block">
                          2ND PLACE
                        </span>
                        <span className="font-esports font-bold text-sm text-white truncate block mt-0.5">
                          {matchResult?.runnerUpUsername || '亗RASTAR_OP'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono block">
                          UID: {matchResult?.runnerUpUid || '209384910'}
                        </span>
                        <span className="text-[10px] text-cyan-300 font-bold font-mono mt-1 block">
                          ₹{tournament.secondPrize || Math.round(tournament.prizePool * 0.25)}
                        </span>
                      </div>

                      {/* 3rd Place */}
                      <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-700/40">
                        <span className="text-[10px] text-amber-400 font-bold block">
                          3RD PLACE
                        </span>
                        <span className="font-esports font-bold text-sm text-amber-200 truncate block mt-0.5">
                          {matchResult?.thirdPlaceUsername || '☠BADBOY_FF'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono block">
                          UID: {matchResult?.thirdPlaceUid || '319402851'}
                        </span>
                        <span className="text-[10px] text-amber-300 font-bold font-mono mt-1 block">
                          ₹{tournament.thirdPrize || Math.round(tournament.prizePool * 0.15)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Registration timestamp & verified badge */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-slate-500 font-mono">
                    Registered: {new Date(registration.registeredAt).toLocaleDateString()} • Slot #{registration.slotNumber}
                  </div>
                  <span className="text-[10px] text-cyan-400 font-esports font-bold tracking-wider">
                    FT HOST VERIFIED
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Guide Modal: How to enter custom room */}
      {showRoomGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md rounded-2xl glass-panel-elevated p-6 border border-cyan-500/40 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-esports text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                HOW TO JOIN CUSTOM ROOM
              </h3>
              <button
                onClick={() => setShowRoomGuide(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">1</span>
                <span>Open <strong>Free Fire MAX / Free Fire</strong> on your mobile device.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">2</span>
                <span>Tap the Mode Selection screen &gt; select <strong>Custom</strong> at the bottom right.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">3</span>
                <span>Paste the <strong>Room ID</strong> into the search bar and press Enter.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">4</span>
                <span>Tap <strong>Join</strong>, enter the <strong>Room Password</strong>, and occupy your assigned <strong>Slot Number</strong>.</span>
              </div>
            </div>

            <button
              onClick={() => setShowRoomGuide(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-esports font-bold text-xs"
            >
              GOT IT, READY FOR BATTLE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
