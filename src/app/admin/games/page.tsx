import { db } from "@/lib/db";
import { toman, PLATFORM_FA } from "@/lib/constants";
import GameRow from "./GameRow";

export const dynamic = "force-dynamic";

export default async function AdminGames() {
  const games = await db.game.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <GameForm />
      <div className="glass overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-white/5"><tr>
            <th className="table-th">بازی</th><th className="table-th">ژانر</th><th className="table-th">پلتفرم</th>
            <th className="table-th">نرخ</th><th className="table-th">امتیاز</th><th className="table-th">محبوب</th><th className="table-th">عملیات</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {games.map((g) => (
              <tr key={g.id}>
                <td className="table-td"><b>{g.emoji} {g.title}</b><br /><span className="font-display text-[10px] text-slate-500">{g.titleEn}</span></td>
                <td className="table-td">{g.genre}</td>
                <td className="table-td">{PLATFORM_FA[g.platform]}</td>
                <td className="table-td">{toman(g.pricePerHour)}</td>
                <td className="table-td">{g.rating}</td>
                <td className="table-td">{g.popular ? "⭐" : "—"}</td>
                <td className="table-td"><GameRow id={g.id} popular={g.popular} active={g.active} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GameForm() {
  return (
    <form action="/api/admin/games" method="POST" className="glass grid gap-4 p-6 sm:grid-cols-3">
      <div className="sm:col-span-3"><h3 className="font-bold text-white">➕ افزودن بازی جدید</h3></div>
      <div><label className="label">نام (فارسی)</label><input name="title" required className="input" /></div>
      <div><label className="label">نام (EN)</label><input name="titleEn" required className="input" dir="ltr" /></div>
      <div><label className="label">اسلاگ</label><input name="slug" required className="input" dir="ltr" placeholder="fifa-25" /></div>
      <div><label className="label">ژانر</label><input name="genre" required className="input" /></div>
      <div><label className="label">پلتفرم</label>
        <select name="platform" className="input"><option value="PC">PC</option><option value="PS5">PS5</option><option value="XBOX">XBOX</option></select>
      </div>
      <div><label className="label">ایموجی</label><input name="emoji" defaultValue="🎮" className="input" /></div>
      <div><label className="label">نرخ ساعتی (تومان)</label><input name="pricePerHour" type="number" defaultValue={150000} className="input" dir="ltr" /></div>
      <div className="sm:col-span-2"><label className="label">توضیحات</label><input name="description" className="input" /></div>
      <button className="btn-neon self-end !py-3">افزودن</button>
    </form>
  );
}
