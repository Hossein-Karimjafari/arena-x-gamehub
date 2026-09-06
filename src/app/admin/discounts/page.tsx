import { db } from "@/lib/db";
import { dateFa } from "@/lib/constants";
import DiscountRow from "./DiscountRow";

export const dynamic = "force-dynamic";

export default async function AdminDiscounts() {
  const discounts = await db.discount.findMany({ orderBy: { code: "asc" } });

  return (
    <div className="space-y-6">
      <form action="/api/admin/discounts" method="POST" className="glass grid gap-4 p-6 sm:grid-cols-4">
        <div className="sm:col-span-4"><h3 className="font-bold text-white">🏷️ کد تخفیف جدید</h3></div>
        <div><label className="label">کد</label><input name="code" required dir="ltr" className="input" placeholder="SUMMER25" /></div>
        <div><label className="label">درصد</label><input name="percent" type="number" min={1} max={90} required dir="ltr" className="input" /></div>
        <div><label className="label">حداکثر استفاده</label><input name="maxUse" type="number" defaultValue={100} dir="ltr" className="input" /></div>
        <div><label className="label">انقضا (اختیاری)</label><input name="expiresAt" type="date" dir="ltr" className="input" /></div>
        <button className="btn-neon sm:col-span-4 !py-3">ایجاد کد</button>
      </form>

      <div className="glass overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-white/5"><tr><th className="table-th">کد</th><th className="table-th">درصد</th><th className="table-th">استفاده</th><th className="table-th">انقضا</th><th className="table-th">وضعیت</th><th className="table-th">عملیات</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {discounts.map((d) => (
              <tr key={d.id}>
                <td className="table-td font-mono font-bold text-neon-cyan" dir="ltr">{d.code}</td>
                <td className="table-td">{d.percent}٪</td>
                <td className="table-td">{d.used} / {d.maxUse}</td>
                <td className="table-td text-xs">{d.expiresAt ? dateFa(d.expiresAt) : "—"}</td>
                <td className="table-td">{d.active ? "✅" : "⛔"}</td>
                <td className="table-td"><DiscountRow id={d.id} active={d.active} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
