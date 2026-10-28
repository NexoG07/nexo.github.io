import { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  Compass,
  Gamepad2,
  Trash2,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface NikoAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const DEFAULT_WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Hey! Ich bin **Niko**, dein Gaming-Assistent auf Nexo! 🎮\n\n' +
    'Ich bin dein KI-Experte für **Eaglercraft 1.8 Seeds** (mit genauen Koordinaten, Schmieden, Diamanten, Wüstentempeln & seltenen Biomen) sowie für alle **28+ Nexo Games** und Pro-Gamer-Taktiken!\n\n' +
    'Klicke unten auf einen Vorschlag oder frag mich direkt!',
  timestamp: Date.now(),
};

const QUICK_SUGGESTIONS = [
  { label: '🔥 Beste Eaglercraft 1.8 Seeds', query: 'Was sind die besten Seeds für Eaglercraft 1.8?' },
  { label: '💎 Schmiede & Diamanten Seeds', query: 'Welcher Eaglercraft 1.8 Seed hat eine Schmiede mit Diamanten?' },
  { label: '🏜️ Wüstentempel & Notch-Apfel', query: 'Gib mir einen Eaglercraft 1.8 Seed mit Wüstentempel und Notch-Äpfeln' },
  { label: '⚔️ 1.8 PvP & Kampf-Tricks', query: 'Wie funktioniert Block-Hitting und PvP in Eaglercraft 1.8?' },
  { label: '🧊 Seltene Biome (Ice Spikes & Mesa)', query: 'Welche seltenen Biom-Seeds gibt es für Eaglercraft 1.8?' },
  { label: '🎮 Nexo Games Pro-Tipps', query: 'Welche Spiele gibt es auf Nexo und was sind deine besten Pro-Tipps?' },
];

export default function NikoAssistantModal({
  isOpen,
  onClose,
  initialQuery,
}: NikoAssistantModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = sessionStorage.getItem('niko_chat_history');
      return stored ? JSON.parse(stored) : [DEFAULT_WELCOME];
    } catch {
      return [DEFAULT_WELCOME];
    }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, messages]);

  // Handle initial query if passed
  useEffect(() => {
    if (isOpen && initialQuery) {
      handleSend(initialQuery);
    }
  }, [isOpen, initialQuery]);

  // Persist history in session
  useEffect(() => {
    try {
      sessionStorage.setItem('niko_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historyPayload }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Konnte leider keine Antwort generieren.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Niko Chat Error:', err);
      const errorMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content:
          'Verbindungsproblem mit dem KI-Dienst. Bitte versuche es gleich erneut oder wähle einen der Vorschläge!',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSeed(text);
    setTimeout(() => setCopiedSeed(null), 2500);
  };

  const handleClearChat = () => {
    setMessages([DEFAULT_WELCOME]);
    sessionStorage.removeItem('niko_chat_history');
  };

  if (!isOpen) return null;

  // Render message text with simple markdown bold, inline code, and copy buttons
  const renderMessageContent = (content: string) => {
    // Detect numbers that look like seeds
    const seedPattern = /`(-?\d{3,20})`/g;
    const parts = content.split('\n');

    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {parts.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Check for seeds in this line
          const seedMatches = [...line.matchAll(seedPattern)];

          return (
            <div key={idx} className="flex flex-col gap-1">
              <div>
                {line.split(/(\*\*.*?\*\*|`.*?`)/).map((segment, sIdx) => {
                  if (segment.startsWith('**') && segment.endsWith('**')) {
                    return (
                      <strong key={sIdx} className="font-bold text-white">
                        {segment.slice(2, -2)}
                      </strong>
                    );
                  }
                  if (segment.startsWith('`') && segment.endsWith('`')) {
                    const codeVal = segment.slice(1, -1);
                    return (
                      <span
                        key={sIdx}
                        className="font-mono bg-violet-950/80 text-violet-300 px-1.5 py-0.5 rounded border border-violet-700/50 text-[11px] sm:text-xs font-semibold inline-block mx-0.5"
                      >
                        {codeVal}
                      </span>
                    );
                  }
                  return <span key={sIdx}>{segment}</span>;
                })}
              </div>

              {/* Quick copy button if a seed was found */}
              {seedMatches.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 pb-1">
                  {seedMatches.map((match, mIdx) => {
                    const seedStr = match[1];
                    const isCopied = copiedSeed === seedStr;
                    return (
                      <button
                        key={mIdx}
                        type="button"
                        onClick={() => handleCopy(seedStr)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer border ${
                          isCopied
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : 'bg-violet-900/40 hover:bg-violet-800/60 border-violet-600/50 text-violet-200'
                        }`}
                        title={`Seed ${seedStr} in Zwischenablage kopieren`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Kopiert!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Seed kopieren ({seedStr})</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl h-[92vh] sm:h-[85vh] max-h-[750px] bg-[#0c0e1a] border border-[#232742] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Modal Header */}
        <header className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-[#131627] to-[#181a30] border-b border-[#232742] flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-900/50">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0c0e1a]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  <span>Niko</span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-violet-600/30 text-violet-300 border border-violet-500/40">
                    KI Assistent
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Eaglercraft 1.8 Seeds &amp; Nexo Gaming-Experte
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleClearChat}
              title="Chat-Verlauf leeren"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Schließen (ESC)"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Quick Suggestion Chips */}
        <div className="px-3 sm:px-4 py-2.5 bg-[#0e101f] border-b border-[#1c2035] overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1 shrink-0 pl-1">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span>Tipps:</span>
          </span>
          {QUICK_SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(item.query)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#17192b] hover:bg-violet-900/60 border border-[#272b47] hover:border-violet-500/60 text-slate-300 hover:text-white transition-all whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center shadow-md ${
                    isUser
                      ? 'bg-violet-600 text-white'
                      : 'bg-gradient-to-tr from-violet-700 to-purple-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 sm:p-4 shadow-md ${
                    isUser
                      ? 'bg-violet-600 text-white rounded-tr-none'
                      : 'bg-[#141728] border border-[#252945] text-slate-200 rounded-tl-none'
                  }`}
                >
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-violet-700 text-white shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#141728] border border-[#252945] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 text-xs text-slate-400">
                <span>Niko denkt nach</span>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Feature Badges Footer */}
        <div className="px-4 py-1.5 bg-[#090b14] border-t border-[#1c2035] flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-emerald-400" />
              <span>Eaglercraft 1.8 Seeds</span>
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Pro Gaming Tipps &amp; Tricks</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Gamepad2 className="w-3 h-3 text-violet-400" />
              <span>28+ Nexo Games</span>
            </span>
          </div>
          <span>Powered by Gemini</span>
        </div>

        {/* Input Bar */}
        <footer className="p-3 sm:p-4 bg-[#0e101f] border-t border-[#232742] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Frag Niko nach Eaglercraft 1.8 Seeds, Diamanten, Nexo Games..."
                disabled={isLoading}
                className="w-full bg-[#151829] border border-[#272b47] focus:border-violet-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md shadow-violet-900/40 shrink-0"
            >
              <span>Senden</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
