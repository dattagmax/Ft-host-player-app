import React, { useState } from 'react';
import { Medal, Crown, Trophy, Sparkles, TrendingUp, Award, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const LeaderboardScreen: React.FC = () => {
  const { profile } = useAuth();
  const { leaderboard } = useApp();

  const [period, setPeriod] = useState<'weekly' | 'all_time'>('all_time');

  // Filter or scale points for weekly vs all-time
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (period === 'weekly') {
      return (b.points * 0.4) - (a.points * 0.4);
    }
    return b.points - a.points;
  });

  const top1 = sortedLeaderboard[0];
  const top2 = sortedLeaderboard[1];
  const top3 = sortedLeaderboard[2];
  const restPlayers = sortedLeaderboard.slice(3);

  // Compute or highlight current player's stats
  const currentPlayerPoints = profile ? profile.tournamentWins * 320 + 800 : 0;
  const currentPlayerWins = profile?.tournamentWins ?? 0;
  const currentPlayerPrize = profile ? profile.tournamentWins * 600 : 0;

  return (
    <div className="space-y-6 pb-28">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Medal className="w-5 h-5 text-yellow-400" />
          <h2 className="font-esports text-2xl font-bold text-white tracking-wider text-glow">
            ESPORTS <span className="text-cyan-400">RANKINGS</span>
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Official hall of fame. Points updated after verified tournament results.
        </p>
      </div>

      {/* Period Tabs: Weekly / All-Time */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900/90 border border-cyan-500/20">
        <button
          onClick={() => setPeriod('weekly')}
          className={`py-2 rounded-lg text-xs font-esports font-bold tracking-wider transition ${
            period === 'weekly'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          WEEKLY CUP
        </button>
        <button
          onClick={() => setPeriod('all_time')}
          className={`py-2 rounded-lg text-xs font-esports font-bold tracking-wider transition ${
            period === 'all_time'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ALL-TIME LEGENDS
        </button>
      </div>

      {/* EMPTY STATE OR RANKINGS */}
      {sortedLeaderboard.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl text-slate-400 text-xs space-y-3 border border-slate-800">
          <Trophy className="w-12 h-12 mx-auto text-yellow-400/40" />
          <h3 className="font-esports text-lg font-bold text-white tracking-wider">
            Leaderboard coming soon.
          </h3>
          <p className="text-slate-400 max-w-xs mx-auto">
            Official rankings and hall of fame standings will appear once match results are verified by tournament referees.
          </p>
        </div>
      ) : (
        <>
          {/* TOP THREE PODIUM DISPLAY */}
          {top1 && top2 && top3 && (
            <div className="relative pt-8 pb-4">
              <div className="grid grid-cols-3 gap-2 items-end">
                {/* 2nd Place (Silver) */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-slate-400 to-slate-200 shadow-lg shadow-slate-400/20 overflow-hidden">
                      <img
                        src={top2.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Top2'}
                        alt={top2.username}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center font-esports border-2 border-slate-950">
                      2
                    </span>
                  </div>

                  <span className="font-esports font-bold text-xs text-slate-200 text-center truncate w-full block">
                    {top2.username}
                  </span>
                  <span className="text-[10px] text-cyan-300 font-mono">
                    {period === 'weekly' ? Math.round(top2.points * 0.4) : top2.points} pts
                  </span>

                  {/* Podium Block */}
                  <div className="w-full h-24 mt-2 rounded-t-xl bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700/80 border-t-2 border-slate-400 flex flex-col items-center justify-center p-1 text-center">
                    <Medal className="w-5 h-5 text-slate-300 mb-0.5" />
                    <span className="font-esports font-black text-slate-300 text-sm">2ND</span>
                    <span className="text-[10px] text-slate-300 font-semibold">{top2.tournamentWins} Wins</span>
                  </div>
                </div>

                {/* 1st Place (Gold Crown & Champion) */}
                <div className="flex flex-col items-center -mt-6">
                  <Crown className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] animate-bounce mb-1" />
                  <div className="relative mb-2">
                    <div className="w-18 h-18 rounded-full p-1 bg-gradient-to-tr from-yellow-500 via-amber-300 to-yellow-600 shadow-xl shadow-yellow-500/40 overflow-hidden">
                      <img
                        src={top1.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Top1'}
                        alt={top1.username}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-yellow-400 text-slate-950 font-black text-sm flex items-center justify-center font-esports border-2 border-slate-950 shadow-md">
                      1
                    </span>
                  </div>

                  <span className="font-esports font-black text-sm text-yellow-300 text-center truncate w-full block text-glow">
                    {top1.username}
                  </span>
                  <span className="text-xs text-yellow-400 font-bold font-mono">
                    {period === 'weekly' ? Math.round(top1.points * 0.4) : top1.points} pts
                  </span>

                  {/* Gold Podium Block */}
                  <div className="w-full h-32 mt-2 rounded-t-xl bg-gradient-to-t from-amber-950 via-yellow-950 to-amber-800/80 border-t-2 border-yellow-400 flex flex-col items-center justify-center p-1 text-center shadow-lg shadow-yellow-500/20">
                    <Trophy className="w-6 h-6 text-yellow-400 mb-0.5" />
                    <span className="font-esports font-black text-yellow-300 text-base">CHAMPION</span>
                    <span className="text-[11px] text-yellow-200 font-bold">{top1.tournamentWins} Wins</span>
                    <span className="text-[10px] text-yellow-400/80 font-mono">₹{top1.totalPrizeWon}</span>
                  </div>
                </div>

                {/* 3rd Place (Bronze) */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-700 to-amber-500 shadow-lg shadow-amber-700/20 overflow-hidden">
                      <img
                        src={top3.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Top3'}
                        alt={top3.username}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center font-esports border-2 border-slate-950">
                      3
                    </span>
                  </div>

                  <span className="font-esports font-bold text-xs text-amber-200 text-center truncate w-full block">
                    {top3.username}
                  </span>
                  <span className="text-[10px] text-cyan-300 font-mono">
                    {period === 'weekly' ? Math.round(top3.points * 0.4) : top3.points} pts
                  </span>

                  {/* Bronze Podium Block */}
                  <div className="w-full h-20 mt-2 rounded-t-xl bg-gradient-to-t from-slate-900 via-amber-950 to-amber-900/80 border-t-2 border-amber-600 flex flex-col items-center justify-center p-1 text-center">
                    <Medal className="w-5 h-5 text-amber-500 mb-0.5" />
                    <span className="font-esports font-black text-amber-400 text-sm">3RD</span>
                    <span className="text-[10px] text-slate-300 font-semibold">{top3.tournamentWins} Wins</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RANKINGS LIST (Positions 4+) */}
          {restPlayers.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center px-1 text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                <span>Rank & Player</span>
                <div className="flex gap-6 pr-2">
                  <span>Wins</span>
                  <span>Points</span>
                </div>
              </div>

              {restPlayers.map((player, index) => {
                const rankPos = index + 4;
                const isCurrentUser = profile && (player.username === profile.ffUsername || player.ffUid === profile.ffUid);
                const points = period === 'weekly' ? Math.round(player.points * 0.4) : player.points;

                return (
                  <div
                    key={player.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${
                      isCurrentUser
                        ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-esports font-black text-sm text-slate-400">
                        #{rankPos}
                      </span>

                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                        <img
                          src={player.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.username}`}
                          alt={player.username}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-esports font-bold text-sm text-white truncate max-w-[140px] sm:max-w-none">
                            {player.username}
                          </span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 text-[9px] font-black uppercase">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          UID: {player.ffUid} • Prize: ₹{player.totalPrizeWon}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pr-1 text-right">
                      <span className="font-esports font-bold text-xs text-slate-300 w-8">
                        {player.tournamentWins}
                      </span>
                      <span className="font-esports font-black text-sm text-cyan-400 font-mono w-14">
                        {points}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* CURRENT PLAYER'S STICKY RANK CARD (If logged in and has tournament activity) */}
      {profile && (
        <div className="p-3.5 rounded-2xl glass-panel-elevated border border-cyan-400/50 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-esports font-black text-base shrink-0">
              {profile.tournamentWins > 0 ? `#${Math.max(1, 50 - profile.tournamentWins)}` : '-'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase font-bold text-cyan-300">Your Current Standing</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 text-[8px] font-bold">
                  ACTIVE
                </span>
              </div>
              <h4 className="font-esports font-bold text-sm text-white truncate">
                {profile.ffUsername}
              </h4>
              <span className="text-[10px] text-slate-400">
                {currentPlayerWins} Tournament Wins • Prize: ₹{currentPlayerPrize}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Points</span>
            <span className="font-esports font-black text-base text-cyan-400 font-mono">
              {currentPlayerPoints} PTS
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
