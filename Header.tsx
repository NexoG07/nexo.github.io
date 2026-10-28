import React, { useState } from 'react';
import { Search, Dices, Menu, X, Sparkles } from 'lucide-react';
import CrazyGlitchLogo from './CrazyGlitchLogo';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRandomGame: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onSecretCloud: () => void;
  onSecretAdmin: () => void;
  onOpenAssistant?: () => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  onRandomGame,
  onToggleSidebar,
  isSidebarOpen,
  onSecretCloud,
  onSecretAdmin,
  onOpenAssistant,
}: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '7777') {
      onSearchChange('');
      onSecretCloud();
      return;
    }
    if (val === '0000') {
      onSearchChange('');
      onSecretAdmin();
      return;
    }
    onSearchChange(val);
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#090a14]/90 backdrop-blur-xl border-b border-[#1c1f33] px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Navigation umschalten"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <a href="/" className="cursor-pointer">
          <CrazyGlitchLogo size={36} showText={true} />
        </a>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-2 sm:mx-6">
        <div
          className={`relative flex items-center rounded-full transition-all duration-300 ${
            isSearchFocused
              ? 'bg-[#121422] border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.35)]'
              : 'bg-[#111320] border-[#222538] hover:border-slate-700'
          } border px-3.5 py-1.5`}
        >
          <Search className={`w-4 h-4 mr-2.5 transition-colors ${isSearchFocused ? 'text-violet-400' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Spiele suchen... (z. B. Space Waves, Minecraft, Chess)"
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Niko AI Assistant Button */}
        {onOpenAssistant && (
          <button
            type="button"
            onClick={onOpenAssistant}
            title="Niko - Dein KI Gaming-Assistent (Eaglercraft 1.8 Seeds & Nexo)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-extrabold text-violet-100 bg-[#16182c] hover:bg-violet-950/80 border border-violet-500/40 hover:border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.25)] transition-all cursor-pointer whitespace-nowrap group hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform animate-pulse" />
            <span className="hidden sm:inline">Niko KI</span>
          </button>
        )}

        {/* Random Game Button */}
        <button
          type="button"
          onClick={onRandomGame}
          title="Zufälliges Spiel starten"
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all cursor-pointer whitespace-nowrap"
        >
          <Dices className="w-4 h-4" />
          <span className="hidden sm:inline">Zufälliges Spiel</span>
        </button>
      </div>
    </header>
  );
}
