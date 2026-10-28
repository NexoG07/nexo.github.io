import { Play, Flame, Heart, Sparkles } from 'lucide-react';
import { Game } from '../types';
import { useRatings } from '../utils/ratings';

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (gameId: string) => void;
}

export default function GameCard({
  game,
  onPlay,
  isFavorite = false,
  onToggleFavorite,
}: GameCardProps) {
  const { getRating } = useRatings();
  const rating = getRating(game.id);

  return (
    <div
      onClick={() => onPlay(game)}
      className="group relative flex flex-col bg-[#111320] border border-[#202336] hover:border-violet-500/70 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(139,92,246,0.3)] select-none"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#0c0d15]">
        <img
          src={game.thumbnail}
          alt={game.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.8)] transform scale-75 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start pointer-events-none">
          {game.badge && (
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-violet-600/90 text-white shadow-md backdrop-blur-sm border border-violet-400/40">
              {game.badge}
            </span>
          )}
          {game.isTrending && !game.badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/90 text-black shadow-md flex items-center gap-1 backdrop-blur-sm">
              <Flame className="w-3 h-3 fill-current" />
              HOT
            </span>
          )}
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(game.id);
            }}
            title={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              isFavorite
                ? 'bg-rose-500/90 text-white shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                : 'bg-black/50 text-slate-300 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Rating Badge */}
        {rating.total > 0 && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>{rating.percentage}%</span>
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
              {game.title}
            </h3>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1c1f30]">
          <span className="text-violet-400/90 font-medium truncate max-w-[120px]">
            {game.category}
          </span>
          <span className="text-[10px] text-slate-400">
            {game.developer || 'Nexo'}
          </span>
        </div>
      </div>
    </div>
  );
}
