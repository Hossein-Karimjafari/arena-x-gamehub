import { db } from "@/lib/db";
import SectionHeading from "@/components/SectionHeading";
import PricingTable from "./PricingTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "تعرفه‌ها و اشتراک", description: "پلن‌های ساعتی، روزانه، هفتگی، ماهانه و VIP گیم‌نت آرنا ایکس" };

export default async function PricingPage() {
  const plans = await db.plan.findMany({ where: { active: true }, orderBy: { order: "asc" } });

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeading kicker="PRICING" title="💎 تعرفه‌ها و اشتراک‌ها" desc="هرچی بیشتر بازی کنی، ارزون‌تر میشه. همه پلن‌ها شامل اینترنت فیبر و نوشیدنی خوش‌آمدگویی هستند." />
      <PricingTable plans={plans.map((p) => ({ ...p, features: JSON.parse(p.features) as string[] }))} />
      <div className="glass mt-10 p-8">
        <h3 className="mb-4 font-black text-white">🎯 تخفیف‌های ویژه</h3>
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div className="rounded-xl bg-white/5 p-4"><p className="mb-1 font-bold text-neon-cyan">شب‌بیدارها 🌙</p><p className="text-slate-400">جمعه‌ها ۱۲ تا ۸ صبح: ۳۰٪ تخفیف همه پلن‌ها + اسنک رایگان.</p></div>
          <div className="rounded-xl bg-white/5 p-4"><p className="mb-1 font-bold text-neon-purple">ساعات خلوت 🕐</p><p className="text-slate-400">شنبه تا چهارشنبه ۹ تا ۱۴: ۲۰٪ تخفیف پلن ساعتی.</p></div>
          <div className="rounded-xl bg-white/5 p-4"><p className="mb-1 font-bold text-neon-green">دانشجویی 🎓</p><p className="text-slate-400">با نمایش کارت دانشجویی: ۱۵٪ تخفیف دائمی.</p></div>
        </div>
      </div>
    </div>
  );
}
