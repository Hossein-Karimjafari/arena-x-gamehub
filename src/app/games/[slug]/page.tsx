import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PLATFORM_FA, toman } from "@/lib/constants";
import { SITE_URL } from "@/lib/env";
import CoverArt from "@/components/CoverArt";
import { IconPlay } from "@/components/icons";
import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await db.game.findUnique({ where: { slug } });
  return { title: game?.title ?? "بازی", description: game?.description.slice(0, 150) };
}

export default async function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await db.game.findUnique({
    where: { slug },
    include: { reviews: { where: { approved: true }, include: { user: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!game) notFound();

  const shots = ["🎯", "🔥", "💥", "🏆", "🌃", "⚔️"];
  const screenshots = shots.map((s) => ({ emoji: s, src: `/images/games/${game.slug}.webp` }));

  const gameJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    alternateName: game.titleEn,
    genre: game.genre,
    gamePlatform: game.platform,
    description: game.description,
    url: `${SITE_URL}/games/${game.slug}`,
    ...(game.rating > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: game.rating, bestRating: 5, ratingCount: Math.max(1, game.reviews.length) },
    }),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }} />
      <nav className="mb-8 text-xs text-slate-500">
        <Link href="/" className="hover:text-neon-purple">خانه</Link> / <Link href="/games" className="hover:text-neon-purple">بازی‌ها</Link> / <span className="text-slate-300">{game.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <CoverArt emoji={game.emoji} src={`/images/games/${game.slug}.webp`} gradient={game.gradient} className="h-80 !rounded-3xl shadow-neon" big alt={game.title} />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {screenshots.slice(0, 3).map((s, i) => (
              <CoverArt key={i} emoji={s.emoji} src={s.src} gradient={game.gradient} className={`h-24 !rounded-xl ${i === 0 ? "" : "opacity-80"}`} imgStyle={i === 0 ? { objectPosition: "center 20%" } : i === 1 ? { objectPosition: "center 55%" } : { objectPosition: "center bottom" }} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="chip !border-neon-purple/40 !text-neon-purple">{game.genre}</span>
            <span className="chip !border-neon-cyan/40 !text-neon-cyan">{PLATFORM_FA[game.platform]}</span>
            {game.multiplayer && <span className="chip !border-neon-green/40 !text-neon-green">چندنفره • {game.players}</span>}
          </div>
          <h1 className="mb-1 font-display text-3xl font-black text-white md:text-4xl">{game.title}</h1>
          <p className="mb-4 font-display text-sm tracking-widest text-slate-500">{game.titleEn}</p>
          <StarRating value={Math.round(game.rating)} />
          <p className="mt-4 leading-8 text-slate-300">{game.description}</p>

          <div className="glass mt-6 p-5">
            <h3 className="mb-3 font-bold text-white">🖥️ سیستم مورد نیاز / تجهیزات آرنا</h3>
            <p className="text-sm leading-7 text-slate-400">{game.sysreq}</p>
          </div>

          <div className="glass mt-4 flex items-center justify-between p-5">
            <div>
              <p className="text-xs text-slate-400">هزینه هر ساعت</p>
              <p className="text-xl font-black text-neon-green">{toman(game.pricePerHour)}</p>
            </div>
            <Link href={`/booking?game=${game.slug}`} className="btn-neon">🎮 رزرو این بازی</Link>
          </div>
        </div>
      </div>

      {/* trailer placeholder */}
      <div className="mt-10">
        <h2 className="section-title mb-6 text-xl">🎬 تریلر</h2>
        <CoverArt emoji="▶️" src={`/images/games/${game.slug}.webp`} gradient={game.gradient} className="h-64 !rounded-3xl" imgStyle={{ filter: "brightness(.45) blur(1px)" }}>
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-transform hover:scale-110">
              <IconPlay className="h-7 w-7 translate-x-[-1px]" />
            </span>
          </div>
        </CoverArt>
      </div>

      {/* reviews */}
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="section-title mb-6 text-xl">💬 دیدگاه گیمرها ({game.reviews.length})</h2>
          <div className="space-y-4">
            {game.reviews.map((r) => (
              <div key={r.id} className="glass p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold text-white">{r.user.name ?? r.user.username}</span>
                  <StarRating value={r.rating} />
                </div>
                <p className="text-sm leading-7 text-slate-300">{r.comment}</p>
              </div>
            ))}
            {game.reviews.length === 0 && <p className="glass p-6 text-sm text-slate-400">هنوز دیدگاهی ثبت نشده؛ اولین نفر باش!</p>}
          </div>
        </div>
        <ReviewForm gameId={game.id} target="GAME" />
      </div>
    </div>
  );
}
