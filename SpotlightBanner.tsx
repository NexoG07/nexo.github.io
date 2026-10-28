import { Play, Sparkles, Flame, Info } from 'lucide-react';
import { Game } from '../types';

interface SpotlightBannerProps {
  game: Game;
  onPlay: (game: Game) => void;
  onDetails?: (game: Game) => void;
}

export default function SpotlightBanner({
  game,
  onPlay,
  onDetails,
}: SpotlightBannerProps) {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-violet-500/30 bg-[#111320] shadow-[0_0_40px_rgba(139,92,246,0.15)] group">
      {/* Background Graphic with blur and gradient overlay */}
      <div className="absolute inset-0">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c16] via-[#0b0c16]/80 to-transparent md:bg-gradient-to-r md:from-[#0b0c16] md:via-[#0b0c16]/80 md:to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8 md:p-12 max-w-2xl flex flex-col justify-end min-h-[320px] md:min-h-[380px]">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FEATURED SPOTLIGHT</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-black">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>TOP GAME</span>
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200 backdrop-blur-md">
            {game.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-3 drop-shadow-md">
          {game.title}
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm md:text-base text-slate-300 line-clamp-3 mb-6 leading-relaxed">
          {game.description}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onPlay(game)}
            className="flex items-center gap-2.5 px-6 sm:px-8 py-3 rounded-full text-sm font-extrabold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-purple-500 shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
            <span>Jetzt Spielen</span>
          </button>

          {onDetails && (
            <button
              type="button"
              onClick={() => onDetails(game)}
              className="flex items-center gap-1.5 px-4 py-3 rounded-full text-sm font-bold text-slate-200 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4" />
              <span>Details</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
