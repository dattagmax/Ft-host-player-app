import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeScreen } from './screens/HomeScreen';
import { TournamentsScreen } from './screens/TournamentsScreen';
import { MyMatchesScreen } from './screens/MyMatchesScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { WalletModal } from './components/WalletModal';
import { TournamentDetailsModal } from './components/TournamentDetailsModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AnnouncementModal } from './components/AnnouncementModal';
import { AuthModal } from './components/AuthModal';
import { GiftCodeModal } from './components/GiftCodeModal';
import { useOnlineStatus } from './hooks/useOnlineStatus';

const MainLayout: React.FC = () => {
  const { activeTab, selectedTournament, setSelectedTournament } = useApp();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 flex justify-center selection:bg-cyan-500 selection:text-slate-950">
      {/* Mobile-first Android Container */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative bg-[#060e1c] shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-slate-800/60">
        
        {/* Esports Top Header */}
        <Header />

        {/* Offline indicator bar */}
        {!isOnline && (
          <div className="w-full bg-amber-500/90 text-slate-950 font-bold text-xs py-1 px-3 text-center flex items-center justify-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            <span>Offline Mode: Using cached tournament schedule and profile.</span>
          </div>
        )}

        {/* Main Content View with Tab Routing */}
        <main className="flex-1 px-4 pt-4 overflow-y-auto">
          {activeTab === 'home' && <HomeScreen onOpenAuth={() => setIsAuthModalOpen(true)} />}
          {activeTab === 'tournaments' && <TournamentsScreen />}
          {activeTab === 'matches' && <MyMatchesScreen onOpenAuth={() => setIsAuthModalOpen(true)} />}
          {activeTab === 'leaderboard' && <LeaderboardScreen />}
          {activeTab === 'profile' && <ProfileScreen onOpenAuth={() => setIsAuthModalOpen(true)} />}
        </main>

        {/* Global Modals */}
        <WalletModal />
        <TournamentDetailsModal
          tournament={selectedTournament}
          onClose={() => setSelectedTournament(null)}
        />
        <NotificationsModal />
        <AnnouncementModal />
        <GiftCodeModal />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        {/* Fixed Liquid-Glass Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
