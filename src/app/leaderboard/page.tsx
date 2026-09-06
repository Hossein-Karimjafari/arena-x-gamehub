import { db } from "@/lib/db";
import { toman, faNum } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const top = await db.user.findMany({ where: { role: "USER" }, orderBy: { xp: "desc" }, take: 20 });

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="mb-10 text-center">
        <h1 className="section-title mb-2 neon-text">🏅 لیدربورد آرنا</h1>
        <p className="text-sm text-slate-400">برترین گیمرهای ماه بر اساس امتیاز فعالیت — تو کجای جدولی؟</p>
      </div>

      <div className="glass overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr><th className="table-th">رتبه</th><th className="table-th">گیمر</th><th className="table-th">سطح</th><th className="table-th">XP</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {top.map((u, i) => (
              <tr key={u.id} className={i < 3 ? "bg-neon-purple/5" : ""}>
                <td className="table-td font-display text-lg">{medals[i] ?? faNum(i + 1)}</td>
                <td className="table-td">
                  <span className="font-bold text-white">{u.name ?? u.username}</span>
                  <span className="mr-2 text-xs text-slate-500">@{u.username}</span>
                </td>
                <td className="table-td">{u.level}</td>
                <td className="table-td font-bold text-neon-purple">{faNum(u.xp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass mt-8 p-6 text-sm leading-7 text-slate-400">
        <p className="mb-2 font-bold text-white">چطور امتیاز بگیرم؟</p>
        <p>🎮 هر ساعت رزرو: ۵۰ XP — 🏆 ثبت‌نام مسابقه: ۱۰۰ XP — 💬 دیدگاه بازی: ۳۰ XP — 💎 خرید اشتراک: ۲۰۰ XP — 💰 شارژ کیف پول: به ازای هر ۱۰ هزار تومان ۱ XP</p>
      </div>
    </div>
  );
}
