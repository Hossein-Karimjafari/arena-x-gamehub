import { db } from "@/lib/db";
import { dateFa, STATUS_FA } from "@/lib/constants";
import TournamentRow from "./TournamentRow";

export const dynamic = "force-dynamic";

export default async function AdminTournaments() {
  const tournaments = await db.tournament.findMany({ include: { _count: { select: { registrations: true } } }, orderBy: { date: "asc" } });

  return (
    <div className="space-y-6">
      <form action="/api/admin/tournaments" method="POST" className="glass grid gap-4 p-6 sm:grid-cols-3">
        <div className="sm:col-span-3"><h3 className="font-bold text-white">➕ مسابقه جدید</h3></div>
        <div><label className="label">عنوان</label><input name="title" required className="input" /></div>
        <div><label className="label">اسلاگ</label><input name="slug" required dir="ltr" className="input" /></div>
        <div><label className="label">بازی</label><input name="game" required className="input" /></div>
        <div><label className="label">پلتفرم</label><select name="platform" className="input"><option value="PC">PC</option><option value="PS5">PS5</option><option value="XBOX">XBOX</option></select></div>
        <div><label className="label">تاریخ (میلادی)</label><input name="date" type="datetime-local" required dir="ltr" className="input" /></div>
        <div><label className="label">جایزه</label><input name="prize" className="input" placeholder="۵ میلیون تومان" /></div>
        <div><label className="label">هزینه ثبت‌نام</label><input name="entryFee" type="number" defaultValue={0} dir="ltr" className="input" /></div>
        <div><label className="label">ظرفیت</label><input name="capacity" type="number" defaultValue={32} dir="ltr" className="input" /></div>
        <div><label className="label">نفرات تیم</label><input name="teamSize" type="number" defaultValue={1} dir="ltr" className="input" /></div>
        <div className="sm:col-span-2"><label className="label">توضیحات</label><input name="description" className="input" /></div>
        <div className="sm:col-span-3"><label className="label">قوانین</label><textarea name="rules" className="input min-h-20" /></div>
        <button className="btn-neon">افزودن مسابقه</button>
      </form>

      <div className="glass overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="bg-white/5"><tr><th className="table-th">مسابقه</th><th className="table-th">تاریخ</th><th className="table-th">ثبت‌نام</th><th className="table-th">وضعیت</th><th className="table-th">عملیات</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {tournaments.map((t) => (
              <tr key={t.id}>
                <td className="table-td"><b>{t.emoji} {t.title}</b><br /><span className="text-[10px] text-slate-500">{t.game}</span></td>
                <td className="table-td text-xs">{dateFa(t.date)}</td>
                <td className="table-td">{t._count.registrations} / {t.capacity}</td>
                <td className="table-td"><span className="chip !py-0.5 !text-[10px]">{STATUS_FA[t.status]}</span></td>
                <td className="table-td"><TournamentRow id={t.id} status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
