import { useState } from 'react';
import { X, Send, Eye, ShieldAlert } from 'lucide-react';
import { PopupConfig } from '../types';
import AnnouncementPopup from './AnnouncementPopup';

interface SecretNexoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: PopupConfig;
  onSave: (config: PopupConfig) => void;
}

const PRESET_BADGES = [
  '📢 Ankündigung',
  '🛡️ 0000 Nachricht',
  '⚡ Nexo Update',
  '🎉 Community Event',
  '⚠️ Wichtige Info',
  '🎮 Neues Spiel Verfügbar',
];

export default function SecretNexoModal({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}: SecretNexoModalProps) {
  const [enabled, setEnabled] = useState(currentConfig.enabled);
  const [title, setTitle] = useState(currentConfig.title || 'Willkommen auf Nexo!');
  const [message, setMessage] = useState(
    currentConfig.message || 'Viel Spaß beim Zocken der besten kostenlosen Browsergames!'
  );
  const [badge, setBadge] = useState(currentConfig.badge || '📢 Ankündigung');
  const [buttonText, setButtonText] = useState(currentConfig.buttonText || "Los geht's!");
  const [displayMode, setDisplayMode] = useState<PopupConfig['displayMode']>(
    currentConfig.displayMode || 'always'
  );
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      enabled,
      title,
      message,
      badge,
      buttonText,
      displayMode,
      updatedAt: Date.now(),
    });
    onClose();
  };

  const previewConfig: PopupConfig = {
    enabled: true,
    title,
    message,
    badge,
    buttonText,
    displayMode,
    updatedAt: Date.now(),
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-xl bg-[#0e101a] border border-violet-500/40 rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.3)] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#202336] flex items-center justify-between bg-violet-950/20">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-violet-400" />
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Geheimmenü: Ankündigungs-Steuerung</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300">
                    CODE: 0000
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Passe das globale Popup für alle Besucher an</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Activation Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#141624] border border-[#25283d]">
              <div>
                <div className="text-sm font-bold text-white">Ankündigungs-Popup aktivieren</div>
                <div className="text-xs text-slate-400">
                  Zeigt dieses Popup beim Laden der Website für Besucher an
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Titel der Nachricht
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z. B. Willkommen auf Nexo!"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141624] border border-[#25283d] text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Nachrichtstext
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Schreibe deine Nachricht..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141624] border border-[#25283d] text-white text-sm focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>

            {/* Badge selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Badge / Tag
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PRESET_BADGES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBadge(b)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                      badge === b
                        ? 'bg-violet-600 text-white border-violet-500'
                        : 'bg-[#141624] text-slate-300 border-[#25283d] hover:border-slate-500'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#141624] border border-[#25283d] text-white text-xs focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Button text */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Button Text
              </label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Los geht's!"
                className="w-full px-3.5 py-2 rounded-xl bg-[#141624] border border-[#25283d] text-white text-xs focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Display Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Anzeigehäufigkeit
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'always', label: 'Immer bei Aufruf' },
                  { id: 'once_per_session', label: '1x pro Sitzung' },
                  { id: 'once_total', label: '1x insgesamt' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDisplayMode(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-colors cursor-pointer ${
                      displayMode === item.id
                        ? 'bg-violet-600/30 border-violet-500 text-white'
                        : 'bg-[#141624] border-[#25283d] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-[#202336] bg-[#0c0d16] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-[#25283d] transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vorschau</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Speichern & Aktivieren</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <AnnouncementPopup
          popup={previewConfig}
          isOpen={true}
          onClose={() => setShowPreview(false)}
          isPreview={true}
        />
      )}
    </>
  );
}
