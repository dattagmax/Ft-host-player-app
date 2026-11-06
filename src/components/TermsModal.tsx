import React from 'react';
import { ShieldAlert, X, Mail } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="font-esports text-base font-bold text-white tracking-wide">
                TERMS & FAIR PLAY RULES
              </h3>
            </div>
            <p className="text-[11px] text-cyan-400 font-mono mt-1">
              Last Updated: 06/11/2026
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div className="flex-1 overflow-y-auto my-3 pr-2 space-y-4 text-xs text-slate-300 leading-relaxed scrollbar-thin">
          {/* 1. Acceptance of Terms */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              1. Acceptance of Terms
            </h4>
            <p className="text-slate-300">
              By creating an account or using FT HOST, you agree to follow these Terms and Conditions.
            </p>
          </div>

          {/* 2. Player Account */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              2. Player Account
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>Players must provide accurate information.</li>
              <li>Each player is responsible for their account.</li>
              <li>Sharing accounts is prohibited.</li>
              <li>Fake identities and impersonation are prohibited.</li>
              <li>Players must keep their login credentials secure.</li>
            </ul>
          </div>

          {/* 3. Free Fire UID */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              3. Free Fire UID
            </h4>
            <p className="text-slate-300">
              Players must provide their correct Free Fire UID and in-game name.
            </p>
            <p className="text-slate-300">
              Incorrect or misleading information may result in registration rejection or disqualification.
            </p>
          </div>

          {/* 4. Tournament Registration */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              4. Tournament Registration
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>Players can join tournaments only when registration status is OPEN.</li>
              <li>COMING SOON tournaments cannot be joined.</li>
              <li>FULL and CLOSED tournaments do not accept new registrations.</li>
              <li>Duplicate registrations are prohibited.</li>
              <li>Players must follow the tournament&apos;s game mode and team requirements.</li>
            </ul>
          </div>

          {/* 5. Entry Fees and Prizes */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              5. Entry Fees and Prizes
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>Entry fees must be displayed before registration.</li>
              <li>Prize distribution must be clearly communicated.</li>
              <li>Eligible prizes will be distributed according to the published tournament rules.</li>
              <li>Any cancellation or refund will follow the applicable tournament policy and law.</li>
              <li>Players must not attempt fraudulent transactions.</li>
            </ul>
          </div>

          {/* 6. Fair Play Rules */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              6. Fair Play Rules
            </h4>
            <p className="text-slate-300 font-medium">Strictly prohibited:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>Hacking or cheating.</li>
              <li>Using unauthorized third-party tools.</li>
              <li>Exploiting game bugs.</li>
              <li>Teaming with opponents.</li>
              <li>Using fake accounts.</li>
              <li>Impersonating other players.</li>
              <li>Deliberately disrupting tournaments.</li>
              <li>Abusing or threatening other players.</li>
              <li>Manipulating match results.</li>
            </ul>
            <p className="text-amber-400 font-medium pt-0.5">
              Violations may result in disqualification or account suspension.
            </p>
          </div>

          {/* 7. Match Rules */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              7. Match Rules
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>Players must join at the scheduled time.</li>
              <li>Players must use the correct Free Fire UID.</li>
              <li>Room ID and password must not be shared with unauthorized people.</li>
              <li>Players must follow the match instructions.</li>
              <li>Late entry may result in disqualification according to tournament rules.</li>
            </ul>
          </div>

          {/* 8. Results and Leaderboard */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              8. Results and Leaderboard
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>Tournament results must be verified before publication.</li>
              <li>Leaderboard points are awarded according to the published scoring rules.</li>
              <li>Suspected cheating or result manipulation may lead to investigation.</li>
              <li>Verified results may be corrected if an error is discovered.</li>
            </ul>
          </div>

          {/* 9. Gift Codes */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              9. Gift Codes
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>Gift Codes must be valid and active.</li>
              <li>Each player may redeem a code only according to its redemption limits.</li>
              <li>Expired or invalid codes cannot be redeemed.</li>
              <li>Duplicate redemption is prohibited.</li>
              <li>Fraudulent attempts to obtain rewards may result in account restrictions.</li>
            </ul>
          </div>

          {/* 10. Wallet and Withdrawals */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              10. Wallet and Withdrawals
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>Players must follow the displayed wallet and transaction rules.</li>
              <li>Withdrawal requests are subject to verification and eligibility.</li>
              <li>Fraudulent transactions are prohibited.</li>
              <li>Transaction disputes should be reported to official support.</li>
              <li>No payment or withdrawal should be considered successful until confirmed by the system.</li>
            </ul>
          </div>

          {/* 11. Disqualification and Suspension */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              11. Disqualification and Suspension
            </h4>
            <p className="text-slate-300">
              FT HOST may investigate suspicious activity and take appropriate action, including:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>Tournament disqualification.</li>
              <li>Registration cancellation.</li>
              <li>Temporary account suspension.</li>
              <li>Permanent account suspension where justified.</li>
            </ul>
            <p className="text-slate-300 pt-0.5">
              Players should have an opportunity to contact support regarding disputed decisions.
            </p>
          </div>

          {/* 12. Tournament Cancellation */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              12. Tournament Cancellation
            </h4>
            <p className="text-slate-300">
              Tournament schedules may change because of technical issues, emergencies or other operational reasons.
            </p>
            <p className="text-slate-300">
              Players will be informed of relevant changes and applicable refund arrangements.
            </p>
          </div>

          {/* 13. Independent Platform Disclaimer */}
          <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              13. Independent Platform Disclaimer
            </h4>
            <p className="text-slate-300">
              FT HOST is an independent community tournament hosting platform.
            </p>
            <p className="text-slate-400">
              FT HOST is not affiliated with, endorsed by or officially connected to Garena or Free Fire.
            </p>
            <p className="text-slate-400 text-[11px]">
              Free Fire is a trademark of its respective owner.
            </p>
          </div>

          {/* 14. Changes to Terms */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              14. Changes to Terms
            </h4>
            <p className="text-slate-300">
              FT HOST may update these Terms and Conditions when necessary.
            </p>
            <p className="text-slate-300">
              Updated terms will be published in the application.
            </p>
          </div>

          {/* 15. Contact and Support */}
          <div className="space-y-2 bg-cyan-950/20 p-3 rounded-xl border border-cyan-500/20">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              15. Contact and Support
            </h4>
            <p className="text-slate-300 text-[11px]">
              For tournament disputes, account issues or complaints:
            </p>
            <div className="space-y-1 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-400">App Name: </span>
                <span className="font-bold text-white">FT HOST</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Support Email: </span>
                <a
                  href="mailto:fthost.esports@gmail.com"
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Mail className="w-3 h-3" />
                  fthost.esports@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-esports font-bold text-xs tracking-wider transition"
          >
            I ACCEPT ALL TERMS
          </button>
        </div>
      </div>
    </div>
  );
};
