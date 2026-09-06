import { db } from "@/lib/db";
import GameCard from "@/components/GameCard";
import GamesFilter from "./GamesFilter";

export const dynamic = "force-dynamic";
export const metadata = { title: "بازی‌ها", description: "لیست کامل بازی‌های کامپیوتری و کنسولی گیم‌نت آرنا ایکس" };

export default async function GamesPage({ searchParams }: { searchParams: { q?: string; genre?: string; platform?: string; multi?: string; sort?: string } }) {
  const { q, genre, platform, multi, sort } = await searchParams;

  const games = await db.game.findMany({
    where: {
      active: true,
      ...(q ? { OR: [{ title: { contains: q } }, { titleEn: { contains: q } }] } : {}),
      ...(genre ? { genre } : {}),
      ...(platform ? { platform } : {}),
      ...(multi ? { multiplayer: multi === "1" } : {}),
    },
  });

  const sorted = [...games].sort((a, b) =>
    sort === "price" ? a.pricePerHour - b.pricePerHour : sort === "new" ? b.createdAt.getTime() - a.createdAt.getTime() : b.rating - a.rating
  );

  const genres = [...new Set((await db.game.findMany({ select: { genre: true } })).map((g) => g.genre))];
  const platforms = [...new Set((await db.game.findMany({ select: { platform: true } })).map((g) => g.platform))];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <div className="mb-10 text-center">
        <h1 className="section-title mb-2 neon-text">🎮 کتابخانه بازی‌ها</h1>
        <p className="text-sm text-slate-400">همه عناوین آرنا ایکس؛ فیلتر کن، انتخاب کن، رزرو کن.</p>
      </div>

      <GamesFilter genres={genres} platforms={platforms} />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((g) => <GameCard key={g.id} game={g} />)}
      </div>
      {sorted.length === 0 && (
        <div className="glass mt-8 p-12 text-center text-slate-400">بازی‌ای با این فیلترها پیدا نشد 😕 فیلترها را تغییر بده.</div>
      )}
    </div>
  );
}
