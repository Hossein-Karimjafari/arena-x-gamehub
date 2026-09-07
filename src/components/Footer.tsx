import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/constants";
import { IconInstagram, IconTelegram, IconWhatsApp, IconYouTube, IconDiscord } from "@/components/icons";

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
                { href: SITE.socials.instagram, label: "اینستاگرام", Icon: IconInstagram },
                { href: SITE.socials.telegram, label: "تلگرام", Icon: IconTelegram },
                { href: SITE.socials.whatsapp, label: "واتساپ", Icon: IconWhatsApp },
                { href: SITE.socials.youtube, label: "یوتیوب", Icon: IconYouTube },
                { href: SITE.socials.discord, label: "دیسکورد", Icon: IconDiscord },
              ].map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" title={label} aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-neon-purple/60 hover:text-white hover:shadow-neon">
                  <Icon className="h-5 w-5" />
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
              <a href="https://trustseal.enamad.ir" target="_blank" rel="noreferrer" title="نماد اعتماد الکترونیکی"
                className="glass grid h-24 w-24 place-items-center overflow-hidden !rounded-xl transition-opacity hover:opacity-80">
                <Image src="/images/enamad.png" alt="نماد اعتماد الکترونیکی" width={80} height={80} className="object-contain p-2" />
              </a>
              <a href="https://samandehi.ir" target="_blank" rel="noreferrer" title="ساماندهی رسانه‌های دیجیتال"
                className="glass grid h-24 w-24 place-items-center overflow-hidden !rounded-xl transition-opacity hover:opacity-80">
                <Image src="/images/samandehi.png" alt="نشان ساماندهی رسانه‌های دیجیتال" width={80} height={80} className="object-contain p-2" />
              </a>
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
