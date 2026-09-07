import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { dateFa, toman, STATUS_FA } from "@/lib/constants";
import { SITE_URL } from "@/lib/env";
import CoverArt from "@/components/CoverArt";
import TournamentRegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await db.tournament.findUnique({ where: { slug } });
  return { title: t?.title ?? "مسابقه", description: t?.description.slice(0, 150) };
}

export default async function TournamentDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await db.tournament.findUnique({
    where: { slug },
    include: { registrations: { include: { user: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!t) notFound();

  const seats = t.registrations.length;
  const full = seats >= t.capacity;
  const progress = Math.round((seats / t.capacity) * 100);

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: t.title,
    description: t.description,
    startDate: t.date.toISOString(),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: t.status === "DONE" ? "https://schema.org/EventScheduled" : "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: "گیم‌نت آرنا ایکس", address: "تهران، خیابان ولیعصر" },
    url: `${SITE_URL}/tournaments/${t.slug}`,
  };

  const scoreboard = [
    { team: "NoScope", pts: 86, medal: "🥇" },
    { team: "Night Wolves", pts: 74, medal: "🥈" },
    { team: "IR Reapers", pts: 65, medal: "🥉" },
    { team: "Ghost Squad", pts: 51, medal: "🎖" },
    { team: "Pixel Hunters", pts: 44, medal: "" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }} />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <CoverArt emoji={t.emoji} src={`/images/tournaments/${t.slug}.jpg`} gradient="violet" className="h-64 !rounded-3xl shadow-neon" big alt={t.title} />

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`chip ${t.status === "OPEN" ? "!text-neon-green !border-neon-green/40" : "!text-neon-cyan !border-neon-cyan/40"}`}>{STATUS_FA[t.status]}</span>
              <span className="chip">🎮 {t.game}</span>
              <span className="chip">{t.teamSize > 1 ? `👥 تیمی ${t.teamSize} نفره` : "🏃 انفرادی"}</span>
            </div>
            <h1 className="mb-2 font-display text-3xl font-black text-white">{t.title}</h1>
            <p className="leading-8 text-slate-300">{t.description}</p>
          </div>

          <div className="glass p-6">
            <h3 className="mb-3 font-black text-white">📋 قوانین مسابقه</h3>
            <div className="space-y-2 text-sm leading-7 text-slate-300">
              {t.rules.split("\n").map((r, i) => <p key={i}>{r}</p>)}
            </div>
          </div>

          <div>
            <h3 className="section-title mb-5 text-xl">🏅 جدول امتیازات فصل</h3>
            <div className="glass overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5"><tr><th className="table-th">رتبه</th><th className="table-th">تیم</th><th className="table-th">امتیاز</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {scoreboard.map((s) => (
                    <tr key={s.team}><td className="table-td">{s.medal || s.team}</td><td className="table-td font-bold">{s.team}</td><td className="table-td text-neon-green">{s.pts}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass p-6">
            <h3 className="mb-4 font-black text-white">ℹ️ اطلاعات مسابقه</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-400">تاریخ برگزاری</dt><dd className="font-bold text-white">{dateFa(t.date, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">ساعت</dt><dd className="text-white">{dateFa(t.date, { hour: "2-digit", minute: "2-digit" })}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">جایزه</dt><dd className="font-bold text-neon-green">{t.prize}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">هزینه ثبت‌نام</dt><dd className="text-white">{t.entryFee ? toman(t.entryFee) : "رایگان"}</dd></div>
            </dl>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-slate-400"><span>ظرفیت</span><span>{seats} از {t.capacity}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${full ? "bg-neon-red" : "bg-gradient-to-l from-neon-green to-neon-cyan"}`} style={{ width: `${progress}%` }} /></div>
            </div>
          </div>

          <TournamentRegisterForm tournamentId={t.id} status={t.status} full={full} teamSize={t.teamSize} entryFee={t.entryFee} seats={seats} capacity={t.capacity} />

          <div className="glass p-6">
            <h3 className="mb-4 font-black text-white">👥 ثبت‌نام‌شده‌ها ({seats})</h3>
            <div className="space-y-2">
              {t.registrations.slice(0, 12).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                  <span className="text-slate-200">{r.teamName || r.user.name || r.user.username}</span>
                  <span className="text-[10px] text-slate-500">{r.paid ? "✅" : "⏳"}</span>
                </div>
              ))}
              {seats === 0 && <p className="text-sm text-slate-400">هنوز کسی ثبت‌نام نکرده؛ رکورد اول را بزن!</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
