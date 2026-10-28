import nexoLogoImg from '../assets/images/nexo_logo.webp';

interface CrazyGlitchLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function CrazyGlitchLogo({
  className = '',
  size = 40,
  showText = true,
}: CrazyGlitchLogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Glowing Neon Emblem */}
      <div className="relative shrink-0">
        <div
          className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-60 blur-md group-hover:opacity-100 transition-opacity duration-300"
          style={{ width: size + 8, height: size + 8 }}
        />
        <img
          src={nexoLogoImg}
          alt="Nexo Gaming Logo"
          className="relative rounded-full object-cover border border-violet-400/50 shadow-[0_0_15px_rgba(139,92,246,0.5)] group-hover:scale-105 transition-transform duration-300"
          style={{ width: size, height: size }}
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-violet-300 via-purple-200 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]">
              NEXO
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_#a855f7] animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-violet-400/80 tracking-widest uppercase mt-0.5">
            GAMING PORTAL
          </span>
        </div>
      )}
    </div>
  );
}
