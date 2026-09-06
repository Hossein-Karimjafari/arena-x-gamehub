import { SITE } from "@/lib/constants";
import SectionHeading from "@/components/SectionHeading";
import CoverArt from "@/components/CoverArt";
import { GALLERY } from "@/lib/constants";

export const metadata = { title: "درباره ما", description: "داستان گیم‌نت آرنا ایکس؛ از یک ایده تا بزرگ‌ترین میدان گیمینگ شرق تهران" };

export default function AboutPage() {
  const timeline = [
    { year: "۱۳۹۸", title: "تولد آرنا", desc: "با ۶ سیستم قدیمی و یک رؤیا بزرگ در ۴۵ متر شروع شد." },
    { year: "۱۴۰۰", title: "ورود کنسول‌ها", desc: "اولین استیشن PS5 شرق تهران در آرنا نصب شد." },
    { year: "۱۴۰۱", title: "اولین تورنمنت بزرگ", desc: "جام فیفا آرنا با ۶۴ شرکت‌کننده و پخش زنده برگزار شد." },
    { year: "۱۴۰۳", title: "نوسازی کامل", desc: "ارتقای همه سیستم‌ها به RTX 4070، افتتاح اتاق VIP و کافه." },
    { year: "۱۴۰۵", title: "پلتفرم آنلاین", desc: "رزرو آنلاین، کیف پول و لیدربورد؛ آرنا حالا همیشه همراه شماست." },
  ];

  const values = [
    { emoji: "🤝", title: "احترام", desc: "آرنا خانه همه گیمرهاست؛ بدون تبعیض، بدون قضاوت." },
    { emoji: "⚔️", title: "رقابت سالم", desc: "برد با مهارت می‌آید، نه با بهانه. داوری منصفانه خط قرمز ماست." },
    { emoji: "🚀", title: "بهترین سخت‌افزار", desc: "هیچ‌وقت روی کیفیت سیستم‌ها کم نمی‌گذاریم." },
    { emoji: "🌱", title: "رشد جامعه", desc: "از مسابقات تا کارگاه‌های استریم؛ رشد گیمرهای ایران هدف ماست." },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeading kicker="ABOUT US" title="داستان آرنا ایکس" desc="جایی که از یک پاتوق کوچک، میدان نبرد گیمرهای حرفه‌ای ساخته شد." />

      <div className="mb-16 grid items-center gap-10 lg:grid-cols-2">
        <div className="reveal leading-8 text-slate-300">
          <p>
            آرنا ایکس در سال ۱۳۹۸ توسط سه دوست گیمر که از گیم‌نت‌های بی‌روح و سیستم‌های لگ‌دار خسته بودند تأسیس شد. قواعدشان ساده بود: <b className="text-white">هر سیستمی که خودمان بازی نکنیم، مشتری هم بازی نکند.</b>
          </p>
          <p className="mt-4">
            امروز با بیش از ۱۵۰ عضو فعال ماهانه، ۱۲ سیستم RTX 4070، ۶ کنسول نسل نهم، اتاق تیمی VIP و کافه‌ای که عطر قهوه‌اش با صدای کیبوردها قاطی شده، آرنا به یکی از محبوب‌ترین گیم‌نت‌های تهران تبدیل شده است.
          </p>
          <p className="mt-4">
            و این تازه شروع ماجراست؛ نقشه‌های بزرگ‌تر در جیبمان است. 🎯
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <CoverArt emoji="🏢" gradient="violet" title="سالن اصلی — ۲۰۰ متر" className="h-44 !rounded-2xl" />
          <CoverArt emoji="🎉" gradient="cyan" title="ایونت شب‌گیم" className="mt-8 h-44 !rounded-2xl" />
        </div>
      </div>

      {/* timeline */}
      <h2 className="section-title mb-10 text-center neon-text">🕰️ سفر ما</h2>
      <div className="relative mx-auto mb-16 max-w-2xl border-r-2 border-neon-purple/30 pr-8">
        {timeline.map((t) => (
          <div key={t.year} className="reveal relative mb-8">
            <span className="absolute -right-[41px] top-1 grid h-5 w-5 place-items-center rounded-full bg-neon-purple shadow-neon" />
            <p className="font-display text-lg font-black text-neon-purple">{t.year}</p>
            <p className="font-bold text-white">{t.title}</p>
            <p className="mt-1 text-sm text-slate-400">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* values */}
      <h2 className="section-title mb-10 text-center neon-text">💎 ارزش‌های ما</h2>
      <div className="mb-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v) => (
          <div key={v.title} className="reveal glass card-hover p-6 text-center">
            <p className="mb-3 text-4xl">{v.emoji}</p>
            <h3 className="mb-2 font-bold text-white">{v.title}</h3>
            <p className="text-xs leading-6 text-slate-400">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* team */}
      <h2 className="section-title mb-10 text-center neon-text">👥 تیم آرنا</h2>
      <div className="grid gap-5 sm:grid-cols-3">
        {[
          { name: "کیان احمدی", role: "هم‌بنیان‌گذار و مدیر فنی", emoji: "🧑‍💻" },
          { name: "پرهام صادقی", role: "هم‌بنیان‌گذار و مدیر مسابقات", emoji: "🏆" },
          { name: "مائده رستمی", role: "مدیر کافه و تجربه مشتری", emoji: "☕" },
        ].map((m) => (
          <div key={m.name} className="reveal glass card-hover p-8 text-center">
            <span className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-neon-violet/40 to-neon-cyan/20 text-4xl">{m.emoji}</span>
            <h3 className="font-bold text-white">{m.name}</h3>
            <p className="mt-1 text-xs text-slate-400">{m.role}</p>
          </div>
        ))}
      </div>

      {/* gallery */}
      <h2 className="section-title mb-10 mt-16 text-center neon-text">📷 محیط آرنا</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GALLERY.map((g) => (
          <CoverArt key={g.title} emoji={g.emoji} gradient={g.gradient} title={g.title} className="reveal card-hover h-48 !rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
