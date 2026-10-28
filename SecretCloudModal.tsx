import { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, RotateCw, Globe, ShieldCheck, Zap } from 'lucide-react';
import CrazyGlitchLogo from './CrazyGlitchLogo';

interface SecretCloudModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DIRECT_URL = 'https://www.easyfun.gg/cloud-games/';
const PROXY_URL = '/api/cloud-proxy?url=https://www.easyfun.gg/cloud-games/';
const WRAPPER_URL = '/easyfun.html';

export default function SecretCloudModal({
  isOpen,
  onClose,
}: SecretCloudModalProps) {
  const [mode, setMode] = useState<'direct' | 'proxy' | 'wrapper'>('direct');
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentUrl = mode === 'direct' ? DIRECT_URL : mode === 'proxy' ? PROXY_URL : WRAPPER_URL;

  // Close with Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
      console.warn('Fullscreen error:', err);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      id="nexo-secret-cloud-modal"
      className="fixed inset-0 z-50 flex flex-col bg-[#07080f] text-white w-screen h-screen overflow-hidden select-none animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header Bar */}
      <header className="h-14 px-3 sm:px-5 bg-[#0f111c] border-b border-[#202336] flex items-center justify-between shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-3">
          <CrazyGlitchLogo size={32} showText={false} />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_#a855f7] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-violet-400" />
              <span>EasyFun Cloud Games</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mode Switcher Buttons */}
          <div className="hidden sm:flex items-center p-0.5 rounded-full bg-[#161826] border border-[#25283d]">
            <button
              type="button"
              onClick={() => {
                setMode('direct');
                setIsLoading(true);
                setIframeKey((k) => k + 1);
              }}
              title="Direkte Cloud Verbindung"
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer ${
                mode === 'direct'
                  ? 'bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Direkt</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('proxy');
                setIsLoading(true);
                setIframeKey((k) => k + 1);
              }}
              title="Nexo Server Proxy (umgeht Iframe-Blockaden sicher)"
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer ${
                mode === 'proxy'
                  ? 'bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Proxy</span>
            </button>
          </div>

          {/* Reload button */}
          <button
            type="button"
            onClick={handleReload}
            title="Neu laden"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#161826] hover:bg-[#1f2233] border border-[#25283d] rounded-full transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">Neu laden</span>
          </button>

          {/* Fullscreen button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Vollbild"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#161826] hover:bg-[#1f2233] border border-[#25283d] rounded-full transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-violet-400" />
                <span className="hidden sm:inline">Normal</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-violet-400" />
                <span className="hidden sm:inline">Vollbild</span>
              </>
            )}
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            title="Schließen (ESC)"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-rose-600 border border-slate-700 hover:border-rose-500 rounded-full transition-colors cursor-pointer ml-1"
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07080f] z-10 px-4 text-center">
            <div className="relative mb-5">
              <div className="w-14 h-14 rounded-full border-4 border-violet-500/20 border-t-violet-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe className="w-6 h-6 text-violet-400 animate-pulse" />
              </div>
            </div>
            <p className="text-sm font-bold text-white tracking-wide mb-1">
              EasyFun Cloud Games werden geladen...
            </p>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              {mode === 'proxy'
                ? 'Nexo-Proxy lädt Cloud Games direkt ohne externe Drittanbieter-Ausfälle...'
                : 'Direkte Verbindung mit den Cloud-Servern wird hergestellt...'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'direct' ? 'proxy' : 'direct');
                  setIsLoading(true);
                  setIframeKey((k) => k + 1);
                }}
                className="px-3.5 py-1.5 rounded-full bg-violet-600/30 hover:bg-violet-600/50 text-xs font-semibold text-violet-200 transition-colors border border-violet-500/40 cursor-pointer"
              >
                Zu {mode === 'direct' ? 'Proxy' : 'Direkt'} wechseln
              </button>
              <button
                type="button"
                onClick={() => setIsLoading(false)}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors border border-white/10 cursor-pointer"
              >
                Ladebildschirm schließen
              </button>
            </div>
          </div>
        )}

        {/* Cloud Games Iframe */}
        <iframe
          key={`${currentUrl}-${iframeKey}`}
          ref={iframeRef}
          src={currentUrl}
          title="EasyFun Cloud Games"
          tabIndex={0}
          scrolling="auto"
          style={{
            width: '100%',
            height: '100%',
            border: 0,
            display: 'block',
          }}
          className="bg-black w-full h-full"
          allow="accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; gamepad; geolocation; gyroscope; microphone; camera; picture-in-picture; screen-wake-lock; web-share"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
