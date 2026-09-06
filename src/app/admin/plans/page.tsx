import { db } from "@/lib/db";
import { toman } from "@/lib/constants";
import PlanRow from "./PlanRow";

export const dynamic = "force-dynamic";

export default async function AdminPlans() {
  const plans = await db.plan.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <form action="/api/admin/plans" method="POST" className="glass grid gap-4 p-6 sm:grid-cols-4">
        <div className="sm:col-span-4"><h3 className="font-bold text-white">➕ پلن جدید</h3></div>
        <div><label className="label">عنوان</label><input name="title" required className="input" /></div>
        <div><label className="label">قیمت (تومان)</label><input name="price" type="number" required dir="ltr" className="input" /></div>
        <div><label className="label">ساعت بازی</label><input name="hours" type="number" required dir="ltr" className="input" /></div>
        <div><label className="label">ترتیب</label><input name="order" type="number" defaultValue={9} dir="ltr" className="input" /></div>
        <div className="sm:col-span-3"><label className="label">امکانات (هر خط یک مورد)</label><textarea name="features" required className="input min-h-20" /></div>
        <button className="btn-neon self-end !py-3">افزودن</button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className="glass p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">{p.title} {p.badge && <span className="chip !py-0 !text-[10px] !text-neon-purple">{p.badge}</span>}</h3>
              <PlanRow id={p.id} active={p.active} />
            </div>
            <p className="mt-2 text-sm text-slate-400">{toman(p.price)} — {p.hours} ساعت</p>
          </div>
        ))}
      </div>
    </div>
  );
}
