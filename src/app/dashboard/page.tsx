import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { levelFromXp, toman, dateFa, STATUS_FA, faNum } from "@/lib/constants";
import LogoutButton from "@/components/LogoutButton";
import NotificationBell from "./NotificationBell";
import { ProfileForm, PasswordForm, ReferralCode, CancelBooking, PayPending, FeedbackFromQuery } from "./Forms";

export const dynamic = "force-dynamic";
export const metadata = { title: "داشبورد من" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.user.id }, include: { hours: true } });
  if (!user) redirect("/login");

  const [bookings, regs, txs, notifs] = await Promise.all([
    db.booking.findMany({ where: { userId: user.id }, include: { station: true }, orderBy: { createdAt: "desc" }, take: 30 }),
    db.tournamentRegistration.findMany({ where: { userId: user.id }, include: { tournament: true }, orderBy: { createdAt: "desc" }, take: 10 }),
    db.walletTx.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
    db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const lvl = levelFromXp(user.xp);
  const today = new Date(new Date().toDateString());
  const upcoming = bookings.filter((b) => new Date(b.date + "T00:00:00") >= today && b.status !== "CANCELLED" && b.status !== "DONE");
  const past = bookings.filter((b) => !upcoming.includes(b));

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <Suspense fallback={null}>
        <FeedbackFromQuery />
      </Suspense>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-neon-violet to-neon-cyan font-display text-2xl font-black text-white shadow-neon">
            {(user.name ?? user.username ?? "G")[0]}
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-white">{user.name ?? user.username}</h1>
            <p className="text-sm text-slate-400">@{user.username} • عضویت {dateFa(user.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(user.role === "ADMIN" || user.role === "OPERATOR") && <a href="/admin" className="btn-outline !py-2.5 !text-sm">پنل مدیریت</a>}
          <LogoutButton />
        </div>
      </div>

      {/* Level & stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass p-5 sm:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-slate-400">سطح <b className={`text-lg ${lvl.color}`}>{lvl.title}</b></p>
            <p className="font-display text-sm text-neon-purple">{faNum(user.xp)} XP</p>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-l from-neon-purple to-neon-cyan transition-all" style={{ width: `${lvl.progress}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">{lvl.nextXp ? `${faNum(lvl.nextXp - user.xp)} XP تا سطح بعدی` : "بالاترین سطح! 🏆"}</p>
        </div>
        <div className="glass p-5">
          <p className="text-xs text-slate-400">کیف پول</p>
          <p className="mt-1 text-xl font-black text-neon-green">{toman(user.balance)}</p>
          <a href="/dashboard/wallet" className="mt-2 inline-block text-xs text-neon-purple hover:underline">شارژ / خرید اشتراک ←</a>
        </div>
        <div className="glass p-5">
          <p className="text-xs text-slate-400">کد دعوت دوستان</p>
          <div className="mt-1"><ReferralCode code={user.referralCode} /></div>
          <p className="mt-1 text-[10px] text-slate-500">۳۰٬۰۰۰ تومان پاداش برای هر دوست 🤝</p>
        </div>
      </div>

      {user.hours && user.hours.remaining > 0 && (
        <div className="glass mb-8 flex items-center justify-between p-5">
          <p className="text-sm text-slate-300">⏱️ ساعت‌های باقی‌مانده اشتراک</p>
          <p className="font-display text-lg font-black text-neon-cyan">{faNum(user.hours.remaining)} ساعت</p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Bookings */}
          <section>
            <h2 className="section-title mb-4 text-xl">🎮 رزروهای من</h2>
            <div className="space-y-3">
              {upcoming.map((b) => (
                <div key={b.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-bold text-white">{b.station.name} <span className="text-xs font-normal text-slate-400">({b.station.type})</span></p>
                    <p className="mt-0.5 text-xs text-slate-400">{dateFa(b.date)} • ساعت {faNum(b.startHour)}:۰۰ تا {faNum(b.startHour + b.hours)}:۰۰ • {toman(b.totalPrice)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="chip !border-neon-green/40 !text-neon-green">{STATUS_FA[b.status]}</span>
                    {b.status === "PENDING" && b.payMethod === "online" && <PayPending id={b.id} />}
                    {b.status === "CONFIRMED" && <CancelBooking id={b.id} />}
                  </div>
                </div>
              ))}
              {past.slice(0, 4).map((b) => (
                <div key={b.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4 opacity-60">
                  <div>
                    <p className="font-bold text-slate-300">{b.station.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{dateFa(b.date)} • {toman(b.totalPrice)}</p>
                  </div>
                  <span className="chip">{STATUS_FA[b.status]}</span>
                </div>
              ))}
              {bookings.length === 0 && <p className="glass p-6 text-sm text-slate-400">هنوز رزروی نداری؛ <a href="/booking" className="text-neon-purple underline">اولین رزرو</a> را بزن!</p>}
            </div>
          </section>

          {/* Tournaments */}
          <section>
            <h2 className="section-title mb-4 text-xl">🏆 مسابقات من</h2>
            <div className="space-y-3">
              {regs.map((r) => (
                <div key={r.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-bold text-white">{r.tournament.emoji} {r.tournament.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{dateFa(r.tournament.date)} {r.teamName && `• تیم ${r.teamName}`}</p>
                  </div>
                  <a href={`/tournaments/${r.tournament.slug}`} className="text-xs text-neon-purple hover:underline">مشاهده مسابقه ←</a>
                </div>
              ))}
              {regs.length === 0 && <p className="glass p-6 text-sm text-slate-400">در مسابقه‌ای ثبت‌نام نکردی؛ <a href="/tournaments" className="text-neon-purple underline">مسابقات فعال</a> را ببین!</p>}
            </div>
          </section>

          {/* Wallet transactions */}
          <section>
            <h2 className="section-title mb-4 text-xl">👛 تراکنش‌های کیف پول</h2>
            <div className="glass divide-y divide-white/5">
              {txs.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 text-sm">
                  <div>
                    <p className="text-slate-200">{t.desc}</p>
                    <p className="text-[10px] text-slate-500">{dateFa(t.createdAt, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <span className={`font-bold ${t.amount > 0 ? "text-neon-green" : "text-neon-red"}`}>{t.amount > 0 ? "+" : ""}{toman(t.amount)}</span>
                </div>
              ))}
              {txs.length === 0 && <p className="p-6 text-sm text-slate-400">تراکنشی ثبت نشده.</p>}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <NotificationBell notifs={notifs.map((n) => ({ id: n.id, title: n.title, body: n.body, read: n.read, createdAt: n.createdAt.toISOString() }))} />
          <div className="glass p-6">
            <h3 className="mb-4 font-black text-white">⚙️ تنظیمات حساب</h3>
            <ProfileForm user={{ name: user.name ?? "", phone: user.phone ?? "", email: user.email ?? "" }} />
          </div>
          <div className="glass p-6">
            <h3 className="mb-4 font-black text-white">🔑 تغییر رمز عبور</h3>
            <PasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
