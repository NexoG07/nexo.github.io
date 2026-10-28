import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Flame,
  LayoutGrid,
  ArrowUpDown,
  Car,
  Footprints,
} from 'lucide-react';
import { Game, SortOption, PopupConfig } from './types';
import { GAMES } from './data/games';
import { useRatings } from './utils/ratings';
import { fetchPopupConfig, updatePopupConfig, DEFAULT_POPUP_CONFIG } from './utils/popupService';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GameCard from './components/GameCard';
import SpotlightBanner from './components/SpotlightBanner';
import GameOverlay from './components/GameOverlay';
import SecretCloudModal from './components/SecretCloudModal';
import SecretNexoModal from './components/SecretNexoModal';
import AnnouncementPopup from './components/AnnouncementPopup';
import CrazyGlitchLogo from './components/CrazyGlitchLogo';
import NikoAssistantModal from './components/NikoAssistantModal';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('trending');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Secret Modals State
  const [isSecretCloudOpen, setIsSecretCloudOpen] = useState(false);
  const [isSecretAdminOpen, setIsSecretAdminOpen] = useState(false);
  const [, setKeySequence] = useState<string>('');

  // Announcement Popup State
  const [popupConfig, setPopupConfig] = useState<PopupConfig>(DEFAULT_POPUP_CONFIG);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Niko AI Assistant State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // User Local Collections
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('nexo_favorites');
      return stored ? JSON.parse(stored) : ['ultra-chess', 'space-waves', 'minecraft'];
    } catch {
      return ['ultra-chess', 'space-waves', 'minecraft'];
    }
  });

  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('nexo_recent');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const { getRating } = useRatings();

  // Load Announcement Config
  useEffect(() => {
    fetchPopupConfig().then((config) => {
      setPopupConfig(config);
      if (config.enabled) {
        if (config.displayMode === 'always') {
          setIsPopupOpen(true);
        } else if (config.displayMode === 'once_per_session') {
          const shown = sessionStorage.getItem('nexo_popup_shown');
          if (!shown) {
            setIsPopupOpen(true);
            sessionStorage.setItem('nexo_popup_shown', 'true');
          }
        } else if (config.displayMode === 'once_total') {
          const shown = localStorage.getItem('nexo_popup_shown');
          if (!shown) {
            setIsPopupOpen(true);
            localStorage.setItem('nexo_popup_shown', 'true');
          }
        }
      }
    });
  }, []);

  // Global Key Listener for Secret Codes '7777' and '0000'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';

      if (['7', '0'].includes(e.key)) {
        setKeySequence((prev) => {
          const next = (prev + e.key).slice(-4);
          if (next === '7777') {
            setIsSecretCloudOpen(true);
            return '';
          }
          if (next === '0000') {
            setIsSecretAdminOpen(true);
            return '';
          }
          return next;
        });
      } else if (!isInput && e.key.length === 1) {
        setKeySequence('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save Favorites
  const toggleFavorite = useCallback((gameId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId];
      try {
        localStorage.setItem('nexo_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Launch Game
  const handlePlayGame = useCallback((game: Game) => {
    setSelectedGame(game);
    setRecentIds((prev) => {
      const next = [game.id, ...prev.filter((id) => id !== game.id)].slice(0, 20);
      try {
        localStorage.setItem('nexo_recent', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Save Popup from admin
  const handleSavePopup = async (config: PopupConfig) => {
    const updated = await updatePopupConfig(config);
    setPopupConfig(updated);
  };

  // Spotlight game (Ultra Chess 3D)
  const spotlightGame = useMemo(() => {
    return GAMES.find((g) => g.id === 'ultra-chess') || GAMES[0];
  }, []);

  // Filtered games
  const filteredGames = useMemo(() => {
    const list = GAMES.filter((game) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        game.title.toLowerCase().includes(q) ||
        game.description.toLowerCase().includes(q) ||
        (game.developer && game.developer.toLowerCase().includes(q)) ||
        game.tags.some((t) => t.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedCategory === 'Alle') return true;
      if (selectedCategory === '🔥 Beliebt & Hot') return game.isTrending;
      if (selectedCategory === '✨ Neu auf Nexo') {
        return [
          'ultra-chess',
          'space-waves',
          'level-devil',
          'drift-hunters',
          'drive-mad',
          'retro-bowl',
          'tunnel-rush',
          'ovo',
          'hole-io',
          'basketball-bros',
          'football-bros',
          'rocketgoal-io',
          'super-liquid-soccer',
          'airborne-bmx',
        ].includes(game.id);
      }
      if (selectedCategory === '♟️ Strategie & Schach') {
        return game.tags.some((t) => ['Schach', 'Chess', 'Strategie', 'Brettspiel'].includes(t));
      }
      if (selectedCategory === '❤️ Favoriten') return favorites.includes(game.id);
      if (selectedCategory === '🕒 Zuletzt gespielt') return recentIds.includes(game.id);
      if (selectedCategory === '🏎️ Rennspiele') {
        return game.tags.some((t) => ['Kart', 'Fahren', 'Flucht', 'Drift', 'Rennen', 'Survival'].includes(t));
      }
      if (selectedCategory === '⚡ Action & 3D') {
        return game.tags.some((t) => ['Action', 'FPS', '3D', 'Open World', 'RPG', 'Shooter'].includes(t));
      }
      if (selectedCategory === '👥 2 Spieler & Multiplayer') {
        return game.tags.some((t) => ['Multiplayer', '.io', '2 Spieler', 'Koop'].includes(t));
      }
      if (selectedCategory === '🌐 Multiplayer .io') {
        return game.tags.includes('.io') || game.tags.includes('Multiplayer');
      }
      if (selectedCategory === '🏃 Runner & Geschick') {
        return game.tags.some((t) => ['Runner', 'Parkour', 'Arcade', 'Physik', 'Plattformer', 'Skill'].includes(t));
      }
      if (selectedCategory === '🧱 Sandbox & Voxel') {
        return game.tags.some((t) => ['Sandbox', 'Voxel', 'Minecraft', '3D-Welt'].includes(t));
      }
      if (selectedCategory === '🏆 Sport & Arcade') {
        return game.tags.some((t) => ['Sport', 'Golf', 'Arcade', 'Physik', 'Football', 'Basketball', 'Fußball'].includes(t));
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortOption === 'az') return a.title.localeCompare(b.title);
      if (sortOption === 'rating') {
        const ratingA = getRating(a.id).percentage || 0;
        const ratingB = getRating(b.id).percentage || 0;
        return ratingB - ratingA;
      }
      if (sortOption === 'newest') {
        const isNewA = ['ultra-chess', 'space-waves', 'level-devil', 'drift-hunters', 'drive-mad'].includes(a.id);
        const isNewB = ['ultra-chess', 'space-waves', 'level-devil', 'drift-hunters', 'drive-mad'].includes(b.id);
        return isNewA === isNewB ? 0 : isNewA ? -1 : 1;
      }
      return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
    });
  }, [searchQuery, selectedCategory, favorites, recentIds, sortOption, getRating]);

  // Trending shelf
  const trendingGames = useMemo(() => {
    return GAMES.filter((g) => g.isTrending);
  }, []);

  // Racing shelf
  const racingGames = useMemo(() => {
    return GAMES.filter((g) => g.tags.some((t) => ['Kart', 'Fahren', 'Drift', 'Rennen', 'Auto'].includes(t)));
  }, []);

  // Runner shelf
  const runnerGames = useMemo(() => {
    return GAMES.filter((g) => g.tags.some((t) => ['Runner', 'Parkour', 'Skill', 'Geschick', 'Plattformer'].includes(t)));
  }, []);

  // Random game
  const handleRandomGame = () => {
    const randomIndex = Math.floor(Math.random() * GAMES.length);
    handlePlayGame(GAMES[randomIndex]);
  };

  return (
    <div className="min-h-screen bg-[#080911] text-slate-100 flex flex-col">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRandomGame={handleRandomGame}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        onSecretCloud={() => setIsSecretCloudOpen(true)}
        onSecretAdmin={() => setIsSecretAdminOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex flex-1 w-full max-w-7xl mx-auto">
        {/* Sidebar */}
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSearchQuery('');
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          favoritesCount={favorites.length}
          recentCount={recentIds.length}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-10 min-w-0">
          {/* Spotlight Hero Banner (only on 'Alle' & empty search) */}
          {selectedCategory === 'Alle' && !searchQuery && spotlightGame && (
            <SpotlightBanner
              game={spotlightGame}
              onPlay={handlePlayGame}
              onDetails={handlePlayGame}
            />
          )}

          {/* Shelves (only when viewing 'Alle' and not searching) */}
          {selectedCategory === 'Alle' && !searchQuery && (
            <>
              {/* Shelf 1: Beliebt auf Nexo */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      Beliebt auf Nexo
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('🔥 Beliebt & Hot')}
                    className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                  >
                    Alle ansehen →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                  {trendingGames.slice(0, 8).map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onPlay={handlePlayGame}
                      isFavorite={favorites.includes(game.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </section>

              {/* Shelf 2: Rennspiele & Drift */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-violet-400" />
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      Rennspiele &amp; Highspeed-Action
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('🏎️ Rennspiele')}
                    className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                  >
                    Alle ansehen →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {racingGames.slice(0, 4).map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onPlay={handlePlayGame}
                      isFavorite={favorites.includes(game.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </section>

              {/* Shelf 3: Runner & Geschick */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Footprints className="w-5 h-5 text-violet-400" />
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      Runner &amp; Geschicklichkeit
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('🏃 Runner & Geschick')}
                    className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                  >
                    Alle ansehen →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {runnerGames.slice(0, 4).map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onPlay={handlePlayGame}
                      isFavorite={favorites.includes(game.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Main All Games Grid */}
          <section className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c1f33] pb-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {searchQuery
                    ? `Suchergebnisse für „${searchQuery}“ (${filteredGames.length})`
                    : selectedCategory === 'Alle'
                    ? 'Alle Spiele auf Nexo'
                    : `${selectedCategory} (${filteredGames.length})`}
                </h2>
              </div>

              {/* Sorting & Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-violet-400" />
                  <span className="hidden sm:inline">Sortieren:</span>
                </span>
                <div className="flex items-center bg-[#111320] p-1 rounded-xl border border-[#202336] text-xs">
                  {[
                    { id: 'trending', label: 'Hot' },
                    { id: 'newest', label: 'Neu' },
                    { id: 'rating', label: 'Rating' },
                    { id: 'az', label: 'A-Z' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSortOption(s.id as SortOption)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        sortOption === s.id
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Games Grid */}
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                {filteredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onPlay={handlePlayGame}
                    isFavorite={favorites.includes(game.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center space-y-3 bg-[#111320] border border-[#202336] rounded-2xl p-8">
                <p className="text-base font-bold text-white">Keine Spiele gefunden</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Versuche andere Suchbegriffe oder wähle eine andere Kategorie in der Seitenleiste.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Alle');
                  }}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-colors cursor-pointer"
                >
                  Filter zurücksetzen
                </button>
              </div>
            )}
          </section>

          {/* Footer */}
          <footer className="pt-10 pb-6 border-t border-[#1c1f33] text-slate-400">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="space-y-3">
                <CrazyGlitchLogo size={36} showText={true} />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Nexo ist das moderne Portal für kostenlose Online-Spiele. Spiele hunderte spannende Browsergames direkt ohne Download auf jedem Gerät!
                </p>
              </div>

              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-3">
                  Beliebte Kategorien
                </h4>
                <ul className="space-y-1.5 text-xs">
                  <li>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('🏎️ Rennspiele')}
                      className="hover:text-violet-400 transition-colors cursor-pointer"
                    >
                      Rennspiele &amp; Driften
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('♟️ Strategie & Schach')}
                      className="hover:text-violet-400 transition-colors cursor-pointer"
                    >
                      3D Schach &amp; Taktik
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('🏃 Runner & Geschick')}
                      className="hover:text-violet-400 transition-colors cursor-pointer"
                    >
                      Runner &amp; Parkour
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('🧱 Sandbox & Voxel')}
                      className="hover:text-violet-400 transition-colors cursor-pointer"
                    >
                      Sandbox &amp; Voxel
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-3">
                  Über Nexo
                </h4>
                <p className="text-xs leading-relaxed text-slate-400 mb-2">
                  Schnell. Sicher. Kostenlos. Kein Download und keine Installation erforderlich.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-950/50 border border-violet-800/40 text-xs text-violet-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Alle Games Online &amp; spielbereit</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#161826] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
              <p>© {new Date().getFullYear()} Nexo Games. Alle Rechte vorbehalten.</p>
              <p className="text-slate-400">Entwickelt für echtes High-Speed-Gaming im Browser.</p>
            </div>
          </footer>
        </main>
      </div>

      {/* Fullscreen Game Overlay Stage */}
      {selectedGame && (
        <GameOverlay
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onSelectGame={(g) => setSelectedGame(g)}
          relatedGames={GAMES.filter((g) => g.id !== selectedGame.id && g.category === selectedGame.category)}
          isFavorite={favorites.includes(selectedGame.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* Secret Cloud Modal (Code 7777) */}
      <SecretCloudModal
        isOpen={isSecretCloudOpen}
        onClose={() => setIsSecretCloudOpen(false)}
      />

      {/* Secret Admin Modal (Code 0000) */}
      <SecretNexoModal
        isOpen={isSecretAdminOpen}
        onClose={() => setIsSecretAdminOpen(false)}
        currentConfig={popupConfig}
        onSave={handleSavePopup}
      />

      {/* Announcement Popup */}
      <AnnouncementPopup
        popup={popupConfig}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />

      {/* Floating Niko AI Assistant Quick-Trigger (Home page) */}
      {!selectedGame && (
        <button
          type="button"
          onClick={() => setIsAssistantOpen(true)}
          title="Niko - KI Gaming-Assistent (Eaglercraft 1.8 Seeds & Nexo Infos)"
          className="fixed bottom-5 right-5 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-violet-950/70 border border-violet-400/40 transition-all hover:scale-105 cursor-pointer group"
        >
          <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform animate-pulse" />
          <span>Niko KI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      )}

      {/* Niko AI Assistant Modal */}
      <NikoAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
}
