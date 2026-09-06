import Link from "next/link";
import { SITE } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/5 bg-black/40">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-neon-violet to-neon-purple font-display font-black text-white shadow-neon">AX</span>
              <span className="font-display text-lg font-extrabold tracking-wider text-white">ARENA<span className="text-neon-purple">X</span></span>
            </div>
            <p className="text-sm leading-7 text-slate-400">
              گیم‌نت حرفه‌ای آرنا ایکس؛ مقصد اول گیمرهای تهران با سیستم‌های نسل جدید، اینترنت فیبر و فضایی که برای بردن ساخته شده.
            </p>
            <div className="mt-4 flex gap-2">
              {[
                { href: SITE.socials.instagram, label: "اینستاگرام", icon: "📷" },
                { href: SITE.socials.telegram, label: "تلگرام", icon: "✈️" },
                { href: SITE.socials.whatsapp, label: "واتساپ", icon: "💬" },
                { href: SITE.socials.youtube, label: "یوتیوب", icon: "▶️" },
                { href: SITE.socials.discord, label: "دیسکورد", icon: "🎧" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-lg transition-all hover:border-neon-purple/60 hover:shadow-neon">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-white">دسترسی سریع</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {[
                { href: "/games", label: "بازی‌ها" },
                { href: "/booking", label: "رزرو آنلاین" },
                { href: "/tournaments", label: "مسابقات" },
                { href: "/pricing", label: "تعرفه و اشتراک" },
                { href: "/blog", label: "اخبار و مقالات" },
              ].map((l) => (
                <li key={l.href}><Link href={l.href} className="transition-colors hover:text-neon-purple">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-white">تماس با ما</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>📍 {SITE.address}</li>
              <li>☎️ <span dir="ltr">{SITE.phone}</span> | <span dir="ltr">{SITE.mobile}</span></li>
              <li>🕘 {SITE.hours}</li>
              <li>✉️ <a href="mailto:hi@arenax.gg" className="hover:text-neon-purple">hi@arenax.gg</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-white">اعتماد شما</h4>
            <div className="flex gap-3">
              <div className="glass grid h-24 w-24 place-items-center text-center text-[11px] text-slate-400">نماد اعتماد<br />الکترونیکی<br /><span className="text-2xl">🛡️</span></div>
              <div className="glass grid h-24 w-24 place-items-center text-center text-[11px] text-slate-400">ساماندهی<br />رسانه‌های دیجیتال<br /><span className="text-2xl">🏛️</span></div>
            </div>
            <p className="mt-4 text-xs text-slate-500">پرداخت امن از طریق درگاه رسمی بانکی</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-slate-500 md:flex-row">
          <p>© ۱۴۰۵ گیم‌نت آرنا ایکس — تمامی حقوق محفوظ است.</p>
          <p className="font-display tracking-widest">GAME. WIN. REPEAT.</p>
        </div>
      </div>
    </footer>
  );
}
