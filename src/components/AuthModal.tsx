import React, { useState } from 'react';
import { Mail, Lock, User, Hash, Phone, Sparkles, AlertCircle, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { login, register, loginWithGoogle, requestPasswordReset } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [ffUsername, setFfUsername] = useState('');
  const [ffUid, setFfUid] = useState('');
  const [phone, setPhone] = useState('');

  // Helper to translate Firebase Auth errors into clear, actionable messages
  const formatAuthError = (err: unknown): string => {
    if (!err) return 'An unexpected error occurred. Please try again.';
    const raw = err instanceof Error ? err.message : String(err);

    if (raw.includes('auth/operation-not-allowed')) {
      return 'Email/Password authentication is not yet enabled in your Firebase Console. Please enable it under Firebase Console > Authentication > Sign-in method > Email/Password, or use "Continue with Google".';
    }
    if (raw.includes('auth/email-already-in-use')) {
      return 'This email address is already registered. Please sign in instead.';
    }
    if (raw.includes('auth/invalid-credential') || raw.includes('auth/wrong-password') || raw.includes('auth/user-not-found')) {
      return 'Invalid email or password. Please verify your credentials or reset your password.';
    }
    if (raw.includes('auth/weak-password')) {
      return 'Password is too weak. Please use at least 6 characters.';
    }
    if (raw.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (raw.includes('auth/popup-closed-by-user')) {
      return 'Google sign-in popup was closed before completing.';
    }
    if (raw.includes('auth/popup-blocked')) {
      return 'Google sign-in popup was blocked by your browser. Please allow popups for this app.';
    }
    if (raw.includes('auth/network-request-failed')) {
      return 'Network connection error. Please check your internet connection.';
    }
    return raw.replace('Firebase: ', '');
  };

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      setLoading(true);
      await login(email.trim(), password);
      onClose();
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !password || !ffUsername.trim() || !ffUid.trim()) {
      setError('Please fill in all required fields (Full Name, Email, Password, FF IGN, FF UID).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    try {
      setLoading(true);
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        ffUsername: ffUsername.trim(),
        ffUid: ffUid.trim(),
        phone: phone.trim()
      });
      onClose();
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      setLoading(true);
      await loginWithGoogle();
      onClose();
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }
    try {
      setLoading(true);
      await requestPasswordReset(email.trim());
      setSuccessMessage('Password reset link sent! Check your inbox.');
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl glass-panel-elevated p-6 border border-cyan-500/40 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 p-1 mb-2 shadow-lg shadow-cyan-500/25">
            <img src="/icon.svg" alt="FT HOST Logo" className="w-full h-full object-cover rounded-lg" />
          </div>
          <h2 className="font-esports text-2xl font-bold text-white tracking-wider">
            FT <span className="text-cyan-400">HOST</span>
          </h2>
          <p className="text-xs text-cyan-200/70 font-medium tracking-wide">
            {mode === 'login' && 'ENTER THE FREE FIRE ESPORTS ARENA'}
            {mode === 'register' && 'CREATE VERIFIED PLAYER ACCOUNT'}
            {mode === 'forgot' && 'RESET PLAYER ACCOUNT PASSWORD'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900/90 border border-cyan-500/20 mb-5">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2 rounded-lg text-xs font-esports font-bold tracking-wider transition ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`py-2 rounded-lg text-xs font-esports font-bold tracking-wider transition ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              REGISTER
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Forms */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="text-[11px] text-slate-300 font-semibold mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@fthost.gg"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] text-slate-300 font-semibold">Password</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(null); }}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-esports font-bold tracking-wider shadow-lg shadow-cyan-500/20 active:scale-98 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'SIGNING IN...' : 'LOGIN TO FT HOST'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-300 font-semibold mb-1 block">Full Real Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aryan Sharma"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-300 font-semibold mb-1 block">Free Fire IGN *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                  <input
                    type="text"
                    value={ffUsername}
                    onChange={(e) => setFfUsername(e.target.value)}
                    placeholder="亗SHADOW亗"
                    required
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-8 pr-2 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-300 font-semibold mb-1 block">Free Fire UID *</label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                  <input
                    type="text"
                    value={ffUid}
                    onChange={(e) => setFfUid(e.target.value)}
                    placeholder="891024819"
                    required
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-8 pr-2 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-semibold mb-1 block">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@fthost.gg"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-300 font-semibold mb-1 block">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    required
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-8 pr-2 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-300 font-semibold mb-1 block">Phone (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-8 pr-2 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-esports font-bold tracking-wider shadow-lg shadow-cyan-500/20 active:scale-98 transition disabled:opacity-50"
            >
              {loading ? 'CREATING PLAYER ACCOUNT...' : 'CREATE PLAYER ACCOUNT'}
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="text-[11px] text-slate-300 font-semibold mb-1 block">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@fthost.gg"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-esports font-bold tracking-wider shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
            >
              {loading ? 'SENDING LINK...' : 'SEND PASSWORD RESET EMAIL'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className="w-full py-2 text-xs text-slate-400 hover:text-white text-center"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Google Sign-in */}
        {mode !== 'forgot' && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2.5 transition active:scale-98"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
