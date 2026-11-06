import React, { useState, useRef } from 'react';
import {
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  Building2,
  Smartphone,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  ArrowLeft,
  Ban
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';

export const WalletModal: React.FC = () => {
  const { wallet, profile } = useAuth();
  const {
    isWalletModalOpen,
    closeWalletModal,
    walletInitialAction,
    transactions,
    requestDeposit,
    requestWithdrawal,
    cancelWithdrawalRequest
  } = useApp();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>(walletInitialAction);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [referenceId, setReferenceId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositSubmitted, setDepositSubmitted] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Withdraw Form State
  const [withdrawMethod, setWithdrawMethod] = useState<'UPI' | 'Bank'>('UPI');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(200);

  // UPI Fields
  const [upiId, setUpiId] = useState('');

  // Bank Fields (Vertical separate inputs)
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [confirmBankAccountNumber, setConfirmBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  // Withdrawal Confirmation Screen State
  const [isConfirmingWithdrawal, setIsConfirmingWithdrawal] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSubmitted, setWithdrawSubmitted] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Cancellation State
  const [cancellingTxId, setCancellingTxId] = useState<string | null>(null);
  const [cancellationMessage, setCancellationMessage] = useState<string | null>(null);

  // History Filter
  const [historyCategory, setHistoryCategory] = useState<'all' | TransactionType>('all');

  if (!isWalletModalOpen) return null;

  const FT_HOST_UPI_ID = 'fthost.official@axisbank';
  const availableBalance = wallet?.balance ?? 0;
  const holdBalance = wallet?.withdrawalHoldBalance ?? 0;
  const totalDeposited = wallet?.totalDeposited ?? 0;
  const totalWithdrawn = wallet?.totalWithdrawn ?? 0;

  const copyUpiId = () => {
    navigator.clipboard.writeText(FT_HOST_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Screenshot Selection
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setDepositError('Invalid file format. Please upload JPG, JPEG, or PNG images only.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setDepositError('File size exceeds 5MB limit. Please choose a smaller screenshot.');
      return;
    }

    setDepositError(null);
    setScreenshotFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Deposit Request
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError(null);

    if (!depositAmount || depositAmount < 50) {
      setDepositError('Minimum deposit amount is ₹50.');
      return;
    }
    const cleanRef = referenceId.trim();
    if (!cleanRef) {
      setDepositError('Please enter the 12-digit UPI Reference / UTR Number.');
      return;
    }

    try {
      setDepositLoading(true);
      await requestDeposit(depositAmount, 'UPI', cleanRef, screenshotFile);
      setDepositSubmitted(true);
      setReferenceId('');
      setScreenshotFile(null);
      setScreenshotPreview(null);
    } catch (err: unknown) {
      setDepositError(err instanceof Error ? err.message : 'Failed to submit deposit request.');
    } finally {
      setDepositLoading(false);
    }
  };

  // Step 1: Pre-validate withdrawal & show confirmation screen
  const handleRequestWithdrawalClick = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);

    if (withdrawAmount < 100) {
      setWithdrawError('Minimum withdrawal amount is ₹100.');
      return;
    }
    if (withdrawAmount > availableBalance) {
      setWithdrawError(`Insufficient funds. Your available balance is ₹${availableBalance}.`);
      return;
    }

    if (withdrawMethod === 'UPI') {
      const cleanUpi = upiId.trim();
      if (!cleanUpi || !cleanUpi.includes('@')) {
        setWithdrawError('Please enter a valid UPI ID (e.g. player@okaxis).');
        return;
      }
    } else {
      if (!accountHolderName.trim()) {
        setWithdrawError('Please enter the Bank Account Holder Name.');
        return;
      }
      const cleanAcc = bankAccountNumber.trim();
      const cleanConfirm = confirmBankAccountNumber.trim();
      if (!cleanAcc || cleanAcc.length < 8) {
        setWithdrawError('Please enter a valid Bank Account Number (minimum 8 digits).');
        return;
      }
      if (cleanAcc !== cleanConfirm) {
        setWithdrawError('Bank Account Number and Confirmation do not match.');
        return;
      }
      const cleanIfsc = ifscCode.trim().toUpperCase();
      if (!cleanIfsc || cleanIfsc.length < 9) {
        setWithdrawError('Please enter a valid 11-character IFSC Code (e.g. SBIN0001234).');
        return;
      }
    }

    // Input is valid -> Open confirmation step
    setIsConfirmingWithdrawal(true);
  };

  // Helper formatting for masked details
  const getMaskedPayoutDetails = () => {
    if (withdrawMethod === 'UPI') {
      const parts = upiId.trim().split('@');
      const name = parts[0] || '';
      const handle = parts[1] || '';
      const maskedName = name.length > 2 ? `${name.slice(0, 2)}***${name.slice(-1)}` : `${name}***`;
      return `${maskedName}@${handle}`;
    } else {
      const last4 = bankAccountNumber.trim().slice(-4);
      return `A/C: •••• •••• ${last4} | IFSC: ${ifscCode.trim().toUpperCase()} (${accountHolderName.trim()})`;
    }
  };

  // Step 2: Final confirmation of withdrawal
  const handleFinalConfirmWithdrawal = async () => {
    setWithdrawError(null);
    setWithdrawLoading(true);

    const masked = getMaskedPayoutDetails();
    const estTime = withdrawMethod === 'UPI' ? '1–24 hours' : '1–3 business days';

    try {
      await requestWithdrawal(withdrawAmount, withdrawMethod, {
        method: withdrawMethod,
        upiId: withdrawMethod === 'UPI' ? upiId.trim() : undefined,
        accountHolderName: withdrawMethod === 'Bank' ? accountHolderName.trim() : undefined,
        accountNumber: withdrawMethod === 'Bank' ? bankAccountNumber.trim() : undefined,
        ifscCode: withdrawMethod === 'Bank' ? ifscCode.trim().toUpperCase() : undefined,
        maskedDetails: masked,
        estimatedProcessingTime: estTime
      });

      setIsConfirmingWithdrawal(false);
      setWithdrawSubmitted(true);
      // Reset form
      setUpiId('');
      setAccountHolderName('');
      setBankAccountNumber('');
      setConfirmBankAccountNumber('');
      setIfscCode('');
    } catch (err: unknown) {
      setWithdrawError(err instanceof Error ? err.message : 'Withdrawal request failed.');
      setIsConfirmingWithdrawal(false);
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Handle Cancellation of a Pending Withdrawal
  const handleCancelPendingWithdrawal = async (txId: string) => {
    try {
      setCancellingTxId(txId);
      await cancelWithdrawalRequest(txId, 'Cancelled by player');
      setCancellationMessage('Your withdrawal request has been cancelled. The reserved amount has been returned to your available wallet balance.');
      setTimeout(() => setCancellationMessage(null), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to cancel withdrawal.');
    } finally {
      setCancellingTxId(null);
    }
  };

  // Filtered Transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (historyCategory === 'all') return true;
    return tx.type === historyCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl my-6 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={closeWalletModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <WalletIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-esports text-lg font-bold text-white tracking-wider">
              FT HOST <span className="text-cyan-400">WALLET</span>
            </h2>
            <p className="text-xs text-slate-400">Manage entry credits & prize cashouts</p>
          </div>
        </div>

        {/* 1. WALLET BALANCE SUMMARY CARD */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/80">
            {/* Available Balance */}
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Available Balance
                </span>
              </div>
              <div className="font-esports text-2xl font-black text-white flex items-baseline gap-0.5">
                <span className="text-lg text-cyan-400">₹</span>
                {availableBalance}
              </div>
              <span className="text-[10px] text-slate-500">Playable balance</span>
            </div>

            {/* Withdrawal Hold Balance */}
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Withdrawal Hold
                </span>
              </div>
              <div className="font-esports text-2xl font-black text-amber-300 flex items-baseline gap-0.5">
                <span className="text-lg text-amber-400">₹</span>
                {holdBalance}
              </div>
              <span className="text-[10px] text-slate-500">Reserved in escrow</span>
            </div>
          </div>

          {/* Lifetime Statistics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between items-center pr-2">
              <span className="text-[11px] text-slate-400">Total Deposited</span>
              <span className="font-semibold text-slate-200">₹{totalDeposited}</span>
            </div>
            <div className="flex justify-between items-center pl-2 border-l border-slate-800">
              <span className="text-[11px] text-slate-400">Total Withdrawn</span>
              <span className="font-semibold text-slate-200">₹{totalWithdrawn}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-4">
          <button
            onClick={() => {
              setActiveTab('deposit');
              setDepositSubmitted(false);
              setIsConfirmingWithdrawal(false);
            }}
            className={`py-2 rounded-lg text-xs font-esports font-bold tracking-wider flex items-center justify-center gap-1.5 transition ${
              activeTab === 'deposit'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            DEPOSIT
          </button>
          <button
            onClick={() => {
              setActiveTab('withdraw');
              setWithdrawSubmitted(false);
              setIsConfirmingWithdrawal(false);
            }}
            className={`py-2 rounded-lg text-xs font-esports font-bold tracking-wider flex items-center justify-center gap-1.5 transition ${
              activeTab === 'withdraw'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            WITHDRAW
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setIsConfirmingWithdrawal(false);
            }}
            className={`py-2 rounded-lg text-xs font-esports font-bold tracking-wider flex items-center justify-center gap-1.5 transition ${
              activeTab === 'history'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            HISTORY
          </button>
        </div>

        {/* 2. DEPOSIT TAB */}
        {activeTab === 'deposit' && (
          <div className="overflow-y-auto pr-1 space-y-4 flex-1 scrollbar-thin">
            {depositSubmitted ? (
              <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-cyan-400 mx-auto" />
                <h4 className="font-esports text-base font-bold text-white tracking-wide">
                  DEPOSIT REQUEST SUBMITTED
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Thank you! Your payment details have been received successfully. Your deposit is currently under verification. Your wallet will be updated once your payment is confirmed.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setDepositSubmitted(false)}
                    className="py-2.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-esports font-bold tracking-wider transition"
                  >
                    MAKE ANOTHER DEPOSIT
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                {depositError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
                    {depositError}
                  </div>
                )}

                {/* Select Deposit Amount */}
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold mb-1.5 block">
                    Select Deposit Amount (₹)
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[100, 200, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-esports font-bold border transition ${
                          depositAmount === amt
                            ? 'bg-cyan-600 text-white border-cyan-500'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        +₹{amt}
                      </button>
                    ))}
                  </div>
                  {/* Custom Amount */}
                  <input
                    type="number"
                    min="50"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    placeholder="Enter custom deposit amount"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Minimum deposit: ₹50</span>
                </div>

                {/* FT HOST Official UPI Info */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/20 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">FT HOST Official UPI ID:</span>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="flex items-center gap-1 text-cyan-400 font-bold hover:underline"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedUpi ? 'Copied' : 'Copy UPI ID'}
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-cyan-300 text-xs text-center select-all">
                    {FT_HOST_UPI_ID}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Payment Instructions: Open Google Pay, PhonePe, Paytm, or BHIM. Pay to the FT HOST Official UPI ID above. After payment, enter your 12-digit UTR and upload your payment screenshot below.
                  </p>
                </div>

                {/* UTR / Transaction ID Input */}
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold mb-1 block">
                    UTR / Transaction ID *
                  </label>
                  <input
                    type="text"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    placeholder="Enter 12-digit UPI Ref / UTR number (e.g. 481920491823)"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                {/* Payment Screenshot Upload Button (Placed directly below UTR and above Submit button) */}
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold mb-1 block">
                    Payment Screenshot
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleScreenshotChange}
                    className="hidden"
                    id="payment-screenshot-input"
                  />

                  {!screenshotPreview ? (
                    <label
                      htmlFor="payment-screenshot-input"
                      className="cursor-pointer flex items-center justify-center gap-2 w-full p-3.5 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 hover:bg-slate-900/60 hover:border-cyan-500/50 text-slate-300 text-xs transition"
                    >
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>Upload Payment Screenshot (JPG, PNG)</span>
                    </label>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-200">
                          <ImageIcon className="w-4 h-4 text-cyan-400" />
                          <span className="truncate max-w-[200px]">{screenshotFile?.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveScreenshot}
                          className="text-[11px] text-red-400 hover:underline"
                        >
                          Replace / Remove
                        </button>
                      </div>
                      <div className="w-full h-28 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                        <img
                          src={screenshotPreview}
                          alt="Screenshot preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Deposit Request Button */}
                <button
                  type="submit"
                  disabled={depositLoading}
                  className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-esports font-bold text-xs tracking-wider transition disabled:opacity-50"
                >
                  {depositLoading ? 'SUBMITTING REQUEST...' : `SUBMIT DEPOSIT REQUEST (₹${depositAmount})`}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 3. WITHDRAW TAB */}
        {activeTab === 'withdraw' && (
          <div className="overflow-y-auto pr-1 space-y-4 flex-1 scrollbar-thin">
            {withdrawSubmitted ? (
              <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-center space-y-3">
                <Clock className="w-12 h-12 text-cyan-400 mx-auto" />
                <h4 className="font-esports text-base font-bold text-white tracking-wide">
                  WITHDRAWAL REQUEST RECEIVED
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Your withdrawal request has been submitted successfully. The requested amount has been reserved in your wallet. You can track its status in Transaction History.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setWithdrawSubmitted(false)}
                    className="py-2.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-esports font-bold tracking-wider transition"
                  >
                    RETURN TO WALLET
                  </button>
                </div>
              </div>
            ) : isConfirmingWithdrawal ? (
              /* WITHDRAWAL CONFIRMATION SCREEN */
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                  <h4 className="font-esports text-sm font-bold tracking-wider">
                    CONFIRM WITHDRAWAL DETAILS
                  </h4>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Withdrawal Amount:</span>
                    <span className="font-esports font-bold text-white text-sm">
                      ₹{withdrawAmount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Payout Method:</span>
                    <span className="font-semibold text-cyan-300">
                      {withdrawMethod === 'UPI' ? 'UPI ID' : 'Bank Account Transfer'}
                    </span>
                  </div>

                  <div className="flex justify-between items-start py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Destination:</span>
                    <span className="font-mono text-slate-200 text-right max-w-[200px] break-all">
                      {getMaskedPayoutDetails()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Processing Time:</span>
                    <span className="text-slate-300">
                      {withdrawMethod === 'UPI' ? '1–24 hours' : '1–3 business days'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Processing Fee:</span>
                    <span className="text-emerald-400 font-medium">₹0 (Free Payout)</span>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-sm font-bold">
                    <span className="text-white font-esports">FINAL PAYOUT:</span>
                    <span className="text-cyan-400 font-esports text-base">₹{withdrawAmount}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300/90 leading-tight">
                  Note: Upon confirmation, ₹{withdrawAmount} will be moved to your Withdrawal Hold Balance until verified and released.
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingWithdrawal(false)}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-esports font-bold text-xs tracking-wider transition"
                  >
                    GO BACK
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalConfirmWithdrawal}
                    disabled={withdrawLoading}
                    className="py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-esports font-bold text-xs tracking-wider transition disabled:opacity-50"
                  >
                    {withdrawLoading ? 'RESERVING...' : 'CONFIRM WITHDRAWAL'}
                  </button>
                </div>
              </div>
            ) : (
              /* WITHDRAWAL FORM */
              <form onSubmit={handleRequestWithdrawalClick} className="space-y-4">
                {withdrawError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
                    {withdrawError}
                  </div>
                )}

                {/* Available Balance Reminder */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Available Balance:</span>
                  <span className="font-esports font-bold text-cyan-400 text-sm">
                    ₹{availableBalance}
                  </span>
                </div>

                {/* Payout Method Selection */}
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold mb-1.5 block">
                    Select Payout Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('UPI')}
                      className={`py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                        withdrawMethod === 'UPI'
                          ? 'bg-cyan-600 text-white border-cyan-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      UPI ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('Bank')}
                      className={`py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                        withdrawMethod === 'Bank'
                          ? 'bg-cyan-600 text-white border-cyan-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      Bank Account
                    </button>
                  </div>
                </div>

                {/* UPI WITHDRAWAL FORM */}
                {withdrawMethod === 'UPI' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold mb-1 block">
                        UPI ID *
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. yourname@okhdfcbank"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold mb-1 block">
                        Withdrawal Amount (₹) *
                      </label>
                      <input
                        type="number"
                        min="100"
                        max={availableBalance}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                        required
                      />
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                        <span>Min: ₹100</span>
                        <span>Estimated processing: 1–24 hours</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* BANK ACCOUNT WITHDRAWAL FORM (Vertical separate fields) */
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold mb-1 block">
                        1. Account Holder Name *
                      </label>
                      <input
                        type="text"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        placeholder="As shown on passbook or cheque"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold mb-1 block">
                        2. Bank Account Number *
                      </label>
                      <input
                        type="text"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        placeholder="Enter bank account number"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold mb-1 block">
                        3. Confirm Bank Account Number *
                      </label>
                      <input
                        type="text"
                        value={confirmBankAccountNumber}
                        onChange={(e) => setConfirmBankAccountNumber(e.target.value)}
                        placeholder="Re-enter bank account number"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold mb-1 block">
                        4. IFSC Code *
                      </label>
                      <input
                        type="text"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        placeholder="e.g. HDFC0001234"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold mb-1 block">
                        5. Withdrawal Amount (₹) *
                      </label>
                      <input
                        type="number"
                        min="100"
                        max={availableBalance}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                        required
                      />
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                        <span>Min: ₹100</span>
                        <span>Estimated processing: 1–3 business days</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={availableBalance < 100}
                  className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-esports font-bold text-xs tracking-wider transition disabled:opacity-50"
                >
                  REQUEST WITHDRAWAL
                </button>
              </form>
            )}
          </div>
        )}

        {/* 4. HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="overflow-y-auto pr-1 space-y-3 flex-1 scrollbar-thin flex flex-col">
            {cancellationMessage && (
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs">
                {cancellationMessage}
              </div>
            )}

            {/* Category Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {[
                { id: 'all', label: 'All' },
                { id: 'deposit', label: 'Deposits' },
                { id: 'withdrawal', label: 'Withdrawals' },
                { id: 'entry_fee', label: 'Entry Fees' },
                { id: 'refund', label: 'Refunds' },
                { id: 'gift_code_reward', label: 'Gift Codes' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setHistoryCategory(cat.id as any)}
                  className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                    historyCategory === cat.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Transactions List */}
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                <History className="w-8 h-8 mx-auto opacity-30 text-cyan-400" />
                <p className="text-sm font-semibold text-slate-300">No transactions recorded.</p>
                <p className="text-slate-500">Your deposits, withdrawals, and entry fees will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((tx) => {
                  const isPositive =
                    tx.type === 'deposit' ||
                    tx.type === 'prize_payout' ||
                    tx.type === 'refund' ||
                    tx.type === 'gift_code_reward';

                  const canCancelWithdrawal =
                    tx.type === 'withdrawal' && tx.status === 'pending';

                  return (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              tx.type === 'deposit'
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : tx.type === 'withdrawal'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-esports font-bold text-xs text-white">
                                {tx.type === 'deposit' && 'DEPOSIT'}
                                {tx.type === 'withdrawal' && 'WITHDRAWAL'}
                                {tx.type === 'entry_fee' && 'TOURNAMENT ENTRY'}
                                {tx.type === 'prize_payout' && 'PRIZE MONEY'}
                                {tx.type === 'refund' && 'REFUND'}
                                {tx.type === 'gift_code_reward' && 'GIFT CODE REWARD'}
                              </span>

                              {/* Status Badge */}
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                  tx.status === 'completed' || tx.status === 'approved'
                                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                                    : tx.status === 'pending' || tx.status === 'processing'
                                    ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                                    : 'bg-red-950/60 text-red-400 border border-red-500/30'
                                }`}
                              >
                                {tx.status}
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{tx.note}</p>
                            {tx.referenceId && (
                              <p className="text-[10px] text-slate-500 font-mono">
                                ID: {tx.referenceId}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0">
                          <span
                            className={`font-esports font-bold text-sm ${
                              isPositive ? 'text-emerald-400' : 'text-slate-200'
                            }`}
                          >
                            {isPositive ? '+' : '-'}₹{tx.amount}
                          </span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Cancel Button for Pending Withdrawals */}
                      {canCancelWithdrawal && (
                        <div className="pt-2 border-t border-slate-900 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleCancelPendingWithdrawal(tx.id)}
                            disabled={cancellingTxId === tx.id}
                            className="px-3 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-800/40 text-[10px] font-semibold flex items-center gap-1 transition"
                          >
                            <Ban className="w-3 h-3" />
                            {cancellingTxId === tx.id ? 'Cancelling...' : 'Cancel & Return Funds'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
