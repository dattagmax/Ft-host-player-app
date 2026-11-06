import React, { useState } from 'react';
import {
  X,
  Trophy,
  Users,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Coins,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Tournament } from '../types';

interface TournamentDetailsModalProps {
  tournament: Tournament | null;
  onClose: () => void;
}

export const TournamentDetailsModal: React.FC<TournamentDetailsModalProps> = ({
  tournament,
  onClose
}) => {
  const { profile, wallet } = useAuth();
  const { joinTournament, registrations, setActiveTab, openWalletModal } = useApp();

  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [joinSuccess, setJoinSuccess] = useState<{ slot: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!tournament) return null;

  const isAlreadyRegistered = registrations.some(
    (r) => r.tournamentId === tournament.id && r.status === 'confirmed'
  );

  const isFull = tournament.registeredSlots >= tournament.totalSlots;
  const isMultiplayer = tournament.gameMode === 'Duo' || tournament.gameMode === 'Squad';
  const balance = wallet?.balance ?? 0;
  const hasSufficientBalance = balance >= tournament.entryFee;

  const handleJoin = async () => {
    setErrorMessage(null);
    if (!profile) {
      setErrorMessage('Please login or create an account to register.');
      return;
    }

    if (isMultiplayer && !teamName.trim()) {
      setErrorMessage(`Please enter your ${tournament.gameMode} Team Name.`);
      return;
    }

    try {
      setLoading(true);
      const res = await joinTournament(tournament.id, {
        teamName: teamName.trim(),
        teamMembers: teamMembers.trim()
      });

      if (res.success && res.slot) {
        setJoinSuccess({ slot: res.slot });
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToMatches = () => {
    onClose();
    setActiveTab('matches');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel-elevated p-5 sm:p-6 border border-cyan-500/40 shadow-2xl my-6 max-h-[92vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-black/60 text-slate-300 hover:text-white hover:bg-black/90 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto pr-1 space-y-4">
          {/* Banner Graphic & Tags */}
          <div className="relative w-full h-44 rounded-xl overflow-hidden border border-cyan-500/30">
            <img
              src={tournament.bannerUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop'}
              alt={tournament.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Badges on Banner */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-cyan-950/90 text-cyan-300 font-esports font-bold text-xs border border-cyan-400/50">
                {tournament.gameMode}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-950/90 text-blue-300 font-esports font-bold text-xs border border-blue-400/50">
                {tournament.map}
              </span>
              {tournament.registration_status === 'COMING_SOON' && (
                <span className="px-2 py-0.5 rounded-md bg-cyan-950/90 text-cyan-300 font-esports font-bold text-xs border border-cyan-400/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                  COMING SOON
                </span>
              )}
              {tournament.registration_status === 'OPEN' && tournament.status !== 'live' && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 font-esports font-bold text-xs border border-emerald-500/50 flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  OPEN
                </span>
              )}
              {tournament.registration_status === 'FULL' && (
                <span className="px-2 py-0.5 rounded-md bg-amber-950/90 text-amber-300 font-esports font-bold text-xs border border-amber-500/50">
                  FULL
                </span>
              )}
              {tournament.registration_status === 'CLOSED' && tournament.status !== 'live' && (
                <span className="px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-400 font-esports font-bold text-xs border border-slate-700">
                  REGISTRATION CLOSED
                </span>
              )}
              {tournament.status === 'live' && (
                <span className="px-2 py-0.5 rounded-md bg-red-950 text-red-400 font-esports font-black text-xs border border-red-500/50 flex items-center gap-1 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  LIVE
                </span>
              )}
            </div>

            {/* Bottom Title on Banner */}
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="font-esports text-xl font-bold text-white text-glow leading-tight">
                {tournament.title}
              </h3>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/25 text-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Prize Pool</span>
              <span className="font-esports text-base sm:text-lg font-bold text-cyan-400 flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                ₹{tournament.prizePool}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Entry Fee</span>
              <span className="font-esports text-base sm:text-lg font-bold text-white">
                {tournament.entryFee === 0 ? (
                  <span className="text-emerald-400">FREE</span>
                ) : (
                  `₹${tournament.entryFee}`
                )}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Slots</span>
              <span className="font-esports text-base sm:text-lg font-bold text-white">
                <span className="text-cyan-400">{tournament.registeredSlots}</span>/{tournament.totalSlots}
              </span>
            </div>
          </div>

          {/* Slots Fill Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Slots Available</span>
              <span className="text-cyan-400 font-bold">
                {tournament.totalSlots - tournament.registeredSlots} slots left
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (tournament.registeredSlots / tournament.totalSlots) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* Match Schedule */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-200 font-medium">{tournament.matchDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 font-bold">{tournament.matchTime}</span>
            </div>
          </div>

          {/* Prize Distribution */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-esports font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              Prize Breakdown
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-yellow-950/40 border border-yellow-500/30">
                <span className="text-[10px] text-yellow-400 font-bold block">1st Place</span>
                <span className="font-esports font-bold text-sm text-yellow-300">
                  ₹{tournament.firstPrize || Math.round(tournament.prizePool * 0.6)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-300 font-bold block">2nd Place</span>
                <span className="font-esports font-bold text-sm text-white">
                  ₹{tournament.secondPrize || Math.round(tournament.prizePool * 0.25)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-700/30">
                <span className="text-[10px] text-amber-400 font-bold block">3rd Place</span>
                <span className="font-esports font-bold text-sm text-amber-300">
                  ₹{tournament.thirdPrize || Math.round(tournament.prizePool * 0.15)}
                </span>
              </div>
            </div>
          </div>

          {/* Rules & Requirements */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-esports font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              Official Match Rules
            </span>
            <div className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed pl-2 border-l-2 border-cyan-500/40 font-mono">
              {tournament.rules}
            </div>
          </div>

          {/* Success State */}
          {joinSuccess ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-400/50 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-esports text-lg font-bold text-white text-glow">
                REGISTRATION CONFIRMED!
              </h4>
              <p className="text-xs text-cyan-200">
                You have been assigned <strong className="text-white text-sm font-esports">SLOT #{joinSuccess.slot}</strong>.
                Room ID and Password will be posted under <strong className="text-cyan-300">My Matches</strong> prior to match start.
              </p>
              <button
                onClick={handleGoToMatches}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-esports font-bold tracking-wider flex items-center justify-center gap-2"
              >
                VIEW IN MY MATCHES
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {/* Errors */}
              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Duo / Squad inputs */}
              {isMultiplayer && !isAlreadyRegistered && (
                <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-2.5">
                  <span className="text-xs font-bold text-cyan-300 block">
                    {tournament.gameMode} Team Details
                  </span>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Team Name *</label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. TEAM GODLIKE"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Squad Roster / IGNs</label>
                    <input
                      type="text"
                      value={teamMembers}
                      onChange={(e) => setTeamMembers(e.target.value)}
                      placeholder="Player 2, Player 3, Player 4 (IGN or UID)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isAlreadyRegistered ? (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>You are registered in this tournament!</span>
                  </div>
                  <button
                    onClick={handleGoToMatches}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
                  >
                    My Matches
                  </button>
                </div>
              ) : tournament.registration_status === 'COMING_SOON' ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Registration has not opened yet. Players cannot register and no wallet balance will be deducted.</span>
                  </div>
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-esports font-bold tracking-wider cursor-not-allowed"
                  >
                    REGISTRATION NOT OPEN (COMING SOON)
                  </button>
                </div>
              ) : tournament.registration_status === 'CLOSED' ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Registration for this tournament has closed. Roster is locked.</span>
                  </div>
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-500 font-esports font-bold tracking-wider cursor-not-allowed"
                  >
                    REGISTRATION CLOSED
                  </button>
                </div>
              ) : isFull || tournament.registration_status === 'FULL' ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>All tournament slots are filled. No additional registrations are accepted.</span>
                  </div>
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 font-esports font-bold tracking-wider cursor-not-allowed"
                  >
                    TOURNAMENT FULL (SLOTS FILLED)
                  </button>
                </div>
              ) : !hasSufficientBalance ? (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-yellow-950/40 border border-yellow-500/30 text-yellow-300 text-xs flex items-center justify-between">
                    <span>Balance: ₹{balance} (Required: ₹{tournament.entryFee})</span>
                    <span className="font-bold">Short: ₹{tournament.entryFee - balance}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openWalletModal('deposit');
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-esports font-bold tracking-wider shadow-lg shadow-yellow-500/20 active:scale-98 transition flex items-center justify-center gap-2"
                  >
                    <Coins className="w-4 h-4" />
                    ADD FUNDS TO JOIN (₹{tournament.entryFee})
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleJoin}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-esports font-bold text-base tracking-wider shadow-lg shadow-cyan-500/25 active:scale-98 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  {loading ? 'CONFIRMING ENTRY...' : `CONFIRM & JOIN (FEE: ₹${tournament.entryFee})`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
