import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Wallet as WalletIcon,
  Edit3,
  Lock,
  FileText,
  ShieldAlert,
  LogOut,
  Copy,
  Check,
  Gift,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { TermsModal } from '../components/TermsModal';
import { PrivacyPolicyModal } from '../components/PrivacyPolicyModal';

export const ProfileScreen: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { profile, wallet, logout, updatePlayerProfile, requestPasswordReset } = useAuth();
  const { openWalletModal, openGiftCodeModal } = useApp();

  const [copiedUid, setCopiedUid] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isResetPasswordSuccess, setIsResetPasswordSuccess] = useState(false);

  // Edit profile form state
  const [editFullName, setEditFullName] = useState(profile?.fullName || '');
  const [editFfUsername, setEditFfUsername] = useState(profile?.ffUsername || '');
  const [editFfUid, setEditFfUid] = useState(profile?.ffUid || '');
  const [editPhone, setEditPhone] = useState(profile?.phone || '');
  const [editLoading, setEditLoading] = useState(false);

  const copyUid = () => {
    if (!profile?.ffUid) return;
    navigator.clipboard.writeText(profile.ffUid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      setEditLoading(true);
      await updatePlayerProfile({
        fullName: editFullName.trim(),
        ffUsername: editFfUsername.trim(),
        ffUid: editFfUid.trim(),
        phone: editPhone.trim()
      });
      setIsEditModalOpen(false);
    } catch {
      alert('Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!profile?.email) return;
    try {
      await requestPasswordReset(profile.email);
      setIsResetPasswordSuccess(true);
      setTimeout(() => setIsResetPasswordSuccess(false), 4000);
    } catch {
      alert('Failed to send password reset email.');
    }
  };

  if (!profile) {
    return (
      <div className="py-16 text-center space-y-4 bg-slate-900/60 rounded-2xl p-6 border border-slate-800">
        <User className="w-12 h-12 text-cyan-400 mx-auto opacity-70" />
        <h3 className="font-esports text-lg font-bold text-white tracking-wide">
          LOGIN TO ACCESS PLAYER PROFILE
        </h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          Sign in or register to customize your Free Fire credentials, manage esports earnings and participate in tournaments.
        </p>
        <button
          onClick={onOpenAuth}
          className="py-2.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-esports font-bold text-xs tracking-wider transition"
        >
          LOGIN / REGISTER
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28">
      {/* 1. Player Profile Header Card */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {/* Player Avatar */}
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 p-1 shrink-0">
              <img
                src={profile.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=FTHostAvatar'}
                alt={profile.ffUsername}
                className="w-full h-full object-cover rounded-xl"
              />
              <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
            </div>

            <div>
              {/* Player Name */}
              <h3 className="font-esports text-lg font-bold text-white leading-tight truncate">
                {profile.ffUsername}
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">{profile.fullName}</p>

              {/* Free Fire UID with Copy Button */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[11px] text-cyan-300 font-mono font-medium">
                  UID: {profile.ffUid}
                </span>
                <button
                  type="button"
                  onClick={copyUid}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="Copy UID"
                >
                  {copiedUid ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={() => {
              setEditFullName(profile.fullName);
              setEditFfUsername(profile.ffUsername);
              setEditFfUid(profile.ffUid);
              setEditPhone(profile.phone || '');
              setIsEditModalOpen(true);
            }}
            className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition"
            title="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Email Address & Joined Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 mt-4 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 truncate">
            <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{profile.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* 2. Wallet Balance & Manage Wallet Card */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <WalletIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Wallet Balance
            </span>
            <span className="font-esports text-xl font-bold text-white">
              <span className="text-cyan-400">₹</span>{wallet?.balance ?? 0}
            </span>
          </div>
        </div>

        <button
          onClick={() => openWalletModal('deposit')}
          className="py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-esports font-bold text-xs tracking-wider transition"
        >
          MANAGE WALLET
        </button>
      </div>

      {/* 3. Settings & Actions Minimal Flat Card */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 divide-y divide-slate-800/80 overflow-hidden text-sm">
        {/* Gift Code */}
        <button
          onClick={openGiftCodeModal}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 text-slate-200 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold text-white block">
                Gift Code
              </span>
              <span className="text-[11px] text-slate-400">
                Redeem code for wallet balance
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 text-[10px] font-esports font-bold border border-cyan-500/30">
              REDEEM
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </button>

        {/* Change / Reset Password */}
        <button
          onClick={handlePasswordReset}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 text-slate-200 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-xs font-semibold">Change / Reset Password</span>
          </div>
          {isResetPasswordSuccess ? (
            <span className="text-xs text-emerald-400 font-medium">Email Sent!</span>
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Privacy Policy */}
        <button
          onClick={() => setIsPrivacyModalOpen(true)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 text-slate-200 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-xs font-semibold">Privacy Policy</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* Terms & Fair Play Rules */}
        <button
          onClick={() => setIsTermsModalOpen(true)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 text-slate-200 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-xs font-semibold">Terms & Fair Play Rules</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full p-3.5 flex items-center justify-between hover:bg-red-950/20 text-red-400 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-950/40 text-red-400 border border-red-900/30 flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Logout</span>
          </div>
          <span className="text-[10px] text-red-400/70 font-mono">End Session</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-esports text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                EDIT PLAYER PROFILE
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-300 font-semibold mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold mb-1 block">Free Fire In-Game Name (IGN)</label>
                <input
                  type="text"
                  value={editFfUsername}
                  onChange={(e) => setEditFfUsername(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold mb-1 block">Free Fire Numeric UID</label>
                <input
                  type="text"
                  value={editFfUid}
                  onChange={(e) => setEditFfUid(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold mb-1 block">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={editLoading}
                className="w-full mt-2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-esports font-bold text-xs tracking-wider transition disabled:opacity-50"
              >
                {editLoading ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Terms & Conditions Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </div>
  );
};
