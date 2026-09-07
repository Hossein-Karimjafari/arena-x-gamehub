import Link from "next/link";
import CoverArt from "./CoverArt";
import { PLATFORM_FA, toman, faNum } from "@/lib/constants";
import type { Game } from "@prisma/client";

export default function GameCard({ game }: { game: Game }) {
  return (
    <Link href={`/games/${game.slug}`} className="glass card-hover group block overflow-hidden">
      <CoverArt emoji={game.emoji} src={`/images/games/${game.slug}.jpg`} gradient={game.gradient} className="h-44 transition-transform duration-500 group-hover:scale-105" alt={game.title} />
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-white group-hover:text-neon-purple transition-colors">{game.title}</h3>
            <p className="font-display text-[11px] tracking-wider text-slate-500">{game.titleEn}</p>
          </div>
          <span className="chip !border-neon-green/40 !text-neon-green">★ {faNum(game.rating)}</span>
        </div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="chip">{game.genre}</span>
          <span className="chip">{PLATFORM_FA[game.platform] ?? game.platform}</span>
          {game.multiplayer && <span className="chip !text-neon-cyan">🎮 چندنفره</span>}
        </div>
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <span className="text-xs text-slate-400">{toman(game.pricePerHour)} <span className="text-[10px]">/ ساعت</span></span>
          <span className="text-xs font-bold text-neon-purple group-hover:text-neon-pink">جزئیات ←</span>
        </div>
      </div>
    </Link>
  );
}
