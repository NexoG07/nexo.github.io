import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Keyboard,
  Maximize2,
  Minimize2,
  RotateCw,
  X,
  ThumbsUp,
  ThumbsDown,
  Heart,
  ChevronRight,
  Play,
  Sparkles,
} from 'lucide-react';
import { Game } from '../types';
import { useRatings } from '../utils/ratings';
import CrazyGlitchLogo from './CrazyGlitchLogo';
import NikoAssistantModal from './NikoAssistantModal';

interface GameOverlayProps {
  game: Game | null;
  onClose: () => void;
  onSelectGame?: (game: Game) => void;
  relatedGames?: Game[];
  isFavorite?: boolean;
  onToggleFavorite?: (gameId: string) => void;
}

export default function GameOverlay({
  game,
  onClose,
  onSelectGame,
  relatedGames = [],
  isFavorite = false,
  onToggleFavorite,
}: GameOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showKeyboardHint, setShowKeyboardHint] = useState(true);
  const [showRelatedBar, setShowRelatedBar] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const { getRating, vote } = useRatings();
  const ratingData = game ? getRating(game.id) : null;

  // Resolve optimal iframe embed URL (handling coolgamesonline.io .embed)
  const activeUrl = useMemo(() => {
    if (!game?.url) return '';
    const raw = game.url.trim();

    // If coolgamesonline, guarantee direct .embed format for seamless iframe rendering
    const cgoMatch = raw.match(/coolgamesonline\.io\/(?:games\/)?([a-zA-Z0-9_-]+)/);
    if (cgoMatch && cgoMatch[1]) {
      const slug = cgoMatch[1].replace(/\.embed$/, '');
      return `https://coolgamesonline.io/${slug}.embed`;
    }

    // If gaming-nexo07 workers.dev (Golf Hit), ensure direct clean game iframe without surrounding site UI
    if (raw.includes('gaming-nexo07.workers.dev')) {
      if (!raw.endsWith('.html')) {
        return raw.replace(/\/?$/, '/golf-hit.html');
      }
    }

    // If 1games.io (e.g. Granny Horror), ensure direct /embed/ URL for clean iframe
    const oneGameMatch = raw.match(/1games\.io\/(?:(?:game|games|embed)\/)?([a-zA-Z0-9_-]+)/);
    if (oneGameMatch && oneGameMatch[1]) {
      const slug = oneGameMatch[1];
      return `https://1games.io/embed/${slug}`;
    }

    return raw;
  }, [game?.url]);

  const focusGame = () => {
    if (iframeRef.current) {
      iframeRef.current.focus();
      try {
        iframeRef.current.contentWindow?.focus();
      } catch {}
    }
  };

  // Close with Escape key & WASD focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      } else if (
        ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)
      ) {
        focusGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll & auto focus
  useEffect(() => {
    if (game) {
      document.body.style.overflow = 'hidden';
      setIsLoading(true);
      setShowKeyboardHint(true);

      const t1 = setTimeout(focusGame, 300);
      const t2 = setTimeout(focusGame, 900);
      const tHint = setTimeout(() => setShowKeyboardHint(false), 7000);
      const tLoad = setTimeout(() => setIsLoading(false), 1500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(tHint);
        clearTimeout(tLoad);
        document.body.style.overflow = '';
      };
    }
  }, [game, iframeKey]);

  // Track Fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(focusGame, 200);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!game) return null;

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div
      ref={containerRef}
      id="nexo-game-stage"
      className="fixed inset-0 z-50 flex flex-col bg-[#07080f] text-white w-screen h-screen overflow-hidden select-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header Controls Bar */}
      <header className="h-14 px-3 sm:px-5 bg-[#0e101c] border-b border-[#1f2236] flex items-center justify-between shrink-0 shadow-lg z-20">
        {/* Game Title & Brand */}
        <div className="flex items-center gap-3">
          <CrazyGlitchLogo size={32} showText={false} />

          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate max-w-[140px] sm:max-w-xs md:max-w-md">
              {game.title}
            </h2>
            <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-violet-300 bg-violet-950/80 border border-violet-700/50">
              {game.category}
            </span>
          </div>

          {/* Upvote / Downvote Counter */}
          {ratingData && (
            <div className="hidden sm:flex items-center gap-1 bg-[#161824] px-2.5 py-1 rounded-full border border-[#25283d] text-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  vote(game.id, 'up');
                }}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                  ratingData.userVote === 'up'
                    ? 'text-emerald-400 font-bold bg-emerald-950/60'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Gefällt mir"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{ratingData.upvotes}</span>
              </button>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  vote(game.id, 'down');
                }}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                  ratingData.userVote === 'down'
                    ? 'text-rose-400 font-bold bg-rose-950/60'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Gefällt mir nicht"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>{ratingData.downvotes}</span>
              </button>

              {ratingData.total > 0 && (
                <span className="text-xs font-bold text-slate-200 ml-1">
                  {ratingData.percentage}%
                </span>
              )}
            </div>
          )}

          {/* Favorite Toggle Button */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(game.id);
              }}
              title={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer hidden sm:flex items-center justify-center ${
                isFavorite
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                  : 'bg-white/5 border-[#25283d] text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Related Games toggle */}
          {relatedGames.length > 0 && onSelectGame && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowRelatedBar((prev) => !prev);
              }}
              title="Weitere Spiele anzeigen"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer border ${
                showRelatedBar
                  ? 'bg-violet-600 text-white border-violet-500'
                  : 'bg-[#161824] text-slate-200 border-[#25283d] hover:bg-[#1f2233]'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mehr Spiele</span>
            </button>
          )}

          {/* Niko KI Gaming-Assistent Button (placed where Neuer Tab used to be) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsAssistantOpen(true);
            }}
            title="Niko - Dein KI Gaming-Assistent (Eaglercraft 1.8 Seeds & Nexo)"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-violet-100 bg-gradient-to-r from-violet-600/90 to-purple-600/90 hover:from-violet-500 hover:to-purple-500 border border-violet-400/50 rounded-full shadow-[0_0_12px_rgba(139,92,246,0.35)] hover:shadow-[0_0_18px_rgba(139,92,246,0.55)] transition-all cursor-pointer hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="font-extrabold tracking-wide">Niko KI</span>
          </button>

          {/* Keyboard focus hint button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              focusGame();
            }}
            title="Tastatur für Spiel aktivieren (WASD / Leertaste / Pfeile)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-violet-300 bg-violet-950/60 border border-violet-700/50 rounded-full hover:bg-violet-900/60 transition-colors cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">WASD Fokus</span>
          </button>

          {/* Reload button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReload();
            }}
            title="Spiel neu laden"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#161824] border border-[#25283d] hover:border-slate-500 rounded-full hover:bg-[#1f2233] transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Neu laden</span>
          </button>

          {/* Fullscreen button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            title="Vollbild umschalten"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#161824] border border-[#25283d] hover:border-slate-500 rounded-full hover:bg-[#1f2233] transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Normal</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Vollbild</span>
              </>
            )}
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Schließen (ESC)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-rose-600 border border-slate-700 hover:border-rose-500 rounded-full transition-colors ml-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Schließen</span>
          </button>
        </div>
      </header>

      {/* Main Stage with Iframe */}
      <div className="relative flex-1 w-full h-[calc(100vh-56px)] bg-[#07080f] overflow-hidden flex items-center justify-center">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0e17] z-10 px-4 text-center">
            <div className="relative mb-5">
              <div className="w-14 h-14 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg">🎮</span>
              </div>
            </div>
            <p className="text-base font-bold text-white tracking-wide mb-1">
              {game.title} wird geladen...
            </p>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Spiel startet direkt im Iframe...
            </p>

            <button
              type="button"
              onClick={() => setIsLoading(false)}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 cursor-pointer transition-colors border border-white/10"
            >
              Ladebildschirm überspringen
            </button>
          </div>
        )}

        {/* Keyboard hint helper badge */}
        {showKeyboardHint && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto bg-[#10121d]/90 backdrop-blur-md border border-[#25283d] px-4 py-2 rounded-full shadow-lg flex items-center gap-2.5 text-xs text-slate-200">
            <span className="text-violet-400 font-bold flex items-center gap-1">
              <Keyboard className="w-4 h-4" /> 1x ins Spiel klicken:
            </span>
            <span>Tastatur (WASD / Pfeile / Leertaste) aktiv</span>
            <button
              type="button"
              onClick={() => setShowKeyboardHint(false)}
              className="text-slate-400 hover:text-white ml-1 text-sm font-bold cursor-pointer"
              title="Ausblenden"
            >
              ✕
            </button>
          </div>
        )}

        {/* Related Games Quick Bar */}
        {showRelatedBar && relatedGames.length > 0 && onSelectGame && (
          <div className="absolute bottom-0 left-0 right-0 z-30 bg-[#10121d]/95 backdrop-blur-md border-t border-[#202336] p-3 shadow-2xl animate-fadeIn">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
                <span>Ähnliche Spiele auf Nexo</span>
                <ChevronRight className="w-3.5 h-3.5 text-violet-400" />
              </span>

              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {relatedGames.map((rg) => (
                  <button
                    key={rg.id}
                    type="button"
                    onClick={() => {
                      onSelectGame(rg);
                      setShowRelatedBar(false);
                    }}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-[#161824] hover:bg-violet-950/80 border border-[#25283d] hover:border-violet-500/60 text-left transition-all cursor-pointer shrink-0 group"
                  >
                    <img
                      src={rg.thumbnail}
                      alt={rg.title}
                      className="w-10 h-7 rounded-lg object-cover"
                    />
                    <div className="leading-tight">
                      <div className="text-xs font-bold text-white group-hover:text-violet-300 truncate max-w-[120px]">
                        {rg.title}
                      </div>
                      <div className="text-[10px] text-slate-400">{rg.category}</div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowRelatedBar(false)}
                className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer shrink-0"
                title="Schließen"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Vollbild-Iframe mit Touch- und Tastaturunterstützung */}
        <iframe
          key={iframeKey}
          ref={iframeRef}
          id={`game-frame-${game.id}`}
          src={activeUrl}
          title={game.title}
          tabIndex={0}
          scrolling="auto"
          style={{
            width: '100%',
            height: '100%',
            border: 0,
            display: 'block',
            WebkitOverflowScrolling: 'touch',
          }}
          className="bg-black w-full h-full"
          allow="accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; gamepad; geolocation; gyroscope; microphone; camera; picture-in-picture; screen-wake-lock; web-share"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => {
            setIsLoading(false);
            setTimeout(focusGame, 100);
            setTimeout(focusGame, 400);
          }}
        />
      </div>

      {/* Niko AI Assistant Modal */}
      <NikoAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
}
