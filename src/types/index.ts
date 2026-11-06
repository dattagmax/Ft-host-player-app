export type GameMode = 'Solo' | 'Duo' | 'Squad';
export type GameMap = 'Bermuda' | 'Purgatory' | 'Kalahari' | 'Alpine' | 'NexTerra';
export type TournamentStatus = 'open' | 'upcoming' | 'full' | 'live' | 'completed';
export type TransactionType = 'deposit' | 'withdrawal' | 'entry_fee' | 'prize_payout' | 'refund' | 'gift_code_reward';
export type TransactionStatus = 'pending' | 'processing' | 'approved' | 'completed' | 'rejected' | 'cancelled';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  ffUsername: string;
  ffUid: string;
  phone?: string;
  avatarUrl?: string;
  tournamentWins: number;
  tournamentsPlayed: number;
  createdAt: string;
}

export interface Wallet {
  userId: string;
  balance: number; // Available Balance
  withdrawalHoldBalance?: number; // Withdrawal Hold Balance
  totalDeposited: number;
  totalWithdrawn: number;
  currency: string;
  updatedAt: string;
}

export interface MatchResultDetails {
  winnerUsername: string;
  winnerUid: string;
  winnerTeamName?: string;
  runnerUpUsername?: string;
  runnerUpUid?: string;
  thirdPlaceUsername?: string;
  thirdPlaceUid?: string;
  verifiedByAdmin: boolean;
  publishedAt: string;
  prizeAwarded: number;
}

export type RegistrationStatus = 'COMING_SOON' | 'OPEN' | 'FULL' | 'CLOSED';

export interface Tournament {
  id: string;
  title: string;
  gameMode: GameMode;
  map: GameMap;
  entryFee: number;
  prizePool: number;
  totalSlots: number;
  registeredSlots: number;
  matchDate: string;
  matchTime: string;
  status: TournamentStatus;
  registration_status: RegistrationStatus;
  rules: string;
  bannerUrl?: string;
  roomId?: string;
  roomPassword?: string;
  isRoomReleased?: boolean;
  featured?: boolean;
  firstPrize?: number;
  secondPrize?: number;
  thirdPrize?: number;
  matchResult?: MatchResultDetails;
  createdAt?: string;
}

export interface Registration {
  id: string;
  tournamentId: string;
  userId: string;
  ffUsername: string;
  ffUid: string;
  teamName?: string;
  teamMembers?: string;
  slotNumber: number;
  entryFeePaid: number;
  status: 'confirmed' | 'cancelled';
  registeredAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  note: string;
  paymentMethod?: string;
  referenceId?: string;
  screenshotUrl?: string;
  payoutDetails?: {
    method: 'UPI' | 'Bank';
    upiId?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    maskedDetails?: string;
    estimatedProcessingTime?: string;
  };
  rejectionReason?: string;
  cancellationReason?: string;
  adminId?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  ffUid: string;
  avatarUrl?: string;
  tournamentWins: number;
  points: number;
  totalPrizeWon: number;
  period: 'weekly' | 'all_time';
  rank?: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'tournament' | 'registration' | 'room_credentials' | 'wallet' | 'leaderboard' | 'announcement';
  isRead: boolean;
  createdAt: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  tag: string;
  active: boolean;
  createdAt: string;
}

export interface GiftCode {
  id: string;
  code: string;
  rewardAmount: number;
  active: boolean;
  maxRedemptions?: number;
  redemptionsCount: number;
  expiresAt?: string;
  createdAt: string;
  description?: string;
}

export interface GiftCodeRedemption {
  id: string;
  codeId: string;
  userId: string;
  playerUsername?: string;
  rewardAmount: number;
  redeemedAt: string;
}
