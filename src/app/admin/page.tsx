import { db } from "@/lib/db";
import { toman, dateFa, faNum, STATUS_FA } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [users, bookings, revenue, payments, stations, games, contacts, notifCount] = await Promise.all([
    db.user.count(),
    db.booking.count(),
    db.booking.aggregate({ where: { status: { in: ["CONFIRMED", "DONE"] } }, _sum: { totalPrice: true } }),
    db.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
    db.station.findMany({ orderBy: { name: "asc" } }),
    db.game.count(),
    db.contact.findMany({ where: { answered: false }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.notification.count({ where: { read: false } }),
  ]);

  const latest = await db.booking.findMany({ include: { user: true, station: true }, orderBy: { createdAt: "desc" }, take: 8 });

  const cards = [
    { label: "کاربران", value: faNum(users), icon: "👥", color: "text-neon-cyan" },
    { label: "کل رزروها", value: faNum(bookings), icon: "🎮", color: "text-neon-purple" },
    { label: "درآمد رزروها", value: toman(revenue._sum.totalPrice ?? 0), icon: "💰", color: "text-neon-green" },
    { label: "شارژ کیف پول", value: toman(payments._sum.amount ?? 0), icon: "👛", color: "text-neon-pink" },
    { label: "بازی‌ها", value: faNum(games), icon: "🕹️", color: "text-neon-cyan" },
    { label: "اعلان‌های نخوانده", value: faNum(notifCount), icon: "🔔", color: "text-neon-red" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="glass card-hover p-6">
            <p className="text-3xl">{c.icon}</p>
            <p className={`mt-3 font-display text-2xl font-black ${c.color}`}>{c.value}</p>
            <p className="mt-1 text-xs text-slate-400">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass overflow-hidden lg:col-span-2">
          <h3 className="border-b border-white/5 p-4 font-bold text-white">آخرین رزروها</h3>
          <table className="w-full">
            <thead className="bg-white/5"><tr><th className="table-th">کاربر</th><th className="table-th">دستگاه</th><th className="table-th">زمان</th><th className="table-th">مبلغ</th><th className="table-th">وضعیت</th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {latest.map((b) => (
                <tr key={b.id}>
                  <td className="table-td">{b.user?.name ?? b.guestName ?? "مهمان"}</td>
                  <td className="table-td">{b.station.name}</td>
                  <td className="table-td text-xs">{dateFa(b.date)} — {faNum(b.startHour)}:۰۰</td>
                  <td className="table-td">{toman(b.totalPrice)}</td>
                  <td className="table-td"><span className="chip !py-0.5 !text-[10px]">{STATUS_FA[b.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass p-5">
          <h3 className="mb-4 font-bold text-white">🖥️ وضعیت دستگاه‌ها</h3>
          <div className="space-y-2.5">
            {stations.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                <span className="text-slate-200">{s.name}</span>
                <span className={`text-[10px] font-bold ${s.online ? "text-neon-green" : "text-slate-500"}`}>{s.online ? "● آنلاین" : "○ آزاد"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {contacts.length > 0 && (
        <div className="glass p-5">
          <h3 className="mb-4 font-bold text-white">📩 پیام‌های بی‌پاسخ فرم تماس</h3>
          <div className="space-y-3">
            {contacts.map((c) => (
              <div key={c.id} className="rounded-xl bg-white/5 p-4 text-sm">
                <p className="font-bold text-white">{c.subject} — <span className="text-xs font-normal text-slate-400">{c.name} ({c.email})</span></p>
                <p className="mt-1 text-slate-300">{c.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
