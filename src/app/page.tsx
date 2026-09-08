import Link from "next/link";
import { db } from "@/lib/db";
import { FEATURES, TESTIMONIALS, GALLERY, toman, dateFa, SITE } from "@/lib/constants";
import GameCard from "@/components/GameCard";
import TournamentCard from "@/components/TournamentCard";
import SectionHeading from "@/components/SectionHeading";
import CoverArt from "@/components/CoverArt";
import StarRating from "@/components/StarRating";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [games, tournaments, reviews, onlineStations, totalStations] = await Promise.all([
    db.game.findMany({ where: { active: true, popular: true }, orderBy: { rating: "desc" }, take: 6 }),
    db.tournament.findMany({ where: { status: { in: ["OPEN", "FULL"] } }, orderBy: { date: "asc" }, take: 3 }),
    db.review.findMany({ where: { target: "SITE", approved: true, gameId: null }, include: { user: true }, orderBy: { createdAt: "desc" }, take: 4 }),
    db.station.count({ where: { online: true } }),
    db.station.count({ where: { active: true } }),
  ]);

  const occupancy = Math.round((5 / 15) * 100);

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-neon-violet/25 blur-[140px]" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-neon-cyan/15 blur-[110px]" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 md:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-right">
              <span className="reveal mb-5 inline-flex items-center gap-2 rounded-full border border-neon-green/40 bg-neon-green/10 px-4 py-1.5 text-xs font-bold text-neon-green">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-neon-green" /></span>
                همین حالا {onlineStations} از {totalStations} دستگاه آنلاین است
              </span>
              <h1 className="reveal mb-4 font-display text-4xl font-black leading-tight text-white md:text-6xl">
                میدان نبرد
                <br />
                <span className="bg-gradient-to-l from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent neon-text">گیمرهای حرفه‌ای</span>
              </h1>
              <p className="reveal mx-auto mb-8 max-w-lg text-base leading-8 text-slate-400 lg:mx-0">
                {SITE.name} با ۱۲ سیستم RTX 4070، کنسول‌های نسل نهم، اینترنت فیبر نوری و مسابقات هفتگی با جوایز نقدی — تجربه‌ای که فقط باید زندگی‌اش کنی.
              </p>
              <div className="reveal flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link href="/booking" className="btn-neon text-base">🎮 رزرو آنلاین</Link>
                <Link href="/games" className="btn-outline text-base">مشاهده بازی‌ها ←</Link>
              </div>
              <div className="reveal mt-10 grid max-w-md grid-cols-3 gap-4 lg:mx-0">
                {[["۱۲+", "سیستم گیمینگ"], ["۱۵۰+", "گیمر فعال ماهانه"], ["۴.۸★", "رضایت کاربران"]].map(([n, l]) => (
                  <div key={l} className="glass p-3 text-center">
                    <p className="font-display text-xl font-black text-neon-purple md:text-2xl">{n}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="animate-floaty">
                <CoverArt emoji="🕹️" src="/images/hero-arcade.webp" gradient="violet" className="glass h-80 w-full !rounded-3xl shadow-neon" big alt="سالن گیم‌نت آرنا ایکس" sizes="(max-width: 1024px) 100vw, 50vw" priority />
              </div>
              <div className="glass animate-floaty absolute -bottom-8 -right-6 w-56 p-4 !rounded-2xl shadow-neon-cyan" style={{ animationDelay: "1.2s" }}>
                <p className="text-xs text-slate-400">🟢 PC-04 — وارزون</p>
                <p className="mt-1 font-bold text-white">۲۴۰ FPS ثابت</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-4/5 rounded-full bg-gradient-to-l from-neon-cyan to-neon-purple" /></div>
              </div>
              <div className="glass animate-floaty absolute -top-6 -left-4 w-48 p-4 !rounded-2xl" style={{ animationDelay: ".6s" }}>
                <p className="text-xs text-slate-400">🏆 ولورنت کلاش</p>
                <p className="mt-1 font-bold text-neon-green">۱۰ میلیون تومان جایزه</p>
              </div>
            </div>
          </div>
        </div>

        {/* marquee */}
        <div className="border-y border-white/5 bg-black/30 py-3">
          <div className="flex overflow-hidden">
            <div className="animate-marquee flex shrink-0 gap-8 whitespace-nowrap font-display text-sm font-bold tracking-widest text-slate-500">
              {Array.from({ length: 2 }).map((_, k) => (
                <span key={k} className="flex shrink-0 gap-8">
                  {["FIFA 24 ⚽", "WARZONE 🎯", "VALORANT 🔫", "DOTA 2 🛡️", "FORTNITE 🪂", "GTA V 🚗", "CS2 💥", "MK1 🥊", "ROCKET LEAGUE 🚀", "RDR2 🤠"].map((t) => (
                    <span key={t} className="flex items-center gap-8">{t}<span className="text-neon-purple">◆</span></span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="reveal glass grid items-center gap-8 overflow-hidden p-8 md:grid-cols-2 md:p-12">
          <div>
            <SectionHeading kicker="WHO WE ARE" title="یک پاتوق، یک میدان، یک خانواده" center={false} />
            <p className="text-sm leading-8 text-slate-400">
              آرنا ایکس در سال ۱۳۹۸ با یک هدف ساده متولد شد: ساختن جایی که گیمرها نه فقط بازی کنند، بلکه <b className="text-white">متعلق به آن باشند</b>. امروز با بیش از ۱۵۰ عضو فعال، ۱۲ سیستم رده‌دنیا و جامعه‌ای پویا، بزرگ‌ترین میزبان مسابقات اکس‌باکس و PC در شرق تهران هستیم.
            </p>
            <p className="mt-4 text-sm leading-8 text-slate-400">
              از شب‌گیم‌های ۲۴ ساعته تا لیگ‌های رسمی با داوری حرفه‌ای؛ هر گوشه‌ی آرنا برای <span className="text-neon-purple font-bold">بردن</span> طراحی شده.
            </p>
            <Link href="/about" className="btn-outline mt-6 !py-2.5 !text-sm">بیشتر درباره ما</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {GALLERY.slice(0, 4).map((g, i) => (
              <CoverArt key={g.title} emoji={g.emoji} src={g.image} gradient={g.gradient} title={g.title} className={`h-36 !rounded-2xl ${i % 2 ? "translate-y-4" : ""}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <SectionHeading kicker="LOADOUT" title="آrsنال امکانات آرنا" desc="هر چیزی که یک گیمر حرفه‌ای لازم دارد، اینجا زیر یک سقف است." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="reveal glass card-hover p-6" style={{ transitionDelay: `${i * 60}ms` }}>
              <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-neon-violet/30 to-neon-purple/10 text-3xl shadow-neon">{f.emoji}</span>
              <h3 className="mb-2 font-bold text-white">{f.title}</h3>
              <p className="text-sm leading-7 text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ POPULAR GAMES ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionHeading kicker="MOST PLAYED" title="بازی‌های محبوب" desc="پرطرفدارترین عناوین روی سیستم‌های آرنا؛ همه با بالاترین گرافیک ممکن." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
        <div className="mt-8 text-center">
          <Link href="/games" className="btn-outline">همه بازی‌ها ({games.length}+) ←</Link>
        </div>
      </section>

      {/* ============ TOURNAMENTS ============ */}
      <section className="relative py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-neon-violet/5 to-transparent" />
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading kicker="TOURNAMENTS" title="مسابقات و ایونت‌ها" desc="جوایز نقدی، داوری حرفه‌ای و پخش زنده؛ جدی‌تر از این نمی‌شه." />
          <div className="grid gap-5 md:grid-cols-3">
            {tournaments.map((t) => <TournamentCard key={t.id} t={t} />)}
          </div>
          <div className="mt-8 text-center">
            <Link href="/tournaments" className="btn-outline">تقویم کامل مسابقات ←</Link>
          </div>
        </div>
      </section>

      {/* ============ OCCUPANCY / LIVE ============ */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="reveal glass flex flex-col items-center justify-between gap-6 p-8 md:flex-row">
          <div>
            <h3 className="text-xl font-black text-white">🔴 وضعیت زنده سالن</h3>
            <p className="mt-1 text-sm text-slate-400">تراکم فعلی گیم‌نت — تصمیم‌های آخر سرفه رو بگیر!</p>
          </div>
          <div className="w-full max-w-md">
            <div className="mb-2 flex justify-between text-xs text-slate-400">
              <span>شلوغی: <b className={occupancy > 70 ? "text-neon-red" : occupancy > 40 ? "text-neon-green" : "text-neon-cyan"}>{occupancy > 70 ? "شلوغ" : occupancy > 40 ? "متوسط" : "آرام"}</b></span>
              <span>{toman(150000)} شروع قیمت</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full bg-gradient-to-l ${occupancy > 70 ? "from-neon-red to-neon-pink" : "from-neon-green to-neon-cyan"}`} style={{ width: `${occupancy}%` }} />
            </div>
          </div>
          <Link href="/booking" className="btn-neon !py-2.5 !text-sm">رزرو جای خودت</Link>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionHeading kicker="PLAYER REVIEWS" title="گیمرها چی می‌گن؟" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className="reveal glass card-hover flex flex-col p-6" style={{ transitionDelay: `${i * 60}ms` }}>
              <StarRating value={t.rating} />
              <p className="my-4 flex-1 text-sm leading-7 text-slate-300">«{t.text}»</p>
              <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-neon-violet to-neon-cyan font-bold text-white">{t.name[0]}</span>
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-[11px] text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ GALLERY ============ */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <SectionHeading kicker="GALLERY" title="نگاهی به آرنا" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY.map((g, i) => (
            <CoverArt key={g.title} emoji={g.emoji} src={g.image} gradient={g.gradient} title={g.title} className="reveal card-hover h-52 !rounded-2xl" big />
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="reveal relative overflow-hidden rounded-3xl border border-neon-purple/30 bg-gradient-to-l from-neon-violet/20 via-panel to-neon-cyan/10 p-10 text-center md:p-16">
          <div className="absolute -top-24 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-neon-purple/30 blur-[100px]" />
          <h2 className="relative mb-3 font-display text-3xl font-black text-white md:text-4xl">آماده‌ای وارد آرنا بشی؟</h2>
          <p className="relative mx-auto mb-8 max-w-xl text-sm leading-7 text-slate-300">
            عضو خانواده آرنا ایکس شو؛ اعتبار خوش‌آمدگویی، تخفیف اولین رزرو و دسترسی زودهنگام به مسابقات منتظرته.
          </p>
          <div className="relative flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-neon text-base">🎯 عضویت رایگان</Link>
            <Link href="/login" className="btn-outline text-base">ورود به حساب</Link>
          </div>
        </div>
      </section>
    </>
  );
}
