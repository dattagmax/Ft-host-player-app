import React from 'react';
import { FileText, X, Mail } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-esports text-base font-bold text-white tracking-wide">
                PRIVACY POLICY
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

        {/* Scrollable Policy Content */}
        <div className="flex-1 overflow-y-auto my-3 pr-2 space-y-4 text-xs text-slate-300 leading-relaxed scrollbar-thin">
          {/* 1. Introduction */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              1. Introduction
            </h4>
            <p className="text-slate-300">
              Welcome to FT HOST. We respect your privacy and are committed to protecting your personal information.
            </p>
            <p className="text-slate-300">
              This Privacy Policy explains how FT HOST collects, uses, stores and protects your information when you use our application.
            </p>
          </div>

          {/* 2. Information We Collect */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              2. Information We Collect
            </h4>
            <p className="text-slate-300 font-medium">We may collect:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>Full name.</li>
              <li>Email address.</li>
              <li>Free Fire username.</li>
              <li>Free Fire UID.</li>
              <li>Profile information.</li>
              <li>Account authentication information.</li>
              <li>Tournament registration records.</li>
              <li>Wallet and transaction records.</li>
              <li>Gift Code redemption history.</li>
            </ul>
          </div>

          {/* 3. How We Use Your Information */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              3. How We Use Your Information
            </h4>
            <p className="text-slate-300 font-medium">We use your information to:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>Create and manage player accounts.</li>
              <li>Provide tournament registration services.</li>
              <li>Manage player profiles.</li>
              <li>Process wallet transactions.</li>
              <li>Deliver tournament notifications.</li>
              <li>Display verified leaderboard results.</li>
              <li>Prevent fraudulent activities.</li>
              <li>Provide customer support.</li>
            </ul>
          </div>

          {/* 4. Wallet and Transaction Information */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              4. Wallet and Transaction Information
            </h4>
            <p className="text-slate-300">
              Wallet and transaction records are used to manage deposits, withdrawals, entry fees and rewards.
            </p>
            <p className="text-cyan-300 font-medium">
              We do not ask players to share their account passwords or payment PINs.
            </p>
          </div>

          {/* 5. Information Sharing */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              5. Information Sharing
            </h4>
            <p className="text-slate-300">
              We do not sell personal information.
            </p>
            <p className="text-slate-300">
              Information may be shared with service providers when necessary to operate FT HOST, process transactions, provide support or meet legal obligations.
            </p>
          </div>

          {/* 6. Data Security */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              6. Data Security
            </h4>
            <p className="text-slate-300">
              We use appropriate security measures to protect player information. However, no online service can guarantee absolute security.
            </p>
          </div>

          {/* 7. Data Retention */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              7. Data Retention
            </h4>
            <p className="text-slate-300">
              We retain information for as long as necessary to provide our services, maintain transaction records and meet applicable legal requirements.
            </p>
          </div>

          {/* 8. Account Deletion */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              8. Account Deletion
            </h4>
            <p className="text-slate-300">
              Players may request account deletion by emailing our official support desk at{' '}
              <a
                href="mailto:fthost.esports@gmail.com"
                className="text-cyan-400 hover:underline font-mono"
              >
                fthost.esports@gmail.com
              </a>.
            </p>
            <p className="text-slate-400 text-[11px]">
              Some transaction records may need to be retained where required by law.
            </p>
          </div>

          {/* 9. Children's Privacy */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              9. Children&apos;s Privacy
            </h4>
            <p className="text-slate-300">
              FT HOST is not intended for users below the minimum age permitted by applicable laws and tournament eligibility requirements.
            </p>
          </div>

          {/* 10. Third-Party Services */}
          <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              10. Third-Party Services
            </h4>
            <p className="text-slate-300">
              FT HOST may use third-party services such as Firebase for authentication, database storage and application infrastructure.
            </p>
            <p className="text-slate-400 text-[11px]">
              Those services may process information according to their own privacy policies.
            </p>
          </div>

          {/* 11. Policy Updates */}
          <div className="space-y-1">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              11. Policy Updates
            </h4>
            <p className="text-slate-300">
              We may update this Privacy Policy when our services or legal requirements change.
            </p>
          </div>

          {/* 12. Contact Us */}
          <div className="space-y-2 bg-cyan-950/20 p-3 rounded-xl border border-cyan-500/20">
            <h4 className="font-esports text-xs font-bold text-cyan-300">
              12. Contact Us
            </h4>
            <p className="text-slate-300 text-[11px]">
              For privacy-related questions:
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
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
