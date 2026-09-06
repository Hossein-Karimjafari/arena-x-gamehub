import { db } from "@/lib/db";
import { toman, faNum, PLATFORM_FA } from "@/lib/constants";
import StationRow from "./StationRow";

export const dynamic = "force-dynamic";

export default async function AdminStations() {
  const stations = await db.station.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] });

  return (
    <div className="space-y-6">
      <form action="/api/admin/stations" method="POST" className="glass grid gap-4 p-6 sm:grid-cols-5">
        <div className="sm:col-span-5"><h3 className="font-bold text-white">🖥️ دستگاه جدید</h3></div>
        <div><label className="label">نام</label><input name="name" required className="input" placeholder="PC-09" /></div>
        <div><label className="label">نوع</label>
          <select name="type" className="input">
            <option value="PC">کامپیوتر</option><option value="PS5">PS5</option><option value="XBOX">XBOX</option><option value="VIP">VIP</option>
          </select>
        </div>
        <div><label className="label">مشخصات</label><input name="specs" required className="input" placeholder="RTX 4070 / i7 / 240Hz" /></div>
        <div><label className="label">نرخ ساعتی</label><input name="hourlyRate" type="number" min={0} required className="input" dir="ltr" /></div>
        <button className="btn-neon !py-2.5 !text-sm sm:mt-7">افزودن</button>
      </form>

      <div className="glass overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-white/5"><tr>
            <th className="table-th">نام</th><th className="table-th">نوع</th><th className="table-th">مشخصات</th>
            <th className="table-th">نرخ</th><th className="table-th">وضعیت</th><th className="table-th">عملیات</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {stations.map((s) => (
              <tr key={s.id}>
                <td className="table-td font-bold">{s.name}</td>
                <td className="table-td"><span className="chip !py-0.5 !text-[10px]">{PLATFORM_FA[s.type] ?? s.type}</span></td>
                <td className="table-td text-xs text-slate-400">{s.specs}</td>
                <td className="table-td">{toman(s.hourlyRate)}</td>
                <td className="table-td text-xs">{s.active ? "✅ فعال" : "⛔ خاموش"} {s.online ? "• 🟢 آنلاین" : ""}</td>
                <td className="table-td"><StationRow id={s.id} hourlyRate={s.hourlyRate} active={s.active} online={s.online} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">تعداد کل: {faNum(stations.length)} دستگاه</p>
    </div>
  );
}
