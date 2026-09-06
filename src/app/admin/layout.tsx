import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "پنل مدیریت" };

const TABS = [
  { href: "/admin", label: "📊 آمار" },
  { href: "/admin/bookings", label: "🎮 رزروها" },
  { href: "/admin/stations", label: "🖥️ دستگاه‌ها" },
  { href: "/admin/users", label: "👤 کاربران" },
  { href: "/admin/games", label: "🕹️ بازی‌ها" },
  { href: "/admin/tournaments", label: "🏆 مسابقات" },
  { href: "/admin/plans", label: "💎 پلن‌ها" },
  { href: "/admin/posts", label: "📰 بلاگ" },
  { href: "/admin/discounts", label: "🏷️ تخفیف‌ها" },
  { href: "/admin/reviews", label: "💬 دیدگاه‌ها" },
  { href: "/admin/contacts", label: "📩 پیام‌ها" },
  { href: "/admin/notifications", label: "🔔 اطلاع‌رسانی" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "OPERATOR") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-white">🛡️ پنل مدیریت آرنا</h1>
          <p className="text-xs text-slate-400">خوش آمدی {session.user.name}</p>
        </div>
        <Link href="/" className="chip hover:!border-neon-purple/60">← بازگشت به سایت</Link>
      </div>

      <nav className="mb-8 flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className="chip !px-4 !py-2 text-sm hover:!border-neon-purple/60 hover:!text-white">{t.label}</Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
