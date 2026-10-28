import {
  Flame,
  Sparkles,
  Gamepad2,
  Trophy,
  Users,
  Compass,
  Footprints,
  Boxes,
  Heart,
  Clock,
  Car,
  Swords,
  Crown,
} from 'lucide-react';

interface SidebarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  isOpen: boolean;
  onClose: () => void;
  favoritesCount: number;
  recentCount: number;
}

const CATEGORIES = [
  { id: 'Alle', label: 'Alle Spiele', icon: Gamepad2 },
  { id: '🔥 Beliebt & Hot', label: 'Beliebt & Hot', icon: Flame, badge: 'HOT' },
  { id: '✨ Neu auf Nexo', label: 'Neu auf Nexo', icon: Sparkles, badge: 'NEW' },
  { id: '♟️ Strategie & Schach', label: 'Strategie & Schach', icon: Crown },
  { id: '🏎️ Rennspiele', label: 'Rennspiele', icon: Car },
  { id: '⚡ Action & 3D', label: 'Action & 3D', icon: Swords },
  { id: '👥 2 Spieler & Multiplayer', label: '2 Spieler & Multi', icon: Users },
  { id: '🌐 Multiplayer .io', label: 'Multiplayer .io', icon: Compass },
  { id: '🏃 Runner & Geschick', label: 'Runner & Geschick', icon: Footprints },
  { id: '🧱 Sandbox & Voxel', label: 'Sandbox & Voxel', icon: Boxes },
  { id: '🏆 Sport & Arcade', label: 'Sport & Arcade', icon: Trophy },
];

export default function Sidebar({
  selectedCategory,
  onSelectCategory,
  isOpen,
  onClose,
  favoritesCount,
  recentCount,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden animate-fadeIn"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-64px)] w-64 bg-[#0a0b16] border-r border-[#1c1f33] p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Main Categories */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Kategorien
            </div>
            <nav className="space-y-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{cat.label}</span>
                    </div>
                    {cat.badge && (
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                          isActive ? 'bg-black/30 text-white' : 'bg-violet-950 text-violet-300'
                        }`}
                      >
                        {cat.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Collections */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Meine Spiele
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onSelectCategory('❤️ Favoriten');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === '❤️ Favoriten'
                    ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heart className={`w-4 h-4 ${selectedCategory === '❤️ Favoriten' ? 'fill-current text-white' : 'text-rose-400'}`} />
                  <span>Favoriten</span>
                </div>
                {favoritesCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
                    {favoritesCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectCategory('🕒 Zuletzt gespielt');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === '🕒 Zuletzt gespielt'
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-violet-400" />
                  <span>Zuletzt gespielt</span>
                </div>
                {recentCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
                    {recentCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="pt-4 border-t border-[#1c1f33] text-[11px] text-slate-400">
          <p className="font-bold text-slate-400">Nexo Gaming</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Kostenlos &amp; ohne Download</p>
        </div>
      </aside>
    </>
  );
}
