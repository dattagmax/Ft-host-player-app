import React from 'react';
import { X, Megaphone, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AnnouncementModal: React.FC = () => {
  const {
    isAnnouncementModalOpen,
    setIsAnnouncementModalOpen,
    activeAnnouncement
  } = useApp();

  if (!isAnnouncementModalOpen || !activeAnnouncement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md rounded-2xl glass-panel-elevated p-6 border border-cyan-500/40 shadow-2xl">
        <button
          onClick={() => setIsAnnouncementModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            {activeAnnouncement.tag}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {activeAnnouncement.createdAt}
          </span>
        </div>

        <h3 className="font-esports text-xl font-bold text-white mb-3 text-glow">
          {activeAnnouncement.title}
        </h3>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line mb-4 font-mono">
          {activeAnnouncement.content}
        </div>

        <button
          onClick={() => setIsAnnouncementModalOpen(false)}
          className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-esports font-bold text-sm tracking-wider"
        >
          UNDERSTOOD
        </button>
      </div>
    </div>
  );
};
