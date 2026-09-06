import Link from "next/link";
import CoverArt from "./CoverArt";
import { dateFa, toman, STATUS_FA } from "@/lib/constants";
import type { Tournament } from "@prisma/client";

export default function TournamentCard({ t }: { t: Tournament }) {
  const color =
    t.status === "OPEN" ? "!text-neon-green !border-neon-green/40" : t.status === "FULL" ? "!text-neon-red !border-neon-red/40" : "!text-neon-cyan !border-neon-cyan/40";
  return (
    <Link href={`/tournaments/${t.slug}`} className="glass card-hover group block overflow-hidden">
      <CoverArt emoji={t.emoji} gradient="violet" className="h-40 transition-transform duration-500 group-hover:scale-105" />
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="font-bold text-white group-hover:text-neon-purple transition-colors">{t.title}</h3>
          <span className={`chip ${color}`}>{STATUS_FA[t.status] ?? t.status}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
          <p>🎮 {t.game}</p>
          <p>📅 {dateFa(t.date)}</p>
          <p>🏆 جایزه: <span className="text-neon-green">{t.prize}</span></p>
          <p>💳 ثبت‌نام: {t.entryFee ? toman(t.entryFee) : "رایگان"}</p>
        </div>
        <div className="mt-3 border-t border-white/5 pt-3 text-left">
          <span className="text-xs font-bold text-neon-purple group-hover:text-neon-pink">مشاهده و ثبت‌نام ←</span>
        </div>
      </div>
    </Link>
  );
}
