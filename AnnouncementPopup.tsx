import { X, Sparkles } from 'lucide-react';
import { PopupConfig } from '../types';

interface AnnouncementPopupProps {
  popup: PopupConfig;
  isOpen: boolean;
  onClose: () => void;
  isPreview?: boolean;
}

export default function AnnouncementPopup({
  popup,
  isOpen,
  onClose,
  isPreview = false,
}: AnnouncementPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0f111c] border border-violet-500/40 rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.35)] overflow-hidden">
        {/* Glow corner */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-violet-300 bg-violet-950/60 border border-violet-700/50">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>{popup.badge || '📢 Ankündigung'}</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight">
            {popup.title || 'Willkommen auf Nexo!'}
          </h3>

          <p className="text-sm text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap">
            {popup.message || 'Viel Spaß beim Zocken der besten kostenlosen Browsergames!'}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all cursor-pointer"
          >
            {popup.buttonText || "Los geht's!"}
          </button>

          {isPreview && (
            <p className="text-[11px] text-center text-violet-400/80 mt-3 font-mono">
              (Live-Vorschau des Ankündigungs-Popups)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
