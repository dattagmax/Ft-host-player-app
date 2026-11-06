import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, testConnection } from '../lib/firebase';
import { UserProfile, Wallet } from '../types';

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  ffUsername: string;
  ffUid: string;
  phone?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  wallet: Wallet | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updatePlayerProfile: (data: Partial<UserProfile>) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  refreshWallet: (amountDelta: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const walletDocRef = doc(db, 'wallets', user.uid);

          // Listen to user profile doc
          const unsubProfile = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
              setProfile(snap.data() as UserProfile);
            } else {
              // Create default profile for newly signed in OAuth user
              const newProf: UserProfile = {
                uid: user.uid,
                fullName: user.displayName || 'FT Warrior',
                email: user.email || '',
                ffUsername: user.displayName ? user.displayName.slice(0, 16) : 'FT_Player',
                ffUid: '10' + Math.floor(10000000 + Math.random() * 90000000),
                avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
                tournamentWins: 0,
                tournamentsPlayed: 0,
                createdAt: new Date().toISOString()
              };
              setDoc(userDocRef, newProf).catch(e => {
                console.error("Profile setDoc error:", e);
              });
              setProfile(newProf);
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          });

          // Listen to user wallet doc
          const unsubWallet = onSnapshot(walletDocRef, (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              setWallet({
                ...data,
                withdrawalHoldBalance: data.withdrawalHoldBalance ?? 0
              } as Wallet);
            } else {
              // Provision clean starter esports wallet for registered player
              const cleanWallet: Wallet = {
                userId: user.uid,
                balance: 0,
                withdrawalHoldBalance: 0,
                totalDeposited: 0,
                totalWithdrawn: 0,
                currency: '₹',
                updatedAt: new Date().toISOString()
              };
              setDoc(walletDocRef, cleanWallet).catch(e => {
                console.error("Wallet setDoc error:", e);
              });
              setWallet(cleanWallet);
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, `wallets/${user.uid}`);
          });

          setLoading(false);
          return () => {
            unsubProfile();
            unsubWallet();
          };
        } catch (err) {
          console.error("Error setting up user listeners:", err);
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setProfile(null);
        setWallet(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      const newProfile: UserProfile = {
        uid: user.uid,
        fullName: data.fullName,
        email: data.email,
        ffUsername: data.ffUsername,
        ffUid: data.ffUid,
        phone: data.phone || '',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.ffUsername}`,
        tournamentWins: 0,
        tournamentsPlayed: 0,
        createdAt: new Date().toISOString()
      };

      const starterWallet: Wallet = {
        userId: user.uid,
        balance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        currency: '₹',
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), newProfile);
      await setDoc(doc(db, 'wallets', user.uid), starterWallet);

      setProfile(newProfile);
      setWallet(starterWallet);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setProfile(null);
    setWallet(null);
    if (auth.currentUser) {
      await signOut(auth);
    }
  };

  const updatePlayerProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, updates);
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const requestPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshWallet = async (amountDelta: number) => {
    if (!currentUser || !wallet) return;

    try {
      const newBal = Math.max(0, wallet.balance + amountDelta);
      const walletRef = doc(db, 'wallets', currentUser.uid);
      await updateDoc(walletRef, {
        balance: newBal,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `wallets/${currentUser.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        wallet,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        updatePlayerProfile,
        requestPasswordReset,
        refreshWallet
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
