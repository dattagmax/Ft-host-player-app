import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import confetti from 'canvas-confetti';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  Tournament,
  Registration,
  Transaction,
  LeaderboardEntry,
  NotificationItem,
  AnnouncementItem
} from '../types';
import {
  INITIAL_TOURNAMENTS,
  INITIAL_LEADERBOARD,
  INITIAL_ANNOUNCEMENTS
} from '../data/initialData';

export type NavTab = 'home' | 'tournaments' | 'matches' | 'leaderboard' | 'profile';

interface AppContextType {
  tournaments: Tournament[];
  registrations: Registration[];
  transactions: Transaction[];
  leaderboard: LeaderboardEntry[];
  announcements: AnnouncementItem[];
  notifications: NotificationItem[];
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedTournament: Tournament | null;
  setSelectedTournament: (tournament: Tournament | null) => void;
  isWalletModalOpen: boolean;
  openWalletModal: (action?: 'deposit' | 'withdraw') => void;
  closeWalletModal: () => void;
  walletInitialAction: 'deposit' | 'withdraw';
  isNotificationModalOpen: boolean;
  setIsNotificationModalOpen: (open: boolean) => void;
  isAnnouncementModalOpen: boolean;
  setIsAnnouncementModalOpen: (open: boolean) => void;
  activeAnnouncement: AnnouncementItem | null;
  setActiveAnnouncement: (announcement: AnnouncementItem | null) => void;
  isGiftCodeModalOpen: boolean;
  setIsGiftCodeModalOpen: (open: boolean) => void;
  openGiftCodeModal: () => void;
  closeGiftCodeModal: () => void;
  unreadCount: number;
  joinTournament: (tournamentId: string, teamInfo?: { teamName?: string; teamMembers?: string }) => Promise<{ success: boolean; message: string; slot?: number }>;
  requestDeposit: (amount: number, method: string, referenceId: string, screenshotFile?: File | null) => Promise<{ success: boolean; message: string }>;
  requestWithdrawal: (
    amount: number,
    method: 'UPI' | 'Bank',
    payoutDetails: {
      method: 'UPI' | 'Bank';
      upiId?: string;
      accountHolderName?: string;
      accountNumber?: string;
      ifscCode?: string;
      maskedDetails: string;
      estimatedProcessingTime: string;
    }
  ) => Promise<{ success: boolean; message: string }>;
  cancelWithdrawalRequest: (transactionId: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  adminApproveWithdrawal: (transactionId: string, adminId?: string, payoutRef?: string) => Promise<{ success: boolean; message: string }>;
  adminRejectWithdrawal: (transactionId: string, adminId?: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  adminApproveDeposit: (transactionId: string, adminId?: string) => Promise<{ success: boolean; message: string }>;
  adminRejectDeposit: (transactionId: string, adminId?: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  redeemGiftCode: (code: string) => Promise<{ success: boolean; message: string; reward?: number }>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  updateTournamentLifecycleStatus: (
    tournamentId: string,
    newStatus: 'open' | 'upcoming' | 'live' | 'completed',
    options?: {
      roomId?: string;
      roomPassword?: string;
      isRoomReleased?: boolean;
      winnerUsername?: string;
      winnerUid?: string;
      winnerTeamName?: string;
      prizeAwarded?: number;
    }
  ) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, wallet, refreshWallet, updatePlayerProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Modals state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletInitialAction, setWalletInitialAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isGiftCodeModalOpen, setIsGiftCodeModalOpen] = useState(false);

  const openWalletModal = (action: 'deposit' | 'withdraw' = 'deposit') => {
    setWalletInitialAction(action);
    setIsWalletModalOpen(true);
  };

  const closeWalletModal = () => {
    setIsWalletModalOpen(false);
  };

  const openGiftCodeModal = () => {
    setIsGiftCodeModalOpen(true);
  };

  const closeGiftCodeModal = () => {
    setIsGiftCodeModalOpen(false);
  };

  // Real-time Firestore sync for Tournaments (Never auto-creates sample tournaments)
  useEffect(() => {
    try {
      const tourneysRef = collection(db, 'tournaments');
      const unsub = onSnapshot(tourneysRef, (snapshot) => {
        const list: Tournament[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Tournament, 'id'>) });
        });
        setTournaments(list);
      }, (err) => {
        console.warn("Tournaments listener notice:", err);
      });
      return () => unsub();
    } catch (err) {
      console.warn("Tournaments setup notice:", err);
    }
  }, []);

  // Real-time Firestore sync for verified Leaderboard
  useEffect(() => {
    try {
      const lbRef = collection(db, 'leaderboard');
      const unsub = onSnapshot(lbRef, (snapshot) => {
        const list: LeaderboardEntry[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<LeaderboardEntry, 'id'>) });
        });
        list.sort((a, b) => b.points - a.points);
        setLeaderboard(list);
      }, () => {});
      return () => unsub();
    } catch {}
  }, []);

  // Real-time Firestore sync for Announcements
  useEffect(() => {
    try {
      const annRef = collection(db, 'announcements');
      const unsub = onSnapshot(annRef, (snapshot) => {
        const list: AnnouncementItem[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          if (d.active !== false) {
            list.push({ id: docSnap.id, ...(d as Omit<AnnouncementItem, 'id'>) });
          }
        });
        setAnnouncements(list);
      }, () => {});
      return () => unsub();
    } catch {}
  }, []);

  // Firestore sync for authenticated user registrations, transactions & notifications
  useEffect(() => {
    if (!profile) {
      setRegistrations([]);
      setTransactions([]);
      setNotifications([]);
      return;
    }

    try {
      // Registrations query for user
      const qRegs = query(collection(db, 'registrations'), where('userId', '==', profile.uid));
      const unsubRegs = onSnapshot(qRegs, (snap) => {
        const regs: Registration[] = [];
        snap.forEach((d) => regs.push({ id: d.id, ...(d.data() as Omit<Registration, 'id'>) }));
        setRegistrations(regs);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'registrations');
      });

      // Transactions query for user
      const qTx = query(collection(db, 'transactions'), where('userId', '==', profile.uid));
      const unsubTx = onSnapshot(qTx, (snap) => {
        const txs: Transaction[] = [];
        snap.forEach((d) => txs.push({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) }));
        txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTransactions(txs);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'transactions');
      });

      // Notifications query for user
      const qNotif = query(collection(db, 'notifications'), where('userId', '==', profile.uid));
      const unsubNotif = onSnapshot(qNotif, (snap) => {
        const notifs: NotificationItem[] = [];
        snap.forEach((d) => notifs.push({ id: d.id, ...(d.data() as Omit<NotificationItem, 'id'>) }));
        notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(notifs);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'notifications');
      });

      return () => {
        unsubRegs();
        unsubTx();
        unsubNotif();
      };
    } catch (err) {
      console.error("Firestore user listeners error:", err);
    }
  }, [profile]);

  // Secure, atomic tournament registration system
  const joinTournament = async (
    tournamentId: string,
    teamInfo?: { teamName?: string; teamMembers?: string }
  ): Promise<{ success: boolean; message: string; slot?: number }> => {
    // 1. Check player authentication
    if (!profile) {
      return { success: false, message: 'Please login or create an account to join tournaments.' };
    }

    const tourney = tournaments.find((t) => t.id === tournamentId);
    if (!tourney) {
      return { success: false, message: 'Tournament not found.' };
    }

    // 2. Validate registration status
    if (tourney.registration_status === 'COMING_SOON') {
      return { success: false, message: 'Registration has not opened yet.' };
    }
    if (tourney.registration_status === 'FULL') {
      return { success: false, message: 'Tournament slots are already full.' };
    }
    if (tourney.registration_status === 'CLOSED') {
      return { success: false, message: 'Registration for this tournament is closed.' };
    }
    if (tourney.registration_status !== 'OPEN') {
      return { success: false, message: 'Tournament is not open for registration.' };
    }

    // 3. Check duplicate registration in current user state
    const alreadyRegistered = registrations.some(
      (r) => r.tournamentId === tournamentId && (r.userId === profile.uid || r.status === 'confirmed')
    );
    if (alreadyRegistered) {
      return { success: false, message: 'You have already joined this tournament.' };
    }

    // 4. Check available slots
    if (tourney.registeredSlots >= tourney.totalSlots) {
      return { success: false, message: 'Tournament slots are already full.' };
    }

    if (tourney.status === 'completed' || tourney.status === 'live') {
      return { success: false, message: 'Registration is not allowed for live or completed matches.' };
    }

    // 5. Check wallet balance for tournaments with entry fee
    const currentBalance = wallet?.balance ?? 0;
    const entryFee = tourney.entryFee ?? 0;
    if (entryFee > 0 && currentBalance < entryFee) {
      openWalletModal('deposit');
      return {
        success: false,
        message: `Insufficient balance! You need ₹${entryFee}, but your available balance is ₹${currentBalance}.`
      };
    }

    const nowIso = new Date().toISOString();

    // Production Firestore ACID transaction preventing race conditions and double bookings
    try {
      const regDocId = `${tournamentId}_${profile.uid}`;
      const regDocRef = doc(db, 'registrations', regDocId);
      const tourneyDocRef = doc(db, 'tournaments', tournamentId);
      const walletDocRef = doc(db, 'wallets', profile.uid);

      let assignedSlot = tourney.registeredSlots + 1;

      await runTransaction(db, async (txn) => {
        // Step A: Atomically verify duplicate registration
        const existingRegSnap = await txn.get(regDocRef);
        if (existingRegSnap.exists()) {
          throw new Error('You have already joined this tournament.');
        }

        // Step B: Atomically verify tournament status & available slots
        const tourneySnap = await txn.get(tourneyDocRef);
        if (!tourneySnap.exists()) {
          throw new Error('Tournament not found.');
        }
        const tData = tourneySnap.data();
        if (tData.registration_status !== 'OPEN') {
          if (tData.registration_status === 'COMING_SOON') throw new Error('Registration has not opened yet.');
          if (tData.registration_status === 'CLOSED') throw new Error('Registration for this tournament is closed.');
          throw new Error('Tournament slots are already full.');
        }
        const currentRegistered = tData.registeredSlots ?? 0;
        const totalCapacity = tData.totalSlots ?? 0;
        if (currentRegistered >= totalCapacity) {
          throw new Error('Tournament slots are already full.');
        }

        // Step C: Atomically verify wallet balance
        let userBalance = 0;
        const walletSnap = await txn.get(walletDocRef);
        if (walletSnap.exists()) {
          userBalance = walletSnap.data().balance ?? 0;
        }
        if (entryFee > 0 && userBalance < entryFee) {
          throw new Error(`Insufficient balance! You need ₹${entryFee}, but your available balance is ₹${userBalance}.`);
        }

        assignedSlot = currentRegistered + 1;
        const isCapacityReached = assignedSlot >= totalCapacity;

        // Step D: Atomic writes
        // 1. Deduct entry fee
        if (entryFee > 0) {
          txn.update(walletDocRef, {
            balance: userBalance - entryFee,
            updatedAt: nowIso
          });
        }

        // 2. Increment tournament slot count and update status if full
        const tourneyUpdates: Record<string, any> = {
          registeredSlots: assignedSlot,
          registration_status: isCapacityReached ? 'FULL' : 'OPEN'
        };
        txn.update(tourneyDocRef, tourneyUpdates);

        // 3. Create confirmed registration
        txn.set(regDocRef, {
          tournamentId,
          userId: profile.uid,
          ffUsername: profile.ffUsername,
          ffUid: profile.ffUid,
          teamName: teamInfo?.teamName || '',
          teamMembers: teamInfo?.teamMembers || '',
          slotNumber: assignedSlot,
          entryFeePaid: entryFee,
          status: 'confirmed',
          registeredAt: nowIso
        });
      });

      // Post-transaction tasks: ledger log & player notification
      if (entryFee > 0) {
        await addDoc(collection(db, 'transactions'), {
          userId: profile.uid,
          type: 'entry_fee',
          amount: entryFee,
          status: 'completed',
          note: `Entry Fee: ${tourney.title}`,
          createdAt: nowIso
        }).catch(() => {});
      }

      await addDoc(collection(db, 'notifications'), {
        userId: profile.uid,
        title: 'Tournament Joined Successfully!',
        message: `You are confirmed for ${tourney.title}. Slot #${assignedSlot} assigned.`,
        type: 'registration',
        isRead: false,
        createdAt: nowIso
      }).catch(() => {});

      // Celebratory confetti
      try {
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#06b6d4', '#ffffff', '#22d3ee']
        });
      } catch {}

      return {
        success: true,
        message: `Registration confirmed! Slot #${assignedSlot} assigned.`,
        slot: assignedSlot
      };
    } catch (err: any) {
      console.warn("Firestore atomic transaction note:", err);
      return {
        success: false,
        message: err?.message || 'Could not complete registration. Please try again.'
      };
    }
  };

  // 1. Professional Deposit Submission with Duplicate UTR Check & Screenshot Upload
  const requestDeposit = async (
    amount: number,
    method: string,
    referenceId: string,
    screenshotFile?: File | null
  ): Promise<{ success: boolean; message: string }> => {
    if (!profile) {
      throw new Error('Please login to submit deposit requests.');
    }
    if (!amount || amount < 50) {
      throw new Error('Minimum deposit amount is ₹50.');
    }
    const cleanRef = referenceId.trim();
    if (!cleanRef) {
      throw new Error('Please enter the 12-digit UPI Ref / UTR transaction ID.');
    }

    try {
      // Check for duplicate UTR submissions
      const duplicateQuery = query(
        collection(db, 'transactions'),
        where('referenceId', '==', cleanRef)
      );
      const dupSnap = await getDocs(duplicateQuery);
      if (!dupSnap.empty) {
        throw new Error('This UPI Ref / UTR number has already been submitted. Please check your transaction history or contact support.');
      }

      // Handle payment screenshot upload (Firebase Storage + base64 fallback)
      let screenshotUrl = '';
      if (screenshotFile) {
        try {
          const fileExt = screenshotFile.name.split('.').pop() || 'png';
          const storagePath = `deposit_screenshots/${profile.uid}_${Date.now()}.${fileExt}`;
          const storageRef = ref(storage, storagePath);
          const uploadRes = await uploadBytes(storageRef, screenshotFile);
          screenshotUrl = await getDownloadURL(uploadRes.ref);
        } catch (storageErr) {
          console.warn("Firebase Storage upload note:", storageErr);
          // Resilient fallback: data URL format
          try {
            screenshotUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = () => resolve('');
              reader.readAsDataURL(screenshotFile);
            });
          } catch {}
        }
      }

      const nowIso = new Date().toISOString();
      const txDoc: Omit<Transaction, 'id'> = {
        userId: profile.uid,
        type: 'deposit',
        amount,
        status: 'pending',
        note: `Deposit via ${method} (UTR: ${cleanRef})`,
        paymentMethod: method,
        referenceId: cleanRef,
        screenshotUrl: screenshotUrl || undefined,
        createdAt: nowIso
      };
      await addDoc(collection(db, 'transactions'), txDoc);

      // Professional deposit notification as required
      await addDoc(collection(db, 'notifications'), {
        userId: profile.uid,
        title: 'DEPOSIT REQUEST SUBMITTED',
        message: 'Thank you! Your payment details have been received successfully. Your deposit is currently under verification. Your wallet will be updated once your payment is confirmed.',
        type: 'wallet',
        isRead: false,
        createdAt: nowIso
      }).catch(() => {});

      return {
        success: true,
        message: 'Thank you! Your payment details have been received successfully. Your deposit is currently under verification. Your wallet will be updated once your payment is confirmed.'
      };
    } catch (err: any) {
      if (err instanceof Error) throw err;
      throw new Error('Failed to submit deposit request.');
    }
  };

  // 2. Professional Withdrawal Hold System with Atomic Firestore Balance Transfer
  const requestWithdrawal = async (
    amount: number,
    method: 'UPI' | 'Bank',
    payoutDetails: {
      method: 'UPI' | 'Bank';
      upiId?: string;
      accountHolderName?: string;
      accountNumber?: string;
      ifscCode?: string;
      maskedDetails: string;
      estimatedProcessingTime: string;
    }
  ): Promise<{ success: boolean; message: string }> => {
    if (!profile) {
      throw new Error('Please login to submit a withdrawal request.');
    }
    if (!amount || amount < 100) {
      throw new Error('Minimum withdrawal amount is ₹100.');
    }

    const nowIso = new Date().toISOString();
    const walletRef = doc(db, 'wallets', profile.uid);
    const withdrawalId = `WD-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

    try {
      // Atomic Firestore transaction: Move requested amount from Available Balance to Withdrawal Hold Balance
      await runTransaction(db, async (txn) => {
        const walletSnap = await txn.get(walletRef);
        if (!walletSnap.exists()) {
          throw new Error('Wallet not found.');
        }

        const walletData = walletSnap.data();
        const currentAvailable = walletData.balance ?? 0;
        const currentHold = walletData.withdrawalHoldBalance ?? 0;

        if (currentAvailable < amount) {
          throw new Error(`Insufficient funds. Your available balance is ₹${currentAvailable}.`);
        }

        const newAvailable = currentAvailable - amount;
        const newHold = currentHold + amount;

        // Move amount from available balance to withdrawal hold balance
        txn.update(walletRef, {
          balance: newAvailable,
          withdrawalHoldBalance: newHold,
          updatedAt: nowIso
        });

        // Record withdrawal transaction with pending status and hold reference
        const txDocRef = doc(collection(db, 'transactions'));
        txn.set(txDocRef, {
          userId: profile.uid,
          type: 'withdrawal',
          amount,
          status: 'pending',
          note: `Withdrawal via ${method} to ${payoutDetails.maskedDetails}`,
          paymentMethod: method,
          referenceId: withdrawalId,
          payoutDetails,
          createdAt: nowIso
        });
      });

      // Professional withdrawal notification
      await addDoc(collection(db, 'notifications'), {
        userId: profile.uid,
        title: 'WITHDRAWAL REQUEST RECEIVED',
        message: 'Your withdrawal request has been submitted successfully. The requested amount has been reserved in your wallet. You can track its status in Transaction History.',
        type: 'wallet',
        isRead: false,
        createdAt: nowIso
      }).catch(() => {});

      return {
        success: true,
        message: 'Your withdrawal request has been submitted successfully. The requested amount has been reserved in your wallet. You can track its status in Transaction History.'
      };
    } catch (err: any) {
      if (err instanceof Error) throw err;
      throw new Error('Withdrawal request failed.');
    }
  };

  // 3. User / Admin Withdrawal Cancellation with Automatic Balance Restoration
  const cancelWithdrawalRequest = async (
    transactionId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!profile) throw new Error('Please login.');
    const nowIso = new Date().toISOString();
    const txRef = doc(db, 'transactions', transactionId);
    const walletRef = doc(db, 'wallets', profile.uid);

    try {
      await runTransaction(db, async (txn) => {
        const txSnap = await txn.get(txRef);
        if (!txSnap.exists()) throw new Error('Transaction record not found.');
        const txData = txSnap.data() as Transaction;

        if (txData.userId !== profile.uid) throw new Error('Unauthorized action.');
        if (txData.status !== 'pending') {
          throw new Error(`Cannot cancel withdrawal. Current status is ${txData.status.toUpperCase()}.`);
        }

        const walletSnap = await txn.get(walletRef);
        if (!walletSnap.exists()) throw new Error('Wallet not found.');

        const wData = walletSnap.data();
        const currentBal = wData.balance ?? 0;
        const currentHold = wData.withdrawalHoldBalance ?? 0;

        // Release entire held amount back to Available Balance
        txn.update(walletRef, {
          balance: currentBal + txData.amount,
          withdrawalHoldBalance: Math.max(0, currentHold - txData.amount),
          updatedAt: nowIso
        });

        // Set status to cancelled
        txn.update(txRef, {
          status: 'cancelled',
          cancellationReason: reason || 'Cancelled by player',
          updatedAt: nowIso
        });
      });

      // Professional cancellation notification
      await addDoc(collection(db, 'notifications'), {
        userId: profile.uid,
        title: 'WITHDRAWAL CANCELLED',
        message: 'Your withdrawal request has been cancelled. The reserved amount has been returned to your available wallet balance.',
        type: 'wallet',
        isRead: false,
        createdAt: nowIso
      }).catch(() => {});

      return {
        success: true,
        message: 'Your withdrawal request has been cancelled. The reserved amount has been returned to your available wallet balance.'
      };
    } catch (err: any) {
      if (err instanceof Error) throw err;
      throw new Error('Could not cancel withdrawal.');
    }
  };

  // 4. FT HOST ADMIN Backend Compatibility: Approve Withdrawal
  const adminApproveWithdrawal = async (
    transactionId: string,
    adminId = 'admin',
    payoutRef?: string
  ): Promise<{ success: boolean; message: string }> => {
    const nowIso = new Date().toISOString();
    const txRef = doc(db, 'transactions', transactionId);

    try {
      await runTransaction(db, async (txn) => {
        const txSnap = await txn.get(txRef);
        if (!txSnap.exists()) throw new Error('Transaction not found.');
        const txData = txSnap.data() as Transaction;

        if (txData.status === 'completed' || txData.status === 'approved') {
          throw new Error('Withdrawal is already completed.');
        }

        const walletRef = doc(db, 'wallets', txData.userId);
        const walletSnap = await txn.get(walletRef);
        if (walletSnap.exists()) {
          const currentHold = walletSnap.data().withdrawalHoldBalance ?? 0;
          const currentWithdrawn = walletSnap.data().totalWithdrawn ?? 0;
          txn.update(walletRef, {
            withdrawalHoldBalance: Math.max(0, currentHold - txData.amount),
            totalWithdrawn: currentWithdrawn + txData.amount,
            updatedAt: nowIso
          });
        }

        txn.update(txRef, {
          status: 'completed',
          adminId,
          approvedAt: nowIso,
          payoutReference: payoutRef || `PAY-${Date.now().toString().slice(-6)}`,
          updatedAt: nowIso
        });
      });

      const txSnap = await getDoc(txRef);
      if (txSnap.exists()) {
        await addDoc(collection(db, 'notifications'), {
          userId: txSnap.data().userId,
          title: 'Withdrawal Dispatched',
          message: `Your withdrawal of ₹${txSnap.data().amount} has been successfully dispatched.`,
          type: 'wallet',
          isRead: false,
          createdAt: nowIso
        }).catch(() => {});
      }

      return { success: true, message: 'Withdrawal verified and settled.' };
    } catch (err: any) {
      if (err instanceof Error) throw err;
      throw new Error('Failed to approve withdrawal.');
    }
  };

  // 5. FT HOST ADMIN Backend Compatibility: Reject Withdrawal
  const adminRejectWithdrawal = async (
    transactionId: string,
    adminId = 'admin',
    reason = 'Invalid payout details'
  ): Promise<{ success: boolean; message: string }> => {
    const nowIso = new Date().toISOString();
    const txRef = doc(db, 'transactions', transactionId);

    try {
      await runTransaction(db, async (txn) => {
        const txSnap = await txn.get(txRef);
        if (!txSnap.exists()) throw new Error('Transaction not found.');
        const txData = txSnap.data() as Transaction;

        if (txData.status !== 'pending' && txData.status !== 'processing') {
          throw new Error(`Cannot reject withdrawal with status ${txData.status}.`);
        }

        const walletRef = doc(db, 'wallets', txData.userId);
        const walletSnap = await txn.get(walletRef);
        if (walletSnap.exists()) {
          const currentBal = walletSnap.data().balance ?? 0;
          const currentHold = walletSnap.data().withdrawalHoldBalance ?? 0;
          // Restore reserved amount to Available Balance
          txn.update(walletRef, {
            balance: currentBal + txData.amount,
            withdrawalHoldBalance: Math.max(0, currentHold - txData.amount),
            updatedAt: nowIso
          });
        }

        txn.update(txRef, {
          status: 'rejected',
          adminId,
          rejectionReason: reason,
          updatedAt: nowIso
        });
      });

      const txSnap = await getDoc(txRef);
      if (txSnap.exists()) {
        await addDoc(collection(db, 'notifications'), {
          userId: txSnap.data().userId,
          title: 'Withdrawal Rejected',
          message: `Your withdrawal request of ₹${txSnap.data().amount} was rejected (${reason}). The reserved amount has been returned to your available balance.`,
          type: 'wallet',
          isRead: false,
          createdAt: nowIso
        }).catch(() => {});
      }

      return { success: true, message: 'Withdrawal rejected and funds restored.' };
    } catch (err: any) {
      if (err instanceof Error) throw err;
      throw new Error('Failed to reject withdrawal.');
    }
  };

  // 6. FT HOST ADMIN Backend Compatibility: Approve Deposit
  const adminApproveDeposit = async (
    transactionId: string,
    adminId = 'admin'
  ): Promise<{ success: boolean; message: string }> => {
    const nowIso = new Date().toISOString();
    const txRef = doc(db, 'transactions', transactionId);

    try {
      await runTransaction(db, async (txn) => {
        const txSnap = await txn.get(txRef);
        if (!txSnap.exists()) throw new Error('Transaction not found.');
        const txData = txSnap.data() as Transaction;

        if (txData.status === 'completed' || txData.status === 'approved') {
          throw new Error('Deposit is already credited.');
        }

        const walletRef = doc(db, 'wallets', txData.userId);
        const walletSnap = await txn.get(walletRef);
        if (walletSnap.exists()) {
          const currentBal = walletSnap.data().balance ?? 0;
          const currentDeposited = walletSnap.data().totalDeposited ?? 0;
          txn.update(walletRef, {
            balance: currentBal + txData.amount,
            totalDeposited: currentDeposited + txData.amount,
            updatedAt: nowIso
          });
        }

        txn.update(txRef, {
          status: 'completed',
          adminId,
          approvedAt: nowIso,
          updatedAt: nowIso
        });
      });

      const txSnap = await getDoc(txRef);
      if (txSnap.exists()) {
        await addDoc(collection(db, 'notifications'), {
          userId: txSnap.data().userId,
          title: 'Deposit Confirmed',
          message: `Your deposit of ₹${txSnap.data().amount} has been verified and added to your wallet!`,
          type: 'wallet',
          isRead: false,
          createdAt: nowIso
        }).catch(() => {});
      }

      return { success: true, message: 'Deposit verified and credited.' };
    } catch (err: any) {
      if (err instanceof Error) throw err;
      throw new Error('Failed to approve deposit.');
    }
  };

  // 7. FT HOST ADMIN Backend Compatibility: Reject Deposit
  const adminRejectDeposit = async (
    transactionId: string,
    adminId = 'admin',
    reason = 'Payment verification failed'
  ): Promise<{ success: boolean; message: string }> => {
    const nowIso = new Date().toISOString();
    const txRef = doc(db, 'transactions', transactionId);

    try {
      await updateDoc(txRef, {
        status: 'rejected',
        adminId,
        rejectionReason: reason,
        updatedAt: nowIso
      });

      const txSnap = await getDoc(txRef);
      if (txSnap.exists()) {
        await addDoc(collection(db, 'notifications'), {
          userId: txSnap.data().userId,
          title: 'Deposit Rejected',
          message: `Your deposit request of ₹${txSnap.data().amount} was rejected (${reason}).`,
          type: 'wallet',
          isRead: false,
          createdAt: nowIso
        }).catch(() => {});
      }

      return { success: true, message: 'Deposit rejected.' };
    } catch (err: any) {
      if (err instanceof Error) throw err;
      throw new Error('Failed to reject deposit.');
    }
  };

  // Dedicated Gift Code Redemption System
  const redeemGiftCode = async (
    code: string
  ): Promise<{ success: boolean; message: string; reward?: number }> => {
    if (!profile) {
      return { success: false, message: 'Please login or register to redeem gift codes.' };
    }

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a valid gift code.' };
    }

    try {
      const nowIso = new Date().toISOString();
      const giftCodeRef = doc(db, 'gift_codes', cleanCode);
      const redemptionDocId = `${cleanCode}_${profile.uid}`;
      const redemptionRef = doc(db, 'gift_code_redemptions', redemptionDocId);
      const walletRef = doc(db, 'wallets', profile.uid);

      let rewardAmount = 0;

      await runTransaction(db, async (txn) => {
        // 1. Check if the code exists
        const codeSnap = await txn.get(giftCodeRef);
        if (!codeSnap.exists()) {
          throw new Error('Invalid gift code.');
        }

        const codeData = codeSnap.data();

        // 2. Check if the code is active
        if (codeData.active === false || codeData.isActive === false) {
          throw new Error('This gift code has expired.');
        }

        // 3. Check if the code has expired
        const expiry = codeData.expiresAt || codeData.expiryDate;
        if (expiry) {
          const expiryTime = new Date(expiry).getTime();
          if (!isNaN(expiryTime) && expiryTime < Date.now()) {
            throw new Error('This gift code has expired.');
          }
        }

        // 4. Check if maximum redemptions limit has been reached
        const currentRedemptions = codeData.redemptionCount ?? codeData.redemptionsCount ?? 0;
        const maxRedemptions = codeData.maxRedemptions;
        if (maxRedemptions && currentRedemptions >= maxRedemptions) {
          throw new Error('This gift code has reached its redemption limit.');
        }

        // 5. Check if user already redeemed this code
        const redSnap = await txn.get(redemptionRef);
        if (redSnap.exists()) {
          throw new Error('You have already redeemed this code.');
        }

        // 6. Get player wallet
        const walletSnap = await txn.get(walletRef);
        const currentBalance = walletSnap.exists() ? (walletSnap.data().balance ?? 0) : 0;
        rewardAmount = Number(codeData.rewardAmount) || 0;

        // Atomic Writes:
        // A. Increment redemption count on gift code
        txn.update(giftCodeRef, {
          redemptionCount: currentRedemptions + 1,
          totalRewardsDistributed: (codeData.totalRewardsDistributed || 0) + rewardAmount
        });

        // B. Record redemption document
        txn.set(redemptionRef, {
          codeId: cleanCode,
          code: cleanCode,
          userId: profile.uid,
          playerUsername: profile.ffUsername,
          rewardAmount,
          redeemedAt: nowIso
        });

        // C. Update wallet balance
        if (walletSnap.exists()) {
          txn.update(walletRef, {
            balance: currentBalance + rewardAmount,
            updatedAt: nowIso
          });
        } else {
          txn.set(walletRef, {
            userId: profile.uid,
            balance: rewardAmount,
            totalDeposited: 0,
            totalWithdrawn: 0,
            currency: '₹',
            updatedAt: nowIso
          });
        }
      });

      // Post-transaction record-keeping:
      // 1. Transaction log
      await addDoc(collection(db, 'transactions'), {
        userId: profile.uid,
        type: 'prize_payout',
        amount: rewardAmount,
        status: 'completed',
        note: `Gift Code Redeemed: ${cleanCode}`,
        createdAt: nowIso
      }).catch(() => {});

      // 2. Notification log
      await addDoc(collection(db, 'notifications'), {
        userId: profile.uid,
        title: '🎁 Gift Code Redeemed!',
        message: `Congratulations! ₹${rewardAmount} has been added to your wallet.`,
        type: 'wallet',
        isRead: false,
        createdAt: nowIso
      }).catch(() => {});

      // 3. Confetti effect
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#22d3ee', '#10b981', '#facc15']
        });
      } catch {}

      return {
        success: true,
        message: `Congratulations! ₹${rewardAmount} has been added to your wallet.`,
        reward: rewardAmount
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Could not redeem gift code. Please try again.'
      };
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      notifications.forEach((n) => {
        if (!n.isRead) {
          updateDoc(doc(db, 'notifications', n.id), { isRead: true }).catch(() => {});
        }
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Safe fallback
    }
  };

  const updateTournamentLifecycleStatus = async (
    tournamentId: string,
    newStatus: 'open' | 'upcoming' | 'live' | 'completed',
    options?: {
      roomId?: string;
      roomPassword?: string;
      isRoomReleased?: boolean;
      winnerUsername?: string;
      winnerUid?: string;
      winnerTeamName?: string;
      prizeAwarded?: number;
    }
  ) => {
    const tourney = tournaments.find((t) => t.id === tournamentId);
    if (!tourney) return;

    const isWinnerCurrentPlayer = profile && (
      options?.winnerUsername === profile.ffUsername ||
      options?.winnerUid === profile.ffUid
    );

    const prizeWon = options?.prizeAwarded || tourney.firstPrize || Math.round(tourney.prizePool * 0.6);

    const matchResultObj = newStatus === 'completed' && options?.winnerUsername ? {
      winnerUsername: options.winnerUsername,
      winnerUid: options.winnerUid || '',
      winnerTeamName: options.winnerTeamName || '',
      verifiedByAdmin: true,
      publishedAt: new Date().toISOString(),
      prizeAwarded: prizeWon
    } : undefined;

    // 1. Update in-memory
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          return {
            ...t,
            status: newStatus,
            roomId: options?.roomId || t.roomId,
            roomPassword: options?.roomPassword || t.roomPassword,
            isRoomReleased: options?.isRoomReleased ?? (newStatus === 'live' ? true : t.isRoomReleased),
            matchResult: matchResultObj || t.matchResult
          };
        }
        return t;
      })
    );

    // 2. Notify on LIVE
    if (newStatus === 'live' && profile) {
      const liveNotif: NotificationItem = {
        id: `notif-live-${Date.now()}`,
        userId: profile.uid,
        title: '⚔️ MATCH IS NOW LIVE!',
        message: `${tourney.title} has started! Room ID and Password are now available in My Matches.`,
        type: 'room_credentials',
        isRead: false,
        createdAt: 'Just now'
      };
      setNotifications((prev) => [liveNotif, ...prev]);
    }

    // 3. If COMPLETED and current player won
    if (newStatus === 'completed' && isWinnerCurrentPlayer && profile) {
      await refreshWallet(prizeWon);
      updatePlayerProfile({
        tournamentWins: (profile.tournamentWins || 0) + 1
      }).catch(() => {});

      const newTx: Transaction = {
        id: `tx-win-${Date.now()}`,
        userId: profile.uid,
        type: 'prize_payout',
        amount: prizeWon,
        status: 'completed',
        note: `1st Prize: ${tourney.title}`,
        createdAt: new Date().toISOString()
      };
      setTransactions((prev) => [newTx, ...prev]);

      const winNotif: NotificationItem = {
        id: `notif-win-${Date.now()}`,
        userId: profile.uid,
        title: '🏆 BOOYAH! TOURNAMENT VICTORY',
        message: `Congratulations! You won 1st Place in ${tourney.title}! ₹${prizeWon} has been credited to your wallet.`,
        type: 'tournament',
        isRead: false,
        createdAt: 'Just now'
      };
      setNotifications((prev) => [winNotif, ...prev]);
    }

    // 4. Update Firestore
    try {
      const tourneyRef = doc(db, 'tournaments', tournamentId);
      const updatePayload: Record<string, any> = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };
      if (newStatus === 'live') {
        updatePayload.isRoomReleased = true;
        if (options?.roomId) updatePayload.roomId = options.roomId;
        if (options?.roomPassword) updatePayload.roomPassword = options.roomPassword;
      }
      if (matchResultObj) {
        updatePayload.matchResult = matchResultObj;
      }
      await updateDoc(tourneyRef, updatePayload).catch((err) => {
        console.warn("Firestore tournament update note:", err);
      });
    } catch (err) {
      console.warn("Firestore update error:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        tournaments,
        registrations,
        transactions,
        leaderboard,
        announcements,
        notifications,
        activeTab,
        setActiveTab,
        selectedTournament,
        setSelectedTournament,
        isWalletModalOpen,
        openWalletModal,
        closeWalletModal,
        walletInitialAction,
        isNotificationModalOpen,
        setIsNotificationModalOpen,
        isAnnouncementModalOpen,
        setIsAnnouncementModalOpen,
        activeAnnouncement,
        setActiveAnnouncement,
        isGiftCodeModalOpen,
        setIsGiftCodeModalOpen,
        openGiftCodeModal,
        closeGiftCodeModal,
        unreadCount,
        joinTournament,
        requestDeposit,
        requestWithdrawal,
        cancelWithdrawalRequest,
        adminApproveWithdrawal,
        adminRejectWithdrawal,
        adminApproveDeposit,
        adminRejectDeposit,
        redeemGiftCode,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        updateTournamentLifecycleStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
